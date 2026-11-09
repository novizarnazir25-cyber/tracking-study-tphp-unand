import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Get additional info like lecturer name or student details
  let lecturer = null;
  if (user.lecturerId) {
    lecturer = await prisma.lecturer.findUnique({
      where: { id: user.lecturerId },
    });
  }

  let student = null;
  if (user.studentId) {
    student = await prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        pembimbingUtama: { select: { id: true, namaGelar: true, email: true, noHp: true } },
        pembimbingPendamping: { select: { id: true, namaGelar: true, email: true, noHp: true } },
      },
    });
  }

  return NextResponse.json({
    user: {
      ...user,
      lecturer,
      student,
    },
  });
}
