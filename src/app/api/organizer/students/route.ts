import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { hashSync } from 'bcryptjs';

export async function GET() {
  const students = store.students.map(s => ({
    id: s.id,
    registrationNumber: s.registrationNumber,
    name: s.name,
    creditLimit: s.creditLimit,
    creditsUsed: s.creditsUsed,
    variantType: s.variantType,
    registrationCount: store.registrations.filter(r => r.studentId === s.id).length,
  }));
  return NextResponse.json({ success: true, data: students });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const student = {
    id: `stu-${Date.now()}`,
    registrationNumber: body.registrationNumber || '',
    password: hashSync(body.password || 'password', 10),
    name: body.name || '',
    creditLimit: body.creditLimit || 27,
    creditsUsed: 0,
    variantType: (body.variantType || 'HOSTELLER') as 'HOSTELLER' | 'DAY_BOARDER',
    completedCourses: body.completedCourses || [],
  };
  store.students.push(student);
  return NextResponse.json({ success: true, data: { ...student, password: undefined } });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  store.students = store.students.filter(s => s.id !== id);
  store.registrations = store.registrations.filter(r => r.studentId !== id);
  return NextResponse.json({ success: true });
}
