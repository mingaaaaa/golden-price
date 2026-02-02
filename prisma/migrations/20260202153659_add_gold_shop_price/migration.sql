-- CreateTable
CREATE TABLE IF NOT EXISTS "GoldShopPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "prices" TEXT NOT NULL,
    "collectedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GoldShopPrice_date_key" ON "GoldShopPrice"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GoldShopPrice_date_idx" ON "GoldShopPrice"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GoldShopPrice_collectedAt_idx" ON "GoldShopPrice"("collectedAt");
