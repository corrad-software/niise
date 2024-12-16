export default defineEventHandler(async (event) => {
  const { temujanjiID } = event.context.params;

  try {
    // Fetch the report data and related details
    const report = await prisma.report.findFirst({
      where: {
        reportID: parseInt(temujanjiID),
        pengesanan_penyamaran: true,
      },
      include: {
        permohonan: {
          include: {
            pemohon: true,
          },
        },
        permohonan_detail: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!report) {
      return {
        statusCode: 404,
        message: "Report tidak dijumpai.",
      };
    }

    // Format the data to fit the front-end expectations
    return {
      statusCode: 200,
      data: {
        reportID: report.reportID,
        permohonanID: report.permohonanID,
        permohonanDetailID: report.permohonan_detail?.permohonanDetailID,
        jenisDokumen: report.permohonan_detail?.jenisDokumen,
        negara: report.permohonan_detail?.negara,
        namaPemilik: report.permohonan_detail?.namaPemilik,
        noDokumen: report.permohonan_detail?.noDokumen,
        kewarganegaraan: report.permohonan_detail?.kewarganegaraan,
        tarikhLahir: report.permohonan_detail?.tarikhLahir,
        jantina: report.permohonan_detail?.jantina,
        tarikhLuputDokumen: report.permohonan_detail?.tarikhLuputDokumen,
        skorPersamaanMuka: report.permohonan_detail?.skorPersamaanMuka,
        skorPersamaanCapJari: report.permohonan_detail?.skorPersamaanCapJari,
        umur: report.permohonan_detail?.umur,
        tinggi: report.permohonan_detail?.tinggi,
        warnaRambut: report.permohonan_detail?.warnaRambut,
        bangsa: report.permohonan_detail?.bangsa,
        etnik: report.permohonan_detail?.etnik,
        bentukKepala: report.permohonan_detail?.bentukKepala,
        mata: report.permohonan_detail?.mata,
        telinga: report.permohonan_detail?.telinga,
        hidung: report.permohonan_detail?.hidung,
        mulut: report.permohonan_detail?.mulut,
        parut: report.permohonan_detail?.parut,
        sejarahPerjalanan: report.permohonan_detail?.sejarahPerjalanan,
        persamaanTandaTangan: report.permohonan_detail?.persamaanTandaTangan,
        pemeriksaanLain: report.permohonan_detail?.pemeriksaanLain,
        dapatan: report.permohonan_detail?.dapatan,
        laporanSystemTdb: report.permohonan_detail?.document
          ? {
              documentURL: report.permohonan_detail.document.documentURL,
              documentName: report.permohonan_detail.document.documentName,
              documentType: report.permohonan_detail.document.documentType,
              documentExtension:
                report.permohonan_detail.document.documentExtension,
              imageMIMEType: report.permohonan_detail.document.imageMIMEType,
            }
          : null,
        // Include permohonan and pemohon details if needed
        pemohon: report.permohonan?.pemohon
          ? {
              nama_pemohon: report.permohonan.pemohon.nama_pemohon,
              pangkat_pemohon: report.permohonan.pemohon.pangkat_pemohon,
              no_pegawai_pemohon: report.permohonan.pemohon.no_pegawai_pemohon,
            }
          : null,
        status: report.permohonan?.status_permohonan,
      },
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return {
      statusCode: 500,
      message: "Error fetching report data.",
    };
  }
});
