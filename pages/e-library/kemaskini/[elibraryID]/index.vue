<script setup>
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
});
const uploadedFiles = ref([]);
const uploadedImages = ref([]);
const isSubmitting = ref(false);
const existingImages = ref([]);

const jenisDokumenOptions = [
  "Pasport",
  "Malpass",
  "Cap Keselamatan",
  "Cap Jari",
  "Pemeriksaan Siber",
  "Tulisan Tangan",
  "I-Kad",
  "Lain-lain",
];

const ketulenanOptions = ["Palsu", "Tulen"];

// Add this new array of country options
const negaraPengeluaranOptions = [
  "Malaysia",
  "Indonesia",
  "Singapura",
  "Thailand",
  "Filipina",
  "Brunei",
  "Vietnam",
  "Kemboja",
  "Myanmar",
  "Laos",
  "China",
  "Jepun",
  "Korea Selatan",
  "India",
  "Pakistan",
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
  "Lain-lain",
];

// Fetch existing data
const fetchELibraryData = async () => {
  try {
    const { data: response } = await useFetch(
      `/api/elibrary/${elibraryID.value}`
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
    const { data } = await useFetch(`/api/elibrary/${elibraryID.value}`, {
      method: "PUT",
      body: {
        ...formData.value,
        images: uploadedImages.value,
      },
    });

    if (data.value?.statusCode === 200) {
      await $swal.fire("Berjaya!", "Maklumat berjaya dikemaskini", "success");
      router.push("/e-library");
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
  router.push("/e-library");
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
        confirmButtonText: "Tutup",
        showDenyButton: index < existingImages.value.length - 1,
        showCancelButton: index > 0,
        denyButtonText: "Seterusnya",
        cancelButtonText: "Sebelumnya",
      })
      .then((result) => {
        if (result.isDenied && index < existingImages.value.length - 1) {
          showImage(index + 1);
        } else if (result.dismiss === Swal.DismissReason.cancel && index > 0) {
          showImage(index - 1);
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
  <div>
    <div class="flex justify-between items-center">
      <h1>Kemaskini E-Library</h1>
    </div>

    <!-- Add this section after your form -->
    <rs-card v-if="existingImages.length > 0" class="mt-6 p-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold mb-4">Gambar Sedia Ada</h2>
        <div class="flex justify-end mb-4">
          <rs-button @click="previewAllImages" variant="primary">
            Papar Semua Gambar
          </rs-button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
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
          />
          <span class="text-xs text-gray-500 mt-1 block truncate">
            {{ image.documentName }}
          </span>
        </div>
      </div>
    </rs-card>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" @submit="submitForm" :actions="false">
        <div class="space-y-4">
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
            type="number"
            name="elibrary_tahunPengeluaran"
            label="Tahun Pengeluaran"
            v-model="formData.elibrary_tahunPengeluaran"
            validation="required|number|min:1900|max:2100"
            :validation-messages="{
              required: 'Sila masukkan tahun pengeluaran',
              number: 'Sila masukkan nombor sahaja',
              min: 'Tahun tidak sah',
              max: 'Tahun tidak sah',
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

          <!-- File Upload -->
          <FormKit
            type="file"
            name="images"
            label="Gambar"
            accept="image/*"
            multiple="true"
            v-model="uploadedFiles"
            :help="'Maximum 100 images, 5MB per image'"
            :validation-messages="{
              required: 'Sila pilih sekurang-kurangnya satu gambar',
            }"
          />

          <!-- Preview Images -->
          <div v-if="uploadedImages.length > 0" class="grid grid-cols-3 gap-4">
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

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2 mt-4">
            <rs-button @click="goBack" variant="danger">Kembali</rs-button>
            <rs-button
              btn-type="submit"
              variant="success"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Sedang Dikemaskini..." : "Kemaskini" }}
            </rs-button>
          </div>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>
