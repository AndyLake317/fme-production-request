import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Generate a one-time signed URL the browser uses to upload a file
// directly to Supabase Storage — bypassing Vercel's 4.5MB body limit.
export async function POST(req: Request) {
  try {
    const { filename } = await req.json();
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

    const { data, error } = await supabase.storage
      .from('request-uploads')
      .createSignedUploadUrl(path);

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    });
  } catch (e: any) {
    console.error('upload-url route failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
