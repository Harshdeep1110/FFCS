import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

// GET /api/student/courses — available courses with slots grouped by teacher
export async function GET() {
  const courses = store.courses.map(course => {
    // Group slots by teacher
    const courseSlots = store.slots.filter(s => s.courseId === course.id);
    const teacherMap = new Map<string, { teacher: typeof store.teachers[0]; slots: typeof courseSlots }>();

    for (const slot of courseSlots) {
      const teacher = store.teachers.find(t => t.id === slot.teacherId);
      if (!teacher) continue;

      if (!teacherMap.has(teacher.id)) {
        teacherMap.set(teacher.id, { teacher, slots: [] });
      }
      teacherMap.get(teacher.id)!.slots.push(slot);
    }

    return {
      ...course,
      teachers: Array.from(teacherMap.values()).map(({ teacher, slots }) => ({
        id: teacher.id,
        name: teacher.name,
        slots: slots.map(s => ({
          ...s,
          dayTime: `${s.day.slice(0, 3)} ${s.startTime}-${s.endTime}`,
        })),
      })),
    };
  });

  return NextResponse.json({ success: true, data: courses });
}
