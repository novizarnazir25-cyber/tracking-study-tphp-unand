import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Memastikan setiap mahasiswa TPHP yang berstatus aktif memiliki akun User untuk login.
 * Username: NIM mahasiswa
 * Password default: NIM mahasiswa (dan juga dapat diakses dengan 'mhs123')
 */
export async function ensureStudentUserAccounts() {
  try {
    const activeStudents = await prisma.student.findMany({
      where: {
        statusAkademik: 'aktif',
        isArchived: false,
      },
    });

    const defaultPasswordHash = await bcrypt.hash('mhs123', 10);

    let createdCount = 0;
    for (const st of activeStudents) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: st.nim },
            { studentId: st.id },
          ],
        },
      });

      if (!existingUser) {
        // Hash NIM sebagai password utama
        const nimPasswordHash = await bcrypt.hash(st.nim, 10);
        await prisma.user.create({
          data: {
            username: st.nim,
            name: st.nama,
            email: st.email || `${st.nim}@student.unand.ac.id`,
            password: nimPasswordHash,
            role: 'MAHASISWA',
            studentId: st.id,
            isActive: true,
          },
        });
        createdCount++;
      } else if (!existingUser.studentId || existingUser.role !== 'MAHASISWA') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            studentId: st.id,
            role: 'MAHASISWA',
          },
        });
      }
    }

    return { totalActive: activeStudents.length, createdCount };
  } catch (err) {
    console.error('Error saat sinkronisasi akun mahasiswa:', err);
    throw err;
  }
}
