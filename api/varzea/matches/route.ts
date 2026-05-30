import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch all matches with joined team names
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: matches, error } = await supabase
      .from('varzea_matches')
      .select(`
        id,
        match_date,
        field_location,
        status,
        home_score,
        away_score,
        home_team:varzea_teams!home_team_id(name, neighborhood),
        away_team:varzea_teams!away_team_id(name, neighborhood)
      `)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return NextResponse.json(matches, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Automate or register a new scheduling request
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { home_team_id, away_team_id, match_date, field_location } = body;

    const { data: newMatch, error } = await supabase
      .from('varzea_matches')
      .insert({
        home_team_id,
        away_team_id,
        match_date,
        field_location
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newMatch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
