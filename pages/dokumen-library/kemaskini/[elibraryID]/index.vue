<script setup>
// Update page meta definition to match pattern
definePageMeta({
  title: "Kemaskini Dokumen E-Library",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Dokumen E-Library",
      path: "/dokumen-library",
    },
    {
      name: "Kemaskini",
      type: "current",
    },
  ],
});

const route = useRoute();
const router = useRouter();
const { $swal } = useNuxtApp();
const elibraryID = ref(route.params.elibraryID);
const formData = ref({
  elibrary_jenisDokumen: "",
  elibrary_negaraPengeluaran: "",
  elibrary_tahunPengeluaran: "",
  elibrary_ketulenan: "",
  elibrary_maklumatTerperinci: "",
  elibrary_ulasan: "",
  elibrary_mukaSurat: "",
  elibrary_noDocument: "",
  elibrary_namaPemilik: "",
  elibrary_peralatanDigunakan: "",
  elibrary_caraSemakan: "",
  elibrary_dapatan: "",
});
const uploadedFiles = ref([]);
const uploadedImages = ref([]);
const isSubmitting = ref(false);
const existingImages = ref([]);

// Dropdown options
const tahunOptions = [
  { label: "Sila Pilih", value: "" },
  ...Array.from({ length: 124 }, (_, i) => ({
    label: (2024 - i).toString(),
    value: (2024 - i).toString(),
  })),
];

const jenisDokumenOptions = [
  { label: "Sila Pilih", value: "" },
  { label: "Pasport", value: "Pasport" },
  { label: "Malpass", value: "Malpass" },
  { label: "Cap Keselamatan", value: "Cap Keselamatan" },
  { label: "Cap Jari", value: "Cap Jari" },
  { label: "Pemeriksaan Siber", value: "Pemeriksaan Siber" },
  { label: "Tulisan Tangan", value: "Tulisan Tangan" },
  { label: "I-Kad", value: "I-Kad" },
  { label: "Lain-lain", value: "Lain-lain" },
];

const ketulenanOptions = [
  { label: "Sila Pilih", value: "" },
  { label: "Palsu", value: "Palsu" },
  { label: "Tulen", value: "Tulen" },
];

const negaraPengeluaranOptions = [
  { label: "Sila Pilih", value: "" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Singapura", value: "Singapura" },
  { label: "Thailand", value: "Thailand" },
  { label: "Filipina", value: "Filipina" },
  { label: "Brunei", value: "Brunei" },
  { label: "Vietnam", value: "Vietnam" },
  { label: "Kemboja", value: "Kemboja" },
  { label: "Myanmar", value: "Myanmar" },
  { label: "Laos", value: "Laos" },
  { label: "China", value: "China" },
  { label: "Jepun", value: "Jepun" },
  { label: "Korea Selatan", value: "Korea Selatan" },
  { label: "India", value: "India" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Nepal", value: "Nepal" },
  { label: "Sri Lanka", value: "Sri Lanka" },
  { label: "Lain-lain", value: "Lain-lain" },
];

const caraSemakanOptions = [
  { label: "Sila Pilih", value: "" },
  { label: "Cahaya biasa(Flood Light)", value: "Cahaya biasa(Flood Light)" },
  {
    label: "Cahaya UV(Ultraviolet Light 365nm)",
    value: "Cahaya UV(Ultraviolet Light 365nm)",
  },
  { label: "Cahaya Infrared", value: "Cahaya Infrared" },
];

// Fetch existing data
const fetchELibraryData = async () => {
  try {
    const { data: response } = await useFetch(
      `/api/dokumen-library/${elibraryID.value}`
    );
    if (response.value && response.value.statusCode === 200) {
      formData.value = response.value.data;
      existingImages.value = response.value.data.document;
    } else {
      throw new Error(response.value?.message || "Failed to fetch data");
    }
  } catch (error) {
    $swal.fire("Ralat!", error.message, "error");
  }
};

// Watch for file changes
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

const submitForm = async () => {
  try {
    isSubmitting.value = true;
    const { data } = await useFetch(
      `/api/dokumen-library/${elibraryID.value}`,
      {
        method: "PUT",
        body: {
          ...formData.value,
          images: uploadedImages.value,
        },
      }
    );

    if (data.value?.statusCode === 200) {
      await $swal.fire("Berjaya!", "Maklumat berjaya dikemaskini", "success");
      router.push("/dokumen-library");
    } else {
      throw new Error(data.value?.message || "Failed to update");
    }
  } catch (error) {
    $swal.fire("Ralat!", error.message, "error");
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push("/dokumen-library");
};

// Function to preview image
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

// Function to preview all images
const previewAllImages = () => {
  if (!existingImages.value || existingImages.value.length === 0) {
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
        title: existingImages.value[index].documentName,
        imageUrl: existingImages.value[index].documentURL,
        imageWidth: 600,
        imageHeight: 400,
        imageAlt: existingImages.value[index].documentName,
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        cancelButtonText: "Sebelumnya",
        denyButtonText: "Seterusnya",
        confirmButtonText: "Tutup",
        // Hide buttons based on position
        showCancelButton: index > 0,
        showDenyButton: index < existingImages.value.length - 1,
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
        if (result.isDenied && index < existingImages.value.length - 1) {
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

onMounted(() => {
  fetchELibraryData();
});
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <!-- Header section -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Kemaskini E-Library</h3>
      </div>
    </div>

    <!-- Existing Images Section -->
    <rs-card v-if="existingImages.length > 0" class="mt-6 p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Gambar Sedia Ada</h3>
        <rs-button
          @click="previewAllImages"
          variant="primary"
          size="sm"
          class="px-3 inline-flex items-center justify-center"
        >
          <Icon name="ic:baseline-collections" class="mr-2 w-4 h-4" />
          Papar Semua Gambar
        </rs-button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="image in existingImages"
          :key="image.documentID"
          class="relative group cursor-pointer"
          @click="previewImage(image)"
        >
          <img
            :src="image.documentURL"
            :alt="image.documentName"
            class="w-full h-32 object-cover rounded-lg"
            @error="(e) => (e.target.style.display = 'none')"
            @load="(e) => (e.target.style.display = '')"
          />
          <span class="text-xs text-gray-500 mt-1 block truncate">
            {{ image.documentName }}
          </span>
        </div>
      </div>
    </rs-card>

    <!-- Form Section -->
    <rs-card class="p-4">
      <FormKit type="form" @submit="submitForm" :actions="false">
        <div class="space-y-6">
          <!-- Document Information Section -->
          <div>
            <h3 class="text-lg font-semibold mb-4 border-b pb-2">
              Butiran Maklumat
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Jenis Dokumen -->
              <FormKit
                type="select"
                name="elibrary_jenisDokumen"
                label="Jenis Dokumen"
                v-model="formData.elibrary_jenisDokumen"
                :options="jenisDokumenOptions"
                validation="required"
                :validation-messages="{
                  required: 'Sila pilih jenis dokumen',
                }"
              />

              <!-- Negara Pengeluaran -->
              <FormKit
                type="select"
                name="elibrary_negaraPengeluaran"
                label="Negara Pengeluaran"
                v-model="formData.elibrary_negaraPengeluaran"
                :options="negaraPengeluaranOptions"
                validation="required"
                :validation-messages="{
                  required: 'Sila pilih negara pengeluaran',
                }"
              />

              <!-- Tahun Pengeluaran -->
              <FormKit
                type="select"
                name="elibrary_tahunPengeluaran"
                label="Tahun Pengeluaran"
                v-model="formData.elibrary_tahunPengeluaran"
                :options="tahunOptions"
                validation="required"
                :validation-messages="{
                  required: 'Sila pilih tahun pengeluaran',
                }"
              />
            </div>
          </div>

          <!-- Document Details Section -->
          <div>
            <h3 class="text-lg font-semibold mb-4 border-b pb-2">
              Butiran Dokumen
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- No Document -->
              <FormKit
                type="text"
                name="elibrary_noDocument"
                label="No. Dokumen"
                v-model="formData.elibrary_noDocument"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan no. dokumen',
                }"
              />

              <!-- Muka Surat -->
              <FormKit
                type="text"
                name="elibrary_mukaSurat"
                label="Muka Surat"
                v-model="formData.elibrary_mukaSurat"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan muka surat',
                }"
              />

              <!-- Nama Pemilik -->
              <FormKit
                type="text"
                name="elibrary_namaPemilik"
                label="Nama Pemilik"
                v-model="formData.elibrary_namaPemilik"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan nama pemilik',
                }"
              />
            </div>
          </div>

          <!-- Inspection Details Section -->
          <div>
            <h3 class="text-lg font-semibold mb-4 border-b pb-2">
              Maklumat Pemeriksaan
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Peralatan Digunakan -->
              <FormKit
                type="text"
                name="elibrary_peralatanDigunakan"
                label="Peralatan Digunakan"
                v-model="formData.elibrary_peralatanDigunakan"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan peralatan yang digunakan',
                }"
              />

              <!-- Cara Semakan -->
              <FormKit
                type="select"
                name="elibrary_caraSemakan"
                label="Cara Semakan"
                v-model="formData.elibrary_caraSemakan"
                :options="caraSemakanOptions"
                validation="required"
                :validation-messages="{
                  required: 'Sila pilih cara semakan',
                }"
              />

              <!-- Ketulenan -->
              <FormKit
                type="select"
                name="elibrary_ketulenan"
                label="Ketulenan"
                v-model="formData.elibrary_ketulenan"
                :options="ketulenanOptions"
                validation="required"
                :validation-messages="{
                  required: 'Sila pilih ketulenan',
                }"
              />

              <!-- Dapatan -->
              <FormKit
                type="select"
                name="elibrary_dapatan"
                label="Dapatan"
                v-model="formData.elibrary_dapatan"
                :options="ketulenanOptions"
                validation="required"
                :validation-messages="{
                  required: 'Sila pilih dapatan',
                }"
              />
            </div>
          </div>

          <!-- Additional Information Section -->
          <div>
            <h3 class="text-lg font-semibold mb-4 border-b pb-2">
              Maklumat Tambahan
            </h3>
            <div class="grid grid-cols-1 gap-4">
              <!-- Maklumat Terperinci -->
              <FormKit
                type="textarea"
                name="elibrary_maklumatTerperinci"
                label="Maklumat Terperinci"
                v-model="formData.elibrary_maklumatTerperinci"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan maklumat terperinci',
                }"
              />

              <!-- Ulasan -->
              <FormKit
                type="textarea"
                name="elibrary_ulasan"
                label="Ulasan"
                v-model="formData.elibrary_ulasan"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan ulasan',
                }"
              />
            </div>
          </div>

          <!-- File Upload Section -->
          <div>
            <h3 class="text-lg font-semibold mb-4 border-b pb-2">
              Muat Naik Gambar
            </h3>
            <FormKit
              type="file"
              name="images"
              label="Gambar"
              accept="image/*"
              multiple="true"
              v-model="uploadedFiles"
              :help="'Maximum 100 images, 5MB per image'"
            />

            <!-- Preview Images -->
            <div
              v-if="uploadedImages.length > 0"
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
            >
              <div
                v-for="(image, index) in uploadedImages"
                :key="index"
                class="relative group"
              >
                <img
                  :src="image.base64"
                  :alt="image.name"
                  class="w-full h-32 object-cover rounded-lg"
                />
                <button
                  @click.prevent="removeImage(index)"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                >
                  <Icon name="ic:round-close" class="w-4 h-4" />
                </button>
                <span class="text-xs text-gray-500 mt-1 block truncate">
                  {{ image.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-2 mt-6">
            <rs-button variant="danger" @click="goBack" class="px-4 py-2">
              <Icon name="ic:round-arrow-back" class="mr-2 w-4 h-4" />
              Kembali
            </rs-button>
            <rs-button
              btn-type="submit"
              variant="primary"
              :disabled="isSubmitting"
              class="px-4 py-2"
            >
              <Icon
                :name="isSubmitting ? 'eos-icons:loading' : 'ic:round-save'"
                class="mr-2 w-4 h-4"
              />
              {{ isSubmitting ? "Sedang Dikemaskini..." : "Kemaskini" }}
            </rs-button>
          </div>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style scoped>
.form-grid {
  @apply grid gap-4;
}

@screen sm {
  .form-grid {
    @apply grid-cols-1;
  }
}

@screen md {
  .form-grid {
    @apply grid-cols-2;
  }
}

@screen lg {
  .form-grid {
    @apply grid-cols-3;
  }
}
</style>
