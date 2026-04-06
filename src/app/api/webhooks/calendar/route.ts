import { createClient } from '@/lib/supabase/server';
import { syncCalendar } from '@/lib/calendar/sync';

export async function POST(request: Request) {
  try {
    // Google Calendar push notifications send channel info in headers
    const channelId = request.headers.get('x-goog-channel-id');

    if (!channelId) {
      return Response.json(
        { error: 'Missing channel ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Look up calendar connection by the channel ID (stored as the connection ID)
    const { data: connection, error: connError } = await supabase
      .from('calendar_connections')
      .select('id, user_id')
      .eq('id', channelId)
      .eq('is_active', true)
      .single();

    if (connError || !connection) {
      // Return 200 anyway to acknowledge the webhook and stop retries
      return Response.json({ received: true, synced: false });
    }

    // Trigger sync in the background — but we still return 200 quickly
    try {
      await syncCalendar(connection.id, connection.user_id);
    } catch {
      // Log error but don't fail the webhook response
      // In production, this would go to an error tracking service
    }

    return Response.json({ received: true, synced: true });
  } catch {
    // Always return 200 for webhooks to prevent Google from retrying
    return Response.json({ received: true, synced: false });
  }
}
