<script setup>
definePageMeta({
  title: "E-Library",
  middleware: ["auth"],
  requiresAuth: true,
});
const tableData = ref([]);
const showDetailsModal = ref(false);
const showUploadModal = ref(false);
const selectedDetails = ref(null);
const selectedElibraryId = ref(null);
const uploadedImages = ref([]);
const isSubmitting = ref(false);
const uploadedFiles = ref([]);

const { $swal } = useNuxtApp();

const fetchELibraryData = async () => {
  try {
    const { data: response } = await useFetch("/api/elibrary");
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

onMounted(() => {
  fetchELibraryData();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>E-Library</h1>
    </div>

    <div class="mt-4">
      <rs-card class="py-1">
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
              class="p-1"
            >
              Lihat Perincian
            </rs-button>
          </template>

          <!-- Tindakan -->
          <template v-slot:tindakan="{ value }">
            <div class="flex gap-2">
              <rs-button
                @click="uploadItem(value.id)"
                variant="primary"
                size="sm"
                class="p-1"
                title="Muat Naik"
              >
                Muat Naik
              </rs-button>
              <rs-button
                @click="updateItem(value.id)"
                variant="warning"
                size="sm"
                class="p-1"
                title="Kemaskini"
              >
                Kemaskini
              </rs-button>
            </div>
          </template>
        </rs-table>
      </rs-card>
    </div>

    <!-- Upload Modal -->
    <rs-modal
      v-model="showUploadModal"
      title="Muat Naik Gambar"
      size="lg"
      :hide-footer="true"
    >
      <template #body>
        <FormKit type="form" @submit="submitImages" :actions="false">
          <div class="space-y-4">
            <!-- File Upload -->
            <FormKit
              type="file"
              name="images"
              label="Pilih Gambar"
              accept="image/*"
              multiple="true"
              v-model="uploadedFiles"
              :help="'Maximum 100 images, 5MB per image'"
              validation="required"
              :validation-messages="{
                required: 'Sila pilih sekurang-kurangnya satu gambar',
              }"
            />

            <!-- Preview Images -->
            <div
              v-if="uploadedImages.length > 0"
              class="grid grid-cols-3 gap-4"
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
                  class="flex items-center justify-center absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                >
                  <Icon name="ic:round-close" size="1.2rem" />
                </button>
                <span class="text-xs text-gray-500 mt-1 block truncate">
                  {{ image.name }}
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end gap-2 mt-4">
              <rs-button
                variant="secondary"
                @click="showUploadModal = false"
                :disabled="isSubmitting"
              >
                Batal
              </rs-button>
              <rs-button
                btn-type="submit"
                variant="primary"
                :disabled="uploadedImages.length === 0 || isSubmitting"
              >
                {{ isSubmitting ? "Sedang Memuat Naik..." : "Muat Naik" }}
              </rs-button>
            </div>
          </div>
        </FormKit>
      </template>
    </rs-modal>

    <!-- Details Modal -->
    <rs-modal v-model="showDetailsModal" title="Maklumat & Ulasan" size="lg">
      <template #body>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">Maklumat Terperinci:</h3>
            <p class="whitespace-pre-wrap">
              {{ selectedDetails?.maklumatTerperinci }}
            </p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Ulasan:</h3>
            <p class="whitespace-pre-wrap">{{ selectedDetails?.ulasan }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <rs-button @click="showDetailsModal = false" variant="secondary"
            >Tutup</rs-button
          >
        </div>
      </template>
    </rs-modal>
  </div>
</template>
