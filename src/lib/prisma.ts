// src/lib/prisma.ts
import {PrismaClient} from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'], // Bật log này để xem câu lệnh SQL chạy ngầm (tùy chọn)
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma