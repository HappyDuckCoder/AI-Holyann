// src/lib/prisma.ts — Prisma 7: connection via adapter (prisma.config.ts holds URL for CLI)
// Tạo pg.Pool bằng config object rồi truyền vào PrismaPg để tránh lỗi "Cannot use 'in' operator to search for 'password'" (pg-pool dùng 'password' in options).
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma?: PrismaClient
    pool?: Pool
}

function createPrismaClient() {
    try {
        const connectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://localhost'
        if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
            console.warn('⚠️ DATABASE_URL/DIRECT_URL not found, using placeholder (queries will fail)')
        }

        // Re‑use a single Pool across HMR to avoid "MaxClientsInSessionMode"
        const pool =
            globalForPrisma.pool ??
            new Pool({
                connectionString: connectionUrl,
                // Giảm số client tối đa để không vượt giới hạn pool_size (Neon/Supabase free tier thường khá thấp)
                max: Number(process.env.PG_POOL_MAX ?? '3'),
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
            })

        if (!globalForPrisma.pool) {
            globalForPrisma.pool = fallbackPool
        }

        return new PrismaClient({ adapter: new PrismaPg(fallbackPool), log: [] })
    }
}

export const prisma =
    globalForPrisma.prisma ??
    createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}