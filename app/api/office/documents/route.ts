import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: documents, error } = await supabase
      .from('office_documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(documents, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, title, content_json } = body;

    // Handle updates if document already exists
    if (id) {
      const { data: updatedDoc, error } = await supabase
        .from('office_documents')
        .update({
          title,
          content_json,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(updatedDoc, { status: 200 });
    }

    // Direct standalone insertion
    const { data: newDoc, error } = await supabase
      .from('office_documents')
      .insert({
        title: title || 'Untitled Document',
        content_json: content_json || { bodyText: '', version: "1.0" }
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
