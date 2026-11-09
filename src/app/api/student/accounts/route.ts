import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { ensureStudentUserAccounts } from '@/lib/studentAccounts';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Hanya Admin dan Kaprodi yang dapat melihat daftar akun mahasiswa
    if (user.role !== 'ADMIN' && user.role !== 'KAPRODI') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya pengelola program studi yang berwenang melihat akun mahasiswa.' },
        { status: 403 }
      );
    }

    const students = await prisma.student.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        nim: true,
        nama: true,
        angkatan: true,
        statusAkademik: true,
        tahapUtama: true,
        judulSkripsi: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        pembimbingUtama: {
          select: { namaGelar: true },
        },
      },
      orderBy: { nim: 'asc' },
    });

    const totalStudents = students.length;
    const withAccountCount = students.filter((s) => s.user).length;

    return NextResponse.json({
      success: true,
      data: students,
      stats: {
        totalStudents,
        withAccountCount,
        withoutAccountCount: totalStudents - withAccountCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching student accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memuat daftar akun mahasiswa.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Administrator yang berwenang mengelola akun pengguna mahasiswa.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, studentId, nim } = body;

    if (action === 'sync_all') {
      const result = await ensureStudentUserAccounts({ includeAll: true });
      await logAudit({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entity: 'UserAccounts',
        details: `Sinkronisasi seluruh ${result.total} akun mahasiswa TPHP. Dibuat baru: ${result.createdCount}.`,
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menyinkronkan seluruh ${result.total} akun mahasiswa TPHP.`,
        data: result,
      });
    }

    if (action === 'reset_all_passwords') {
      const result = await ensureStudentUserAccounts({ resetPassword: true, includeAll: true });
      await logAudit({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entity: 'UserAccounts',
        details: `Reset kata sandi seluruh akun mahasiswa TPHP ke NIM masing-masing.`,
      });

      return NextResponse.json({
        success: true,
        message: 'Seluruh kata sandi akun mahasiswa berhasil direset ke NIM masing-masing (dan mhs123).',
        data: result,
      });
    }

    if (action === 'reset_single') {
      if (!studentId && !nim) {
        return NextResponse.json({ error: 'NIM atau studentId wajib disertakan.' }, { status: 400 });
      }

      const st = await prisma.student.findFirst({
        where: studentId ? { id: studentId } : { nim },
      });

      if (!st) {
        return NextResponse.json({ error: 'Mahasiswa tidak ditemukan.' }, { status: 404 });
      }

      const passHash = await bcrypt.hash(st.nim, 10);
      const userAcc = await prisma.user.upsert({
        where: { username: st.nim },
        update: {
          password: passHash,
          studentId: st.id,
          role: 'MAHASISWA',
          isActive: true,
        },
        create: {
          username: st.nim,
          name: st.nama,
          email: st.email || `${st.nim}@student.unand.ac.id`,
          password: passHash,
          role: 'MAHASISWA',
          studentId: st.id,
          isActive: true,
        },
      });

      await logAudit({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entity: 'User',
        entityId: userAcc.id,
        details: `Reset kata sandi akun mahasiswa ${st.nama} (${st.nim}) ke NIM bawaan.`,
      });

      return NextResponse.json({
        success: true,
        message: `Kata sandi akun mahasiswa ${st.nama} (${st.nim}) berhasil direset ke NIM-nya.`,
      });
    }

    return NextResponse.json({ error: 'Aksi pengelolaan tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing student accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pengelolaan akun mahasiswa.' },
      { status: 500 }
    );
  }
}
