import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ success: true, data: store.teachers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const teacher = { id: `t-${Date.now()}`, name: body.name || '', assignedSection: body.assignedSection || null };
  store.teachers.push(teacher);
  return NextResponse.json({ success: true, data: teacher });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const idx = store.teachers.findIndex(t => t.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  store.teachers[idx] = { ...store.teachers[idx], ...body };
  return NextResponse.json({ success: true, data: store.teachers[idx] });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  store.teachers = store.teachers.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
}
