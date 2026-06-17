-- CreateTable
CREATE TABLE "Switch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "model" TEXT,
    "location" TEXT NOT NULL,
    "totalPorts" INTEGER NOT NULL,
    "order" INTEGER,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SwitchPort" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "switchId" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "deviceId" TEXT,
    "deviceIp" TEXT,
    CONSTRAINT "SwitchPort_switchId_fkey" FOREIGN KEY ("switchId") REFERENCES "Switch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatchPanel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "totalPorts" INTEGER NOT NULL,
    "order" INTEGER
);

-- CreateTable
CREATE TABLE "PatchPanelPort" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patchPanelId" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "description" TEXT,
    CONSTRAINT "PatchPanelPort_patchPanelId_fkey" FOREIGN KEY ("patchPanelId") REFERENCES "PatchPanel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "switchId" TEXT,
    "switchPort" TEXT
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mac" TEXT,
    "serial" TEXT,
    "status" TEXT,
    "switchId" TEXT,
    "switchPort" TEXT
);

-- CreateTable
CREATE TABLE "PC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "ip" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT,
    "switchId" TEXT,
    "switchPort" TEXT,
    "lastSeen" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Switch_ip_key" ON "Switch"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "SwitchPort_switchId_port_key" ON "SwitchPort"("switchId", "port");

-- CreateIndex
CREATE UNIQUE INDEX "PatchPanelPort_patchPanelId_port_key" ON "PatchPanelPort"("patchPanelId", "port");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPoint_ip_key" ON "AccessPoint"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Camera_ip_key" ON "Camera"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "PC_mac_key" ON "PC"("mac");
