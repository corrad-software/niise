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
const showReportModal = ref(false);
const selectedReport = ref(null);

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
    const response = await $fetch(
      `/api/permohonan/${noSiri}/reports?type=maklumat`
    );
    if (response.statusCode === 200) {
      barangList.value = response.data.map((item) => ({
        jenisBarang: item.jenisBarang,
        tandaBarang: item.tagNo,
        keadaanBarang: item.keadaan,
        kuantitiBarang: item.kuantiti,
        tindakan: item.tindakan,
      }));
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
};

// Modify showReportDetails function
const showReportDetails = async (reportId) => {
  try {
    const { data: response } = await useFetch(`/api/report/${reportId}`);
    if (response.value && response.value.statusCode === 200) {
      if (!response.value.data) {
        $swal.fire({
          title: "Tiada Data",
          text: "Tiada maklumat laporan untuk barang ini",
          icon: "info",
        });
        return;
      }
      selectedReport.value = response.value.data;
      showReportModal.value = true;
    } else {
      throw new Error(
        response.value?.message || "Failed to fetch report details"
      );
    }
  } catch (error) {
    console.error("Error fetching report details:", error);
    $swal.fire({
      title: "Ralat",
      text: "Gagal mendapatkan maklumat laporan",
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
              variant="secondary-outline"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[100px]"
              @click="showReportDetails(text)"
            >
              <Icon name="ph:list" class="w-4 h-4 mr-2" />
              Butiran
            </rs-button>
          </template>
        </rs-table>
        <div v-else class="text-gray-500">Tiada barang ditambah</div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 mt-8 border-t pt-4">
        <rs-button @click="$router.back()" variant="danger">
          <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
          Kembali
        </rs-button>
      </div>
    </rs-card>

    <!-- Report Modal -->
    <rs-modal v-model="showReportModal" title="Maklumat Laporan" size="lg">
      <template #body>
        <div v-if="selectedReport" class="space-y-6 p-2">
          <!-- Basic Information Section -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Report Details -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Maklumat Barang:
              </h3>
              <div class="space-y-3">
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Jenis Barang:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{
                      selectedReport.lookup_report_jenis_barangTolookup
                        ?.lookupValue || "-"
                    }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Tanda Barang:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{ selectedReport.tanda_barang || "-" }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Keadaan Barang:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{ selectedReport.keadaan_barang || "-" }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Kuantiti:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{ selectedReport.kuantiti_barang || "-" }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Inspection Details -->
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
                    >Peralatan:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{ selectedReport.peralatan || "-" }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Dapatan:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{
                      selectedReport.lookup_report_dapatanTolookup
                        ?.lookupValue || "-"
                    }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Tarikh Dicipta:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{
                      selectedReport.create_at
                        ? new Date(selectedReport.create_at).toLocaleDateString(
                            "ms-MY"
                          )
                        : "-"
                    }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Tarikh Dikemaskini:</span
                  >
                  <span class="text-gray-700 dark:text-gray-300">
                    {{
                      selectedReport.modified_at
                        ? new Date(
                            selectedReport.modified_at
                          ).toLocaleDateString("ms-MY")
                        : "-"
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Steps Section -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
            >
              Langkah-langkah:
            </h3>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ selectedReport.langkah_langkah || "-" }}
            </p>
          </div>

          <!-- Supporting Documents Section -->
          <div
            v-if="selectedReport.report_doc_support?.length > 0"
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <!-- <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Dokumen Sokongan:
              </h3>
              <rs-button
                @click="previewAllImages(selectedReport.report_doc_support)"
                variant="primary"
                size="sm"
                class="px-3 inline-flex items-center justify-center"
              >
                <Icon name="ic:baseline-collections" class="mr-2 w-4 h-4" />
                Papar Semua Gambar
              </rs-button>
            </div> -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="doc in selectedReport.report_doc_support"
                :key="doc.report_attachID"
                class="relative group cursor-pointer hover:opacity-90 transition-opacity"
                @click="previewImage(doc.document)"
              >
                <img
                  :src="doc.document.documentURL"
                  :alt="doc.document.documentName"
                  class="w-full h-32 object-cover rounded-lg shadow-sm"
                  @error="(e) => (e.target.style.display = 'none')"
                  @load="(e) => (e.target.style.display = '')"
                />
                <span
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate"
                >
                  {{ doc.document.documentName }}
                </span>
                <p class="text-xs text-gray-500">{{ doc.keterangan || "-" }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-4">
            Tiada dokumen sokongan
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end px-4 py-3 bg-gray-50 dark:bg-gray-800">
          <rs-button
            @click="showReportModal = false"
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
