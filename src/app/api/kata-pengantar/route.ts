import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { formatJakartaDateTime } from '@/lib/timezone';
import { DEFAULT_KATA_PENGANTAR, KataPengantarData } from '@/lib/kataPengantarDefaults';

export async function GET() {
  try {
    const user = await getCurrentUser().catch(() => null);

    const canEdit = Boolean(
      user &&
        (user.role === 'ADMIN' ||
          user.role === 'KAPRODI' ||
          user.username === 'novizar')
    );

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'kata_pengantar_judul',
            'kata_pengantar_subjudul',
            'kata_pengantar_nama',
            'kata_pengantar_jabatan',
            'kata_pengantar_fakultas',
            'kata_pengantar_foto',
            'kata_pengantar_p1',
            'kata_pengantar_p2',
            'kata_pengantar_p3',
            'kata_pengantar_p4',
            'kata_pengantar_p5',
            'kata_pengantar_updated_at',
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    const data = {
      judul: map['kata_pengantar_judul'] || DEFAULT_KATA_PENGANTAR.judul,
      subjudul: map['kata_pengantar_subjudul'] || DEFAULT_KATA_PENGANTAR.subjudul,
      nama: map['kata_pengantar_nama'] || DEFAULT_KATA_PENGANTAR.nama,
      jabatan: map['kata_pengantar_jabatan'] || DEFAULT_KATA_PENGANTAR.jabatan,
      fakultas: map['kata_pengantar_fakultas'] || DEFAULT_KATA_PENGANTAR.fakultas,
      fotoUrl: map['kata_pengantar_foto'] || DEFAULT_KATA_PENGANTAR.fotoUrl,
      paragraf1: map['kata_pengantar_p1'] || DEFAULT_KATA_PENGANTAR.paragraf1,
      paragraf2: map['kata_pengantar_p2'] || DEFAULT_KATA_PENGANTAR.paragraf2,
      paragraf3: map['kata_pengantar_p3'] || DEFAULT_KATA_PENGANTAR.paragraf3,
      paragraf4: map['kata_pengantar_p4'] || DEFAULT_KATA_PENGANTAR.paragraf4,
      paragraf5: map['kata_pengantar_p5'] || DEFAULT_KATA_PENGANTAR.paragraf5,
      updatedAt: map['kata_pengantar_updated_at'] || formatJakartaDateTime(new Date()),
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
    console.error('Error fetching kata pengantar:', error);
    return NextResponse.json(
      { error: 'Gagal memuat kata pengantar.' },
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
      user.role === 'ADMIN' ||
      user.role === 'KAPRODI' ||
      user.username === 'novizar';

    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            'Hanya Administrator atau Ketua Departemen yang berwenang mengubah konten Kata Pengantar.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      judul = DEFAULT_KATA_PENGANTAR.judul,
      subjudul = DEFAULT_KATA_PENGANTAR.subjudul,
      nama = DEFAULT_KATA_PENGANTAR.nama,
      jabatan = DEFAULT_KATA_PENGANTAR.jabatan,
      fakultas = DEFAULT_KATA_PENGANTAR.fakultas,
      fotoUrl = DEFAULT_KATA_PENGANTAR.fotoUrl,
      paragraf1 = DEFAULT_KATA_PENGANTAR.paragraf1,
      paragraf2 = DEFAULT_KATA_PENGANTAR.paragraf2,
      paragraf3 = DEFAULT_KATA_PENGANTAR.paragraf3,
      paragraf4 = DEFAULT_KATA_PENGANTAR.paragraf4,
      paragraf5 = DEFAULT_KATA_PENGANTAR.paragraf5,
    } = body;

    const nowFormatted = formatJakartaDateTime(new Date());

    const upsertSetting = async (key: string, value: string, desc: string) => {
      await prisma.setting.upsert({
        where: { key },
        update: { value, description: desc },
        create: { key, value, description: desc },
      });
    };

    await upsertSetting('kata_pengantar_judul', String(judul).trim(), 'Judul Kata Pengantar');
    await upsertSetting('kata_pengantar_subjudul', String(subjudul).trim(), 'Subjudul Kata Pengantar');
    await upsertSetting('kata_pengantar_nama', String(nama).trim(), 'Nama Lengkap & Gelar Ketua Departemen');
    await upsertSetting('kata_pengantar_jabatan', String(jabatan).trim(), 'Jabatan Resmi Ketua Departemen');
    await upsertSetting('kata_pengantar_fakultas', String(fakultas).trim(), 'Fakultas & Universitas');
    await upsertSetting('kata_pengantar_foto', String(fotoUrl).trim(), 'URL / Path Foto Resmi Ketua Departemen');
    await upsertSetting('kata_pengantar_p1', String(paragraf1).trim(), 'Paragraf 1 Kata Pengantar');
    await upsertSetting('kata_pengantar_p2', String(paragraf2).trim(), 'Paragraf 2 Kata Pengantar');
    await upsertSetting('kata_pengantar_p3', String(paragraf3).trim(), 'Paragraf 3 Kata Pengantar');
    await upsertSetting('kata_pengantar_p4', String(paragraf4).trim(), 'Paragraf 4 Kata Pengantar');
    await upsertSetting('kata_pengantar_p5', String(paragraf5).trim(), 'Paragraf 5 Kata Pengantar');
    await upsertSetting('kata_pengantar_updated_at', nowFormatted, 'Waktu Pembaruan Kata Pengantar');

    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE',
      entity: 'Setting',
      details: `${user.role} (${user.name}) memperbarui konten Kata Pengantar Ketua Departemen TPHP.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Kata Pengantar Ketua Departemen berhasil diperbarui.',
      data: {
        judul: String(judul).trim(),
        subjudul: String(subjudul).trim(),
        nama: String(nama).trim(),
        jabatan: String(jabatan).trim(),
        fakultas: String(fakultas).trim(),
        fotoUrl: String(fotoUrl).trim(),
        paragraf1: String(paragraf1).trim(),
        paragraf2: String(paragraf2).trim(),
        paragraf3: String(paragraf3).trim(),
        paragraf4: String(paragraf4).trim(),
        paragraf5: String(paragraf5).trim(),
        updatedAt: nowFormatted,
      },
    });
  } catch (error: any) {
    console.error('Error updating kata pengantar:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan pembaruan kata pengantar.' },
      { status: 500 }
    );
  }
}
