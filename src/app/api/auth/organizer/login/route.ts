import { NextRequest, NextResponse } from 'next/server';
import { compareSync } from 'bcryptjs';
import { store } from '@/lib/store';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password required' }, { status: 400 });
    }

    const organizer = store.organizers.find(o => o.username === username);
    if (!organizer || !compareSync(password, organizer.password)) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await signToken({ sub: organizer.id, role: 'organizer' });

    return NextResponse.json({
      success: true,
      data: { token, username: organizer.username },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
