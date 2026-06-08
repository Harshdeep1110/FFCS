import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

// GET /api/organizer/courses
export async function GET() {
  return NextResponse.json({ success: true, data: store.courses });
}

// POST /api/organizer/courses — create
export async function POST(req: NextRequest) {
  const body = await req.json();
  const course = {
    id: `c-${Date.now()}`,
    courseCode: body.courseCode || '',
    courseName: body.courseName || '',
    creditValue: body.creditValue || 3,
    courseType: body.courseType || 'Theory',
    prerequisites: body.prerequisites || [],
    antirequisites: body.antirequisites || [],
  };
  store.courses.push(course);
  return NextResponse.json({ success: true, data: course });
}

// PUT /api/organizer/courses — update
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const idx = store.courses.findIndex(c => c.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  store.courses[idx] = { ...store.courses[idx], ...body };
  return NextResponse.json({ success: true, data: store.courses[idx] });
}

// DELETE /api/organizer/courses
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  store.courses = store.courses.filter(c => c.id !== id);
  return NextResponse.json({ success: true });
}
