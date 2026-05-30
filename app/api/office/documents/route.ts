import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

// GET: Fetch all documents for the workspace
export async function GET() {
  try {
    const supabase = await createClient();
    
    // For MVP phase, we grab the latest entries. 
    // Once auth is strictly locked down, this filters by the user's workspace_id.
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

// POST: Create a brand new document entry
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { title, workspace_id } = body;

    // Fallback/Stub workspace validation until workspace creation UI is live
    let targetWorkspaceId = workspace_id;
    if (!targetWorkspaceId) {
      const { data: existingWorkspace } = await supabase.from('office_workspaces').select('id').limit(1).single();
      if (existingWorkspace) {
        targetWorkspaceId = existingWorkspace.id;
      } else {
        // Create a root fallback workspace if one doesn't exist yet so the app never crashes
        const { data: defaultAccount } = await supabase.from('office_accounts').select('id').limit(1).single();
        if (defaultAccount) {
          const { data: newWS } = await supabase.from('office_workspaces').insert({
            owner_id: defaultAccount.id,
            workspace_name: 'Main Office Workspace',
            slug: 'main-office'
          }).select().single();
          targetWorkspaceId = newWS?.id;
        }
      }
    }

    const { data: newDoc, error } = await supabase
      .from('office_documents')
      .insert({
        title: title || 'Untitled Document',
        workspace_id: targetWorkspaceId,
        content_json: { blocks: [], version: "1.0" }
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
