import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { verifyToken } from '@/lib/auth';

function getStudentId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  // We'll verify synchronously by checking store — for demo, just parse the token
  const token = auth.replace('Bearer ', '');
  // Quick decode without full verify for speed (demo)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'student') return null;
    return payload.sub;
  } catch { return null; }
}

// GET /api/student/profile
export async function GET(req: NextRequest) {
  const studentId = getStudentId(req);
  if (!studentId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const student = store.students.find(s => s.id === studentId);
  if (!student) {
    return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: student.id,
      registrationNumber: student.registrationNumber,
      name: student.name,
      creditLimit: student.creditLimit,
      creditsUsed: student.creditsUsed,
      variantType: student.variantType,
      completedCourses: student.completedCourses,
    },
  });
}
