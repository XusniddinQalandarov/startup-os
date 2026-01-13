import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Redirect to login on the same origin
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
