'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import StudentProgressInputModal from '@/components/StudentProgressInputModal';
import StatusBadge from '@/components/StatusBadge';
import {
  GraduationCap,
  User,
  Users,
  Calendar,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  ExternalLink,
  Home,
} from 'lucide-react';

const STAGE_NAMES: Record<string, string> = {
  penetapan_judul: 'Penetapan Judul & Proposal',
  seminar_proposal: 'Seminar Proposal Skripsi',
  penelitian: 'Penelitian Lab / Pengambilan Data',
  penulisan_skripsi: 'Penulisan Naskah Skripsi',
  seminar_hasil: 'Seminar Hasil Penelitian',
  ujian_sarjana: 'Ujian Sarjana / Sidang Skripsi',
};

const CHAPTER_LABELS: Record<string, { label: string; color: string }> = {
  belum_dimulai: { label: 'Belum Dimulai', color: 'bg-slate-100 text-slate-600' },
  draf: { label: 'Penyusunan Draf', color: 'bg-blue-100 text-blue-800' },
  ditinjau_pembimbing: { label: 'Ditinjau Pembimbing', color: 'bg-amber-100 text-amber-800' },
  revisi: { label: 'Sedang Revisi', color: 'bg-orange-100 text-orange-800' },
  disetujui: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-800' },
};

export default function MahasiswaPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      // Jika role bukan MAHASISWA, alihkan ke dashboard
      if (userData.user.role !== 'MAHASISWA') {
        router.push('/dashboard');
        return;
      }

      // Ambil data profil dan progres mahasiswa
      const res = await fetch('/api/student/me');
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Gagal memuat data portal mahasiswa.');
      }

      setStudent(resJson.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleReportSuccess = () => {
    setToastMessage('Kemajuan studi Anda berhasil dicatat dan disinkronkan ke sistem!');
    setTimeout(() => setToastMessage(null), 5000);
    fetchPortalData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={currentUser} />
      <DemoBanner />

      <div className="flex flex-1">
        <Sidebar userRole={currentUser?.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Breadcrumb & Tombol Beranda */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-unand-800 hover:bg-slate-50 transition shadow-2xs"
            >
              <Home className="w-4 h-4 text-unand-800" />
              <span>&larr; Beranda Utama TPHP StudyTrack</span>
            </Link>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                &times;
              </button>
            </div>
          )}

          {/* Header Banner Mahasiswa */}
          <div className="bg-gradient-to-r from-unand-900 via-unand-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-gold-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-gold-300 font-semibold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Portal Studi Mahasiswa TPHP &bull; FATETA Universitas Andalas</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {student?.nama || currentUser?.name || 'Mahasiswa TPHP'}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200 font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>NIM: <strong className="text-white font-mono">{student?.nim || currentUser?.username}</strong></span>
                  <span>&bull;</span>
                  <span>Angkatan: <strong className="text-white">{student?.angkatan || '-'}</strong></span>
                  <span>&bull;</span>
                  <span>Semester Berjalan: <strong className="text-gold-300">Semester {student?.calculatedSemester || '-'}</strong></span>
                </p>
              </div>

              {/* Tombol Input Kemajuan */}
              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowInputModal(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Input Kemajuan Studi Saya</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-unand-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Memuat data kemajuan studi Anda...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Ringkasan Status & Estimasi Progres */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Progres Penyelesaian */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Estimasi Progres Tugas Akhir
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-unand-900">
                        {student.progressPercentage}%
                      </span>
                      <span className="text-xs text-slate-500 font-medium">dari total tahapan</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-unand-700 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, student.progressPercentage))}%` }}
                    />
                  </div>
                </div>

                {/* Tahapan Terkini */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tahapan Utama Saat Ini
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {STAGE_NAMES[student.tahapUtama] || student.tahapUtama}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Laporan Terakhir:</span>
                    <strong className="text-slate-800 font-medium">
                      {student.tglLaporanTerakhir || 'Belum dilaporkan'}
                    </strong>
                  </div>
                </div>

                {/* Status Evaluasi Akademik */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Status Evaluasi Studi
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={student.statusPerhatian} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {student.alasanPerhatian || 'Pemantauan studi berjalan sesuai rencana akademik.'}
                  </p>
                </div>
              </div>

              {/* Informasi Judul Tugas Akhir & Tim Pembimbing */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Judul & Topik Penelitian */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <BookOpen className="w-5 h-5 text-unand-800" />
                    <h3 className="text-base font-bold text-slate-900">
                      Rencana & Judul Tugas Akhir
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
                        Judul Skripsi:
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                        {student.judulSkripsi || 'Judul skripsi belum ditetapkan.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Bidang Penelitian:</span>
                        <strong className="text-slate-700 font-semibold">
                          {student.bidangPenelitian || 'Teknologi Pangan dan Hasil Pertanian'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Target Penyelesaian:</span>
                        <strong className="text-slate-700 font-semibold">
                          {student.targetSelesai || 'Sesuai Kalender Akademik'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tim Dosen Pembimbing */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Users className="w-5 h-5 text-unand-800" />
                    <h3 className="text-base font-bold text-slate-900">
                      Dosen Pembimbing
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Pembimbing Utama */}
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                        Pembimbing Utama
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {student.pembimbingUtama?.namaGelar || 'Belum ditetapkan'}
                      </p>
                      {student.pembimbingUtama?.email && (
                        <p className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.pembimbingUtama.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Pembimbing Pendamping */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                        Pembimbing Pendamping
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {student.pembimbingPendamping?.namaGelar || 'Belum ditetapkan'}
                      </p>
                      {student.pembimbingPendamping?.email && (
                        <p className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.pembimbingPendamping.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kemajuan Naskah Tiap Bab (Bab I - V) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-unand-800" />
                    <h3 className="text-base font-bold text-slate-900">
                      Status Naskah Skripsi per Bab
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowInputModal(true)}
                    className="text-xs font-semibold text-unand-800 hover:text-unand-900 flex items-center gap-1"
                  >
                    <span>Perbarui Bab &rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {(student.chapters || []).map((ch: any) => {
                    const statusInfo = CHAPTER_LABELS[ch.status] || {
                      label: ch.status,
                      color: 'bg-slate-100 text-slate-700',
                    };
                    return (
                      <div
                        key={ch.id || ch.chapterNum}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {ch.chapterName || `Bab ${ch.chapterNum}`}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {ch.catatan || 'Naskah bab'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block text-center ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Riwayat Laporan Kemajuan & Asistensi Bimbingan */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-unand-800" />
                    <h3 className="text-base font-bold text-slate-900">
                      Riwayat Pembaruan Kemajuan & Asistensi
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {student.reports?.length || 0} Catatan Tercatat
                  </span>
                </div>

                {!student.reports || student.reports.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs space-y-2">
                    <p>Belum ada catatan kemajuan yang tercatat.</p>
                    <button
                      onClick={() => setShowInputModal(true)}
                      className="px-4 py-2 bg-unand-800 hover:bg-unand-900 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Buat Laporan Pertama Sekarang</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {student.reports.map((rep: any) => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition space-y-2 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {rep.reporterName}
                            </span>
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                              {rep.reporterRole}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {rep.tglLaporan}
                          </span>
                        </div>

                        <p className="text-slate-800 leading-relaxed font-medium">
                          {rep.ringkasanKemajuan || 'Pembaruan berkala kemajuan studi.'}
                        </p>

                        {rep.hambatanUtama && rep.hambatanUtama !== 'Tidak ada hambatan signifikan.' && (
                          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-amber-900 text-[11px]">
                            <strong>Kendala/Hambatan:</strong> {rep.hambatanUtama}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                          {rep.tglBimbinganTerakhir && (
                            <span>Tgl Bimbingan: <strong className="text-slate-700">{rep.tglBimbinganTerakhir}</strong></span>
                          )}
                          {rep.tindakanBerikutnya && (
                            <span>Langkah Berikutnya: <strong className="text-slate-700">{rep.tindakanBerikutnya}</strong></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal Input Kemajuan Mahasiswa */}
          {showInputModal && student && (
            <StudentProgressInputModal
              isOpen={showInputModal}
              onClose={() => setShowInputModal(false)}
              student={student}
              onSuccess={handleReportSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
}
