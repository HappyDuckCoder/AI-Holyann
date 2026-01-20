// src/lib/prisma.ts
import {PrismaClient} from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
    try {
        // Sử dụng DIRECT_URL cho server actions để tránh pooling timeout
        // DATABASE_URL cho edge/serverless với pooling
        const directUrl = process.env.DIRECT_URL;
        const poolingUrl = process.env.DATABASE_URL;

        const connectionUrl = directUrl || poolingUrl;

        if (!connectionUrl) {
            console.warn('⚠️ DATABASE_URL/DIRECT_URL not found, using default configuration')
        }

        // Use direct connection for better transaction support
        return new PrismaClient({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
            datasources: {
                db: {
                    url: connectionUrl
                }
            }
        })
    } catch (error) {
        console.error('❌ Error creating Prisma Client:', error)
        // Return a basic client as fallback
        return new PrismaClient({
            log: ['error']
        })
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