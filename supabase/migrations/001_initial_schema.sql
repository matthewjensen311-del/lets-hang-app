-- =============================================================================
-- Let's Hang - Initial Schema Migration
-- =============================================================================
-- Social hangout planning app with calendar integration, group management,
-- preference matching, and smart scheduling.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- 1. profiles
-- ===========================================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL
              CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,24}$'),
  display_name TEXT NOT NULL,
  avatar_url  TEXT,
  bio         TEXT CONSTRAINT bio_length CHECK (char_length(bio) <= 160),
  city        TEXT,
  state       TEXT,
  timezone    TEXT NOT NULL DEFAULT 'America/New_York',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Policies
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===========================================================================
-- 2. user_preferences
-- ===========================================================================
CREATE TABLE user_preferences (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  budget_tier              TEXT NOT NULL DEFAULT 'moderate'
                           CHECK (budget_tier IN ('free','budget','moderate','splurge','no_limit')),
  interests                JSONB NOT NULL DEFAULT '[]'::jsonb,
  food_preferences         JSONB NOT NULL DEFAULT '[]'::jsonb,
  dietary_restrictions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  activity_energy          TEXT NOT NULL DEFAULT 'moderate'
                           CHECK (activity_energy IN ('chill','moderate','active','adventure')),
  indoor_outdoor           TEXT NOT NULL DEFAULT 'both'
                           CHECK (indoor_outdoor IN ('indoor','outdoor','both')),
  max_travel_distance_miles INT NOT NULL DEFAULT 30,
  preferred_group_size     TEXT NOT NULL DEFAULT 'any'
                           CHECK (preferred_group_size IN ('one_on_one','small','medium','large','any')),
  drink_preference         TEXT NOT NULL DEFAULT 'social'
                           CHECK (drink_preference IN ('none','social','enthusiast')),
  early_bird_night_owl     TEXT NOT NULL DEFAULT 'flexible'
                           CHECK (early_bird_night_owl IN ('early_bird','night_owl','flexible')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Policies
CREATE POLICY user_preferences_select ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_delete ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================================================
-- 3. calendar_connections
-- ===========================================================================
CREATE TABLE calendar_connections (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider             TEXT NOT NULL CHECK (provider IN ('google','apple','outlook')),
  provider_account_id  TEXT NOT NULL,
  access_token         TEXT,
  refresh_token        TEXT,
  token_expires_at     TIMESTAMPTZ,
  calendar_ids         JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_synced_at       TIMESTAMPTZ,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, provider, provider_account_id)
);

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- Policies: strictly private
CREATE POLICY calendar_connections_select ON calendar_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY calendar_connections_insert ON calendar_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_connections_update ON calendar_connections
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_connections_delete ON calendar_connections
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================================================
-- 4. calendar_events
-- ===========================================================================
CREATE TABLE calendar_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id     UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  title             TEXT,
  start_time        TIMESTAMPTZ NOT NULL,
  end_time          TIMESTAMPTZ NOT NULL,
  is_all_day        BOOLEAN NOT NULL DEFAULT false,
  is_busy           BOOLEAN NOT NULL DEFAULT true,
  recurrence_rule   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (connection_id, external_event_id)
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Policies: strictly private
CREATE POLICY calendar_events_select ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY calendar_events_insert ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_events_update ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_events_delete ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================================================
-- 5. hangout_availability
-- ===========================================================================
CREATE TABLE hangout_availability (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0 = Sunday
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  label       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hangout_availability ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_hangout_availability_user ON hangout_availability(user_id);

-- ===========================================================================
-- 6. friendships  (moved before hangout_availability policies, which reference it)
-- ===========================================================================
CREATE TABLE friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','blocked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at   TIMESTAMPTZ,

  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status    ON friendships(status);

-- Policies for friendships
CREATE POLICY friendships_select ON friendships
  FOR SELECT USING (auth.uid() IN (requester_id, addressee_id));

CREATE POLICY friendships_insert ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY friendships_update ON friendships
  FOR UPDATE USING (auth.uid() IN (requester_id, addressee_id))
  WITH CHECK (auth.uid() IN (requester_id, addressee_id));

-- Policies for hangout_availability (after friendships exists)
CREATE POLICY hangout_availability_select_own ON hangout_availability
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY hangout_availability_select_friends ON hangout_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND addressee_id = hangout_availability.user_id)
          OR
          (addressee_id = auth.uid() AND requester_id = hangout_availability.user_id)
        )
    )
  );

CREATE POLICY hangout_availability_insert ON hangout_availability
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY hangout_availability_update ON hangout_availability
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY hangout_availability_delete ON hangout_availability
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================================================
-- 7. groups
-- ===========================================================================
CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  emoji       TEXT,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===========================================================================
-- 8. group_members  (moved before groups policies, which reference it)
-- ===========================================================================
CREATE TABLE group_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member'
            CHECK (role IN ('admin','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user  ON group_members(user_id);

-- Policies for groups (after group_members exists)
CREATE POLICY groups_select ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY groups_update ON groups
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY groups_delete ON groups
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY groups_insert ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policies
CREATE POLICY group_members_select ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY group_members_insert ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
    -- Allow the group creator to insert (for bootstrapping the first member)
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_members.group_id
        AND g.created_by = auth.uid()
    )
  );

CREATE POLICY group_members_delete ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
    -- Allow members to remove themselves
    OR auth.uid() = user_id
  );

-- ===========================================================================
-- 9. hangouts
-- ===========================================================================
CREATE TABLE hangouts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  created_by            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id              UUID REFERENCES groups(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'proposed'
                        CHECK (status IN ('proposed','confirmed','in_progress','completed','cancelled')),
  scheduled_start       TIMESTAMPTZ NOT NULL,
  scheduled_end         TIMESTAMPTZ NOT NULL,
  vibe                  TEXT,
  vibe_tags             JSONB NOT NULL DEFAULT '[]'::jsonb,
  budget_cap            TEXT,
  location_center_lat   FLOAT,
  location_center_lng   FLOAT,
  location_radius_miles INT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hangouts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER hangouts_updated_at
  BEFORE UPDATE ON hangouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_hangouts_created_by ON hangouts(created_by);
CREATE INDEX idx_hangouts_group      ON hangouts(group_id);
CREATE INDEX idx_hangouts_status     ON hangouts(status);
CREATE INDEX idx_hangouts_scheduled  ON hangouts(scheduled_start, scheduled_end);

-- Policies
CREATE POLICY hangouts_select ON hangouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hangout_participants hp
      WHERE hp.hangout_id = hangouts.id
        AND hp.user_id = auth.uid()
    )
    OR auth.uid() = created_by
  );

CREATE POLICY hangouts_insert ON hangouts
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY hangouts_update ON hangouts
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- ===========================================================================
-- 10. hangout_participants
-- ===========================================================================
CREATE TABLE hangout_participants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id   UUID NOT NULL REFERENCES hangouts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rsvp_status  TEXT NOT NULL DEFAULT 'pending'
               CHECK (rsvp_status IN ('pending','going','maybe','declined')),
  responded_at TIMESTAMPTZ,

  UNIQUE (hangout_id, user_id)
);

ALTER TABLE hangout_participants ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_hangout_participants_hangout ON hangout_participants(hangout_id);
CREATE INDEX idx_hangout_participants_user    ON hangout_participants(user_id);

-- Policies
CREATE POLICY hangout_participants_select ON hangout_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hangout_participants hp
      WHERE hp.hangout_id = hangout_participants.hangout_id
        AND hp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM hangouts h
      WHERE h.id = hangout_participants.hangout_id
        AND h.created_by = auth.uid()
    )
  );

CREATE POLICY hangout_participants_insert ON hangout_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hangouts h
      WHERE h.id = hangout_participants.hangout_id
        AND h.created_by = auth.uid()
    )
  );

CREATE POLICY hangout_participants_update ON hangout_participants
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===========================================================================
-- 11. itinerary_items
-- ===========================================================================
CREATE TABLE itinerary_items (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id                UUID NOT NULL REFERENCES hangouts(id) ON DELETE CASCADE,
  order_index               INT NOT NULL,
  type                      TEXT NOT NULL
                            CHECK (type IN ('food','activity','drinks','entertainment','transport','other')),
  title                     TEXT NOT NULL,
  description               TEXT,
  venue_name                TEXT,
  venue_address             TEXT,
  venue_lat                 FLOAT,
  venue_lng                 FLOAT,
  venue_google_place_id     TEXT,
  venue_photo_url           TEXT,
  venue_rating              FLOAT,
  venue_price_level         INT CHECK (venue_price_level IS NULL OR venue_price_level BETWEEN 1 AND 4),
  estimated_start           TIMESTAMPTZ,
  estimated_end             TIMESTAMPTZ,
  estimated_cost_per_person DECIMAL(10,2),
  booking_url               TEXT,
  booking_status            TEXT NOT NULL DEFAULT 'none'
                            CHECK (booking_status IN ('none','suggested','booked','confirmed')),
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_itinerary_items_hangout ON itinerary_items(hangout_id, order_index);

-- Policies
CREATE POLICY itinerary_items_select ON itinerary_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hangout_participants hp
      WHERE hp.hangout_id = itinerary_items.hangout_id
        AND hp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM hangouts h
      WHERE h.id = itinerary_items.hangout_id
        AND h.created_by = auth.uid()
    )
  );

CREATE POLICY itinerary_items_insert ON itinerary_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hangouts h
      WHERE h.id = itinerary_items.hangout_id
        AND h.created_by = auth.uid()
    )
  );

CREATE POLICY itinerary_items_update ON itinerary_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM hangouts h
      WHERE h.id = itinerary_items.hangout_id
        AND h.created_by = auth.uid()
    )
  );

CREATE POLICY itinerary_items_delete ON itinerary_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM hangouts h
      WHERE h.id = itinerary_items.hangout_id
        AND h.created_by = auth.uid()
    )
  );

-- ===========================================================================
-- 12. notifications
-- ===========================================================================
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL
             CHECK (type IN (
               'friend_request','friend_accepted',
               'hangout_invite','hangout_update','hangout_reminder',
               'itinerary_ready','rsvp_update','group_invite'
             )),
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read)
  WHERE is_read = false;
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Policies
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===========================================================================
-- Database Functions
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- compute_shared_availability
-- Returns JSONB array of { date, start_time, end_time } windows where ALL
-- supplied users are available (recurring availability minus busy calendar
-- events) for each date in the given range.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION compute_shared_availability(
  p_user_ids   UUID[],
  p_start_date DATE,
  p_end_date   DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result   JSONB := '[]'::jsonb;
  v_date     DATE;
  v_dow      INT;
  v_slot     RECORD;
BEGIN
  -- Iterate each date in range
  v_date := p_start_date;
  WHILE v_date <= p_end_date LOOP
    -- Day of week: extract dow gives 0=Sunday in our convention
    v_dow := EXTRACT(DOW FROM v_date)::int;

    -- Find overlapping availability windows across ALL users for this day
    FOR v_slot IN
      SELECT
        GREATEST(MAX(ha.start_time), MAX(ha.start_time)) AS slot_start,
        LEAST(MIN(ha.end_time), MIN(ha.end_time)) AS slot_end
      FROM (
        -- For each user, get the union of their active availability windows for this DOW
        SELECT
          ha_inner.user_id,
          ha_inner.start_time,
          ha_inner.end_time
        FROM hangout_availability ha_inner
        WHERE ha_inner.user_id = ANY(p_user_ids)
          AND ha_inner.day_of_week = v_dow
          AND ha_inner.is_active = true
      ) ha
      GROUP BY ha.start_time, ha.end_time
      HAVING COUNT(DISTINCT ha.user_id) = array_length(p_user_ids, 1)
    LOOP
      -- Skip if the overlap is invalid
      IF v_slot.slot_start >= v_slot.slot_end THEN
        CONTINUE;
      END IF;

      -- Check that no user has a busy calendar event overlapping this window
      IF NOT EXISTS (
        SELECT 1
        FROM calendar_events ce
        WHERE ce.user_id = ANY(p_user_ids)
          AND ce.is_busy = true
          AND ce.start_time < (v_date + v_slot.slot_end)::timestamptz
          AND ce.end_time   > (v_date + v_slot.slot_start)::timestamptz
      ) THEN
        v_result := v_result || jsonb_build_object(
          'date',       v_date::text,
          'start_time', v_slot.slot_start::text,
          'end_time',   v_slot.slot_end::text
        );
      END IF;
    END LOOP;

    v_date := v_date + 1;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- match_preferences
-- Returns a JSONB object with the intersection of interests, the lowest
-- (most restrictive) budget tier, and the merged set of dietary restrictions
-- for the given user IDs.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_preferences(p_user_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interests          JSONB := NULL;
  v_dietary            JSONB := '[]'::jsonb;
  v_lowest_budget      TEXT  := 'no_limit';
  v_budget_order       TEXT[] := ARRAY['free','budget','moderate','splurge','no_limit'];
  v_lowest_budget_idx  INT   := 5; -- index of 'no_limit'
  v_rec                RECORD;
  v_idx                INT;
BEGIN
  FOR v_rec IN
    SELECT up.interests, up.dietary_restrictions, up.budget_tier
    FROM user_preferences up
    WHERE up.user_id = ANY(p_user_ids)
  LOOP
    -- Intersect interests
    IF v_interests IS NULL THEN
      v_interests := v_rec.interests;
    ELSE
      -- Keep only elements present in both arrays
      v_interests := (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(v_interests) AS elem
        WHERE elem IN (SELECT jsonb_array_elements(v_rec.interests))
      );
    END IF;

    -- Union dietary restrictions
    v_dietary := (
      SELECT COALESCE(jsonb_agg(DISTINCT elem), '[]'::jsonb)
      FROM (
        SELECT jsonb_array_elements(v_dietary) AS elem
        UNION
        SELECT jsonb_array_elements(v_rec.dietary_restrictions) AS elem
      ) sub
    );

    -- Track lowest budget tier
    v_idx := array_position(v_budget_order, v_rec.budget_tier);
    IF v_idx IS NOT NULL AND v_idx < v_lowest_budget_idx THEN
      v_lowest_budget_idx := v_idx;
      v_lowest_budget := v_rec.budget_tier;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'shared_interests',       COALESCE(v_interests, '[]'::jsonb),
    'lowest_budget_tier',     v_lowest_budget,
    'all_dietary_restrictions', v_dietary
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- get_unread_notification_count
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_uid UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM notifications
  WHERE user_id = p_uid
    AND is_read = false;
$$;

-- ===========================================================================
-- Triggers
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Auto-create profile and user_preferences when a new auth.users row appears
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Generate a default username from the email prefix, sanitised
  v_username := lower(regexp_replace(
    split_part(NEW.email, '@', 1),
    '[^a-z0-9_]', '', 'g'
  ));

  -- Ensure minimum length
  IF char_length(v_username) < 3 THEN
    v_username := v_username || '_user';
  END IF;

  -- Truncate to max length
  v_username := left(v_username, 24);

  -- Handle uniqueness by appending random suffix on conflict
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, display_name)
      VALUES (
        NEW.id,
        v_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
      );
      EXIT; -- success, leave loop
    EXCEPTION WHEN unique_violation THEN
      v_username := left(v_username, 18) || '_' || substr(gen_random_uuid()::text, 1, 5);
    END;
  END LOOP;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================================================
-- Realtime
-- ===========================================================================

-- Enable Supabase Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE hangout_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE hangouts;
