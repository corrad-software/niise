export default defineEventHandler(async (event) => {
  try {
    const noSiri = event.context.params.noSiri;

    const permohonan = await prisma.permohonan.findUnique({
      where: {
        no_siri: noSiri,
      },
      include: {
        pemohon: {
          include: {
            user: true,
          },
        },
        // Get semakan details
        permohonan_semakan: {
          include: {
            user: true,
          },
        },
        // Get penerimaan details
        permohonan_penerimaan: {
          include: {
            user: true,
          },
        },
        // Get penolakan details
        permohonan_penolakan: {
          include: {
            user: true,
          },
        },
        // Get approval details
        permohonan_approval: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create timeline events array
    const timelineEvents = [];

    // Add permohonan creation
    timelineEvents.push({
      date: permohonan.create_at,
      type: "creation",
      status: "Permohonan Didaftarkan",
      details: "",
      user: {
        nama: permohonan.pemohon?.user?.userFullName || "-",
        pangkat: permohonan.pemohon?.user?.userRank || "-",
        noPegawai: permohonan.pemohon?.user?.userOfficerNumber || "-",
      },
    });

    // Add semakan if exists
    if (permohonan.permohonan_semakan) {
      timelineEvents.push({
        date: permohonan.permohonan_semakan.create_at,
        type: "semakan",
        status: "Semakan Dilakukan",
        details: permohonan.permohonan_semakan.ulasanPegawaiKaunter || "",
        user: {
          nama: permohonan.permohonan_semakan.user?.userFullName || "-",
          pangkat: permohonan.permohonan_semakan.user?.userRank || "-",
          noPegawai:
            permohonan.permohonan_semakan.user?.userOfficerNumber || "-",
        },
      });
    }

    // Add approval if exists
    if (permohonan.permohonan_approval?.length > 0) {
      permohonan.permohonan_approval.forEach((approval) => {
        timelineEvents.push({
          date: approval.approval_date,
          type: "approval",
          status:
            approval.approval_status === 1 ? "Diluluskan" : "Tidak Diluluskan",
          details: approval.ulasan || "",
          user: {
            nama: approval.user?.userFullName || "-",
            pangkat: approval.user?.userRank || "-",
            noPegawai: approval.user?.userOfficerNumber || "-",
          },
        });
      });
    }

    // Add penerimaan if exists
    if (permohonan.permohonan_penerimaan) {
      timelineEvents.push({
        date: permohonan.permohonan_penerimaan.create_at,
        type: "penerimaan",
        status: "Permohonan Diterima",
        details: permohonan.permohonan_penerimaan.ulasanPegawaiKaunter || "",
        user: {
          nama: permohonan.permohonan_penerimaan.user?.userFullName || "-",
          pangkat: permohonan.permohonan_penerimaan.user?.userRank || "-",
          noPegawai:
            permohonan.permohonan_penerimaan.user?.userOfficerNumber || "-",
        },
      });
    }

    // Add penolakan if exists
    if (permohonan.permohonan_penolakan) {
      timelineEvents.push({
        date: permohonan.permohonan_penolakan.create_at,
        type: "penolakan",
        status: "Permohonan Ditolak",
        details: permohonan.permohonan_penolakan.sebabPenolakan || "",
        user: {
          nama: permohonan.permohonan_penolakan.user?.userFullName || "-",
          pangkat: permohonan.permohonan_penolakan.user?.userRank || "-",
          noPegawai:
            permohonan.permohonan_penolakan.user?.userOfficerNumber || "-",
        },
      });
    }

    // Sort timeline events by date
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      data: timelineEvents,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }
});
