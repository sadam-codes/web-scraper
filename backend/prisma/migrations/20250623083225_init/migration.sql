/*
  Warnings:

  - You are about to drop the `ScrapedData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ScrapedData";

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
