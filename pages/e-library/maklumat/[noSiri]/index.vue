<script setup>
const route = useRoute();
const noSiri = ref(route.params.noSiri);
const logData = ref([]);
const loading = ref(true);
const error = ref(null);

const comparisonFields = [
  "namaPemilik",
  "noDokumen",
  "kewarganegaraan",
  "tarikhLahir",
  "jantina",
  "tarikhLuputDokumen",
  "skorPersamaanMuka",
  "skorPersamaanCapJari",
  "umur",
  "tinggi",
  "warnaRambut",
  "bangsa",
  "etnik",
  "bentukKepala",
  "mata",
  "telinga",
  "hidung",
  "mulut",
  "parut",
  "sejarahPerjalanan",
  "persamaanTandaTangan",
  "pemeriksaanLain",
  "dapatan",
  "jenisSemakan",
  "tarikh",
  "masa",
  "negara",
];

const fieldLabels = {
  namaPemilik: "Nama Pemilik",
  noDokumen: "No. Dokumen",
  kewarganegaraan: "Kewarganegaraan",
  tarikhLahir: "Tarikh Lahir",
  jantina: "Jantina",
  tarikhLuputDokumen: "Tarikh Luput Dokumen",
  skorPersamaanMuka: "Skor Persamaan Muka",
  skorPersamaanCapJari: "Skor Persamaan Cap Jari",
  umur: "Umur",
  tinggi: "Tinggi",
  warnaRambut: "Warna Rambut",
  bangsa: "Bangsa",
  etnik: "Etnik",
  bentukKepala: "Bentuk Kepala",
  mata: "Mata",
  telinga: "Telinga",
  hidung: "Hidung",
  mulut: "Mulut",
  parut: "Parut",
  sejarahPerjalanan: "Sejarah Perjalanan",
  persamaanTandaTangan: "Persamaan Tanda Tangan",
  pemeriksaanLain: "Pemeriksaan Lain",
  dapatan: "Dapatan",
  jenisSemakan: "Jenis Semakan",
  tarikh: "Tarikh",
  masa: "Masa",
  negara: "Negara",
};

const fetchLogData = async () => {
  try {
    const { data: response } = await useFetch(
      `/api/elibrary/maklumat/${noSiri.value}`
    );
    if (response.value && response.value.statusCode === 200) {
      logData.value = response.value.data;
    } else {
      error.value = response.value.message || "Error fetching data";
    }
  } catch (err) {
    error.value = "Failed to fetch log data. Please try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const hasChanged = (field) => {
  return (
    logData.value.length >= 2 &&
    logData.value[0][field] !== logData.value[1][field]
  );
};

const formatValue = (value, field) => {
  if (value === null || value === undefined) return "-";

  if (
    field === "tarikhLahir" ||
    field === "tarikhLuputDokumen" ||
    field === "tarikh"
  ) {
    return formatDate(value, true);
  }

  if (field === "masa") {
    return formatTime(value);
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  if (
    typeof value === "number" &&
    (field === "tinggi" ||
      field === "skorPersamaanMuka" ||
      field === "skorPersamaanCapJari")
  ) {
    return value.toFixed(2);
  }

  return value;
};

const formatDate = (date, dateOnly = false) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (dateOnly) {
    return date.toLocaleDateString("ms-MY");
  }

  return date.toLocaleString("ms-MY");
};

const formatTime = (time) => {
  if (typeof time === "string") {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }
  return time;
};

onMounted(() => {
  fetchLogData();
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-gray-900">E-Library Maklumat</h1>
    <rs-card class="mb-8 p-6 bg-white shadow-lg rounded-lg">
      <div v-if="loading" class="text-center py-8">
        <!-- <rs-spinner size="lg" /> -->
        <p class="mt-2 text-gray-600">Loading...</p>
      </div>
      <div v-else-if="error" class="text-red-600 text-center py-8">
        {{ error }}
      </div>
      <div v-else>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">
          No. Siri: {{ noSiri }}
        </h2>
        <div v-if="logData.length >= 2" class="space-y-6">
          <h3 class="text-xl font-semibold mb-3 text-gray-700">
            Perbandingan Data Terkini
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="field in comparisonFields"
              :key="field"
              class="bg-gray-50 p-4 rounded-lg shadow"
            >
              <h4 class="text-sm font-medium text-gray-500 mb-1">
                {{ fieldLabels[field] }}
              </h4>
              <div class="flex items-center space-x-2">
                <span
                  class="text-lg font-semibold"
                  :class="{ 'text-green-600': hasChanged(field) }"
                >
                  {{ formatValue(logData[0][field], field) }}
                </span>
                <Icon
                  v-if="hasChanged(field)"
                  name="mdi:arrow-right-bold"
                  class="text-green-600"
                  size="1.5em"
                />
                <span
                  v-if="hasChanged(field)"
                  class="text-lg font-semibold text-red-600 line-through"
                >
                  {{ formatValue(logData[1][field], field) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-600">
          <p>Tidak cukup data untuk perbandingan.</p>
        </div>

        <h3 class="text-xl font-semibold mt-8 mb-4 text-gray-700">
          Sejarah Perubahan
        </h3>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tarikh Perubahan
                </th>
                <th
                  v-for="field in comparisonFields"
                  :key="field"
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ fieldLabels[field] }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(log, index) in logData" :key="index">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(log.create_at) }}
                </td>
                <td
                  v-for="field in comparisonFields"
                  :key="field"
                  class="px-6 py-4 whitespace-nowrap text-sm"
                  :class="{
                    'text-green-600 font-medium':
                      index < logData.length - 1 &&
                      log[field] !== logData[index + 1][field],
                    'text-gray-900': !(
                      index < logData.length - 1 &&
                      log[field] !== logData[index + 1][field]
                    ),
                  }"
                >
                  {{ formatValue(log[field], field) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </rs-card>
  </div>
</template>

<style scoped>
/* Add any scoped styles here if needed */
</style>
