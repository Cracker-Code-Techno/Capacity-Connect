import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging is very chatty and costs real time per query — dev only.
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Reuse the client across hot-reloads in development so we don't exhaust the
// connection pool. In production the module is instantiated once per process,
// so no global handle is needed.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
