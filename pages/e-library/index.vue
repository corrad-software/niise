<script setup>
import { useDebounceFn } from "@vueuse/core";

definePageMeta({
  title: "E-Library",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "E-Library",
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
      `/api/elibrary?${queryParams.toString()}`
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
    images: item.perincian.images,
  };
  showDetailsModal.value = true;
};

const updateItem = (id) => {
  navigateTo(`/e-library/kemaskini/${id}`);
};

const uploadItem = (id) => {
  selectedElibraryId.value = id;
  showUploadModal.value = true;
};

const submitImages = async () => {
  const missingDescriptions = uploadedImages.value.some(
    (img) => !img.description.trim()
  );

  if (missingDescriptions) {
    $swal.fire({
      title: "Perhatian",
      text: "Sila masukkan keterangan untuk semua gambar",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

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
    const { data } = await useFetch("/api/elibrary/upload", {
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

watch(
  uploadedFiles,
  async (newFiles) => {
    if (!newFiles || !Array.isArray(newFiles) || newFiles.length === 0) return;

    const newImages = [];
    const oversizedFiles = [];

    for (const file of newFiles) {
      if (!file || !file.file) continue;

      const actualFile = file.file;
      // console.log("Processing file:", actualFile);

      if (actualFile.size > 5000000) {
        oversizedFiles.push(actualFile.name);
        continue;
      }

      const isDuplicate = uploadedImages.value.some(
        (img) => img.name === actualFile.name
      );
      if (isDuplicate) continue;

      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(actualFile);
        });

        newImages.push({
          name: actualFile.name,
          base64: base64,
          size: actualFile.size,
          type: actualFile.type,
          description: "",
        });
      } catch (error) {
        console.error("Error reading file:", error);
      }
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

    uploadedImages.value = [...uploadedImages.value, ...newImages];

    uploadedFiles.value = [];
  },
  { deep: true }
);

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
      `/api/elibrary/summary?${queryParams.toString()}`
    );
    if (response.data.value?.statusCode === 200) {
      summaryData.value = response.data.value.data;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
  }
};

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
  // console.log("Component mounted");
  uploadedImages.value = [];
  uploadedFiles.value = [];
  fetchELibraryData();
  fetchSummary();
});
const currentImageIndex = ref(0);
const showImagePreview = ref(false);

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
        showCancelButton: index > 0,
        showDenyButton: index < images.length - 1,
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

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Ringkasan Dokumen</h3>
      </div>
    </div>

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

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Senarai Dokumen</h3>
      </div>
      <rs-button @click="navigateTo('/e-library/tambah')">
        <Icon name="ph:plus" class="mr-2 w-4 h-4" />
        Tambah Dokumen
      </rs-button>
    </div>

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

        <template v-slot:tindakan="{ text }">
          <div class="flex gap-2">
            <rs-button
              @click="uploadItem(text.id)"
              variant="success"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[110px]"
              title="Muat Naik"
            >
              <Icon name="ic:baseline-upload" class="mr-2 w-4 h-4" />
              Muat Naik
            </rs-button>
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

    <rs-modal
      v-model="showUploadModal"
      title="Muat Naik Gambar"
      size="lg"
      :hide-footer="true"
    >
      <template #body>
        <FormKit type="form" @submit="submitImages" :actions="false">
          <div class="space-y-6 p-2">
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <FormKit
                v-model="uploadedFiles"
                type="file"
                name="images"
                label="Pilih Gambar"
                accept="image/*"
                multiple="true"
                :help="'Maximum 100 images, 5MB per image'"
                :validation="uploadedImages.length === 0 ? 'required' : ''"
                :validation-messages="{
                  required: 'Sila pilih sekurang-kurangnya satu gambar',
                }"
              />
            </div>

            <div
              v-if="uploadedImages.length > 0"
              class="text-sm text-gray-500 mb-2"
            >
              {{ uploadedImages.length }} images loaded
            </div>

            <div
              v-if="uploadedImages.length > 0"
              class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
            >
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                Pratonton Gambar
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="(image, index) in uploadedImages"
                  :key="index"
                  class="relative group space-y-2"
                >
                  <img
                    :src="image.base64"
                    :alt="image.name"
                    class="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                  <button
                    @click.prevent="removeImage(index)"
                    class="absolute top-1 right-2 w-6 h-6 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Icon name="ic:round-close" class="w-4 h-4" />
                  </button>

                  <FormKit
                    type="textarea"
                    v-model="image.description"
                    placeholder="Masukkan keterangan gambar"
                    :validation="[['required']]"
                    :validation-messages="{
                      required: 'Keterangan gambar diperlukan',
                    }"
                    rows="2"
                    class="w-full"
                  />

                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 block truncate"
                  >
                    {{ image.name }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 px-4">
              <rs-button
                variant="danger"
                @click="showUploadModal = false"
                :disabled="isSubmitting"
                size="sm"
                class="px-4 py-2 inline-flex items-center justify-center shadow-sm"
              >
                <Icon name="ic:round-close" class="mr-2 w-4 h-4" />
                Tutup
              </rs-button>
              <rs-button
                btn-type="submit"
                variant="primary"
                :disabled="uploadedImages.length === 0 || isSubmitting"
                size="sm"
                class="px-4 py-2 inline-flex items-center justify-center shadow-sm"
              >
                <Icon name="ic:baseline-upload" class="mr-2 w-4 h-4" />
                {{ isSubmitting ? "Sedang Memuat Naik..." : "Muat Naik" }}
              </rs-button>
            </div>
          </div>
        </FormKit>
      </template>
    </rs-modal>

    <rs-modal v-model="showDetailsModal" title="Maklumat & Ulasan" size="lg">
      <template #body>
        <div class="space-y-6 p-2">
          <div class="grid md:grid-cols-2 gap-6">
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
