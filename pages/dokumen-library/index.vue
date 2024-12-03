<script setup>
import { useDebounceFn } from "@vueuse/core";

definePageMeta({
  title: "Dokumen E-Library",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Dokumen E-Library",
      type: "current",
    },
  ],
});
const tableData = ref([]);
const showDetailsModal = ref(false);
const showUploadModal = ref(false);
const selectedDetails = ref(null);
const selectedElibraryId = ref(null);
const uploadedImages = ref([]);
const isSubmitting = ref(false);
const uploadedFiles = ref([]);
const summaryData = ref({
  jumlahDokumen: 0,
  jumlahDokumenTulen: 0,
  jumlahDokumenPalsu: 0,
});
const filters = ref({
  jenisDokumen: "",
  negaraPengeluaran: "",
  tahunPengeluaran: "",
  ketulenan: "",
});

const { $swal } = useNuxtApp();

const ketulenanOptions = [
  { label: "Semua", value: "" },
  { label: "Tulen", value: "Tulen" },
  { label: "Palsu", value: "Palsu" },
];

const jenisDokumenOptions = [
  { label: "Semua", value: "" },
  { label: "Pasport", value: "Pasport" },
  { label: "Malpass", value: "Malpass" },
  { label: "Cap Keselamatan", value: "Cap Keselamatan" },
  { label: "Cap Jari", value: "Cap Jari" },
  { label: "Pemeriksaan Siber", value: "Pemeriksaan Siber" },
  { label: "Tulisan Tangan", value: "Tulisan Tangan" },
  { label: "I-Kad", value: "I-Kad" },
  { label: "Lain-lain", value: "Lain-lain" },
];

const debouncedFetchData = useDebounceFn(() => {
  fetchELibraryData();
  fetchSummary();
}, 500);

const fetchELibraryData = async () => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.value.jenisDokumen) {
      queryParams.append("jenisDokumen", filters.value.jenisDokumen);
    }
    if (filters.value.negaraPengeluaran) {
      queryParams.append("negaraPengeluaran", filters.value.negaraPengeluaran);
    }
    if (filters.value.tahunPengeluaran) {
      queryParams.append("tahunPengeluaran", filters.value.tahunPengeluaran);
    }
    if (filters.value.ketulenan) {
      queryParams.append("ketulenan", filters.value.ketulenan);
    }

    const { data: response } = await useFetch(
      `/api/dokumen-library?${queryParams.toString()}`
    );
    if (response.value && response.value.statusCode === 200) {
      tableData.value = response.value.data;
    } else {
      console.error("Error fetching e-library data:", response.value.message);
    }
  } catch (error) {
    console.error("Error fetching e-library data:", error);
  }
};

const viewDetails = (item) => {
  selectedDetails.value = {
    maklumatTerperinci: item.perincian.maklumatTerperinci,
    ulasan: item.perincian.ulasan,
    mukaSurat: item.perincian.mukaSurat,
    noDocument: item.perincian.noDocument,
    namaPemilik: item.perincian.namaPemilik,
    peralatanDigunakan: item.perincian.peralatanDigunakan,
    caraSemakan: item.perincian.caraSemakan,
    dapatan: item.perincian.dapatan,
    images: item.perincian.images,
  };
  showDetailsModal.value = true;
};

const updateItem = (id) => {
  navigateTo(`/dokumen-library/kemaskini/${id}`);
};

const uploadItem = (id) => {
  selectedElibraryId.value = id;
  showUploadModal.value = true;
};

const submitImages = async () => {
  if (uploadedImages.value.length === 0) {
    $swal.fire({
      title: "Perhatian",
      text: "Sila pilih sekurang-kurangnya satu gambar",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    isSubmitting.value = true;
    const { data } = await useFetch("/api/dokumen-library/upload", {
      method: "POST",
      body: {
        elibraryId: selectedElibraryId.value,
        images: uploadedImages.value,
      },
    });

    if (data.value?.statusCode === 200) {
      showUploadModal.value = false;
      uploadedImages.value = [];
      $swal.fire({
        title: "Berjaya",
        text: "Gambar berjaya dimuat naik",
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error uploading images:", error);
    $swal.fire({
      title: "Ralat",
      text: "Ralat semasa memuat naik gambar",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for changes to uploadedFiles
watch(uploadedFiles, async (files) => {
  if (!files || files.length === 0) return;

  const newImages = [];
  const oversizedFiles = [];

  for (const file of files) {
    // Access the actual File object from the file.file property
    const actualFile = file.file;

    if (actualFile.size > 5000000) {
      // 5MB limit
      oversizedFiles.push(file.name);
      // Remove the file from uploadedFiles
      const index = uploadedFiles.value.indexOf(file);
      if (index > -1) {
        uploadedFiles.value.splice(index, 1);
      }
      continue;
    }

    // Check if image with same name already exists
    const isDuplicate = uploadedImages.value.some(
      (img) => img.name === file.name
    );
    if (isDuplicate) continue;

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

  // Show SweetAlert for oversized files if any
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

  // Replace existing images instead of appending
  uploadedImages.value = newImages;
});

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
};

const fetchSummary = async () => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.value.jenisDokumen) {
      queryParams.append("jenisDokumen", filters.value.jenisDokumen);
    }
    if (filters.value.negaraPengeluaran) {
      queryParams.append("negaraPengeluaran", filters.value.negaraPengeluaran);
    }
    if (filters.value.tahunPengeluaran) {
      queryParams.append("tahunPengeluaran", filters.value.tahunPengeluaran);
    }
    if (filters.value.ketulenan) {
      queryParams.append("ketulenan", filters.value.ketulenan);
    }

    const response = await useFetch(
      `/api/dokumen-library/summary?${queryParams.toString()}`
    );
    if (response.data.value?.statusCode === 200) {
      summaryData.value = response.data.value.data;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
  }
};

// Watch for filter changes
watch(
  () => [filters.value.negaraPengeluaran, filters.value.tahunPengeluaran],
  () => {
    debouncedFetchData();
  },
  { deep: true }
);

watch(
  () => [filters.value.jenisDokumen, filters.value.ketulenan],
  () => {
    fetchELibraryData();
    fetchSummary();
  }
);

onMounted(() => {
  fetchELibraryData();
  fetchSummary();
});

// Add these new refs
const currentImageIndex = ref(0);
const showImagePreview = ref(false);

// Add these new methods
const previewImage = (image) => {
  $swal.fire({
    title: image.documentName,
    imageUrl: image.documentURL,
    imageWidth: 600,
    imageHeight: 400,
    imageAlt: image.documentName,
    showConfirmButton: true,
    confirmButtonText: "Tutup",
  });
};

const previewAllImages = (images) => {
  if (!images || images.length === 0) {
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
    $swal
      .fire({
        title: images[index].documentName,
        imageUrl: images[index].documentURL,
        imageWidth: 600,
        imageHeight: 400,
        imageAlt: images[index].documentName,
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        cancelButtonText: "Sebelumnya",
        denyButtonText: "Seterusnya",
        confirmButtonText: "Tutup",
        // Hide buttons based on position
        showCancelButton: index > 0,
        showDenyButton: index < images.length - 1,
        // Customize button colors and positions
        customClass: {
          actions: "swal2-buttons-custom-class",
        },
        // Button colors
        cancelButtonColor: "#3085d6", // Blue for Previous
        denyButtonColor: "#3085d6", // Blue for Next
        confirmButtonColor: "#d33", // Red for Close
        allowOutsideClick: false,
        reverseButtons: true, // This will help arrange buttons: Previous | Next | Close
      })
      .then((result) => {
        if (result.isDenied && index < images.length - 1) {
          showImage(index + 1);
        } else if (result.dismiss === $swal.DismissReason.cancel && index > 0) {
          showImage(index - 1);
        } else if (result.isConfirmed) {
          return;
        }
      });
  };

  showImage(currentIndex);
};
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <!-- Update header section styling -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Ringkasan Dokumen</h3>
      </div>
    </div>

    <!-- Filter Section - Update grid styling -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="grid gap-6 md:grid-cols-4 col-span-2 lg:col-span-4">
        <FormKit
          type="select"
          v-model="filters.jenisDokumen"
          :options="jenisDokumenOptions"
          label="Jenis Dokumen"
          placeholder="Pilih Jenis Dokumen"
        />

        <FormKit
          type="text"
          v-model="filters.negaraPengeluaran"
          label="Negara Pengeluaran"
          placeholder="Masukkan Negara"
        />

        <FormKit
          type="number"
          v-model="filters.tahunPengeluaran"
          label="Tahun Pengeluaran"
          placeholder="Masukkan Tahun"
          validation="min:1900|max:2100"
          :validation-messages="{
            min: 'Tahun minimum 1900',
            max: 'Tahun maximum 2100',
          }"
        />

        <FormKit
          type="select"
          v-model="filters.ketulenan"
          :options="ketulenanOptions"
          label="Ketulenan"
          placeholder="Pilih Ketulenan"
        />
      </div>

      <!-- Summary Cards - Update styling to match -->
      <rs-card class="p-4 md:col-span-2 lg:col-span-4 mb-0">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Dokumen
          </h3>
          <div class="text-2xl font-bold">
            {{ summaryData.jumlahDokumen }}
          </div>
        </div>
      </rs-card>

      <rs-card class="p-4 mb-0 col-span-2">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Dokumen Tulen
          </h3>
          <div class="text-2xl font-bold text-green-600">
            {{ summaryData.jumlahDokumenTulen }}
          </div>
        </div>
      </rs-card>

      <rs-card class="p-4 mb-0 col-span-2">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Dokumen Palsu
          </h3>
          <div class="text-2xl font-bold text-red-600">
            {{ summaryData.jumlahDokumenPalsu }}
          </div>
        </div>
      </rs-card>
    </div>

    <!-- Table Section Header -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Senarai Dokumen</h3>
      </div>
    </div>

    <!-- Table Section - Update styling -->
    <rs-card class="px-0 py-4">
      <rs-table
        :data="tableData"
        :options="{
          variant: 'default',
          striped: true,
          borderless: true,
        }"
        :options-advanced="{
          sortable: true,
          filterable: false,
        }"
        advanced
      >
        <!-- Maklumat & Ulasan -->
        <template v-slot:perincian="{ value }">
          <rs-button
            @click="viewDetails(value)"
            variant="info"
            size="sm"
            class="px-3 inline-flex items-center justify-center w-[100px]"
          >
            <Icon name="ic:baseline-info" class="mr-2 w-4 h-4" />
            Perincian
          </rs-button>
        </template>

        <!-- Tindakan -->
        <template v-slot:tindakan="{ text }">
          <div class="flex gap-2">
            <rs-button
              @click="updateItem(text.id)"
              variant="warning"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[110px]"
              title="Kemaskini"
            >
              <Icon name="ph:pencil" class="mr-2 w-4 h-4" />
              Kemaskini
            </rs-button>
          </div>
        </template>
      </rs-table>
    </rs-card>

    <!-- Details Modal -->
    <rs-modal v-model="showDetailsModal" title="Maklumat & Ulasan" size="lg">
      <template #body>
        <div class="space-y-6 p-2">
          <!-- Basic Information Section -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Maklumat Terperinci -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Maklumat Terperinci:
              </h3>
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ selectedDetails?.maklumatTerperinci }}
              </p>
            </div>

            <!-- Ulasan -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Ulasan:
              </h3>
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ selectedDetails?.ulasan }}
              </p>
            </div>
          </div>

          <!-- Document and Inspection Details -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Document Information -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Maklumat Dokumen:
              </h3>
              <div class="space-y-3">
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Muka Surat:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{
                    selectedDetails?.mukaSurat
                  }}</span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >No. Dokumen:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{
                    selectedDetails?.noDocument
                  }}</span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Nama Pemilik:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{
                    selectedDetails?.namaPemilik
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Inspection Information -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Maklumat Pemeriksaan:
              </h3>
              <div class="space-y-3">
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Peralatan Digunakan:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{
                    selectedDetails?.peralatanDigunakan
                  }}</span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Cara Semakan:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{
                    selectedDetails?.caraSemakan
                  }}</span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Dapatan:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{
                    selectedDetails?.dapatan
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div
            v-if="selectedDetails?.images?.length > 0"
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Gambar:
              </h3>
              <rs-button
                @click="previewAllImages(selectedDetails.images)"
                variant="primary"
                size="sm"
                class="px-3 inline-flex items-center justify-center"
              >
                <Icon name="ic:baseline-collections" class="mr-2 w-4 h-4" />
                Papar Semua Gambar
              </rs-button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="image in selectedDetails.images"
                :key="image.documentID"
                class="relative group cursor-pointer hover:opacity-90 transition-opacity"
                @click="previewImage(image)"
              >
                <img
                  :src="image.documentURL"
                  :alt="image.documentName"
                  class="w-full h-32 object-cover rounded-lg shadow-sm"
                  @error="(e) => (e.target.style.display = 'none')"
                  @load="(e) => (e.target.style.display = '')"
                />
                <span
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate"
                >
                  {{ image.documentName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end px-4 py-3 bg-gray-50 dark:bg-gray-800">
          <rs-button
            @click="showDetailsModal = false"
            variant="danger"
            size="sm"
            class="px-4 py-2 inline-flex items-center justify-center shadow-sm"
          >
            <Icon name="ic:round-close" class="mr-2 w-4 h-4" />
            Tutup
          </rs-button>
        </div>
      </template>
    </rs-modal>
  </div>
</template>

<style scoped>
.text-muted-foreground {
  @apply text-gray-500 dark:text-gray-400;
}

.text-muted {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
