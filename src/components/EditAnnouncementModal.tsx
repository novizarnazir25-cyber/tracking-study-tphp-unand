'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Megaphone,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  Tag,
  UserCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  announcement: {
    title: string;
    content: string;
    badge: string;
    authorName: string;
    authorRole: string;
    updatedAt?: string;
    isActive: boolean;
  };
  onSuccess: (updated: any) => void;
}

const BADGE_PRESETS = [
  { label: 'Penting', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { label: 'Agenda Seminar & Sidang', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Batas Waktu Pelaporan', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Informasi Akademik', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Pemberitahuan Prodi', color: 'bg-purple-100 text-purple-800 border-purple-200' },
];

export default function EditAnnouncementModal({
  isOpen,
  onClose,
  announcement,
  onSuccess,
}: Props) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [badge, setBadge] = useState(announcement?.badge || 'Penting');
  const [authorName, setAuthorName] = useState(
    announcement?.authorName || 'Prof. Dr. Novizar Nazir'
  );
  const [authorRole, setAuthorRole] = useState(
    announcement?.authorRole || 'Ketua Program Studi TPHP'
  );
  const [isActive, setIsActive] = useState<boolean>(
    announcement?.isActive !== undefined ? announcement.isActive : true
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setBadge(announcement.badge || 'Penting');
      setAuthorName(announcement.authorName || 'Prof. Dr. Novizar Nazir');
      setAuthorRole(announcement.authorRole || 'Ketua Program Studi TPHP');
      setIsActive(announcement.isActive !== undefined ? announcement.isActive : true);
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          badge: badge.trim(),
          authorName: authorName.trim(),
          authorRole: authorRole.trim(),
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui pengumuman prodi.');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-unand-950 via-unand-900 to-unand-850 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
              <Megaphone className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gold-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                  Wewenang Ketua Prodi
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white mt-0.5">
                Perbarui Pengumuman Halaman Depan
              </h3>
              <p className="text-xs text-slate-300">
                Pesan resmi Program Studi yang langsung tampil di beranda depan untuk seluruh mahasiswa dan dosen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Quick Notice */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Pengumuman ini dapat diisi dengan jadwal evaluasi tugas akhir, tenggat pendaftaran sempro/semhas/sidang, ketersediaan alat laboratorium, atau instruksi akademik penting dari Ketua Program Studi.
            </p>
          </div>

          {/* 1. Judul Pengumuman */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-unand-800" /> Judul Pengumuman <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Jelas & informatif</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Evaluasi Kemajuan Tugas Akhir & Pendaftaran Seminar Periode Berjalan"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
            />
          </div>

          {/* 2. Kategori / Label Preset */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-unand-800" /> Kategori / Label Pengumuman
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {BADGE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setBadge(p.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    badge === p.label
                      ? 'bg-unand-800 text-white border-unand-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Ketik kategori kustom jika diperlukan..."
              className="w-full border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
            />
          </div>

          {/* 3. Isi Pengumuman */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>📝 Isi Pengumuman / Pesan Ketua Prodi</span> <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Gunakan baris baru untuk memisahkan paragraf</span>
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan isi pengumuman atau instruksi lengkap dari Ketua Prodi di sini..."
              className="w-full border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
            />
          </div>

          {/* 4. Identitas Penandatangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-unand-800" /> Nama Penandatangan:
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Prof. Dr. Novizar Nazir"
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-unand-800 focus:outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Jabatan Penandatangan:
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Ketua Program Studi TPHP"
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-unand-800 focus:outline-hidden bg-white"
              />
            </div>
          </div>

          {/* 5. Toggle Status Tayang */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                Status Penayangan di Halaman Depan
              </span>
              <span className="text-[11px] text-slate-500">
                {isActive
                  ? 'Pengumuman saat ini AKTIF dan dapat dibaca oleh seluruh civitas akademika.'
                  : 'Pengumuman disembunyikan sementara dari halaman depan.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border ${
                isActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
              }`}
            >
              {isActive ? '✓ Ditayangkan (Aktif)' : '✕ Disembunyikan'}
            </button>
          </div>

          {/* 6. Live Preview */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-unand-800" /> Pratinjau Tampilan Pengumuman:
            </span>
            <div className="bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40 border-2 border-emerald-600/30 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-unand-800 text-white shadow-2xs uppercase">
                    📢 Pengumuman Program Studi
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Baru Saja</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                {title || '(Judul pengumuman akan tampil di sini)'}
              </h4>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                {content || '(Isi pengumuman lengkap akan tampil di sini)'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>{authorName} &bull; {authorRole}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-xs sm:text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-unand-800 hover:bg-unand-900 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-sm text-xs sm:text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengumuman...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-gold-400" />
                  <span>Simpan & Publikasikan Pengumuman</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
