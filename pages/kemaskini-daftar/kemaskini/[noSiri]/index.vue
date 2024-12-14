<script setup>
definePageMeta({
  title: "Kemaskini Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Semak Permohonan",
      path: "/kemaskini-daftar/senarai",
    },
    {
      name: "Kemaskini",
      type: "current",
    },
  ],
});

const router = useRouter();
const route = useRoute();
const { $swal } = useNuxtApp();

const noSiri = ref(route.params.noSiri);

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

const jenisBarangDetailOptions = ref([]);

const navigateBack = () => {
  router.back();
};

const isFormValid = () => {
  const requiredFields = [
    namaPemohon,
    pangkatPemohon,
    noPegawaiPemohon,
    namaPenghantar,
    pangkatPenghantar,
  ];

  const areRequiredFieldsFilled = requiredFields.every(
    (field) => field.value !== "" && field.value !== 0
  );

  return areRequiredFieldsFilled;
};

const submitForm = async () => {
  if (isFormValid()) {
    try {
      const response = await $fetch(`/api/kaunter-permohonan/${noSiri.value}`, {
        method: "PUT",
        body: {
          ringkasanKenyataanKes: ringkasanKenyataanKes.value,
          noKertasSiasatan: noKertasSiasatan.value,
          noLaporanPolis: noLaporanPolis.value,
        },
      });

      if (response.statusCode === 200) {
        await $swal.fire({
          title: "Berjaya!",
          text: "Permohonan telah berjaya dikemaskini.",
          icon: "success",
          confirmButtonText: "OK",
        });

        router.push("/kemaskini-daftar/senarai");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      $swal.fire({
        title: "Ralat!",
        text: error.message || "Gagal mengemaskini permohonan. Sila cuba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } else {
    $swal.fire({
      title: "Ralat!",
      text: "Sila isi semua medan yang diperlukan.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

const confirmBatal = () => {
  $swal
    .fire({
      title: "Anda pasti?",
      text: "Adakah anda pasti ingin menolak?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan!",
      cancelButtonText: "Tidak",
    })
    .then((result) => {
      if (result.isConfirmed) {
        navigateTo(`/kemaskini-daftar/kemaskini/batal/${noSiri.value}`);
      }
    });
};

const confirmSah = () => {
  $swal
    .fire({
      title: "Anda pasti?",
      text: "Adakah anda pasti ingin mengesahkan borang ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Sahkan!",
      cancelButtonText: "Tidak",
    })
    .then((result) => {
      if (result.isConfirmed) {
      }
    });
};

const fetchLookupData = async (type) => {
  try {
    const response = await $fetch(`/api/lookup?type=${type}`);
    if (response.statusCode === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching ${type} lookup data:`, error);
    return [];
  }
};

const fetchExistingData = async (noSiri) => {
  try {
    const response = await $fetch(`/api/permohonan/${noSiri}`);
    if (response.statusCode === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching existing data:", error);
    $swal.fire({
      title: "Ralat!",
      text: "Gagal mendapatkan data permohonan.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

onMounted(async () => {
  const existingData = await fetchExistingData(noSiri.value);

  if (existingData) {
    namaPemohon.value = existingData.namaPemohon;
    pangkatPemohon.value = existingData.pangkatPemohon;
    noPegawaiPemohon.value = existingData.noPegawaiPemohon;
    namaPenghantar.value = existingData.namaPenghantar;
    pangkatPenghantar.value = existingData.pangkatPenghantar;
    noPegawaiPenghantar.value = existingData.noPegawaiPenghantar;
    ringkasanKenyataanKes.value = existingData.ringkasanKenyataanKes;
    bilangan.value = existingData.bilangan;
    barangList.value = existingData.barangList;
    noKertasSiasatan.value = existingData.noKertasSiasatan;
    noLaporanPolis.value = existingData.noLaporanPolis;
  }

  jenisBarangDetailOptions.value = await fetchLookupData("jenis_barang");
});

const getJenisBarangLabel = (value) => {
  const option = jenisBarangDetailOptions.value.find(
    (opt) => opt.__original === value
  );
  return option ? option.label : value;
};

const resetForm = () => {
  noKertasSiasatan.value = "";
  noLaporanPolis.value = "";
  ringkasanKenyataanKes.value = "";
};
</script>

<template>
  <div>
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Kemaskini Permohonan</h3>
      </div>
      <rs-button btn-type="reset" variant="danger-outline" @click="resetForm">
        <Icon name="ic:round-refresh" class="w-4 h-4 mr-2" />
        Padam Borang
      </rs-button>
    </div>

    <rs-card class="mt-4 px-4 py-6">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Pemohon Section -->
        <div class="grid gap-6 md:grid-cols-3">
          <FormKit
            type="text"
            label="Nama Pemohon"
            v-model="namaPemohon"
            validation="required"
            disabled
          />
          <FormKit
            type="text"
            label="Pangkat Pemohon"
            v-model="pangkatPemohon"
            validation="required"
            disabled
          />
          <FormKit
            type="text"
            label="No Pegawai Pemohon"
            v-model="noPegawaiPemohon"
            validation="required"
            disabled
          />
        </div>

        <!-- Penghantar Section -->
        <div class="grid gap-6 md:grid-cols-3">
          <FormKit
            type="text"
            label="Nama Penghantar"
            v-model="namaPenghantar"
            validation="required"
            disabled
          />
          <FormKit
            type="text"
            label="Pangkat Penghantar"
            v-model="pangkatPenghantar"
            validation="required"
            disabled
          />
          <FormKit
            type="text"
            label="No Pegawai Penghantar"
            v-model="noPegawaiPenghantar"
            validation="required"
            disabled
          />
        </div>

        <!-- No Kertas & Laporan Section -->
        <FormKit
          type="text"
          label="No Kertas Siasatan"
          v-model="noKertasSiasatan"
        />
        <FormKit
          type="text"
          label="No Laporan Polis"
          v-model="noLaporanPolis"
        />

        <!-- Ringkasan Section -->
        <FormKit
          type="textarea"
          label="Ringkasan Kenyataan Kes"
          v-model="ringkasanKenyataanKes"
        />

        <!-- Bilangan Section -->
        <!-- <FormKit
          type="number"
          label="Bilangan"
          v-model="bilangan"
          validation="required|number"
          disabled
        /> -->

        <!-- Barang Section -->
        <div class="mb-4">
          <h3 class="mb-2">
            Senarai Barang<span class="text-red-500">*</span>
          </h3>
          <table
            v-if="barangList.length > 0"
            class="w-full border-collapse border border-gray-300 mb-2"
          >
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 p-2">Bil</th>
                <th class="border border-gray-300 p-2">Jenis Barang</th>
                <th class="border border-gray-300 p-2">Kuantiti</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(barang, index) in barangList" :key="index">
                <td class="border border-gray-300 p-2">{{ index + 1 }}</td>
                <td class="border border-gray-300 p-2">
                  {{
                    barang.jenisBarangDetailLabel || barang.jenisBarangDetail
                  }}
                </td>
                <td class="border border-gray-300 p-2">
                  {{ barang.kuantitiBarang }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-gray-500 mb-2">Tiada barang ditambah</div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-8">
          <rs-button @click="navigateBack" variant="danger">
            <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
            Kembali
          </rs-button>
          <rs-button btn-type="submit" variant="success">
            <Icon name="ci:save" class="w-4 h-4 mr-2" />
            Hantar
          </rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>
