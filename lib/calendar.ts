-- ============================================================
-- SignalBoost Calendar Schema
-- Run in Marketing Supabase project (qpblefwtnbivuusxmabv)
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_services (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_notify_email  text        NOT NULL DEFAULT '',
  name                text        NOT NULL,
  slug                text        NOT NULL,
  duration_minutes    integer     NOT NULL DEFAULT 60,
  price               numeric(10,2) DEFAULT 0,
  currency            text        NOT NULL DEFAULT 'USD',
  description         text        NOT NULL DEFAULT '',
  color               text        NOT NULL DEFAULT '#f5c542',
  active              boolean     NOT NULL DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(owner_id, slug)
);

CREATE TABLE IF NOT EXISTS calendar_availability (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id   uuid    REFERENCES calendar_services(id) ON DELETE CASCADE NOT NULL,
  owner_id     uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week  integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   text    NOT NULL DEFAULT '09:00',
  end_time     text    NOT NULL DEFAULT '17:00',
  UNIQUE(service_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS calendar_blocked_dates (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id     uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_date date    NOT NULL,
  reason       text    NOT NULL DEFAULT '',
  UNIQUE(owner_id, blocked_date)
);

CREATE TABLE IF NOT EXISTS calendar_bookings (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id         uuid        REFERENCES calendar_services(id) ON DELETE CASCADE NOT NULL,
  owner_id           uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name        text        NOT NULL,
  client_email       text        NOT NULL,
  booking_date       date        NOT NULL,
  booking_time       text        NOT NULL,
  status             text        NOT NULL DEFAULT 'pending',
  notes              text        NOT NULL DEFAULT '',
  confirmation_sent  boolean     NOT NULL DEFAULT false,
  created_at         timestamptz DEFAULT now()
);
-- status values: pending | confirmed | cancelled | completed

-- RLS
ALTER TABLE calendar_services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocked_dates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings       ENABLE ROW LEVEL SECURITY;

-- Services: owner manages, public can read active services
CREATE POLICY "svc_owner"       ON calendar_services FOR ALL    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "svc_public_read" ON calendar_services FOR SELECT USING (active = true);

-- Availability: owner manages, public can read (needed for slot calculation)
CREATE POLICY "avail_owner"       ON calendar_availability FOR ALL    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "avail_public_read" ON calendar_availability FOR SELECT USING (true);

-- Blocked dates: owner manages, public can read (to hide blocked days on booking page)
CREATE POLICY "blocked_owner"       ON calendar_blocked_dates FOR ALL    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "blocked_public_read" ON calendar_blocked_dates FOR SELECT USING (true);

-- Bookings: owner manages, public can INSERT to create bookings and SELECT to check taken slots
CREATE POLICY "booking_owner"         ON calendar_bookings FOR ALL    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "booking_public_insert" ON calendar_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "booking_public_read"   ON calendar_bookings FOR SELECT USING (status IN ('pending', 'confirmed'));
