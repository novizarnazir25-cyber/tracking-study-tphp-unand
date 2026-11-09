'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BookOpen,
  FileText,
  AlertTriangle,
  HelpCircle,
  Link2,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSuccess: () => void;
}

const STAGE_OPTIONS = [
  { key: 'penetapan_judul', label: '1. Penetapan Judul & Pengajuan Proposal' },
  { key: 'seminar_proposal', label: '2. Seminar Proposal Skripsi' },
  { key: 'penelitian', label: '3. Penelitian Laboratorium / Pengumpulan Data' },
  { key: 'penulisan_skripsi', label: '4. Penulisan Naskah Skripsi & Pengolahan Data' },
  { key: 'seminar_hasil', label: '5. Seminar Hasil Penelitian' },
  { key: 'ujian_sarjana', label: '6. Ujian Sarjana / Sidang Komprehensif' },
];

const CHAPTER_STATUS_OPTIONS = [
  { value: 'belum_dimulai', label: 'Belum Dimulai' },
  { value: 'draf', label: 'Penyusunan Draf' },
  { value: 'ditinjau_pembimbing', label: 'Ditinjau Pembimbing' },
  { value: 'revisi', label: 'Sedang Revisi' },
  { value: 'disetujui', label: 'Disetujui Pembimbing' },
];

export default function StudentProgressInputModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: Props) {
  if (!isOpen || !student) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [tahapUtama, setTahapUtama] = useState(student.tahapUtama || 'penelitian');
  const [ringkasanKemajuan, setRingkasanKemajuan] = useState('');
  const [tglBimbinganTerakhir, setTglBimbinganTerakhir] = useState(todayStr);
  const [hambatanUtama, setHambatanUtama] = useState('');
  const [tindakanBerikutnya, setTindakanBerikutnya] = useState('');
  const [targetTindakLanjut, setTargetTindakLanjut] = useState('');
  const [tautanDokumen, setTautanDokumen] = useState('');
  const [kebutuhanBantuanProdi, setKebutuhanBantuanProdi] = useState(false);
  const [kebutuhanBantuanCatatan, setKebutuhanBantuanCatatan] = useState('');

  // Bab 1 - 5 progress state
  const existingChapters = student.chapters || [];
  const [chapters, setChapters] = useState([
    {
      num: 1,
      name: 'Bab I: Pendahuluan',
      status: existingChapters.find((c: any) => c.chapterNum === 1)?.status || 'belum_dimulai',
    },
    {
      num: 2,
      name: 'Bab II: Tinjauan Pustaka',
      status: existingChapters.find((c: any) => c.chapterNum === 2)?.status || 'belum_dimulai',
    },
    {
      num: 3,
      name: 'Bab III: Metodologi Penelitian',
      status: existingChapters.find((c: any) => c.chapterNum === 3)?.status || 'belum_dimulai',
    },
    {
      num: 4,
      name: 'Bab IV: Hasil dan Pembahasan',
      status: existingChapters.find((c: any) => c.chapterNum === 4)?.status || 'belum_dimulai',
    },
    {
      num: 5,
      name: 'Bab V: Kesimpulan dan Saran',
      status: existingChapters.find((c: any) => c.chapterNum === 5)?.status || 'belum_dimulai',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChapterChange = (num: number, status: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.num === num ? { ...c, status } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ringkasanKemajuan.trim()) {
      setError('Mohon tuliskan ringkasan kemajuan studi yang telah Anda capai.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Siapkan stage updates
      const stageUpdates = [
        {
          stageKey: tahapUtama,
          status: 'sedang_berjalan',
          tglMulai: todayStr,
        },
      ];

      // Siapkan chapter updates
      const chapterUpdates = chapters.map((ch) => ({
        chapterNum: ch.num,
        status: ch.status,
      }));

      // Tambahkan info tautan dokumen ke ringkasan jika ada
      let finalRingkasan = ringkasanKemajuan.trim();
      if (tautanDokumen.trim()) {
        finalRingkasan += `\n\n[Tautan Berkas/Draf]: ${tautanDokumen.trim()}`;
      }

      const res = await fetch(`/api/students/${student.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedVersion: student.version,
          ringkasanKemajuan: finalRingkasan,
          tglBimbinganTerakhir: tglBimbinganTerakhir || todayStr,
          hambatanUtama: hambatanUtama.trim() || 'Tidak ada kendala yang menghambat.',
          tindakanBerikutnya: tindakanBerikutnya.trim() || 'Melanjutkan penulisan dan asistensi sesuai jadwal.',
          penanggungJawabTindakan: student.nama,
          targetTindakLanjut: targetTindakLanjut || undefined,
          kebutuhanBantuanProdi,
          kebutuhanBantuanCatatan: kebutuhanBantuanProdi ? kebutuhanBantuanCatatan.trim() : null,
          tahapUtamaBaru: tahapUtama,
          stageUpdates,
          chapterUpdates,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Gagal menyimpan laporan kemajuan.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-unand-900 to-unand-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Input Kemajuan Studi Mahasiswa
              </h3>
              <p className="text-xs text-emerald-200">
                {student.nama} &bull; NIM: {student.nim}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Tahap Utama Studi */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-unand-800" />
              <span>Tahapan Studi Terkini:</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={tahapUtama}
              onChange={(e) => setTahapUtama(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-unand-800 focus:border-unand-800"
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Status Kemajuan Tiap Bab */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-unand-800" />
                Kemajuan Naskah Skripsi (Bab I - V)
              </span>
              <span className="text-[11px] text-slate-500">Pilih status tiap bab</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {chapters.map((ch) => (
                <div
                  key={ch.num}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between gap-1.5"
                >
                  <span className="font-semibold text-slate-700 text-xs">
                    {ch.name}
                  </span>
                  <select
                    value={ch.status}
                    onChange={(e) => handleChapterChange(ch.num, e.target.value)}
                    className="border border-slate-200 rounded-md p-1.5 text-[11px] bg-slate-50 text-slate-800 font-medium"
                  >
                    {CHAPTER_STATUS_OPTIONS.map((cOpt) => (
                      <option key={cOpt.value} value={cOpt.value}>
                        {cOpt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Ringkasan Kemajuan / Progres Terbaru */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Ringkasan Kemajuan yang Telah Dicapai:
              <span className="text-red-500"> *</span>
            </label>
            <textarea
              rows={3}
              required
              value={ringkasanKemajuan}
              onChange={(e) => setRingkasanKemajuan(e.target.value)}
              placeholder="Contoh: Telah menyelesaikan analisis laboratorium untuk parameter kadar air dan aktivitas antioksidan. Saat ini sedang menyusun draf Bab IV dan mendiskusikan grafik hasil penelitian."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-unand-800 focus:border-unand-800"
            />
          </div>

          {/* 4. Tanggal Konsultasi / Bimbingan Terakhir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-unand-800" />
                Tanggal Bimbingan Terakhir:
              </label>
              <input
                type="date"
                value={tglBimbinganTerakhir}
                onChange={(e) => setTglBimbinganTerakhir(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-white text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-unand-800" />
                Target Selesai Tahap Berikutnya:
              </label>
              <input
                type="date"
                value={targetTindakLanjut}
                onChange={(e) => setTargetTindakLanjut(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-white text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 5. Hambatan / Kendala yang Dihadapi */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Kendala / Hambatan yang Dihadapi (Jika ada):
            </label>
            <input
              type="text"
              value={hambatanUtama}
              onChange={(e) => setHambatanUtama(e.target.value)}
              placeholder="Contoh: Ketersediaan reagen lab sempat terlambat 1 minggu, saat ini menunggu giliran alat HPLC."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-unand-800"
            />
          </div>

          {/* 6. Rencana Tindakan Berikutnya */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Rencana Tindakan / Langkah Selanjutnya:
            </label>
            <input
              type="text"
              value={tindakanBerikutnya}
              onChange={(e) => setTindakanBerikutnya(e.target.value)}
              placeholder="Contoh: Menjadwalkan asistensi draf Bab IV dengan Pembimbing Utama pada hari Selasa depan."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-unand-800"
            />
          </div>

          {/* 7. Tautan Dokumen Pendukung (Google Drive / Naskah) */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-unand-800" />
              Tautan Draf Naskah / Berkas Pendukung (Opsional):
            </label>
            <input
              type="url"
              value={tautanDokumen}
              onChange={(e) => setTautanDokumen(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-unand-800"
            />
          </div>

          {/* 8. Kebutuhan Bantuan Departemen */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={kebutuhanBantuanProdi}
                onChange={(e) => setKebutuhanBantuanProdi(e.target.checked)}
                className="mt-0.5 rounded text-unand-800 focus:ring-unand-700 h-4 w-4"
              />
              <div>
                <span className="font-bold text-amber-950 block">
                  Memerlukan Dukungan / Fasilitasi Khusus dari Departemen
                </span>
                <span className="text-[11px] text-amber-800 leading-relaxed block">
                  Centang opsi ini jika Anda memerlukan bantuan koordinasi fasilitas lab, mediasi jadwal, atau pendampingan akademik dari pimpinan departemen.
                </span>
              </div>
            </label>

            {kebutuhanBantuanProdi && (
              <textarea
                rows={2}
                value={kebutuhanBantuanCatatan}
                onChange={(e) => setKebutuhanBantuanCatatan(e.target.value)}
                placeholder="Jelaskan kebutuhan fasilitasi yang Anda harapkan dari departemen..."
                className="w-full border border-amber-300 rounded-lg p-2 text-xs bg-white focus:ring-2 focus:ring-amber-600"
              />
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-unand-800 hover:bg-unand-900 text-white font-semibold transition flex items-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Mengirim Data...' : 'Kirim Kemajuan Studi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
