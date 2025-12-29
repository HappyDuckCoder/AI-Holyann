/**
 * Script để đồng bộ dữ liệu giữa Supabase và Local Database
 *
 * Sử dụng:
 * npm run sync:from-supabase  - Đồng bộ từ Supabase về Local DB
 * npm run sync:to-supabase    - Đồng bộ từ Local DB lên Supabase
 * npm run sync:status         - Kiểm tra tình trạng đồng bộ
 */

import {SyncService} from './src/lib/services/sync.service'

const action = process.argv[2]

async function main() {
    console.log('='.repeat(60))
    console.log('🔄 Database Synchronization Tool')
    console.log('='.repeat(60))
    console.log()

    switch (action) {
        case 'from-supabase':
            console.log('📥 Syncing from Supabase to Local DB...')
            console.log()
            const fromResult = await SyncService.syncAllUsersFromSupabase()
            console.log()
            console.log('='.repeat(60))
            console.log('📊 Result:')
            console.log(`  ✅ Synced: ${fromResult.synced}`)
            console.log(`  ❌ Failed: ${fromResult.failed}`)
            console.log(`  📝 Message: ${fromResult.message}`)
            console.log('='.repeat(60))
            break

        case 'to-supabase':
            console.log('📤 Syncing from Local DB to Supabase...')
            console.log()
            const toResult = await SyncService.syncAllUsersToSupabase()
            console.log()
            console.log('='.repeat(60))
            console.log('📊 Result:')
            console.log(`  ✅ Synced: ${toResult.synced}`)
            console.log(`  ❌ Failed: ${toResult.failed}`)
            console.log(`  📝 Message: ${toResult.message}`)
            console.log('='.repeat(60))
            break

        case 'status':
            console.log('🔍 Checking sync status...')
            console.log()
            const status = await SyncService.checkSyncStatus()
            console.log('='.repeat(60))
            console.log('📊 Sync Status:')
            console.log(`  🌐 Supabase: ${status.supabaseCount} users`)
            console.log(`  💻 Local DB: ${status.localCount} users`)
            console.log(`  ${status.inSync ? '✅' : '⚠️'} Status: ${status.message}`)
            console.log('='.repeat(60))
            break

        default:
            console.log('❌ Invalid action!')
            console.log()
            console.log('Available commands:')
            console.log('  npm run sync:from-supabase  - Sync from Supabase to Local DB')
            console.log('  npm run sync:to-supabase    - Sync from Local DB to Supabase')
            console.log('  npm run sync:status         - Check sync status')
            console.log()
            process.exit(1)
    }

    process.exit(0)
}

main().catch((error) => {
    console.error()
    console.error('='.repeat(60))
    console.error('❌ Error:', error.message)
    console.error('='.repeat(60))
    process.exit(1)
})

