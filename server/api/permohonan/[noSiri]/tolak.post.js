// File: /api/permohonan/[noSiri]/tolak.put.js
export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const body = await readBody(event);
  const { sebabPenolakan, lainLainSebab } = body;

  try {
    // Fetch the existing permohonan with pemohon details
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
      include: {
        pemohon: {
          include: {
            user: true, // This will get us the pemohon's email
          },
        },
      },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Create or update the permohonan penolakan entry
    await prisma.permohonan_penolakan.upsert({
      where: {
        permohonanID: permohonan.id,
      },
      update: {
        sebab_penolakan: parseInt(sebabPenolakan),
        lain_sebab: lainLainSebab || null,
        ditolak_oleh: event.context.user.userID,
        create_at: new Date(),
      },
      create: {
        permohonanID: permohonan.id,
        sebab_penolakan: parseInt(sebabPenolakan),
        lain_sebab: lainLainSebab || null,
        ditolak_oleh: event.context.user.userID,
        create_at: new Date(),
      },
    });

    // Update the status of the permohonan to "Permohonan Ditolak"
    await prisma.permohonan.update({
      where: { no_siri: noSiri },
      data: { status_permohonan: "Permohonan Ditolak" },
    });

    // Send email notification to the pemohon
    if (permohonan.pemohon?.user?.userEmail) {
      await sendMail({
        to: permohonan.pemohon.user.userEmail,
        subject: `Permohonan ${noSiri} Ditolak`,
        html: `
          <h1>Permohonan Anda Telah Ditolak</h1>
          <p>No. Siri Permohonan: ${noSiri}</p>
          <p>Sebab Penolakan: ${sebabPenolakan}</p>
          <p>Lain-lain Sebab: ${lainLainSebab || "-"}</p>
          <br>
          <p>Sila hubungi pihak berkenaan untuk maklumat lanjut.</p>
        `,
        text: `
          Permohonan Anda Telah Ditolak
          No. Siri Permohonan: ${noSiri}
          Sebab Penolakan: ${sebabPenolakan}
          Lain-lain Sebab: ${lainLainSebab || "-"}
          
          Sila hubungi pihak berkenaan untuk maklumat lanjut.
        `,
      });
    }

    return {
      statusCode: 200,
      message: "Maklumat penolakan berjaya dikemaskini.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Gagal mengemaskini maklumat penolakan.",
    };
  }
});
