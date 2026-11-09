import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, quickLoginRole, quickLoginUserId } = body;

    let user;

    // Fast-login feature for convenient testing and role switching
    if (quickLoginUserId) {
      user = await prisma.user.findUnique({
        where: { id: quickLoginUserId },
        include: { lecturer: true },
      });
    } else if (quickLoginRole) {
      user = await prisma.user.findFirst({
        where: { role: quickLoginRole, isActive: true },
        include: { lecturer: true, student: true },
      });
    } else {
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Username dan kata sandi wajib diisi.' },
          { status: 400 }
        );
      }

      user = await prisma.user.findFirst({
        where: {
          OR: [{ username: username }, { email: username }],
        },
        include: { lecturer: true, student: true },
      });

      // Auto-provisioning: Jika mahasiswa aktif belum memiliki User, buatkan secara otomatis
      if (!user) {
        const student = await prisma.student.findFirst({
          where: {
            nim: username.trim(),
            statusAkademik: 'aktif',
            isArchived: false,
          },
        });

        if (student) {
          const passHash = await bcrypt.hash(password, 10);
          user = await prisma.user.create({
            data: {
              username: student.nim,
              name: student.nama,
              email: student.email || `${student.nim}@student.unand.ac.id`,
              password: passHash,
              role: 'MAHASISWA',
              studentId: student.id,
              isActive: true,
            },
            include: { lecturer: true, student: true },
          });
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Username atau kata sandi tidak valid. Mahasiswa aktif silakan gunakan NIM.' },
          { status: 401 }
        );
      }

      // Verifikasi password:
      // Mendukung password tersimpan di DB, atau default NIM mahasiswa, atau 'mhs123'
      let isValid = await bcrypt.compare(password, user.password).catch(() => false);
      if (!isValid && user.role === 'MAHASISWA') {
        if (password === user.username || password === 'mhs123') {
          isValid = true;
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'Username atau kata sandi tidak valid.' },
          { status: 401 }
        );
      }
    }

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Akun dinonaktifkan atau tidak ditemukan.' },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role as 'ADMIN' | 'KAPRODI' | 'DOSEN' | 'MAHASISWA',
      lecturerId: user.lecturerId,
      studentId: user.studentId,
    };

    const token = signToken(sessionPayload);

    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: `Pengguna ${user.name} (${user.role}) berhasil masuk ke sistem.`,
    });

    const redirectTo = user.role === 'MAHASISWA' ? '/mahasiswa/portal' : '/dashboard';

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectTo,
      message: `Selamat datang, ${user.name}!`,
    });

    // Set cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error saat login:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat proses masuk.' },
      { status: 500 }
    );
  }
}
