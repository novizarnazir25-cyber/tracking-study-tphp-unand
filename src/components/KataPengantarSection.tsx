'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  Edit3,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Quote,
} from 'lucide-react';
import EditKataPengantarModal from './EditKataPengantarModal';
import { DEFAULT_KATA_PENGANTAR, KataPengantarData } from '@/lib/kataPengantarDefaults';

interface Props {
  initialData?: any;
  showCardWrapper?: boolean;
}

export default function KataPengantarSection({
  initialData,
  showCardWrapper = true,
}: Props) {
  const [data, setData] = useState<any>(initialData || DEFAULT_KATA_PENGANTAR);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/kata-pengantar');
      const resJson = await res.json();
      if (res.ok && resJson.data) {
        setData(resJson.data);
        setCanEdit(Boolean(resJson.canEdit));
      }
    } catch (e) {
      console.error('Error fetching kata pengantar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const contentClass = showCardWrapper
    ? 'bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10'
    : 'p-0';

  return (
    <section id="kata-pengantar" className="scroll-mt-20">
      {toastMessage && (
        <div className="mb-4 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      <div className={contentClass}>
        {/* Header Section Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-unand-900 to-unand-800 border border-gold-400/40 flex items-center justify-center text-gold-300 shadow-sm shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md tracking-wide uppercase">
                  Sambutan Resmi
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Departemen TPHP FATETA UNAND
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {data.judul || 'Kata Pengantar'}
              </h2>
              <p className="text-xs sm:text-sm text-unand-800 font-bold">
                {data.subjudul || 'Ketua Departemen Teknologi Pangan dan Hasil Pertanian'}
              </p>
            </div>
          </div>

          {/* Action: Edit (Admin / Ketua Departemen) */}
          {canEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition"
              title="Edit Teks & Foto Kata Pengantar (Wewenang Admin / Ketua Departemen)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Kata Pengantar</span>
            </button>
          )}
        </div>

        {/* Main Content Layout: Desktop (Side by side) & Mobile (Photo on top) */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          {/* Sisi Kiri: Kartu Profil Ringkas Pejabat & Foto Resmi (Tidak memanjang & tidak mendominasi) */}
          <div className="w-full sm:w-60 md:w-52 lg:w-56 shrink-0 flex flex-col items-center">
            <div className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs">
              {/* Bingkai Foto Proporsional: Rasio Asli 1:1, Ukuran Kompak, Wajah Utuh */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-2 border-slate-200 bg-white p-1 shadow-xs overflow-hidden group hover:border-unand-700 transition-colors">
                {!imageError ? (
                  <img
                    src={data.fotoUrl || '/ketua-departemen.jpg'}
                    alt="Foto Ketua Departemen Teknologi Pangan dan Hasil Pertanian, Universitas Andalas"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-top rounded-xl"
                  />
                ) : (
                  /* Fallback Placeholder Resmi */
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-unand-950 to-slate-900 flex flex-col items-center justify-center p-3 text-center text-white">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-300 font-bold text-sm mb-1.5">
                      NN
                    </div>
                    <GraduationCap className="w-4 h-4 text-gold-400 mb-0.5" />
                    <span className="text-[10px] font-bold text-white block">Foto Resmi</span>
                    <span className="text-[9px] text-slate-300 block">TPHP FATETA</span>
                  </div>
                )}

                {/* Badge Departemen TPHP halus di bagian bawah foto */}
                <div className="absolute bottom-1.5 left-2 right-2 text-center pointer-events-none">
                  <span className="inline-block bg-slate-950/75 text-gold-300 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/10 shadow-xs">
                    TPHP UNAND
                  </span>
                </div>
              </div>

              {/* Identitas di Bawah Foto (Langsung terlihat tanpa scroll) */}
              <div className="mt-3 space-y-1 w-full">
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">
                  {data.nama || 'Prof. Dr. Novizar Nazir'}
                </h4>
                <p className="text-[11px] font-semibold text-unand-800 leading-tight">
                  {data.jabatan || 'Ketua Departemen Teknologi Pangan dan Hasil Pertanian'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {data.fakultas || 'Fakultas Teknologi Pertanian, Universitas Andalas'}
                </p>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Teks Kata Pengantar */}
          <div className="flex-1 text-slate-700 leading-relaxed text-xs sm:text-sm space-y-4">
            {/* Paragraf 1 */}
            <p className="leading-relaxed text-justify sm:text-left">
              Puji syukur ke hadirat Allah SWT atas rahmat dan karunia-Nya sehingga aplikasi{' '}
              <strong className="text-slate-900 font-bold">StudyTrack TPHP</strong> dapat
              dikembangkan sebagai sarana pendukung pemantauan perkembangan studi mahasiswa Departemen
              Teknologi Pangan dan Hasil Pertanian, Fakultas Teknologi Pertanian, Universitas
              Andalas.
            </p>

            {/* Paragraf 2 */}
            <p className="leading-relaxed text-justify sm:text-left">
              Setiap mahasiswa memiliki perjalanan akademik dengan tantangan yang berbeda. Oleh
              karena itu, pemantauan yang berkelanjutan diperlukan agar kendala studi dapat dikenali
              sejak dini dan ditindaklanjuti melalui pendampingan yang sesuai. StudyTrack TPHP hadir
              untuk mendukung upaya tersebut dengan membantu mahasiswa, dosen pembimbing akademik, dan
              pengelola departemen memperoleh gambaran perkembangan studi sebagai dasar perencanaan
              dan tindak lanjut.
            </p>

            {/* Paragraf 3, 4, 5 (Selalu tampil di Desktop; Di Mobile dikontrol oleh Tombol Baca Selengkapnya) */}
            <div className={`space-y-4 ${isExpandedMobile ? 'block' : 'hidden md:block'}`}>
              <p className="leading-relaxed text-justify sm:text-left">
                Melalui aplikasi ini, kami berharap mahasiswa semakin aktif dalam merencanakan studi,
                mengevaluasi kemajuan, serta mengomunikasikan kendala yang dihadapi. Bagi dosen dan
                pengelola departemen, StudyTrack TPHP diharapkan dapat memperkuat koordinasi
                pendampingan, membantu penetapan prioritas penanganan, dan mendukung langkah bersama
                untuk mempercepat penyelesaian studi dengan tetap menjaga mutu akademik dan
                kompetensi lulusan.
              </p>

              <p className="leading-relaxed text-justify sm:text-left">
                Keberhasilan pemanfaatan StudyTrack TPHP memerlukan komitmen seluruh pihak, terutama
                dalam menjaga ketepatan dan keterbaruan data serta menindaklanjuti hasil pemantauan.
                Kami mengajak seluruh mahasiswa dan dosen untuk memanfaatkan aplikasi ini secara
                aktif, bertanggung jawab, dan berkesinambungan.
              </p>

              <p className="leading-relaxed text-justify sm:text-left">
                Terima kasih kami sampaikan kepada tim pengembang dan seluruh pihak yang telah
                berkontribusi. Semoga StudyTrack TPHP menjadi bagian dari penguatan layanan akademik
                yang lebih responsif dan mendukung mahasiswa menyelesaikan studi secara terarah,
                tepat waktu, dan berkualitas.
              </p>

              {/* Tanda Tangan Penutup di Kanan Bawah */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <div className="text-right space-y-0.5">
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                    {data.nama || 'Prof. Dr. Novizar Nazir'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {data.jabatan || 'Ketua Departemen Teknologi Pangan dan Hasil Pertanian'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {data.fakultas || 'Fakultas Teknologi Pertanian, Universitas Andalas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Kontrol Pada Perangkat Seluler (Mobile Only) */}
            <div className="pt-2 md:hidden">
              <button
                type="button"
                onClick={() => setIsExpandedMobile(!isExpandedMobile)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
              >
                {isExpandedMobile ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-unand-800" />
                    <span>Tampilkan Lebih Sedikit</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-unand-800" />
                    <span>Baca Selengkapnya</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Konten Kata Pengantar */}
      {showEditModal && (
        <EditKataPengantarModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          data={data}
          onSuccess={(updated) => {
            setData(updated);
            setToastMessage('Konten Kata Pengantar berhasil diperbarui.');
            setTimeout(() => setToastMessage(null), 5000);
          }}
        />
      )}
    </section>
  );
}
