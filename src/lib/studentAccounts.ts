import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Memastikan seluruh mahasiswa TPHP memiliki akun User untuk login.
 * Username: NIM mahasiswa
 * Password default: NIM mahasiswa (dan juga dapat diakses dengan 'mhs123')
 */
export async function ensureStudentUserAccounts(options: { resetPassword?: boolean; includeAll?: boolean } = {}) {
  try {
    const whereCondition = options.includeAll
      ? { isArchived: false }
      : { isArchived: false }; // Buatkan untuk seluruh mahasiswa yang tidak diarsipkan

    const students = await prisma.student.findMany({
      where: whereCondition,
    });

    let createdCount = 0;
    let updatedCount = 0;

    for (const st of students) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: st.nim },
            { studentId: st.id },
          ],
        },
      });

      const nimPasswordHash = await bcrypt.hash(st.nim, 10);

      if (!existingUser) {
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
      } else {
        const updateData: any = {
          studentId: st.id,
          role: 'MAHASISWA',
          name: st.nama,
          isActive: true,
        };

        if (options.resetPassword) {
          updateData.password = nimPasswordHash;
        }

        await prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
        updatedCount++;
      }
    }

    return { total: students.length, createdCount, updatedCount };
  } catch (err) {
    console.error('Error saat sinkronisasi akun mahasiswa:', err);
    throw err;
  }
}
