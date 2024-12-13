<script setup>
// Page meta definition
definePageMeta({
  title: "Tambah E-Library",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "E-Library",
      path: "/e-library",
    },
    {
      name: "Tambah",
      type: "current",
    },
  ],
});

const router = useRouter();
const { $swal } = useNuxtApp();
const formData = ref({
  elibrary_jenisDokumen: "",
  elibrary_negaraPengeluaran: "",
  elibrary_tahunPengeluaran: "",
  elibrary_ketulenan: "",
  elibrary_maklumatTerperinci: "",
  elibrary_ulasan: "",
});
const uploadedFiles = ref([]);
const uploadedImages = ref([]);
const isSubmitting = ref(false);

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

// Dropdown options
const tahunOptions = [
  { label: "Sila Pilih", value: "" },
  ...Array.from({ length: 124 }, (_, i) => ({
    label: (2024 - i).toString(),
    value: (2024 - i).toString(),
  })),
];

// Watch for file changes
watch(
  uploadedFiles,
  async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    try {
      const newImages = [];
      const oversizedFiles = [];

      // Process each file
      for (const file of files) {
        if (!file || !file.file) continue;

        const actualFile = file.file;

        if (actualFile.size > 5000000) {
          // 5MB limit
          oversizedFiles.push(actualFile.name);
          continue;
        }

        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(actualFile);
        });

        newImages.push({
          name: actualFile.name,
          base64: base64,
          size: actualFile.size,
          type: actualFile.type,
          description: "", // Initialize empty description
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

      // Update uploadedImages with new images
      uploadedImages.value = [...uploadedImages.value, ...newImages];

      // Important: Clear the file input after processing
      uploadedFiles.value = [];
    } catch (error) {
      console.error("Error processing files:", error);
      $swal.fire({
        title: "Ralat",
        text: "Ralat semasa memproses fail",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  },
  { deep: true }
);

// Add preview image function
const previewImage = (image) => {
  $swal.fire({
    title: image.name,
    imageUrl: image.base64,
    imageWidth: 600,
    imageHeight: 400,
    imageAlt: image.name,
    html: image.description
      ? `<p class="mt-3 text-gray-600">${image.description}</p>`
      : "",
    showConfirmButton: true,
    confirmButtonText: "Tutup",
  });
};

// Update removeImage function
const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
};

// Update submitForm function to validate descriptions
const submitForm = async () => {
  // Check if all images have descriptions
  const missingDescriptions = uploadedImages.value.some(
    (img) => !img.description?.trim()
  );

  if (missingDescriptions) {
    await $swal.fire({
      title: "Perhatian",
      text: "Sila masukkan keterangan untuk semua gambar",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    isSubmitting.value = true;
    const { data } = await useFetch("/api/elibrary/add", {
      method: "POST",
      body: {
        ...formData.value,
        images: uploadedImages.value,
      },
    });

    if (data.value?.statusCode === 200) {
      await $swal.fire("Berjaya!", "E-Library berjaya ditambah", "success");
      router.push("/e-library");
    } else {
      throw new Error(data.value?.message || "Failed to add");
    }
  } catch (error) {
    $swal.fire("Ralat!", error.message, "error");
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push("/e-library");
};

const resetForm = () => {
  formData.value = {
    ...formData.value,
    elibrary_jenisDokumen: "",
    elibrary_negaraPengeluaran: "",
    elibrary_tahunPengeluaran: "",
    elibrary_ketulenan: "",
    elibrary_maklumatTerperinci: "",
    elibrary_ulasan: "",
  };

  uploadedImages.value = [];
};
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <!-- Header section -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Tambah E-Library</h3>
      </div>
      <rs-button btn-type="reset" variant="danger-outline" @click="resetForm">
        <Icon name="ic:round-refresh" class="w-4 h-4 mr-2" />
        Padam Borang
      </rs-button>
    </div>

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
              Maklumat Pemeriksaan
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              :validation="uploadedImages.length === 0 ? 'required' : ''"
              :help="'Maximum 100 images, 5MB per image'"
              :validation-messages="{
                required: 'Sila pilih sekurang-kurangnya satu gambar',
              }"
            />

            <!-- Preview Images with Description -->
            <div
              v-if="uploadedImages.length > 0"
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
            >
              <div
                v-for="(image, index) in uploadedImages"
                :key="index"
                class="relative group space-y-2 bg-white rounded-lg p-3 shadow-sm"
              >
                <!-- Image Preview -->
                <div class="relative">
                  <img
                    :src="image.base64"
                    :alt="image.name"
                    class="w-full h-32 object-cover rounded-lg"
                    @click="previewImage(image)"
                  />
                  <button
                    @click.prevent="removeImage(index)"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center"
                  >
                    <Icon name="ic:round-close" class="w-4 h-4" />
                  </button>
                </div>

                <!-- Image Description Input -->
                <FormKit
                  type="textarea"
                  v-model="image.description"
                  placeholder="Masukkan keterangan gambar"
                  :validation="[['required']]"
                  :validation-messages="{
                    required: 'Keterangan gambar diperlukan',
                  }"
                  rows="2"
                  class="w-full text-sm"
                />

                <!-- File Name -->
                <span class="text-xs text-gray-500 block truncate">
                  {{ image.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-2 mt-6">
            <rs-button @click="goBack" variant="danger" class="px-4 py-2">
              <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
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
              {{ isSubmitting ? "Sedang Ditambah..." : "Simpan" }}
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

/* Add these styles for the image preview section */
.swal2-html-container {
  margin: 1em 0 !important;
  text-align: left !important;
}

/* Style for the textarea within the image preview */
:deep(.formkit-input[type="textarea"]) {
  @apply text-sm resize-none;
}

/* Add this new style for delete button hover effect */
.group:hover .opacity-0 {
  opacity: 1;
}
</style>
