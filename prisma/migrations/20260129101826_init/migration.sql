-- CreateTable
CREATE TABLE "GoldPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" REAL NOT NULL,
    "openPrice" REAL NOT NULL,
    "highPrice" REAL NOT NULL,
    "lowPrice" REAL NOT NULL,
    "buyPrice" REAL NOT NULL,
    "sellPrice" REAL NOT NULL,
    "changePercent" REAL NOT NULL,
    "changeAmount" REAL NOT NULL,
    "volume" INTEGER,
    "collectedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PushLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AlertConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "highPrice" REAL,
    "lowPrice" REAL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GoldPrice_collectedAt_key" ON "GoldPrice"("collectedAt");

-- CreateIndex
CREATE INDEX "GoldPrice_collectedAt_idx" ON "GoldPrice"("collectedAt");

-- CreateIndex
CREATE INDEX "GoldPrice_createdAt_idx" ON "GoldPrice"("createdAt");

-- CreateIndex
CREATE INDEX "PushLog_createdAt_idx" ON "PushLog"("createdAt");

-- CreateIndex
CREATE INDEX "PushLog_type_idx" ON "PushLog"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");
