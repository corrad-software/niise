// Path: /api/report/[reportID].get.js

export default defineEventHandler(async (event) => {
  const { reportID } = event.context.params;

  try {
    const report = await prisma.report.findUnique({
      where: { reportID: parseInt(reportID) },
      include: {
        permohonan: {
          include: {
            penghantar: true,
            pemohon: {
              include: {
                user: true,
              },
            },
          },
        },
        lookup_report_jenis_barangTolookup: true,
        lookup_report_dapatanTolookup: {
          select: {
            lookupID: true,
            lookupValue: true,
          },
        },
        report_doc_support: {
          include: {
            document: {
              select: {
                documentID: true,
                documentName: true,
                documentURL: true,
                documentType: true,
                documentExtension: true,
                imageMIMEType: true,
                documentSize: true,
                documentStatus: true,
                documentCreatedDate: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return { statusCode: 404, message: "Report not found" };
    }

    // Format the data for the frontend
    const reportData = {
      kesId: report.permohonan.no_siri,
      tagNo: report.tanda_barang,
      jenisBrg: report.lookup_report_jenis_barangTolookup.lookupValue,
      jenisPemeriksaan: "Forensik",
      pegawai: {
        PENYIASAT: {
          nama: report.permohonan.pemohon?.nama_pemohon || "",
          pangkat: report.permohonan.pemohon?.pangkat_pemohon || "",
          noPegawai: report.permohonan.pemohon?.no_pegawai_pemohon || "",
        },
        PENGHANTAR: {
          nama: report.permohonan.penghantar_sama_dengan_pemohon
            ? report.permohonan.pemohon?.nama_pemohon || ""
            : report.permohonan.penghantar?.nama_penghantar || "",
          pangkat: report.permohonan.penghantar_sama_dengan_pemohon
            ? report.permohonan.pemohon?.pangkat_pemohon || ""
            : report.permohonan.penghantar?.pangkat_penghantar || "",
          noPegawai: report.permohonan.penghantar_sama_dengan_pemohon
            ? report.permohonan.pemohon?.no_pegawai_pemohon || ""
            : report.permohonan.penghantar?.no_pegawai_penghantar || "",
        },
        PEMERIKSA: {
          nama: report.permohonan.pemeriksa?.nama_pemeriksa || "",
          pangkat: report.permohonan.pemeriksa?.pangkat_pemeriksa || "",
          noPegawai: report.permohonan.pemeriksa?.no_pegawai_pemeriksa || "",
        },
        PENERIMA: {
          nama: report.permohonan.penerima?.nama_penerima || "",
          pangkat: report.permohonan.penerima?.pangkat_penerima || "",
          noPegawai: report.permohonan.penerima?.no_pegawai_penerima || "",
        },
      },
      peralatan: report.peralatan,
      langkah2: report.langkah_langkah,
      dapatan: {
        value: report.lookup_report_dapatanTolookup?.lookupID,
        label: report.lookup_report_dapatanTolookup?.lookupValue,
      },
      // Transform document data to include preview information
      documentTambahan: report.report_doc_support.map((doc) => ({
        nama: doc.document.documentName,
        keterangan: doc.keterangan || "",
        preview: {
          url: doc.document.documentURL,
          type: doc.document.imageMIMEType,
          size: doc.document.documentSize,
          extension: doc.document.documentExtension,
          createdDate: doc.document.documentCreatedDate,
        },
      })),
    };

    return { statusCode: 200, data: reportData };
  } catch (error) {
    console.error("Error fetching report:", error);
    return { statusCode: 500, message: error.message };
  }
});
