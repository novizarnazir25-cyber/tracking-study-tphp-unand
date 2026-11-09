'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_KATA_PENGANTAR, KataPengantarData } from '@/lib/kataPengantarDefaults';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSuccess: (updated: any) => void;
}

export default function EditKataPengantarModal({
  isOpen,
  onClose,
  data,
  onSuccess,
}: Props) {
  if (!isOpen) return null;

  const [judul, setJudul] = useState(data?.judul || DEFAULT_KATA_PENGANTAR.judul);
  const [subjudul, setSubjudul] = useState(data?.subjudul || DEFAULT_KATA_PENGANTAR.subjudul);
  const [nama, setNama] = useState(data?.nama || DEFAULT_KATA_PENGANTAR.nama);
  const [jabatan, setJabatan] = useState(data?.jabatan || DEFAULT_KATA_PENGANTAR.jabatan);
  const [fakultas, setFakultas] = useState(data?.fakultas || DEFAULT_KATA_PENGANTAR.fakultas);
  const [fotoUrl, setFotoUrl] = useState(data?.fotoUrl || DEFAULT_KATA_PENGANTAR.fotoUrl);

  const [paragraf1, setParagraf1] = useState(data?.paragraf1 || DEFAULT_KATA_PENGANTAR.paragraf1);
  const [paragraf2, setParagraf2] = useState(data?.paragraf2 || DEFAULT_KATA_PENGANTAR.paragraf2);
  const [paragraf3, setParagraf3] = useState(data?.paragraf3 || DEFAULT_KATA_PENGANTAR.paragraf3);
  const [paragraf4, setParagraf4] = useState(data?.paragraf4 || DEFAULT_KATA_PENGANTAR.paragraf4);
  const [paragraf5, setParagraf5] = useState(data?.paragraf5 || DEFAULT_KATA_PENGANTAR.paragraf5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setJudul(data.judul || DEFAULT_KATA_PENGANTAR.judul);
      setSubjudul(data.subjudul || DEFAULT_KATA_PENGANTAR.subjudul);
      setNama(data.nama || DEFAULT_KATA_PENGANTAR.nama);
      setJabatan(data.jabatan || DEFAULT_KATA_PENGANTAR.jabatan);
      setFakultas(data.fakultas || DEFAULT_KATA_PENGANTAR.fakultas);
      setFotoUrl(data.fotoUrl || DEFAULT_KATA_PENGANTAR.fotoUrl);
      setParagraf1(data.paragraf1 || DEFAULT_KATA_PENGANTAR.paragraf1);
      setParagraf2(data.paragraf2 || DEFAULT_KATA_PENGANTAR.paragraf2);
      setParagraf3(data.paragraf3 || DEFAULT_KATA_PENGANTAR.paragraf3);
      setParagraf4(data.paragraf4 || DEFAULT_KATA_PENGANTAR.paragraf4);
      setParagraf5(data.paragraf5 || DEFAULT_KATA_PENGANTAR.paragraf5);
    }
  }, [data]);

  const handleResetDefault = () => {
    if (confirm('Kembalikan seluruh teks Kata Pengantar ke isi draf baku resmi?')) {
      setJudul(DEFAULT_KATA_PENGANTAR.judul);
      setSubjudul(DEFAULT_KATA_PENGANTAR.subjudul);
      setNama(DEFAULT_KATA_PENGANTAR.nama);
      setJabatan(DEFAULT_KATA_PENGANTAR.jabatan);
      setFakultas(DEFAULT_KATA_PENGANTAR.fakultas);
      setFotoUrl(DEFAULT_KATA_PENGANTAR.fotoUrl);
      setParagraf1(DEFAULT_KATA_PENGANTAR.paragraf1);
      setParagraf2(DEFAULT_KATA_PENGANTAR.paragraf2);
      setParagraf3(DEFAULT_KATA_PENGANTAR.paragraf3);
      setParagraf4(DEFAULT_KATA_PENGANTAR.paragraf4);
      setParagraf5(DEFAULT_KATA_PENGANTAR.paragraf5);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kata-pengantar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          subjudul,
          nama,
          jabatan,
          fakultas,
          fotoUrl,
          paragraf1,
          paragraf2,
          paragraf3,
          paragraf4,
          paragraf5,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menyimpan perubahan Kata Pengantar.');
      }

      onSuccess(resData.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan data.');
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
              <FileText className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <span className="bg-gold-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                Panel Pengelolaan Konten
              </span>
              <h3 className="font-bold text-base sm:text-lg text-white mt-0.5">
                Pengaturan Kata Pengantar Ketua Departemen
              </h3>
              <p className="text-xs text-slate-300">
                Sesuaikan teks, nama pejabat, gelar, dan foto resmi Ketua Departemen TPHP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Section 1: Header & Judul */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Judul Utama</label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Subjudul</label>
              <input
                type="text"
                required
                value={subjudul}
                onChange={(e) => setSubjudul(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Data Pejabat & Foto */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-unand-800" /> Identitas Pejabat Ketua Departemen
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap dan Gelar:
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Prof. Dr. Novizar Nazir"
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-unand-800 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan:
                </label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Ketua Departemen Teknologi Pangan dan Hasil Pertanian"
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-unand-800 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fakultas / Universitas:
                </label>
                <input
                  type="text"
                  required
                  value={fakultas}
                  onChange={(e) => setFakultas(e.target.value)}
                  placeholder="Fakultas Teknologi Pertanian, Universitas Andalas"
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-unand-800 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-unand-800" /> Path / URL Foto Resmi
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="/ketua-departemen.jpg"
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-mono focus:ring-2 focus:ring-unand-800 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 5 Paragraf Isi Kata Pengantar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-unand-800" /> Paragraf Teks Kata Pengantar (5 Paragraf)
              </span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-0.5 rounded-lg"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Teks Baku</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Paragraf 1 (Pembuka & Rasa Syukur):
                </label>
                <textarea
                  rows={3}
                  value={paragraf1}
                  onChange={(e) => setParagraf1(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Paragraf 2 (Pentingnya Pemantauan Berkelanjutan):
                </label>
                <textarea
                  rows={3}
                  value={paragraf2}
                  onChange={(e) => setParagraf2(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Paragraf 3 (Harapan untuk Mahasiswa & Dosen):
                </label>
                <textarea
                  rows={3}
                  value={paragraf3}
                  onChange={(e) => setParagraf3(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Paragraf 4 (Komitmen & Keterbaruan Data):
                </label>
                <textarea
                  rows={3}
                  value={paragraf4}
                  onChange={(e) => setParagraf4(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Paragraf 5 (Apresiasi & Penutup):
                </label>
                <textarea
                  rows={3}
                  value={paragraf5}
                  onChange={(e) => setParagraf5(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-unand-800 focus:outline-hidden"
                />
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
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-gold-400" />
                  <span>Simpan Perubahan Kata Pengantar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
