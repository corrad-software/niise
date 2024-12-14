<script setup>
const defaultImage = new URL(
  "@/assets/img/default-thumbnail.jpg",
  import.meta.url
).href;

definePageMeta({
  title: "Dokumen Library",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Dokumen Library",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

// State management
const elibrary = ref([]);
const selectedDocument = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Filter states
const selectedDocType = ref("");
const selectedAuthenticity = ref("");
const selectedIssuingCountry = ref("");

// Filter options
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
];

// API calls
const fetchElibraryData = async () => {
  try {
    isLoading.value = true;
    const { data: response } = await useFetch("/api/dokumen-library-latest");

    if (response.value?.statusCode === 200) {
      elibrary.value = response.value.data;
    } else {
      error.value = response.value?.message || "Error fetching data";
    }
  } catch (err) {
    error.value = "Error fetching data";
    console.error("Error:", err);
  } finally {
    isLoading.value = false;
  }
};

const fetchElibraryDetails = async (id) => {
  try {
    isLoading.value = true;
    const { data: response } = await useFetch(
      `/api/dokumen-library-latest/${id}`
    );

    if (response.value?.statusCode === 200) {
      selectedDocument.value = response.value.data;
    } else {
      error.value = response.value?.message || "Error fetching details";
    }
  } catch (err) {
    error.value = "Error fetching details";
    console.error("Error:", err);
  } finally {
    isLoading.value = false;
  }
};

// Computed property for filtered documents
const filteredDocuments = computed(() => {
  let filtered = elibrary.value;

  if (selectedDocType.value) {
    filtered = filtered.filter(
      (doc) => doc.jenisDokumen === selectedDocType.value
    );
  }
  if (selectedAuthenticity.value) {
    filtered = filtered.filter(
      (doc) => doc.ketulenan === selectedAuthenticity.value
    );
  }
  if (selectedIssuingCountry.value) {
    filtered = filtered.filter(
      (doc) => doc.negaraPengeluaran === selectedIssuingCountry.value
    );
  }

  return filtered;
});

// Methods
const showDetails = async (doc) => {
  await fetchElibraryDetails(doc.id);
};

const backToList = () => {
  selectedDocument.value = null;
};

const selectImage = (image) => {
  if (selectedDocument.value) {
    selectedDocument.value.selectedImage = image;
  }
};

// Add this new method
const previewImage = (imageUrl, title = "") => {
  $swal.fire({
    imageUrl,
    imageAlt: title,
    title,
    width: "80%",
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      image: "max-h-[80vh] object-contain",
    },
  });
};

// Add this new method
const resetFilters = () => {
  selectedDocType.value = "";
  selectedAuthenticity.value = "";
  selectedIssuingCountry.value = "";
};

// Fetch initial data
onMounted(() => {
  fetchElibraryData();
});
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
      ></div>
    </div>

    <!-- Error State -->
    <RsAlert v-if="error" variant="danger" :show="true" class="mb-4">
      {{ error }}
    </RsAlert>

    <!-- Content -->
    <div v-if="!isLoading && !error">
      <div v-if="!selectedDocument">
        <div class="flex items-center justify-between space-y-2">
          <div>
            <h3 class="text-2xl font-bold tracking-tight">Ringkasan Dokumen</h3>
          </div>
        </div>

        <!-- Filters Card -->
        <RsCard class="mb-6 p-6">
          <div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormKit
                type="select"
                name="documentType"
                label="Jenis Dokumen"
                :options="jenisDokumenOptions"
                v-model="selectedDocType"
              />

              <FormKit
                type="select"
                name="authenticity"
                label="Ketulenan"
                :options="ketulenanOptions"
                v-model="selectedAuthenticity"
              />

              <FormKit
                type="select"
                name="issuingCountry"
                label="Negara Pengeluaran"
                :options="negaraPengeluaranOptions"
                v-model="selectedIssuingCountry"
              />
            </div>

            <div class="flex justify-end">
              <RsButton
                variant="danger-outline"
                size="sm"
                @click="resetFilters"
              >
                <Icon name="mdi:filter-remove" class="w-4 h-4 mr-2" />
                Tetapkan Semula
              </RsButton>
            </div>
          </div>
        </RsCard>

        <!-- Documents Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RsCard
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="cursor-pointer transition-transform hover:scale-105 mb-0"
            @click="showDetails(doc)"
          >
            <div class="p-4">
              <div class="space-y-4">
                <!-- Sample Image -->
                <img
                  :src="doc.selectedImage || defaultImage"
                  :alt="doc.jenisDokumen"
                  class="w-full h-48 object-contain rounded-lg"
                />

                <!-- Basic Document Info -->
                <div class="space-y-2">
                  <h4 class="text-lg font-semibold">{{ doc.jenisDokumen }}</h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="text-gray-500">Negara:</div>
                    <div>{{ doc.negaraPengeluaran }}</div>
                    <div class="text-gray-500">Tahun:</div>
                    <div>{{ doc.tahunPengeluaran }}</div>
                    <div class="text-gray-500">Ketulenan:</div>
                    <div>{{ doc.ketulenan }}</div>
                  </div>
                </div>
              </div>
            </div>
          </RsCard>
        </div>
      </div>

      <!-- Detailed View -->
      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold tracking-tight">
            {{ selectedDocument.jenisDokumen }}
          </h3>
          <RsButton variant="secondary" @click="backToList">
            Kembali ke Senarai
          </RsButton>
        </div>

        <RsCard class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Image Gallery -->
            <div class="space-y-4">
              <img
                :src="selectedDocument.selectedImage"
                :alt="selectedDocument.jenisDokumen"
                class="w-full h-96 object-contain rounded-lg cursor-zoom-in"
                @click="
                  previewImage(
                    selectedDocument.selectedImage,
                    selectedDocument.jenisDokumen
                  )
                "
              />
              <div class="grid grid-cols-4 gap-2">
                <img
                  v-for="(image, idx) in selectedDocument.images"
                  :key="idx"
                  :src="image"
                  :alt="`${selectedDocument.jenisDokumen} ${idx + 1}`"
                  class="w-full h-24 object-contain rounded cursor-pointer"
                  :class="{
                    'ring-2 ring-primary':
                      selectedDocument.selectedImage === image,
                  }"
                  @click="selectImage(image)"
                  @dblclick="previewImage(image, selectedDocument.jenisDokumen)"
                />
              </div>
            </div>

            <!-- Detailed Information -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="text-gray-500">No. Document</div>
                  <div class="font-medium">
                    {{ selectedDocument.noDocument || "-" }}
                  </div>
                </div>
                <!-- <div class="space-y-2">
                  <div class="text-gray-500">Nama Pemilik</div>
                  <div class="font-medium">
                    {{ selectedDocument.namaPemilik || "-" }}
                  </div>
                </div> -->
                <div class="space-y-2">
                  <div class="text-gray-500">Muka Surat</div>
                  <div class="font-medium">
                    {{ selectedDocument.mukaSurat || "-" }}
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-gray-500">Negara Pengeluaran</div>
                  <div class="font-medium">
                    {{ selectedDocument.negaraPengeluaran || "-" }}
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-gray-500">Tahun Pengeluaran</div>
                  <div class="font-medium">
                    {{ selectedDocument.tahunPengeluaran || "-" }}
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-gray-500">Ketulenan</div>
                  <div class="font-medium">
                    {{ selectedDocument.ketulenan || "-" }}
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-gray-500">Maklumat Terperinci</div>
                <div class="font-medium">
                  {{ selectedDocument.maklumatTerperinci || "-" }}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-gray-500">Peralatan Digunakan</div>
                <div class="font-medium">
                  {{ selectedDocument.peralatanDigunakan || "-" }}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-gray-500">Cara Semakan</div>
                <div class="font-medium">
                  {{ selectedDocument.caraSemakan || "-" }}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-gray-500">Dapatan</div>
                <div class="font-medium">
                  {{ selectedDocument.dapatan || "-" }}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-gray-500">Ulasan</div>
                <div class="font-medium">
                  {{ selectedDocument.ulasan || "-" }}
                </div>
              </div>
            </div>
          </div>
        </RsCard>
      </div>
    </div>
  </div>
</template>
