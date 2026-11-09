export interface KataPengantarData {
  judul: string;
  subjudul: string;
  nama: string;
  jabatan: string;
  fakultas: string;
  fotoUrl: string;
  paragraf1: string;
  paragraf2: string;
  paragraf3: string;
  paragraf4: string;
  paragraf5: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_KATA_PENGANTAR: KataPengantarData = {
  judul: 'Kata Pengantar',
  subjudul: 'Ketua Departemen Teknologi Pangan dan Hasil Pertanian',
  nama: 'Prof. Dr. Novizar Nazir',
  jabatan: 'Ketua Departemen Teknologi Pangan dan Hasil Pertanian',
  fakultas: 'Fakultas Teknologi Pertanian, Universitas Andalas',
  fotoUrl: '/ketua-departemen.jpg',
  paragraf1:
    'Puji syukur ke hadirat Allah SWT atas rahmat dan karunia-Nya sehingga aplikasi **StudyTrack TPHP** dapat dikembangkan sebagai sarana pendukung pemantauan perkembangan studi mahasiswa Departemen Teknologi Pangan dan Hasil Pertanian, Fakultas Teknologi Pertanian, Universitas Andalas.',
  paragraf2:
    'Setiap mahasiswa memiliki perjalanan akademik dengan tantangan yang berbeda. Oleh karena itu, pemantauan yang berkelanjutan diperlukan agar kendala studi dapat dikenali sejak dini dan ditindaklanjuti melalui pendampingan yang sesuai. StudyTrack TPHP hadir untuk mendukung upaya tersebut dengan membantu mahasiswa, dosen pembimbing akademik, dan pengelola departemen memperoleh gambaran perkembangan studi sebagai dasar perencanaan dan tindak lanjut.',
  paragraf3:
    'Melalui aplikasi ini, kami berharap mahasiswa semakin aktif dalam merencanakan studi, mengevaluasi kemajuan, serta mengomunikasikan kendala yang dihadapi. Bagi dosen dan pengelola departemen, StudyTrack TPHP diharapkan dapat memperkuat koordinasi pendampingan, membantu penetapan prioritas penanganan, dan mendukung langkah bersama untuk mempercepat penyelesaian studi dengan tetap menjaga mutu akademik dan kompetensi lulusan.',
  paragraf4:
    'Keberhasilan pemanfaatan StudyTrack TPHP memerlukan komitmen seluruh pihak, terutama dalam menjaga ketepatan dan keterbaruan data serta menindaklanjuti hasil pemantauan. Kami mengajak seluruh mahasiswa dan dosen untuk memanfaatkan aplikasi ini secara aktif, bertanggung jawab, dan berkesinambungan.',
  paragraf5:
    'Terima kasih kami sampaikan kepada tim pengembang dan seluruh pihak yang telah berkontribusi. Semoga StudyTrack TPHP menjadi bagian dari penguatan layanan akademik yang lebih responsif dan mendukung mahasiswa menyelesaikan studi secara terarah, tepat waktu, dan berkualitas.',
};
