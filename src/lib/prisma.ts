// src/lib/prisma.ts — Prisma 7: connection via adapter (prisma.config.ts holds URL for CLI)
// Tạo pg.Pool bằng config object rồi truyền vào PrismaPg để tránh lỗi "Cannot use 'in' operator to search for 'password'" (pg-pool dùng 'password' in options).
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
    try {
        const connectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://localhost'
        if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
            console.warn('⚠️ DATABASE_URL/DIRECT_URL not found, using placeholder (queries will fail)')
        }
        const poolConfig = { connectionString: connectionUrl }
        const pool = new Pool(poolConfig)
        const adapter = new PrismaPg(pool)
        return new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        })
    } catch (error) {
        console.error('❌ Error creating Prisma Client:', error)
        const pool = new Pool({ connectionString: 'postgresql://localhost' })
        return new PrismaClient({ adapter: new PrismaPg(pool), log: [] })
    }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// Cleanup on app shutdown
if (process.env.NODE_ENV !== 'production') {
    process.on('beforeExit', async () => {
        await prisma.$disconnect()
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma