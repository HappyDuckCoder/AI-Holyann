// @ts-nocheck
// src/lib/prisma.ts — Prisma 7: connection via adapter (prisma.config.ts holds URL for CLI)
// Tạo pg.Pool bằng config object rồi truyền vào PrismaPg để tránh lỗi "Cannot use 'in' operator to search for 'password'" (pg-pool dùng 'password' in options).
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
    pool?: Pool
}

function createPrismaClient(): PrismaClient {
    try {
        const connectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://localhost'
        if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
            console.warn('⚠️ DATABASE_URL/DIRECT_URL not found, using placeholder (queries will fail)')
        }

        // Một Pool duy nhất cho cả process (tránh MaxClientsInSessionMode khi HMR / nhiều worker).
        const pool =
            globalForPrisma.pool ??
            new Pool({
                connectionString: connectionUrl,
                // Session mode / free tier thường giới hạn 1 connection — mặc định 1, set PG_POOL_MAX=3 nếu plan cho phép.
                max: Math.max(1, Number(process.env.PG_POOL_MAX ?? '1')),
                idleTimeoutMillis: 30_000,
            })

        if (!globalForPrisma.pool) {
            globalForPrisma.pool = pool
        }

        const adapter = new PrismaPg(pool)

        return new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        })
    } catch (error) {
        console.error('❌ Error creating Prisma Client:', error)
        const fallbackPool =
            globalForPrisma.pool ??
            new Pool({
                connectionString: 'postgresql://localhost',
                max: 1,
            })

        if (!globalForPrisma.pool) {
            globalForPrisma.pool = fallbackPool
        }

        return new PrismaClient({ adapter: new PrismaPg(fallbackPool), log: [] })
    }
}

// Singleton: luôn gán vào globalThis để mọi lần import dùng chung 1 client (dev + prod).
const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
}

export { prisma }