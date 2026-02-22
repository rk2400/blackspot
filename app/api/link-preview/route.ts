import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const target = urlObj.searchParams.get('url') || '';
    if (!/^https?:\/\//i.test(target)) {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(target, { signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
    const html = await res.text();
    const pick = (re: RegExp) => {
      const m = html.match(re);
      return m ? m[1] : '';
    };
    const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i) || pick(/<title>([^<]+)<\/title>/i);
    const ogDesc = pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i) || pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    return NextResponse.json({ title: ogTitle || '', description: ogDesc || '', image: ogImage || '' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch preview' }, { status: 500 });
  }
}
