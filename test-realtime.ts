// Test Supabase Realtime Connection
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtimeConnection() {
  console.log('🔌 Testing Supabase Realtime connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

  // Test 1: Subscribe to a channel
  console.log('📡 Test 1: Creating channel...');
  const channel = supabase.channel('test-channel', {
    config: {
      broadcast: { self: true },
    },
  });

  channel
    .on('broadcast', { event: 'test' }, (payload) => {
      console.log('✅ Received broadcast:', payload);
    })
    .subscribe((status) => {
      console.log('📊 Channel status:', status);

      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to channel!\n');

        // Test broadcast
        console.log('📤 Test 2: Sending broadcast message...');
        channel.send({
          type: 'broadcast',
          event: 'test',
          payload: { message: 'Hello from test!' },
        }).then(() => {
          console.log('✅ Broadcast sent!\n');
        });

        // Test postgres_changes
        setTimeout(async () => {
          console.log('📡 Test 3: Testing postgres_changes subscription...');
          const messagesChannel = supabase
            .channel('messages-test')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'chat_messages',
              },
              (payload) => {
                console.log('✅ Postgres change detected:', payload);
              }
            )
            .subscribe((status) => {
              console.log('📊 Messages channel status:', status);

              if (status === 'SUBSCRIBED') {
                console.log('✅ Successfully subscribed to postgres_changes!\n');
                console.log('🎉 All tests passed! Realtime is working.\n');
                console.log('💡 Now try sending a message in your chat to see it appear in real-time.');

                // Cleanup after 5 seconds
                setTimeout(() => {
                  supabase.removeAllChannels();
                  process.exit(0);
                }, 5000);
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.error('❌ Failed to subscribe to postgres_changes');
                console.error('⚠️  Make sure Realtime is enabled in your Supabase project settings');
                process.exit(1);
              }
            });
        }, 2000);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('❌ Failed to subscribe to channel');
        console.error('⚠️  Check your Supabase credentials and internet connection');
        process.exit(1);
      }
    });
}

testRealtimeConnection();
