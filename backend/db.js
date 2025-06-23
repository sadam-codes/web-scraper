import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database via Prisma");
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
}

connectDB(); 

export default prisma;
