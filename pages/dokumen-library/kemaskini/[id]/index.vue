<script setup>
const route = useRoute();
const router = useRouter();
const { $swal } = useNuxtApp();
const documentID = ref(route.params.id);

const formData = ref({
  negaraPengeluaran: "",
  tahunPengeluaran: "",
  mukaSurat: "",
  noDocument: "",
  namaPemilik: "",
  peralatanDigunakan: "",
  caraSemakan: "",
  dapatan: "",
  ulasan: "",
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

const caraSemakanOptions = [
  { label: "Sila Pilih", value: "" },
  { label: "Cahaya biasa(Flood Light)", value: "Cahaya biasa(Flood Light)" },
  {
    label: "Cahaya UV(Ultraviolet Light 365nm)",
    value: "Cahaya UV(Ultraviolet Light 365nm)",
  },
  { label: "Cahaya Infrared", value: "Cahaya Infrared" },
];

const dapatanOptions = [
  { label: "Sila Pilih", value: "" },
  { label: "Palsu", value: "Palsu" },
  { label: "Tulen", value: "Tulen" },
  { label: "Tidak Dapat Dikenalpasti", value: "Tidak Dapat Dikenalpasti" },
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

// Fetch existing data
const fetchDocumentData = async () => {
  try {
    const { data: response } = await useFetch(
      `/api/dokumen-library/${documentID.value}`
    );
    if (response.value && response.value.statusCode === 200) {
      formData.value = {
        negaraPengeluaran: response.value.data.negaraPengeluaran || "",
        tahunPengeluaran: response.value.data.tahunPengeluaran || "",
        mukaSurat: response.value.data.mukaSurat || "",
        noDocument: response.value.data.noDocument || "",
        namaPemilik: response.value.data.namaPemilik || "",
        peralatanDigunakan: response.value.data.peralatanDigunakan || "",
        caraSemakan: response.value.data.caraSemakan || "",
        dapatan: response.value.data.dapatan || "",
        ulasan: response.value.data.ulasan || "",
      };
      existingImages.value = response.value.data.document || [];
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

    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/tiff"];
    if (!allowedTypes.includes(actualFile.type)) {
      $swal.fire({
        title: "Format Fail Tidak Sah",
        text: `${file.name} bukan dalam format yang dibenarkan (PNG, JPG, JPEG, TIFF)`,
        icon: "error",
      });
      continue;
    }

    if (actualFile.size > 5000000) {
      // 5MB limit
      oversizedFiles.push(file.name);
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
      html: `Fail berikut melebihi 5MB:<br><br>${oversizedFiles.join("<br>")}`,
      icon: "warning",
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
      `/api/dokumen-library/${documentID.value}`,
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
      // Go back to the previous page
      router.back();
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

// Function to preview single image
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
  fetchDocumentData();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Kemaskini Dokumen Library</h1>
    </div>

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
          <!-- Negara Pengeluaran -->
          <FormKit
            type="select"
            name="negaraPengeluaran"
            label="Negara Pengeluaran"
            v-model="formData.negaraPengeluaran"
            :options="negaraPengeluaranOptions"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih negara pengeluaran',
            }"
          />

          <!-- Tahun Pengeluaran -->
          <FormKit
            type="select"
            name="tahunPengeluaran"
            label="Tahun Pengeluaran"
            v-model="formData.tahunPengeluaran"
            :options="tahunOptions"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih tahun pengeluaran',
            }"
          />

          <!-- Muka Surat -->
          <FormKit
            type="text"
            name="mukaSurat"
            label="Muka Surat"
            v-model="formData.mukaSurat"
            validation="required"
            :validation-messages="{
              required: 'Sila masukkan muka surat',
            }"
          />

          <!-- No Document -->
          <FormKit
            type="text"
            name="noDocument"
            label="No Document"
            v-model="formData.noDocument"
            validation="required"
            :validation-messages="{
              required: 'Sila masukkan no document',
            }"
          />

          <!-- Nama Pemilik -->
          <FormKit
            type="text"
            name="namaPemilik"
            label="Nama Pemilik"
            v-model="formData.namaPemilik"
            validation="required"
            :validation-messages="{
              required: 'Sila masukkan nama pemilik',
            }"
          />

          <!-- Peralatan yang Digunakan -->
          <FormKit
            type="text"
            name="peralatanDigunakan"
            label="Peralatan yang Digunakan"
            v-model="formData.peralatanDigunakan"
            validation="required"
            :validation-messages="{
              required: 'Sila masukkan peralatan yang digunakan',
            }"
          />

          <!-- Cara Semakan -->
          <FormKit
            type="select"
            name="caraSemakan"
            label="Cara Semakan"
            v-model="formData.caraSemakan"
            :options="caraSemakanOptions"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih cara semakan',
            }"
          />

          <!-- Dapatan -->
          <FormKit
            type="select"
            name="dapatan"
            label="Dapatan"
            v-model="formData.dapatan"
            :options="dapatanOptions"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih dapatan',
            }"
          />

          <!-- Ulasan -->
          <FormKit
            type="textarea"
            name="ulasan"
            label="Ulasan"
            v-model="formData.ulasan"
          />

          <!-- File Upload -->
          <FormKit
            type="file"
            name="images"
            label="Gambar"
            accept="image/png,image/jpeg,image/jpg,image/tiff"
            multiple="true"
            v-model="uploadedFiles"
            help="Maksimum 100 gambar, 5MB setiap gambar (PNG, JPG, JPEG, TIFF)"
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
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="ic:round-close" />
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

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
</style>
