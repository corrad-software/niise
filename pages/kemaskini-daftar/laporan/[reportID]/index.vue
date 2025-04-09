<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { jsPDF } from "jspdf";

definePageMeta({
  title: "Laporan Bahan Bukti",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Semak Permohonan",
      path: "/kemaskini-daftar/senarai",
    },
    {
      name: "Maklumat",
      type: "/",
    },
  ],
});

const { $swal } = useNuxtApp();
const route = useRoute();
const reportID = route.params.reportID;

const generatedData = ref({
  kesId: "",
  tagNo: "",
  jenisBrg: "",
  jenisPemeriksaan: "",
  pegawai: {
    PEGAWAI_PEMOHON: { nama: "", pangkat: "", noPegawai: "" },
    PEGAWAI_PENGHANTAR: { nama: "", pangkat: "", noPegawai: "" },
    PEGAWAI_PENERIMA: { nama: "", pangkat: "", noPegawai: "" },
    PEGAWAI_FORENSIK: [],
  },
  peralatan: "",
  langkah2: "",
  dapatan: "",
  documentTambahan: [],
  gambar: [],
});

const uploadedFiles = ref([]);
const uploadedImages = ref([]);
const uploadedDocs = ref([]);
const existingImages = ref([]);
const existingDocs = ref([]);
const isSubmitting = ref(false);

// State to store dapatan options
const dapatanOptions = ref([]);

// Fetch dapatan options from the lookup API
const fetchDapatanOptions = async () => {
  try {
    const { data } = await useFetch("/api/lookup?type=dapatan");
    if (data.value.statusCode === 200) {
      dapatanOptions.value = [
        { label: "Sila Pilih", value: null },
        ...data.value.data.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      ];
    } else {
      $swal.fire("Error", "Failed to fetch dapatan options.", "error");
    }
  } catch (error) {
    $swal.fire("Error", "Failed to load dapatan options.", "error");
  }
};

onMounted(async () => {
  try {
    const { data } = await useFetch(`/api/laporan/${reportID}`);
    if (data.value.statusCode === 200) {
      generatedData.value = {
        ...generatedData.value,
        ...data.value.data,
      };

      // Handle existing images
      if (data.value.data.gambar?.length > 0) {
        existingImages.value = data.value.data.gambar.map((img) => ({
          documentID: img.documentID,
          name: img.documentName,
          documentName: img.documentName,
          documentURL: img.documentURL,
          size: img.size,
          type: img.type,
        }));
      }

      // Handle existing documents
      if (data.value.data.documentTambahan?.length > 0) {
        existingDocs.value = data.value.data.documentTambahan.map((doc) => ({
          documentID: doc.documentID,
          name: doc.documentName,
          documentName: doc.documentName,
          documentURL: doc.documentURL,
          size: doc.size,
          type: doc.type,
        }));
      }
    } else {
      $swal.fire("Error", "Failed to fetch report data.", "error");
    }

    // Fetch dapatan options on mount
    await fetchDapatanOptions();
  } catch (error) {
    $swal.fire("Error", "Failed to load data.", "error");
  }
});

// Watch for file changes in images
watch(uploadedFiles, async (files) => {
  if (!files || files.length === 0) return;

  const newImages = [];
  const oversizedFiles = [];

  for (const file of files) {
    const actualFile = file.file;

    if (actualFile.size > 5000000) {
      // 5MB limit
      oversizedFiles.push(file.name);
      const index = uploadedFiles.value.indexOf(file);
      if (index > -1) {
        uploadedFiles.value.splice(index, 1);
      }
      continue;
    }

    const reader = new FileReader();
    await new Promise((resolve) => {
      reader.onload = (e) => {
        newImages.push({
          name: file.name,
          base64: e.target.result,
          size: actualFile.size,
          type: actualFile.type,
        });
        resolve();
      };
      reader.readAsDataURL(actualFile);
    });
  }

  if (oversizedFiles.length > 0) {
    $swal.fire({
      title: "Fail Terlalu Besar",
      html: `Fail berikut melebihi 5MB dan telah dikeluarkan:<br><br>${oversizedFiles.join(
        "<br>"
      )}`,
      icon: "warning",
      confirmButtonText: "OK",
    });
  }

  uploadedImages.value = newImages;
});

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
};

const removePdf = (index) => {
  uploadedDocs.value.splice(index, 1);
};

// Add these new functions
const removeExistingImage = (index) => {
  existingImages.value.splice(index, 1);
};

const removeExistingDoc = (index) => {
  existingDocs.value.splice(index, 1);
};

// Function to preview image
const previewImage = (image) => {
  $swal.fire({
    title: image.name || image.documentName,
    imageUrl: image.base64 || image.documentURL,
    imageWidth: 600,
    imageHeight: 400,
    imageAlt: image.name || image.documentName,
    showConfirmButton: true,
    confirmButtonText: "Tutup",
  });
};

// Function to preview all images
const previewAllImages = (images) => {
  // Combine uploaded and existing images
  const allImages = [...uploadedImages.value, ...existingImages.value];

  if (!allImages || allImages.length === 0) {
    $swal.fire({
      title: "Perhatian",
      text: "Tiada gambar untuk dipaparkan",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  let currentIndex = 0;

  const showImage = (index) => {
    const image = allImages[index];
    $swal
      .fire({
        title: image.name || image.documentName,
        imageUrl: image.base64 || image.documentURL,
        imageWidth: 600,
        imageHeight: 400,
        imageAlt: image.name || image.documentName,
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        cancelButtonText: "Sebelumnya",
        denyButtonText: "Seterusnya",
        confirmButtonText: "Tutup",
        showCancelButton: index > 0,
        showDenyButton: index < allImages.length - 1,
        customClass: {
          actions: "swal2-buttons-custom-class",
        },
        cancelButtonColor: "#3085d6",
        denyButtonColor: "#3085d6",
        confirmButtonColor: "#d33",
        allowOutsideClick: false,
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isDenied && index < allImages.length - 1) {
          showImage(index + 1);
        } else if (result.dismiss === $swal.DismissReason.cancel && index > 0) {
          showImage(index - 1);
        }
      });
  };

  showImage(currentIndex);
};

// Add this utility function to check if a string is a base64 data URL
const isBase64DataURL = (str) => {
  return str && str.startsWith("data:");
};

// Modify the submitForm function
const submitForm = async (formData) => {
  try {
    isSubmitting.value = true;

    // Process new images
    const newImages = uploadedImages.value.map((image) => ({
      name: image.name,
      base64: image.base64,
      size: image.size,
      type: image.type,
    }));

    // Process new documents
    const newDocs = uploadedDocs.value.map((doc) => ({
      nama: doc.name,
      base64: doc.base64,
      size: doc.size,
      type: doc.type,
      keterangan: doc.keterangan || null,
    }));

    // Create the processed form data
    const processedFormData = {
      ...formData,
      gambar: newImages,
      documentTambahan: newDocs,
      // Only include existingImageIds if we have existing images and some were removed
      ...(existingImages.value.length > 0 && {
        existingImageIds: existingImages.value.map((img) => img.documentID),
      }),
      // Only include existingDocIds if we have existing documents and some were removed
      ...(existingDocs.value.length > 0 && {
        existingDocIds: existingDocs.value.map((doc) => doc.documentID),
      }),
    };

    const { data } = await useFetch(`/api/laporan/${reportID}`, {
      method: "POST",
      body: processedFormData,
    });

    if (data.value.statusCode === 200) {
      // Clear uploaded files arrays
      uploadedImages.value = [];
      uploadedDocs.value = [];
      uploadedFiles.value = [];

      // Show success message
      $swal.fire({
        title: "Berjaya",
        text: "Laporan berjaya dikemaskini",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Fetch updated data without page refresh
      const { data: updatedData } = await useFetch(`/api/laporan/${reportID}`);
      if (updatedData.value?.data) {
        // Update the local state with new data
        generatedData.value = {
          ...generatedData.value,
          ...updatedData.value.data,
        };

        // Update existing images and docs if they exist in the response
        if (updatedData.value.data.gambar) {
          existingImages.value = updatedData.value.data.gambar.map((img) => ({
            documentID: img.documentID,
            documentName: img.documentName,
            documentURL: img.documentURL,
            size: img.documentSize,
            type: img.documentType,
          }));
        }

        if (updatedData.value.data.documentTambahan) {
          existingDocs.value = updatedData.value.data.documentTambahan.map(
            (doc) => ({
              documentID: doc.documentID,
              documentName: doc.documentName,
              documentURL: doc.documentURL,
              size: doc.documentSize,
              type: doc.documentType,
              keterangan: doc.keterangan,
            })
          );
        }
      }
    } else {
      $swal.fire("Ralat", data.value.message, "error");
    }
  } catch (error) {
    console.error("Submit error:", error);
    $swal.fire("Ralat", "Gagal mengemaskini laporan", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const generatePDF = async () => {
  const doc = new jsPDF();

  // Set font sizes and margins
  const titleSize = 16;
  const subtitleSize = 11;
  const normalSize = 10;
  const margin = 15;
  let yPos = margin;

  // Helper function to check and add new page if needed
  const checkAndAddPage = (neededSpace) => {
    if (yPos + neededSpace > 280) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Add title
  doc.setFontSize(titleSize);
  doc.text("LAPORAN BAHAN BUKTI", 105, yPos, { align: "center" });
  yPos += 15;

  // Define table columns
  const tableWidth = 180;
  const col1Width = 60;
  const col2Width = 60;
  const col3Width = 60;

  // Add case details table
  doc.setFontSize(subtitleSize);
  doc.setLineWidth(0.1);

  // First row headers
  doc.rect(margin, yPos, col1Width, 7);
  doc.rect(margin + col1Width, yPos, col2Width, 7);
  doc.rect(margin + col1Width + col2Width, yPos, col3Width, 7);

  doc.text("NO KES ID", margin + 2, yPos + 5);
  doc.text("TAG NO.", margin + col1Width + 2, yPos + 5);
  doc.text("JENIS BARANG", margin + col1Width + col2Width + 2, yPos + 5);

  yPos += 7;

  // First row values
  doc.setFontSize(normalSize);
  doc.rect(margin, yPos, col1Width, 7);
  doc.rect(margin + col1Width, yPos, col2Width, 7);
  doc.rect(margin + col1Width + col2Width, yPos, col3Width, 7);

  doc.text(generatedData.value.kesId || "", margin + 2, yPos + 5);
  doc.text(generatedData.value.tagNo || "", margin + col1Width + 2, yPos + 5);
  doc.text(
    generatedData.value.jenisBrg || "",
    margin + col1Width + col2Width + 2,
    yPos + 5
  );

  yPos += 12;

  // Add Jenis Pemeriksaan
  doc.setFontSize(subtitleSize);
  doc.rect(margin, yPos, tableWidth, 7);
  doc.text("JENIS PEMERIKSAAN", margin + 2, yPos + 5);
  yPos += 7;

  doc.setFontSize(normalSize);
  doc.rect(margin, yPos, tableWidth, 7);
  doc.text(generatedData.value.jenisPemeriksaan || "", margin + 2, yPos + 5);
  yPos += 12;

  // Function to add officer row with table
  const addOfficerTable = (title, officer) => {
    // Headers
    doc.setFontSize(subtitleSize);
    doc.rect(margin, yPos, col1Width, 7);
    doc.rect(margin + col1Width, yPos, col2Width, 7);
    doc.rect(margin + col1Width + col2Width, yPos, col3Width, 7);

    doc.text(`NAMA ${title}`, margin + 2, yPos + 5);
    doc.text(`PANGKAT ${title}`, margin + col1Width + 2, yPos + 5);
    doc.text(`NOMBOR ${title}`, margin + col1Width + col2Width + 2, yPos + 5);
    yPos += 7;

    // Values
    doc.setFontSize(normalSize);
    doc.rect(margin, yPos, col1Width, 7);
    doc.rect(margin + col1Width, yPos, col2Width, 7);
    doc.rect(margin + col1Width + col2Width, yPos, col3Width, 7);

    doc.text(officer.nama || "", margin + 2, yPos + 5);
    doc.text(officer.pangkat || "", margin + col1Width + 2, yPos + 5);
    doc.text(
      officer.noPegawai || "",
      margin + col1Width + col2Width + 2,
      yPos + 5
    );
    yPos += 12;
  };

  // Add each officer's details in table layout
  addOfficerTable(
    "PEGAWAI PEMOHON",
    generatedData.value.pegawai.PEGAWAI_PEMOHON
  );
  addOfficerTable(
    "PEGAWAI PENGHANTAR",
    generatedData.value.pegawai.PEGAWAI_PENGHANTAR
  );
  addOfficerTable(
    "PEGAWAI PENERIMA",
    generatedData.value.pegawai.PEGAWAI_PENERIMA
  );

  // Add forensic officers if any
  if (generatedData.value.pegawai.PEGAWAI_FORENSIK.length > 0) {
    generatedData.value.pegawai.PEGAWAI_FORENSIK.forEach((officer) => {
      checkAndAddPage(25);
      addOfficerTable("PEGAWAI FORENSIK", officer);
    });
  }

  // Add Peralatan
  checkAndAddPage(40);
  doc.setFontSize(subtitleSize);
  doc.rect(margin, yPos, tableWidth, 7);
  doc.text("PERALATAN YANG DIGUNAKAN", margin + 2, yPos + 5);
  yPos += 7;

  doc.setFontSize(normalSize);
  const peralatanLines = doc.splitTextToSize(
    generatedData.value.peralatan || "",
    170
  );
  const peralatanHeight = peralatanLines.length * 7;
  doc.rect(margin, yPos, tableWidth, peralatanHeight);
  peralatanLines.forEach((line, index) => {
    doc.text(line, margin + 2, yPos + 5 + index * 7);
  });
  yPos += peralatanHeight + 5;

  // Add Langkah Pemeriksaan
  checkAndAddPage(40);
  doc.setFontSize(subtitleSize);
  doc.rect(margin, yPos, tableWidth, 7);
  doc.text("LANGKAH PEMERIKSAAN", margin + 2, yPos + 5);
  yPos += 7;

  doc.setFontSize(normalSize);
  const langkahLines = doc.splitTextToSize(
    generatedData.value.langkah2 || "",
    170
  );
  const langkahHeight = langkahLines.length * 7;
  doc.rect(margin, yPos, tableWidth, langkahHeight);
  langkahLines.forEach((line, index) => {
    doc.text(line, margin + 2, yPos + 5 + index * 7);
  });
  yPos += langkahHeight + 5;

  // Add Dapatan
  checkAndAddPage(20);
  doc.setFontSize(subtitleSize);
  doc.rect(margin, yPos, tableWidth, 7);
  doc.text("DAPATAN", margin + 2, yPos + 5);
  yPos += 7;

  doc.setFontSize(normalSize);
  doc.rect(margin, yPos, tableWidth, 7);
  doc.text(generatedData.value.dapatan?.label || "", margin + 2, yPos + 5);
  yPos += 12;

  // Add images section if there are any images
  const allImages = [...(generatedData.value.gambar || [])];
  if (allImages.length > 0) {
    checkAndAddPage(40);
    doc.setFontSize(subtitleSize);
    doc.rect(margin, yPos, tableWidth, 7);
    doc.text("GAMBAR", margin + 2, yPos + 5);
    yPos += 12;

    // Add images in a grid layout (2 per row)
    const imageWidth = 80;
    const imageHeight = 60;
    const imagesPerRow = 2;
    const xMargin = (210 - imagesPerRow * imageWidth) / 3;

    for (let i = 0; i < allImages.length; i++) {
      if (i > 0 && i % imagesPerRow === 0) {
        yPos += imageHeight + 20;
        checkAndAddPage(imageHeight + 30);
      }

      const xPos = xMargin + (i % imagesPerRow) * (imageWidth + xMargin);
      try {
        const imgData = allImages[i].documentURL || allImages[i].base64;
        doc.addImage(
          imgData,
          "JPEG",
          xPos,
          yPos,
          imageWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        // Add image caption
        doc.setFontSize(8);
        const caption =
          allImages[i].documentName || allImages[i].name || `Gambar ${i + 1}`;
        doc.text(caption, xPos + imageWidth / 2, yPos + imageHeight + 5, {
          align: "center",
        });
      } catch (error) {
        console.error(`Error adding image ${i + 1}:`, error);
      }
    }
    yPos += imageHeight + 30;
  }

  // Add supporting documents section if any
  if (generatedData.value.documentTambahan?.length > 0) {
    checkAndAddPage(40);
    doc.setFontSize(subtitleSize);
    doc.rect(margin, yPos, tableWidth, 7);
    doc.text("DOKUMEN SOKONGAN", margin + 2, yPos + 5);
    yPos += 12;

    doc.setFontSize(normalSize);
    generatedData.value.documentTambahan.forEach((docItem, index) => {
      checkAndAddPage(20);
      // Create a box for each document entry
      const docHeight = docItem.keterangan ? 14 : 7; // Height depends on whether there's a description
      doc.rect(margin, yPos, tableWidth, docHeight);

      // Add document name
      doc.text(
        `${index + 1}. ${docItem.documentName || docItem.name}`,
        margin + 2,
        yPos + 5
      );

      // Add description if exists
      if (docItem.keterangan) {
        doc.text(`   Keterangan: ${docItem.keterangan}`, margin + 2, yPos + 12);
      }

      yPos += docHeight + 5; // Add some spacing between document entries
    });
  }

  // Add footer with date and page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Tarikh: ${new Date().toLocaleDateString("ms-MY")}`, margin, 290);
    doc.text(`Muka Surat ${i} daripada ${pageCount}`, 180, 290);
  }

  // Save the PDF
  doc.save(`Laporan_${generatedData.value.kesId}.pdf`);
};

function previousPage() {
  window.history.back();
}

// Add function to handle document preview
const previewDocument = (doc) => {
  const url = doc.base64 || doc.documentURL || doc.preview?.url;
  if (url) {
    window.open(url, "_blank");
  }
};

// Watch for changes in document files
watch(uploadedDocs, async (files) => {
  try {
    if (!files || files.length === 0) return;

    const newDocs = [];
    const oversizedFiles = [];

    for (const file of files) {
      const actualFile = file.file;

      if (actualFile?.size > 5000000) {
        // 5MB limit
        oversizedFiles.push(file.name);
        const index = uploadedDocs.value.indexOf(file);
        if (index > -1) {
          uploadedDocs.value.splice(index, 1);
        }
        continue;
      }

      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (e) => {
          newDocs.push({
            name: file.name,
            base64: e.target.result,
            size: actualFile.size,
            type: actualFile.type,
          });
          resolve();
        };
        reader.readAsDataURL(actualFile);
      });
    }

    if (oversizedFiles.length > 0) {
      $swal.fire({
        title: "Fail Terlalu Besar",
        html: `Fail berikut melebihi 5MB dan telah dikeluarkan:<br><br>${oversizedFiles.join(
          "<br>"
        )}`,
        icon: "warning",
        confirmButtonText: "OK",
      });
    }

    uploadedDocs.value = newDocs;
  } catch (error) {
    // console.error("Error processing documents:", error);
  }
});

// Function to preview all documents
const previewAllDocs = (docs) => {
  if (!docs || docs.length === 0) {
    $swal.fire({
      title: "Perhatian",
      text: "Tiada dokumen untuk dipaparkan",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  let currentIndex = 0;

  const showDoc = (index) => {
    const doc = docs[index];
    const docUrl = doc.base64 || doc.documentURL;

    window.open(docUrl, "_blank");
  };

  showDoc(currentIndex);
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ms-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Laporan Bahan Bukti</h1>
      <rs-button variant="info" @click="generatePDF">
        <Icon name="mdi:file-pdf" class="mr-2 w-4 h-4" />
        Jana PDF
      </rs-button>
    </div>

    <rs-card class="p-4">
      <FormKit
        type="form"
        @submit="submitForm"
        #default="{ state }"
        :actions="false"
        class="space-y-6"
        incomplete-message="Medan mandatori yang bertanda * wajib diisi."
      >
        <!-- Top Row: KES ID, TAG NO, JENIS BARANG -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormKit
            type="text"
            name="kesId"
            label="NO KES ID"
            v-model="generatedData.kesId"
            validation="required"
            :validation-messages="{ required: 'KES ID diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="tagNo"
            label="TAG NO."
            v-model="generatedData.tagNo"
            validation="required"
            :validation-messages="{ required: 'TAG NO diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="jenisBrg"
            label="JENIS BARANG"
            v-model="generatedData.jenisBrg"
            validation="required"
            :validation-messages="{ required: 'Jenis Barang diperlukan' }"
            disabled
          />
        </div>

        <!-- JENIS PEMERIKSAAN -->
        <FormKit
          type="textarea"
          name="jenisPemeriksaan"
          label="JENIS PEMERIKSAAN"
          v-model="generatedData.jenisPemeriksaan"
          validation="required"
          :validation-messages="{ required: 'Jenis Pemeriksaan diperlukan' }"
          :rows="3"
          disabled
        />

        <!-- PEGAWAI SECTION -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Column 1: Names -->
          <div class="space-y-4">
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PEMOHON.nama"
              label="NAMA PEGAWAI PEMOHON"
              v-model="generatedData.pegawai.PEGAWAI_PEMOHON.nama"
              disabled
            />
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PENGHANTAR.nama"
              label="NAMA PEGAWAI PENGHANTAR"
              v-model="generatedData.pegawai.PEGAWAI_PENGHANTAR.nama"
              disabled
            />
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PENERIMA.nama"
              label="NAMA PEGAWAI PENERIMA"
              v-model="generatedData.pegawai.PEGAWAI_PENERIMA.nama"
              disabled
            />
            <FormKit
              v-if="generatedData.pegawai.PEGAWAI_FORENSIK.length > 0"
              type="text"
              name="pegawai.PEGAWAI_FORENSIK.0.nama"
              label="NAMA PEGAWAI FORENSIK"
              v-model="generatedData.pegawai.PEGAWAI_FORENSIK[0].nama"
              disabled
            />
          </div>

          <!-- Column 2: Ranks -->
          <div class="space-y-4">
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PEMOHON.pangkat"
              label="PANGKAT PEGAWAI PEMOHON"
              v-model="generatedData.pegawai.PEGAWAI_PEMOHON.pangkat"
              disabled
            />
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PENGHANTAR.pangkat"
              label="PANGKAT PEGAWAI PENGHANTAR"
              v-model="generatedData.pegawai.PEGAWAI_PENGHANTAR.pangkat"
              disabled
            />
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PENERIMA.pangkat"
              label="PANGKAT PEGAWAI PENERIMA"
              v-model="generatedData.pegawai.PEGAWAI_PENERIMA.pangkat"
              disabled
            />
            <FormKit
              v-if="generatedData.pegawai.PEGAWAI_FORENSIK.length > 0"
              type="text"
              name="pegawai.PEGAWAI_FORENSIK.0.pangkat"
              label="PANGKAT PEGAWAI FORENSIK"
              v-model="generatedData.pegawai.PEGAWAI_FORENSIK[0].pangkat"
              disabled
            />
          </div>

          <!-- Column 3: Officer Numbers -->
          <div class="space-y-4">
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PEMOHON.noPegawai"
              label="NOMBOR PEGAWAI PEMOHON"
              v-model="generatedData.pegawai.PEGAWAI_PEMOHON.noPegawai"
              disabled
            />
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PENGHANTAR.noPegawai"
              label="NOMBOR PEGAWAI PENGHANTAR"
              v-model="generatedData.pegawai.PEGAWAI_PENGHANTAR.noPegawai"
              disabled
            />
            <FormKit
              type="text"
              name="pegawai.PEGAWAI_PENERIMA.noPegawai"
              label="NOMBOR PEGAWAI PENERIMA"
              v-model="generatedData.pegawai.PEGAWAI_PENERIMA.noPegawai"
              disabled
            />
            <FormKit
              v-if="generatedData.pegawai.PEGAWAI_FORENSIK.length > 0"
              type="text"
              name="pegawai.PEGAWAI_FORENSIK.0.noPegawai"
              label="NOMBOR PEGAWAI FORENSIK"
              v-model="generatedData.pegawai.PEGAWAI_FORENSIK[0].noPegawai"
              disabled
            />
          </div>
        </div>

        <!-- PERALATAN -->
        <FormKit
          v-model="generatedData.peralatan"
          type="textarea"
          name="peralatan"
          label="PERALATAN YANG DIGUNAKAN"
          validation="required"
          :validation-messages="{ required: 'Peralatan diperlukan' }"
          :rows="3"
        />

        <!-- LANGKAH PEMERIKSAAN -->
        <FormKit
          v-model="generatedData.langkah2"
          type="textarea"
          name="langkah2"
          label="LANGKAH PEMERIKSAAN"
          validation="required"
          :validation-messages="{ required: 'Langkah diperlukan' }"
          :rows="5"
        />

        <!-- GAMBAR -->
        <div class="space-y-4 mb-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium">GAMBAR (Maksimum 100 gambar)</h3>
            <rs-button
              v-if="uploadedImages.length > 0 || existingImages.length > 0"
              @click="previewAllImages([...uploadedImages, ...existingImages])"
              variant="info"
              size="sm"
              class="px-3 inline-flex items-center justify-center"
            >
              <Icon name="ic:baseline-collections" class="mr-2 w-4 h-4" />
              Papar Semua Gambar
            </rs-button>
          </div>
          <FormKit
            type="file"
            name="gambar"
            accept=".jpg,.jpeg"
            help="Format yang dibenarkan: JPG sahaja"
            multiple="true"
            v-model="uploadedFiles"
            validation="mime:image/jpeg,image/jpg"
            :validation-messages="{
              mime: 'Sila muat naik fail JPG sahaja',
            }"
          />
          <div
            v-if="uploadedImages.length > 0 || existingImages.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
          >
            <!-- Uploaded Images -->
            <div
              v-for="(image, index) in uploadedImages"
              :key="`new-${index}`"
              class="relative group cursor-pointer"
              @click="previewImage(image)"
            >
              <img
                :src="image.base64"
                :alt="image.name"
                class="w-full h-32 object-cover rounded-lg"
              />
              <button
                @click.stop="removeImage(index)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center"
              >
                <Icon name="ic:round-close" class="w-4 h-4" />
              </button>
              <span class="text-xs text-gray-500 mt-1 block truncate">
                {{ image.name }}
              </span>
            </div>

            <!-- Existing Images -->
            <div
              v-for="(image, index) in existingImages"
              :key="`existing-${index}`"
              class="relative group cursor-pointer"
              @click="previewImage(image)"
            >
              <img
                :src="image.documentURL"
                :alt="image.documentName"
                class="w-full h-32 object-cover rounded-lg"
              />
              <button
                @click.stop="removeExistingImage(index)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center"
              >
                <Icon name="ic:round-close" class="w-4 h-4" />
              </button>
              <span class="text-xs text-gray-500 mt-1 block truncate">
                {{ image.documentName }}
              </span>
            </div>
          </div>
        </div>

        <!-- ULASAN -->
        <FormKit
          type="textarea"
          name="ulasan"
          label="ULASAN PEGAWAI FORENSIK"
          :rows="3"
        />

        <!-- DAPATAN -->
        <FormKit
          v-model="generatedData.dapatan.value"
          type="select"
          name="dapatan"
          label="DAPATAN"
          :options="dapatanOptions"
          validation="required"
          :validation-messages="{ required: 'Dapatan diperlukan' }"
        />

        <!-- DOKUMEN SOKONGAN -->
        <div class="space-y-4 mb-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium">DOKUMEN SOKONGAN (Maksimum 100 dokumen)</h3>
          </div>
          <FormKit
            type="file"
            name="documentTambahan"
            accept=".pdf"
            help="Format yang dibenarkan: PDF sahaja"
            multiple="true"
            v-model="uploadedDocs"
            validation="mime:application/pdf"
            :validation-messages="{
              mime: 'Sila muat naik fail PDF sahaja',
            }"
          />
          <div
            v-if="uploadedDocs.length > 0 || existingDocs.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
          >
            <!-- Uploaded Documents -->
            <div
              v-for="(doc, index) in uploadedDocs"
              :key="`new-doc-${index}`"
              class="relative group"
            >
              <div class="cursor-pointer" @click="previewDocument(doc)">
                <div
                  class="w-full h-32 flex items-center justify-center bg-gray-100 rounded"
                >
                  <Icon name="mdi:file-pdf" class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <button
                @click.stop="removePdf(index)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center"
              >
                <Icon name="ic:round-close" class="w-4 h-4" />
              </button>
              <div class="mt-2">
                <p class="font-medium truncate">{{ doc.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(doc.size) }}
                </p>
              </div>
            </div>

            <!-- Existing Documents -->
            <div
              v-for="(doc, index) in existingDocs"
              :key="`existing-doc-${index}`"
              class="relative group"
            >
              <div class="cursor-pointer" @click="previewDocument(doc)">
                <div
                  class="w-full h-32 flex items-center justify-center bg-gray-100 rounded"
                >
                  <Icon name="mdi:file-pdf" class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <button
                @click.stop="removeExistingDoc(index)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center"
              >
                <Icon name="ic:round-close" class="w-4 h-4" />
              </button>
              <div class="mt-2">
                <p class="font-medium truncate">{{ doc.documentName }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(doc.size) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <rs-button variant="info" btn-type="reset" @click="previousPage()">
            <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
            Kembali
          </rs-button>
          <rs-button variant="info" type="submit" btn-type="submit">
            <Icon name="ic:round-save" class="w-4 h-4 mr-2" />
            Simpan
          </rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style scoped>
.document-preview {
  transition: all 0.3s ease;
}

.document-preview:hover {
  transform: translateY(-2px);
}
</style>
