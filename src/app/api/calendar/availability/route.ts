import { createClient } from '@/lib/supabase/server';
import { computeSharedAvailability } from '@/lib/calendar/availability';

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
    const { userIds, startDate, endDate } = body as {
      userIds?: string[];
      startDate?: string;
      endDate?: string;
    };

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return Response.json(
        { error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return Response.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return Response.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return Response.json(
        { error: 'endDate must be after startDate' },
        { status: 400 }
      );
    }

    const slots = await computeSharedAvailability(userIds, start, end);

    return Response.json({ slots });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
