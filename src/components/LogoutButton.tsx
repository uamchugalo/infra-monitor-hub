import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout} 
      className="text-muted-foreground hover:text-red-600 ml-2"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sair
    </Button>
  );
};
