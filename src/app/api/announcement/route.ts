import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { formatJakartaDateTime } from '@/lib/timezone';

const DEFAULT_ANNOUNCEMENT = {
  title: 'Jadwal Evaluasi Kemajuan Tugas Akhir & Pendaftaran Seminar Periode Berjalan',
  content:
    'Diberitahukan kepada seluruh mahasiswa tugas akhir dan Bapak/Ibu Dosen Pembimbing bahwa pendaftaran Seminar Proposal, Seminar Hasil, dan Ujian Sarjana periode berjalan dibuka hingga akhir bulan ini.\n\nMahasiswa yang telah menyelesaikan penelitian laboratorium dimohon segera berkonsultasi secara intensif dengan dosen pembimbing untuk mematangkan naskah skripsi (Bab I - V) dan menyelesaikan target tahapan studi tepat waktu.',
  badge: 'Penting',
  authorName: 'Prof. Dr. Novizar Nazir',
  authorRole: 'Ketua Program Studi TPHP',
  isActive: true,
};

export async function GET() {
  try {
    const user = await getCurrentUser().catch(() => null);

    const canEdit = Boolean(
      user &&
        (user.role === 'KAPRODI' ||
          user.role === 'ADMIN' ||
          user.username === 'novizar')
    );

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'announcement_title',
            'announcement_content',
            'announcement_badge',
            'announcement_author_name',
            'announcement_author_role',
            'announcement_updated_at',
            'announcement_is_active',
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    const data = {
      title: map['announcement_title'] || DEFAULT_ANNOUNCEMENT.title,
      content: map['announcement_content'] || DEFAULT_ANNOUNCEMENT.content,
      badge: map['announcement_badge'] || DEFAULT_ANNOUNCEMENT.badge,
      authorName: map['announcement_author_name'] || DEFAULT_ANNOUNCEMENT.authorName,
      authorRole: map['announcement_author_role'] || DEFAULT_ANNOUNCEMENT.authorRole,
      updatedAt: map['announcement_updated_at'] || formatJakartaDateTime(new Date()),
      isActive: map['announcement_is_active'] !== 'false',
    };

    return NextResponse.json({
      data,
      canEdit,
      currentUser: user
        ? {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Gagal memuat pengumuman prodi.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const canEdit =
      user.role === 'KAPRODI' ||
      user.role === 'ADMIN' ||
      user.username === 'novizar';

    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            'Hanya Ketua Program Studi atau Administrator yang berwenang memperbarui pengumuman.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      badge = 'Penting',
      authorName = 'Prof. Dr. Novizar Nazir',
      authorRole = 'Ketua Program Studi TPHP',
      isActive = true,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Judul pengumuman wajib diisi.' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Isi pengumuman wajib diisi.' },
        { status: 400 }
      );
    }

    const nowFormatted = formatJakartaDateTime(new Date());

    const upsertSetting = async (key: string, value: string, desc: string) => {
      await prisma.setting.upsert({
        where: { key },
        update: { value, description: desc },
        create: { key, value, description: desc },
      });
    };

    await upsertSetting('announcement_title', title.trim(), 'Judul Pengumuman Halaman Depan');
    await upsertSetting('announcement_content', content.trim(), 'Isi Pengumuman Halaman Depan');
    await upsertSetting('announcement_badge', badge.trim(), 'Kategori / Label Pengumuman');
    await upsertSetting(
      'announcement_author_name',
      authorName.trim(),
      'Nama Penandatangan Pengumuman'
    );
    await upsertSetting(
      'announcement_author_role',
      authorRole.trim(),
      'Jabatan Penandatangan Pengumuman'
    );
    await upsertSetting('announcement_updated_at', nowFormatted, 'Waktu Pembaruan Pengumuman');
    await upsertSetting(
      'announcement_is_active',
      String(isActive),
      'Status Tayang Pengumuman Halaman Depan'
    );

    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE',
      entity: 'Announcement',
      details: `Ketua Prodi/Admin (${user.name}) memperbarui Pengumuman Halaman Depan: "${title.trim()}".`,
    });

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil diperbarui dan ditayangkan di halaman depan.',
      data: {
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim(),
        authorName: authorName.trim(),
        authorRole: authorRole.trim(),
        updatedAt: nowFormatted,
        isActive: Boolean(isActive),
      },
    });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan pengumuman.' },
      { status: 500 }
    );
  }
}
