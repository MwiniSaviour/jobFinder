import { PrismaClient } from "@prisma/client";

let client: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  client ??= new PrismaClient();
  return client;
}

export async function closePrisma(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}
