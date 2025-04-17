export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;

  try {
    // Find the permohonan by its `no_siri`
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
      include: {
        permohonan_approval: true,
        permohonan_assign_forensik: {
          include: {
            permohonan_forensik_checking: true,
          },
        },
        permohonan_jenis_barang: true,
        permohonan_penerimaan: true,
        permohonan_penolakan: true,
        permohonan_semakan: true,
        report: {
          include: {
            report_doc_support: true,
            dokumen_library: {
              include: {
                document: true,
              },
            },
          },
        },
      },
    });

    if (!permohonan) {
      return {
        statusCode: 404,
        message: `Permohonan with noSiri ${noSiri} not found.`,
      };
    }

    // Store IDs before deletion
    const permohonanId = permohonan.id;
    const pemohonId = permohonan.pemohonID;
    const penghantarId = permohonan.penghantarID;

    // Use transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      try {
        console.log('Starting deletion process...');

        // 1. Delete all related report_doc_support records first
        for (const report of permohonan.report || []) {
          if (report.report_doc_support?.length > 0) {
            await tx.report_doc_support.deleteMany({
              where: { reportID: report.reportID },
            });
          }
        }
        console.log('Report doc support records deleted');

        // 2. Delete all related dokumen_library records and their documents
        for (const report of permohonan.report || []) {
          if (report.dokumen_library?.length > 0) {
            for (const dokLib of report.dokumen_library) {
              if (dokLib.document?.length > 0) {
                await tx.document.deleteMany({
                  where: { dokumenLibraryID: dokLib.dokumenLibraryID },
                });
              }
            }
            await tx.dokumen_library.deleteMany({
              where: { reportID: report.reportID },
            });
          }
        }
        console.log('Dokumen library and documents deleted');

        // 3. Delete permohonan_forensik_checking records
        for (const assign of permohonan.permohonan_assign_forensik || []) {
          await tx.permohonan_forensik_checking.deleteMany({
            where: { assignID: assign.assignID },
          });
        }
        console.log('Forensik checking records deleted');

        // 4. Delete other related records
        await tx.permohonan_approval.deleteMany({
          where: { permohonanID: permohonanId },
        });
        console.log('Approval records deleted');

        await tx.permohonan_assign_forensik.deleteMany({
          where: { permohonanID: permohonanId },
        });
        console.log('Assign forensik records deleted');

        await tx.permohonan_jenis_barang.deleteMany({
          where: { permohonanID: permohonanId },
        });
        console.log('Jenis barang records deleted');

        // Delete unique relation records if they exist
        if (permohonan.permohonan_penerimaan) {
          await tx.permohonan_penerimaan.deleteMany({
            where: { permohonanID: permohonanId },
          });
          console.log('Penerimaan record deleted');
        }

        if (permohonan.permohonan_penolakan) {
          await tx.permohonan_penolakan.deleteMany({
            where: { permohonanID: permohonanId },
          });
          console.log('Penolakan record deleted');
        }

        if (permohonan.permohonan_semakan) {
          await tx.permohonan_semakan.deleteMany({
            where: { permohonanID: permohonanId },
          });
          console.log('Semakan record deleted');
        }

        // 5. Delete all related reports
        await tx.report.deleteMany({
          where: { permohonanID: permohonanId },
        });
        console.log('Reports deleted');

        // 6. Delete the permohonan first (changed order)
        await tx.permohonan.delete({
          where: { id: permohonanId },
        });
        console.log('Permohonan deleted');

        // 7. Delete the pemohon if it exists
        if (pemohonId) {
          try {
            await tx.pemohon.delete({
              where: { id: pemohonId },
            });
            console.log('Pemohon deleted');
          } catch (error) {
            console.log('Pemohon already deleted or not found:', error.message);
          }
        }

        // 8. Delete the penghantar if it exists
        if (penghantarId) {
          try {
            await tx.penghantar.delete({
              where: { id: penghantarId },
            });
            console.log('Penghantar deleted');
          } catch (error) {
            console.log('Penghantar already deleted or not found:', error.message);
          }
        }

      } catch (txError) {
        console.error('Transaction error:', txError);
        throw txError;
      }
    });

    return {
      statusCode: 200,
      message: "Permohonan telah berjaya dihapus.",
    };
  } catch (error) {
    console.error("Error deleting permohonan:", error);
    return {
      statusCode: 500,
      message: "Failed to delete permohonan. Please try again.",
      error: error.message,
      code: error.code,
    };
  }
});
