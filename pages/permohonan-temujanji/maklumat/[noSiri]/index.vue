<script setup>
definePageMeta({
  title: "Maklumat Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Permohonan",
      path: "/permohonan-temujanji/senarai",
    },
    {
      name: "Maklumat",
      type: "current",
    },
  ],
});

const route = useRoute();
const noSiri = ref(route.params.noSiri);
const { $swal } = useNuxtApp();

// Form data refs
const namaPemohon = ref("");
const pangkatPemohon = ref("");
const noPegawaiPemohon = ref("");
const namaPenghantar = ref("");
const pangkatPenghantar = ref("");
const noPegawaiPenghantar = ref("");
const ringkasanKenyataanKes = ref("");
const bilangan = ref(0);
const barangList = ref([]);
const noKertasSiasatan = ref("");
const noLaporanPolis = ref("");
const tarikhTemujanji = ref("");
const slotMasa = ref("");
const isPenghantarSameAsPemohon = ref(false);

// Add these refs
const showDocumentModal = ref(false);
const selectedDocument = ref(null);

// Fetch existing data
const fetchExistingData = async (noSiri) => {
  try {
    const response = await $fetch(`/api/permohonan/${noSiri}`);
    if (response.statusCode === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching existing data:", error);
  }
};

// Fetch reports data
const fetchReportsData = async (noSiri) => {
  try {
    const response = await $fetch(`/api/permohonan/${noSiri}/reports`);
    if (response.statusCode === 200) {
      barangList.value = response.data.map((item) => ({
        jenisBarang: item.jenisBarang,
        tandaBarang: item.tagNo,
        keadaanBarang: item.keadaan,
        kuantitiBarang: item.kuantiti,
        tindakan: item.tindakan, // this is the reportID
      }));
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
};

// Modify showDocumentDetails function
const showDocumentDetails = async (reportId) => {
  try {
    const { data: response } = await useFetch(
      `/api/dokumen-library/${reportId}`
    );
    if (response.value && response.value.statusCode === 200) {
      if (!response.value.data) {
        $swal.fire({
          title: "Tiada Data",
          text: "Tiada maklumat dokumen untuk barang ini",
          icon: "info",
        });
        return;
      }
      selectedDocument.value = response.value.data;
      showDocumentModal.value = true;
    } else {
      throw new Error(
        response.value?.message || "Failed to fetch document details"
      );
    }
  } catch (error) {
    console.error("Error fetching document details:", error);
    $swal.fire({
      title: "Ralat",
      text: "Gagal mendapatkan maklumat dokumen",
      icon: "error",
    });
  }
};

// Add function to preview all images
const previewAllImages = (document) => {
  if (!document.document || document.document.length === 0) return;

  let currentIndex = 0;
  const showImage = (index) => {
    $swal
      .fire({
        imageUrl: document.document[index].documentURL,
        imageAlt: document.document[index].documentName,
        showDenyButton: index < document.document.length - 1,
        showCancelButton: index > 0,
        confirmButtonText: "Tutup",
        denyButtonText: "Seterusnya",
        cancelButtonText: "Sebelumnya",
      })
      .then((result) => {
        if (result.isDenied && index < document.document.length - 1) {
          showImage(index + 1);
        } else if (result.dismiss === Swal.DismissReason.cancel && index > 0) {
          showImage(index - 1);
        }
      });
  };

  showImage(currentIndex);
};

// Add function to preview single image
const previewImage = (image) => {
  $swal.fire({
    imageUrl: image.documentURL,
    imageAlt: image.documentName,
    confirmButtonText: "Tutup",
  });
};

onMounted(async () => {
  const existingData = await fetchExistingData(noSiri.value);

  if (existingData) {
    // Set the form values based on the existingData
    namaPemohon.value = existingData.namaPemohon;
    pangkatPemohon.value = existingData.pangkatPemohon;
    noPegawaiPemohon.value = existingData.noPegawaiPemohon;
    namaPenghantar.value = existingData.namaPenghantar;
    pangkatPenghantar.value = existingData.pangkatPenghantar;
    noPegawaiPenghantar.value = existingData.noPegawaiPenghantar;
    ringkasanKenyataanKes.value = existingData.ringkasanKenyataanKes;
    bilangan.value = existingData.bilangan;
    noKertasSiasatan.value = existingData.noKertasSiasatan;
    noLaporanPolis.value = existingData.noLaporanPolis;
    tarikhTemujanji.value = existingData.tarikhTemujanji;
    slotMasa.value = existingData.slotMasa;
    isPenghantarSameAsPemohon.value = existingData.isPenghantarSameAsPemohon;

    await fetchReportsData(noSiri.value);
  }
});
</script>

<template>
  <div>
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Maklumat Permohonan</h3>
      </div>
    </div>

    <rs-card class="mt-4 px-4 py-6">
      <!-- Pemohon Section -->
      <div class="grid gap-6 md:grid-cols-3">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Nama Pemohon</label
          >
          <div class="mt-1 p-2 bg-gray-50 rounded">{{ namaPemohon }}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Pangkat Pemohon</label
          >
          <div class="mt-1 p-2 bg-gray-50 rounded">{{ pangkatPemohon }}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >No Pegawai Pemohon</label
          >
          <div class="mt-1 p-2 bg-gray-50 rounded">{{ noPegawaiPemohon }}</div>
        </div>
      </div>

      <!-- Penghantar Section -->
      <div class="mt-6">
        <div v-if="isPenghantarSameAsPemohon" class="text-gray-600 italic">
          Penghantar Sama seperti Pemohon
        </div>
        <div v-else class="grid gap-6 md:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Nama Penghantar</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ namaPenghantar }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Pangkat Penghantar</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded">
              {{ pangkatPenghantar }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >No Pegawai Penghantar</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded">
              {{ noPegawaiPenghantar }}
            </div>
          </div>
        </div>
      </div>

      <!-- Temujanji Section -->
      <div class="grid gap-6 md:grid-cols-2 border-t mt-6 pt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Tarikh Temujanji</label
          >
          <div class="mt-1 p-2 bg-gray-50 rounded">{{ tarikhTemujanji }}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Slot Masa</label
          >
          <div class="mt-1 p-2 bg-gray-50 rounded">{{ slotMasa }}</div>
        </div>
      </div>

      <!-- Case Details Section -->
      <div class="border-t mt-6 pt-4">
        <div class="grid gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >No Kertas Siasatan</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded">
              {{ noKertasSiasatan }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >No Laporan Polis</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ noLaporanPolis }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Ringkasan Kenyataan Kes</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded whitespace-pre-wrap">
              {{ ringkasanKenyataanKes }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Bilangan</label
            >
            <div class="mt-1 p-2 bg-gray-50 rounded">{{ bilangan }}</div>
          </div>
        </div>
      </div>

      <!-- Barang Section -->
      <div class="border-t mt-6 pt-4">
        <div
          class="flex flex-col md:flex-row items-center justify-between mb-4"
        >
          <h3 class="text-lg font-semibold">Senarai Barang</h3>
        </div>
        <rs-table
          v-if="barangList.length > 0"
          :data="barangList"
          :options="{
            striped: true,
            hover: true,
            bordered: true,
          }"
        >
          <template #tindakan="{ text }">
            <rs-button
              variant="primary"
              size="sm"
              @click="showDocumentDetails(text)"
            >
              <Icon name="ph:eye" class="w-4 h-4 mr-2" />
              Lihat
            </rs-button>
          </template>
        </rs-table>
        <div v-else class="text-gray-500">Tiada barang ditambah</div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-2 mt-8 border-t pt-4">
        <rs-button @click="$router.back()" variant="danger">
          <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
          Kembali
        </rs-button>
      </div>
    </rs-card>

    <!-- Document Modal -->
    <rs-modal
      v-model="showDocumentModal"
      title="Maklumat Dokumen"
      size="lg"
      :hide-footer="true"
    >
      <template #body>
        <div v-if="selectedDocument" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="font-semibold">Negara Pengeluaran:</label>
              <p>{{ selectedDocument.negaraPengeluaran || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Tahun Pengeluaran:</label>
              <p>{{ selectedDocument.tahunPengeluaran || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Muka Surat:</label>
              <p>{{ selectedDocument.mukaSurat || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">No Document:</label>
              <p>{{ selectedDocument.noDocument || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Nama Pemilik:</label>
              <p>{{ selectedDocument.namaPemilik || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Peralatan Digunakan:</label>
              <p>{{ selectedDocument.peralatanDigunakan || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Cara Semakan:</label>
              <p>{{ selectedDocument.caraSemakan || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Dapatan:</label>
              <p>{{ selectedDocument.dapatan || "-" }}</p>
            </div>
            <div>
              <label class="font-semibold">Tarikh Dicipta:</label>
              <p>
                {{
                  selectedDocument.create_at
                    ? new Date(selectedDocument.create_at).toLocaleDateString(
                        "ms-MY"
                      )
                    : "-"
                }}
              </p>
            </div>
            <div>
              <label class="font-semibold">Tarikh Dikemaskini:</label>
              <p>
                {{
                  selectedDocument.modified_at
                    ? new Date(selectedDocument.modified_at).toLocaleDateString(
                        "ms-MY"
                      )
                    : "-"
                }}
              </p>
            </div>
            <div>
              <label class="font-semibold">Dicipta Oleh:</label>
              <p>
                {{
                  selectedDocument.user_dokumen_library_create_byTouser
                    ?.userFullName || "-"
                }}
              </p>
            </div>
            <div>
              <label class="font-semibold">Dikemaskini Oleh:</label>
              <p>
                {{
                  selectedDocument.user_dokumen_library_modified_byTouser
                    ?.userFullName || "-"
                }}
              </p>
            </div>
          </div>
          <div>
            <label class="font-semibold">Ulasan:</label>
            <p class="whitespace-pre-wrap">
              {{ selectedDocument.ulasan || "-" }}
            </p>
          </div>

          <!-- Document Images -->
          <div
            v-if="
              selectedDocument.document && selectedDocument.document.length > 0
            "
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">Gambar</h3>
              <rs-button
                variant="primary"
                size="sm"
                @click="previewAllImages(selectedDocument)"
              >
                <Icon name="ph:images" class="w-4 h-4 mr-2" />
                Papar Semua Gambar
              </rs-button>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="image in selectedDocument.document"
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
          </div>
          <div v-else class="text-center text-gray-500 py-4">
            Tiada gambar untuk dokumen ini
          </div>
        </div>
      </template>
    </rs-modal>
  </div>
</template>
