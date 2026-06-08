import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

// GET /api/organizer/dashboard — full dashboard data
export async function GET() {
  const seatData = store.slots.map(slot => {
    const course = store.courses.find(c => c.id === slot.courseId);
    const teacher = store.teachers.find(t => t.id === slot.teacherId);
    return {
      id: slot.id,
      slotName: slot.slotName,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      course: course?.courseCode || 'Unknown',
      teacher: teacher?.name || 'Unknown',
      occupied: slot.seatsOccupied,
      limit: slot.seatLimit,
    };
  });

  const uniqueStudentsRegistered = new Set(store.registrations.map(r => r.studentId)).size;

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalCourses: store.courses.length,
        totalStudents: store.students.length,
        activeRegistrations: store.registrations.length,
        slotsConfigured: store.slots.length,
        studentsRegistered: uniqueStudentsRegistered,
      },
      seats: seatData,
      registrationOpen: store.registrationOpen,
    },
  });
}

// PUT /api/organizer/dashboard — toggle registration
export async function PUT(req: NextRequest) {
  const { registrationOpen } = await req.json();
  if (typeof registrationOpen === 'boolean') {
    store.registrationOpen = registrationOpen;
  }
  return NextResponse.json({ success: true, data: { registrationOpen: store.registrationOpen } });
}
