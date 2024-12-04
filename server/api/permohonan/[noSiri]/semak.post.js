// File: /api/permohonan/[noSiri]/semak.put.js
export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const { userID } = event.context.user;
  const body = await readBody(event);

  try {
    // Send email notification to pemohon
    // await sendMail({
    //   to: "mdafiqiskandar@gmail.com",
    //   subject: `Permohonan ${noSiri} Telah Disemak`,
    //   html: `
    //       <h1>Permohonan Anda Telah Disemak</h1>
    //       <p>No. Siri Permohonan: ${noSiri}</p>
    //       <p>Status: Permohonan Disemak</p>
    //       <p>Ulasan Pegawai: ${body.ulasanPegawaiKaunter || "-"}</p>
    //       <br>
    //       <p>Sila log masuk ke sistem untuk melihat butiran lanjut.</p>
    //     `,
    //   text: `
    //       Permohonan Anda Telah Disemak
    //       No. Siri Permohonan: ${noSiri}
    //       Status: Permohonan Disemak
    //       Ulasan Pegawai: ${body.ulasanPegawaiKaunter || "-"}
          
    //       Sila log masuk ke sistem untuk melihat butiran lanjut.
    //     `,
    // });

    // return {
    //   statusCode: 200,
    //   message: "Maklumat semakan berjaya dikemaskini.",
    // };

    // Get the permohonan with related pemohon and user data
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

    // Update or create the permohonan semakan entry
    await prisma.permohonan_semakan.upsert({
      where: {
        permohonanID: permohonan.id,
      },
      update: {
        peralatan_keadaan_baik: body.peralatanBaik === "Ya" ? 1 : 0,
        pegawai_berkelayakan: body.pegawaiBerkelayakan === "Ya" ? 1 : 0,
        kaedah_dpt_dilakukan: body.kaedahDapatDilakukan === "Ya" ? 1 : 0,
        subkontrak_diperlukan: body.subkontrakDiperlukan === "Ya" ? 1 : 0,
        tugasan_diterima: body.tugasanDiterima === "Ya" ? 1 : 0,
        ulasan_pegawai: body.ulasanPegawaiKaunter,
        disemak_oleh: userID,
        create_at: new Date(),
      },
      create: {
        permohonanID: permohonan.id,
        peralatan_keadaan_baik: body.peralatanBaik === "Ya" ? 1 : 0,
        pegawai_berkelayakan: body.pegawaiBerkelayakan === "Ya" ? 1 : 0,
        kaedah_dpt_dilakukan: body.kaedahDapatDilakukan === "Ya" ? 1 : 0,
        subkontrak_diperlukan: body.subkontrakDiperlukan === "Ya" ? 1 : 0,
        tugasan_diterima: body.tugasanDiterima === "Ya" ? 1 : 0,
        ulasan_pegawai: body.ulasanPegawaiKaunter,
        disemak_oleh: userID,
        create_at: new Date(),
      },
    });

    // Update the status of the permohonan
    await prisma.permohonan.update({
      where: { no_siri: noSiri },
      data: {
        status_permohonan: "Permohonan Disemak",
        user_permohonan_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: "Maklumat semakan berjaya dikemaskini.",
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Gagal mengemaskini maklumat semakan." };
  }
});
