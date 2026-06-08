import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const enriched = store.slots.map(s => {
    const course = store.courses.find(c => c.id === s.courseId);
    const teacher = store.teachers.find(t => t.id === s.teacherId);
    return { ...s, courseName: course?.courseCode || 'Unknown', teacherName: teacher?.name || 'Unknown' };
  });
  return NextResponse.json({ success: true, data: enriched });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slot = {
    id: `sl-${Date.now()}`,
    slotName: body.slotName || '',
    day: body.day || 'Monday',
    startTime: body.startTime || '08:00',
    endTime: body.endTime || '08:50',
    seatLimit: body.seatLimit || 30,
    seatsOccupied: 0,
    courseId: body.courseId || '',
    teacherId: body.teacherId || '',
  };
  store.slots.push(slot);
  return NextResponse.json({ success: true, data: slot });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const idx = store.slots.findIndex(s => s.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  // Don't allow overwriting seatsOccupied from the form
  const { seatsOccupied, ...rest } = body;
  void seatsOccupied;
  store.slots[idx] = { ...store.slots[idx], ...rest };
  return NextResponse.json({ success: true, data: store.slots[idx] });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  store.slots = store.slots.filter(s => s.id !== id);
  return NextResponse.json({ success: true });
}
