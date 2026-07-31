-- CreateTable
CREATE TABLE "PropertyOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amenitiesJson" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "guests" INTEGER NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlockedDateRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyOverride_propertyId_key" ON "PropertyOverride"("propertyId");

-- CreateIndex
CREATE INDEX "BlockedDateRange_propertyId_idx" ON "BlockedDateRange"("propertyId");

-- CreateIndex
CREATE INDEX "BlockedDateRange_propertyId_checkIn_checkOut_idx" ON "BlockedDateRange"("propertyId", "checkIn", "checkOut");
