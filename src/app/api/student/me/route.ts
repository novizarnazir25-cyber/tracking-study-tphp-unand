import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateSemester, evaluateAttentionStatus, calculateEstimatedProgress } from '@/lib/calculations';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    if (user.role !== 'MAHASISWA' || !user.studentId) {
      return NextResponse.json(
        { error: 'Endpoint ini khusus untuk mahasiswa yang sedang masuk.' },
        { status: 403 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        pembimbingUtama: true,
        pembimbingPendamping: true,
        stages: {
          orderBy: { stageKey: 'asc' },
        },
        chapters: {
          orderBy: { chapterNum: 'asc' },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          include: {
            reporter: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        followUps: {
          orderBy: { createdAt: 'desc' },
        },
        titleHistory: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student || student.isArchived) {
      return NextResponse.json({ error: 'Data mahasiswa tidak ditemukan atau telah diarsipkan.' }, { status: 404 });
    }

    // Ambil konfigurasi bobot & ambang batas
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const reminderReportDays = parseInt(settingsMap['reminder_report_days'] || '30', 10);
    const reminderSubstantiveDays = parseInt(settingsMap['reminder_substantive_days'] || '60', 10);
    const studyPeriodThreshold = parseInt(settingsMap['study_period_semester_threshold'] || '8', 10);
    const currentYear = parseInt(settingsMap['current_calendar_year'] || '2025', 10);
    const semesterType = (settingsMap['semester_type'] || 'genap') as 'ganjil' | 'genap';

    const semCalc = calculateSemester(
      student.angkatan,
      student.semesterManual,
      student.semesterCuti,
      currentYear,
      semesterType
    );

    const attention = evaluateAttentionStatus({
      statusAkademik: student.statusAkademik,
      semester: semCalc.semester,
      tglLaporanTerakhir: student.tglLaporanTerakhir,
      tglKemajuanSubstantif: student.tglKemajuanSubstantif,
      kebutuhanBantuanProdi: student.reports.some((r) => r.kebutuhanBantuanProdi),
      targetTahapanTerlewati: false,
      tahapUtama: student.tahapUtama,
      hasJudul: !!student.judulSkripsi,
      rules: {
        reminderReportDays,
        reminderSubstantiveDays,
        studyPeriodSemesterThreshold: studyPeriodThreshold,
      },
    });

    let customWeights = undefined;
    try {
      if (settingsMap['stage_weights']) {
        customWeights = JSON.parse(settingsMap['stage_weights']);
      }
    } catch {}

    const progressEstimate = calculateEstimatedProgress(
      student.stages,
      customWeights
    );

    return NextResponse.json({
      success: true,
      data: {
        ...student,
        calculatedSemester: semCalc.semester,
        semesterSource: semCalc.source,
        calculatedAttention: attention,
        progressPercentage: progressEstimate.percentage,
        progressBreakdown: progressEstimate.breakdown,
      },
    });
  } catch (error: any) {
    console.error('Error fetching student portal data:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memuat data portal mahasiswa.' },
      { status: 500 }
    );
  }
}
