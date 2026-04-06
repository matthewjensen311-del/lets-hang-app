import { createClient } from '@/lib/supabase/server';
import { syncCalendar } from '@/lib/calendar/sync';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId } = body as { connectionId?: string };

    if (!connectionId) {
      return Response.json(
        { error: 'connectionId is required' },
        { status: 400 }
      );
    }

    const result = await syncCalendar(connectionId, user.id);

    return Response.json({ synced: result.synced, errors: result.errors });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
