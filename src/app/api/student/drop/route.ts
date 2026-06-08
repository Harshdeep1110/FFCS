import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

function getStudentId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  try {
    const payload = JSON.parse(atob(auth.replace('Bearer ', '').split('.')[1]));
    return payload.role === 'student' ? payload.sub : null;
  } catch { return null; }
}

// POST /api/student/drop — body: { courseId }
export async function POST(req: NextRequest) {
  const studentId = getStudentId(req);
  if (!studentId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ success: false, error: 'courseId is required' }, { status: 400 });
  }

  const result = store.dropCourse(studentId, courseId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Course dropped successfully' });
}
