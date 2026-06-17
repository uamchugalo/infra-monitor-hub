import { useEffect, useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, AlertTriangle, TrendingUp, BarChart as BarChartIcon, Video, Router, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

interface ReportDetail {
    name: string;
    ip: string;
    status: 'SUCCESS' | 'FAILED';
    type?: 'PC' | 'CAMERA' | 'AP';
}

interface ReportFailure {
    name: string;
    ip: string;
    mac: string;
    reason: string;
    type?: 'PC' | 'CAMERA' | 'AP';
}

interface Report {
    id: string;
    timestamp: string;
    total: number;
    online_after_wake: number;
    automated?: boolean; // New Flag
    failures: ReportFailure[];
    details: ReportDetail[];
}

export function ReportsModal() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false); // State for button
    const [isOpen, setIsOpen] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateManual = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/generate-report', { method: 'POST' });
            if (res.ok) {
                await fetchReports();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchReports();
        }
    }, [isOpen]);

    // Analytics Data Processing
    const analyticsIds = useMemo(() => {
        // Only use automated reports for stability analytics as requested
        const autoReports = reports.filter(r => r.automated);

        // Helper to get stats for a specific type
        const getStats = (type: 'CAMERA' | 'AP') => {
            const trend = [...autoReports].reverse().map(r => {
                const typeDetails = r.details.filter(d => d.type === type);
                const total = typeDetails.length;
                const online = typeDetails.filter(d => d.status === 'SUCCESS').length;
                const rate = total > 0 ? Math.round((online / total) * 100) : 0;

                return {
                    date: format(new Date(r.timestamp), 'dd/MM HH:mm'),
                    rate, online, total
                };
            });

            const failureCounts: Record<string, number> = {};
            autoReports.forEach(r => {
                r.failures.forEach(f => {
                    if (f.type === type) {
                        const key = f.name || f.ip;
                        failureCounts[key] = (failureCounts[key] || 0) + 1;
                    }
                });
            });

            const failures = Object.entries(failureCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 15); // Increased to 15 to see more devices

            return { trend, failures };
        };

        return {
            cameras: getStats('CAMERA'),
            aps: getStats('AP')
        };
    }, [reports]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Relatórios & Estatísticas
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] !flex flex-col p-0 overflow-hidden">
                <Tabs defaultValue="analytics" className="flex-1 flex flex-col overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-0 border-b shrink-0">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <DialogTitle className="text-xl">Monitoramento de Infraestrutura</DialogTitle>
                                <DialogDescription>
                                    Histórico de disponibilidade e análise de estabilidade.
                                </DialogDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={async () => {
                                    if (confirm("Tem certeza que deseja apagar todo o histórico de relatórios?")) {
                                        await fetch('/api/reports', { method: 'DELETE' });
                                        setReports([]);
                                    }
                                }}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Resetar
                                </Button>
                                <Button size="sm" onClick={handleGenerateManual} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {generating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                    Gerar Relatório Agora
                                </Button>
                            </div>
                        </div>

                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="analytics">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Estabilidade
                            </TabsTrigger>
                            <TabsTrigger value="history">
                                <FileText className="w-4 h-4 mr-2" />
                                Manuais
                            </TabsTrigger>
                            <TabsTrigger value="auto-history">
                                <Clock className="w-4 h-4 mr-2" />
                                Automáticas
                            </TabsTrigger>
                        </TabsList>
                    </DialogHeader>

                    <div className="flex-1 min-h-0">
                        {/* ANALYTICS TAB */}
                        <TabsContent value="analytics" className="h-full m-0 outline-none data-[state=active]:flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                <div className="space-y-8">
                                    {loading && (
                                        <div className="text-center py-20 flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm text-muted-foreground">Analisando estabilidade...</p>
                                        </div>
                                    )}

                                    {!loading && reports.length === 0 && (
                                        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                                            Sem dados históricos para análise.
                                        </div>
                                    )}

                                    {!loading && reports.length > 0 && (
                                        <>
                                            {/* SECTION: CAMERAS */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <h2 className="font-bold text-base flex items-center gap-2 text-zinc-800">
                                                        <div className="p-1.5 bg-orange-500/10 rounded-lg"><Video className="w-4 h-4 text-orange-600" /></div>
                                                        Ocorrências: Câmeras
                                                    </h2>
                                                    <Badge variant="outline" className="text-[10px] uppercase px-2 h-6">Total: {analyticsIds.cameras.failures.length}</Badge>
                                                </div>

                                                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                                                    <div className="overflow-x-auto custom-scrollbar">
                                                        <div className="min-w-[700px] h-[220px]">
                                                            {analyticsIds.cameras.failures.length > 0 ? (
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <BarChart data={analyticsIds.cameras.failures} margin={{ top: 10, right: 30, left: -25, bottom: 40 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                                                        <XAxis
                                                                            dataKey="name"
                                                                            angle={-40}
                                                                            textAnchor="end"
                                                                            interval={0}
                                                                            fontSize={8}
                                                                            height={60}
                                                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                                                        />
                                                                        <YAxis fontSize={8} tickLine={false} axisLine={false} />
                                                                        <Tooltip
                                                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                                                                        />
                                                                        <Bar
                                                                            dataKey="count"
                                                                            fill="#f97316"
                                                                            radius={[3, 3, 0, 0]}
                                                                            barSize={20}
                                                                            name="Falhas"
                                                                        />
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            ) : (
                                                                <div className="h-full flex items-center justify-center text-muted-foreground gap-2 text-sm italic">
                                                                    <CheckCircle className="w-5 h-5 text-green-500/40" />
                                                                    Tudo operando normalmente.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECTION: ACCESS POINTS */}
                                            <div className="space-y-4 pt-6">
                                                <div className="flex items-center justify-between px-1">
                                                    <h2 className="font-bold text-base flex items-center gap-2 text-zinc-800">
                                                        <div className="p-1.5 bg-blue-500/10 rounded-lg"><Router className="w-4 h-4 text-blue-600" /></div>
                                                        Ocorrências: APs
                                                    </h2>
                                                    <Badge variant="outline" className="text-[10px] uppercase px-2 h-6">Total: {analyticsIds.aps.failures.length}</Badge>
                                                </div>

                                                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                                                    <div className="overflow-x-auto custom-scrollbar">
                                                        <div className="min-w-[700px] h-[220px]">
                                                            {analyticsIds.aps.failures.length > 0 ? (
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <BarChart data={analyticsIds.aps.failures} margin={{ top: 10, right: 30, left: -25, bottom: 40 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                                                        <XAxis
                                                                            dataKey="name"
                                                                            angle={-40}
                                                                            textAnchor="end"
                                                                            interval={0}
                                                                            fontSize={8}
                                                                            height={60}
                                                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                                                        />
                                                                        <YAxis fontSize={8} tickLine={false} axisLine={false} />
                                                                        <Tooltip
                                                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                                                                        />
                                                                        <Bar
                                                                            dataKey="count"
                                                                            fill="#3b82f6"
                                                                            radius={[3, 3, 0, 0]}
                                                                            barSize={20}
                                                                            name="Falhas"
                                                                        />
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            ) : (
                                                                <div className="h-full flex items-center justify-center text-muted-foreground gap-2 text-sm italic">
                                                                    <CheckCircle className="w-5 h-5 text-green-500/40" />
                                                                    Tudo operando normalmente.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* MANUAL HISTORY TAB */}
                        <TabsContent value="history" className="h-full m-0 outline-none data-[state=active]:flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {loading ? (
                                    <div className="py-20 text-center text-muted-foreground">Carregando...</div>
                                ) : reports.filter(r => !r.automated).length === 0 ? (
                                    <div className="py-20 text-center text-muted-foreground italic border border-dashed rounded-xl">Nenhum relatório manual encontrado.</div>
                                ) : (
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {reports.filter(r => !r.automated).map((report) => (
                                            <AccordionItem key={report.id} value={report.id} className="border rounded-lg px-4 bg-card/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "p-2 rounded-full",
                                                                (Math.round((report.online_after_wake / report.total) * 100) || 0) === 100 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                                            )}>
                                                                {((Math.round((report.online_after_wake / report.total) * 100) || 0) === 100) ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-semibold text-sm">
                                                                    {format(new Date(report.timestamp), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Relatório Manual</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant={(Math.round((report.online_after_wake / report.total) * 100) || 0) === 100 ? "default" : "secondary"} className="h-6">
                                                            {Math.round((report.online_after_wake / report.total) * 100) || 0}%
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="pb-4 pt-2">
                                                        {report.failures.length > 0 && (
                                                            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
                                                                <h4 className="text-xs font-bold text-destructive mb-3 flex items-center gap-2 uppercase tracking-widest">
                                                                    <XCircle className="w-3 h-3" />
                                                                    Itens Offline ({report.failures.length})
                                                                </h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {report.failures.map((fail, idx) => (
                                                                        <div key={idx} className="text-xs p-2 bg-background border rounded flex justify-between items-center shadow-sm">
                                                                            <span className="font-semibold truncate max-w-[150px]">{fail.name}</span>
                                                                            <span className="font-mono text-[10px] opacity-60 ml-2 bg-muted px-1.5 py-0.5 rounded">{fail.ip}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </div>
                        </TabsContent>

                        {/* AUTOMATED HISTORY TAB */}
                        <TabsContent value="auto-history" className="h-full m-0 outline-none data-[state=active]:flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {loading ? (
                                    <div className="py-20 text-center text-muted-foreground">Carregando...</div>
                                ) : reports.filter(r => r.automated).length === 0 ? (
                                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3 italic border border-dashed rounded-xl">
                                        <Clock className="w-8 h-8 opacity-20" />
                                        Nenhum relatório automático capturado ainda.
                                    </div>
                                ) : (
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {reports.filter(r => r.automated).map((report) => (
                                            <AccordionItem key={report.id} value={report.id} className="border rounded-lg px-4 bg-card/30">
                                                <AccordionTrigger className="hover:no-underline py-3">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                (Math.round((report.online_after_wake / report.total) * 100) || 0) === 100 ? "bg-green-500" : "bg-orange-500"
                                                            )} />
                                                            <div className="text-left">
                                                                <p className="font-medium text-sm">
                                                                    {format(new Date(report.timestamp), "dd/MM - HH:mm", { locale: ptBR })}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">Automático ({report.online_after_wake}/{report.total})</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] h-6 px-2">
                                                            {Math.round((report.online_after_wake / report.total) * 100) || 0}%
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="pb-4 pt-2">
                                                        {report.failures.length > 0 ? (
                                                            <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100 italic leading-relaxed shadow-inner">
                                                                <span className="font-bold not-italic block mb-1 uppercase text-[9px]">Dispositivos Offline:</span>
                                                                {report.failures.map(f => f.name).join(', ')}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2 font-medium">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Todos os sistemas operando normalmente.
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog >
    );
}
