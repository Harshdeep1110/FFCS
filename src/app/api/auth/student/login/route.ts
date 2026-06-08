import { NextRequest, NextResponse } from 'next/server';
import { compareSync } from 'bcryptjs';
import { store } from '@/lib/store';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { registrationNumber, password } = await req.json();

    if (!registrationNumber || !password) {
      return NextResponse.json({ success: false, error: 'Registration number and password required' }, { status: 400 });
    }

    const student = store.students.find(s => s.registrationNumber === registrationNumber);
    if (!student || !compareSync(password, student.password)) {
      return NextResponse.json({ success: false, error: 'Invalid registration number or password' }, { status: 401 });
    }

    if (!store.registrationOpen) {
      return NextResponse.json({ success: false, error: 'Registration window is currently closed' }, { status: 403 });
    }

    const token = await signToken({
      sub: student.id,
      role: 'student',
      registrationNumber: student.registrationNumber,
      name: student.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        student: {
          id: student.id,
          registrationNumber: student.registrationNumber,
          name: student.name,
          creditLimit: student.creditLimit,
          creditsUsed: student.creditsUsed,
          variantType: student.variantType,
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
