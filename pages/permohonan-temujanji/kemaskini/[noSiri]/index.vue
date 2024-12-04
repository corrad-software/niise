<script setup>
definePageMeta({
  title: "Kemaskini Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Permohonan",
      path: "/permohonan-temujanji/senarai",
    },
    {
      name: "Kemaskini",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();
const router = useRouter();
const route = useRoute();

const noSiri = ref(route.params.noSiri);

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

// State for single checkbox
const isPenghantarSameAsPemohon = ref(false);

// Remove computed properties and add watch
watch(isPenghantarSameAsPemohon, (newValue) => {
  if (newValue) {
    namaPenghantar.value = namaPemohon.value;
    pangkatPenghantar.value = pangkatPemohon.value;
    noPegawaiPenghantar.value = noPegawaiPemohon.value;
  } else {
    namaPenghantar.value = "";
    pangkatPenghantar.value = "";
    noPegawaiPenghantar.value = "";
  }
});

// Update these to be reactive refs
const jenisBarangDetailOptions = ref([]);
const jenisBarangSiberOptions = ref([]);

// Fetch lookup data from API
const fetchLookupData = async (type) => {
  try {
    const response = await $fetch(`/api/lookup?type=${type}`);
    if (response.statusCode === 200) {
      // Data return with value and label
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching ${type} lookup data:`, error);
    return [];
  }
};

// Fetch existing data
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
    // Set the form values based on the existingData
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
    tarikhTemujanji.value = existingData.tarikhTemujanji;
    slotMasa.value = existingData.slotMasa;
    isPenghantarSameAsPemohon.value = existingData.isPenghantarSameAsPemohon;
  }

  // Fetch lookup data
  jenisBarangDetailOptions.value = await fetchLookupData("jenis_barang");
  jenisBarangSiberOptions.value = await fetchLookupData("jenis_barang_siber");
});

// Barang modal state
const isBarangModalOpen = ref(false);
const editingBarangIndex = ref(null);
const currentBarang = ref({
  jenisBarangDetail: "",
  tandaBarang: "",
  keadaanBarang: "",
  kuantitiBarang: 1,
  jenisBarangSiber: "",
});

// Barang modal functions
const openBarangModal = () => {
  editingBarangIndex.value = null;
  currentBarang.value = {
    jenisBarangDetail: "",
    tandaBarang: "",
    keadaanBarang: "",
    kuantitiBarang: 1,
    jenisBarangSiber: "",
  };
  isBarangModalOpen.value = true;
};

const editBarang = (index) => {
  editingBarangIndex.value = index;
  currentBarang.value = { ...barangList.value[index] };
  isBarangModalOpen.value = true;
};

const removeBarang = (index) => {
  barangList.value.splice(index, 1);
};

const cancelBarangModal = () => {
  isBarangModalOpen.value = false;
};

const saveBarangModal = () => {
  if (editingBarangIndex.value === null) {
    barangList.value.push({
      ...currentBarang.value,
      jenisBarangDetailLabel: getJenisBarangLabel(
        currentBarang.value.jenisBarangDetail
      ),
    });
  } else {
    barangList.value[editingBarangIndex.value] = {
      ...currentBarang.value,
      jenisBarangDetailLabel: getJenisBarangLabel(
        currentBarang.value.jenisBarangDetail
      ),
    };
  }
  isBarangModalOpen.value = false;
};

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
    noPegawaiPenghantar,
  ];

  const areRequiredFieldsFilled = requiredFields.every(
    (field) => field.value !== "" && field.value !== 0
  );

  // const areBarangFieldsValid = barangList.value.every((barang) =>
  //   Object.values(barang).every((value) => value !== "" && value !== 0)
  // );

  return areRequiredFieldsFilled && barangList.value.length > 0;
};

const simpan = async () => {
  const isDraft = true; // Simpan means saving as draft
  await submitData(isDraft);
};

const submitForm = async () => {
  const isDraft = false; // Submit means final submission
  await submitData(isDraft);
};

const submitData = async (isDraft) => {
  if (isFormValid()) {
    try {
      const response = await $fetch(`/api/permohonan/${noSiri.value}`, {
        method: "PUT",
        body: {
          namaPemohon: namaPemohon.value,
          pangkatPemohon: pangkatPemohon.value,
          noPegawaiPemohon: noPegawaiPemohon.value,
          namaPenghantar: namaPenghantar.value,
          pangkatPenghantar: pangkatPenghantar.value,
          noPegawaiPenghantar: noPegawaiPenghantar.value,
          isPenghantarSameAsPemohon: isPenghantarSameAsPemohon.value,
          ringkasanKenyataanKes: ringkasanKenyataanKes.value,
          bilangan: bilangan.value.toString(),
          barangList: barangList.value,
          noKertasSiasatan: noKertasSiasatan.value,
          noLaporanPolis: noLaporanPolis.value,
          tarikhTemujanji: tarikhTemujanji.value,
          slotMasa: slotMasa.value,
          isDraft: isDraft,
        },
      });

      if (response.statusCode === 200) {
        await $swal.fire({
          title: "Berjaya!",
          text: isDraft
            ? "Permohonan telah berjaya disimpan sebagai draf."
            : "Permohonan telah berjaya dikemaskini.",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Redirect to senarai page after successful submission
        if (!isDraft) {
          router.push("/permohonan-temujanji/senarai");
        }
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
      text: "Sila isi semua medan yang diperlukan dan tambah sekurang-kurangnya satu barang.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

const getJenisBarangLabel = (value) => {
  const option = jenisBarangDetailOptions.value.find(
    (opt) => opt.__original === value
  );
  return option ? option.label : value;
};

// Add this function before the template
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div>
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Permohonan Baru</h3>
      </div>
    </div>

    <rs-card class="mt-4 px-4 py-6">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <div class="grid gap-6 md:grid-cols-3">
          <!-- Nama Pemohon Input -->
          <FormKit
            type="text"
            label="Nama Pemohon"
            v-model="namaPemohon"
            validation="required"
            :disabled="true"
          />

          <!-- Pangkat Pemohon Input -->
          <FormKit
            type="text"
            label="Pangkat Pemohon"
            v-model="pangkatPemohon"
            validation="required"
            :disabled="true"
          />

          <!-- No Pegawai Pemohon Input -->
          <FormKit
            type="text"
            label="No Pegawai Pemohon"
            v-model="noPegawaiPemohon"
            validation="required"
            :disabled="true"
          />
        </div>

        <!-- Checkbox: Apply Pemohon info to Penghantar -->
        <FormKit
          type="checkbox"
          label="Penghantar Sama seperti Pemohon"
          v-model="isPenghantarSameAsPemohon"
          label-class="mb-0"
        />

        <div class="grid gap-6 md:grid-cols-3">
          <!-- Conditionally render Nama Penghantar field if checkbox is not checked -->
          <FormKit
            v-if="!isPenghantarSameAsPemohon"
            type="text"
            label="Nama Penghantar"
            v-model="namaPenghantar"
            validation="required"
          />

          <!-- Conditionally render Pangkat Penghantar field if checkbox is not checked -->
          <FormKit
            v-if="!isPenghantarSameAsPemohon"
            type="text"
            label="Pangkat Penghantar"
            v-model="pangkatPenghantar"
            validation="required"
          />

          <!-- Conditionally render No Pegawai Penghantar field if checkbox is not checked -->
          <FormKit
            v-if="!isPenghantarSameAsPemohon"
            type="text"
            label="No Pegawai Penghantar"
            v-model="noPegawaiPenghantar"
            validation="required"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Tarikh Temujanji Input -->
          <FormKit
            type="date"
            label="Tarikh temujanji"
            v-model="tarikhTemujanji"
            :validation="'required|date|date_after:' + getCurrentDate()"
            :validation-messages="{
              date_after: 'Tarikh temujanji harus selepas hari ini',
            }"
          />

          <!-- Slot Masa Input -->
          <FormKit
            type="time"
            label="Slot masa"
            v-model="slotMasa"
            validation="required"
          />
        </div>

        <!-- No Kertas Siasatan Input -->
        <FormKit
          type="text"
          label="No Kertas Siasatan"
          v-model="noKertasSiasatan"
          validation="required"
        />

        <!-- No Laporan Polis Input -->
        <FormKit
          type="text"
          label="No Laporan Polis"
          v-model="noLaporanPolis"
          validation="required"
        />

        <!-- Ringkasan Kenyataan Kes Input -->
        <FormKit
          type="textarea"
          label="Ringkasan Kenyataan Kes"
          v-model="ringkasanKenyataanKes"
          validation="required"
        />

        <!-- Bilangan Input -->
        <!-- <FormKit
          type="number"
          label="Bilangan"
          v-model="bilangan"
          validation="required|number"
        /> -->

        <!-- Barang Section -->
        <div class="pt-4 pb-2">
          <div
            class="flex flex-col md:flex-row items-center justify-between mb-2"
          >
            <h3 class="mb-2">Senarai Barang</h3>
            <rs-button type="button" @click="openBarangModal" variant="primary">
              <Icon name="ph:plus" class="w-4 h-4 mr-2" />
              Tambah Barang
            </rs-button>
          </div>
          <table
            v-if="barangList.length > 0"
            class="w-full border-collapse border border-gray-300 mb-2"
          >
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 p-2">Jenis Barang</th>
                <th class="border border-gray-300 p-2">Kuantiti</th>
                <th class="border border-gray-300 p-2">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(barang, index) in barangList" :key="index">
                <td class="border border-gray-300 p-2">
                  {{
                    barang.jenisBarangDetailLabel
                      ? barang.jenisBarangDetailLabel
                      : barang.jenisBarangDetail
                  }}
                </td>
                <td class="border border-gray-300 p-2">
                  {{ barang.kuantitiBarang }}
                </td>
                <td class="border border-gray-300 p-2">
                  <div class="flex gap-2">
                    <rs-button
                      type="button"
                      @click="editBarang(index)"
                      variant="warning"
                      class="mr-2"
                    >
                      <Icon name="ph:pencil" class="w-4 h-4 mr-2" />
                      Kemaskini
                    </rs-button>
                    <rs-button
                      type="button"
                      @click="removeBarang(index)"
                      variant="danger"
                    >
                      <Icon name="ph:trash" class="w-4 h-4 mr-2" />
                      Buang
                    </rs-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table
            v-else
            class="w-full border-collapse border border-gray-300 mb-2"
          >
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 p-2">Jenis Barang</th>
                <th class="border border-gray-300 p-2">Kuantiti</th>
                <th class="border border-gray-300 p-2">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="3" class="border border-gray-300 p-2 text-center">
                  Tiada barang ditambah
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-8">
          <rs-button @click="navigateBack" variant="danger">
            <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
            Kembali</rs-button
          >
          <rs-button @click.prevent="simpan" variant="primary">
            <Icon name="ci:save" class="w-4 h-4 mr-2" />
            Simpan
          </rs-button>
          <rs-button btn-type="submit" variant="success">
            <Icon
              name="streamline:interface-upload-laptop-arrow-computer-download-internet-laptop-network-server-up-upload"
              class="w-4 h-4 mr-2"
            />
            Hantar
          </rs-button>
        </div>
      </FormKit>
    </rs-card>

    <!-- Barang Modal -->
    <div
      v-if="isBarangModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">
          {{ editingBarangIndex === null ? "Tambah" : "Edit" }} Barang
        </h2>

        <FormKit
          type="form"
          :actions="false"
          @submit="saveBarangModal"
          #default="{ state: formState }"
        >
          <FormKit
            type="select"
            name="jenisBarangDetail"
            label="Jenis Barang"
            v-model="currentBarang.jenisBarangDetail"
            :options="jenisBarangDetailOptions"
            validation="required"
            :validation-messages="{
              required: 'Jenis Barang diperlukan',
            }"
          />

          <FormKit
            type="text"
            name="tandaBarang"
            label="Tanda Barang"
            v-model="currentBarang.tandaBarang"
            validation="required"
            :validation-messages="{
              required: 'Tanda Barang diperlukan',
            }"
          />

          <FormKit
            type="text"
            name="keadaanBarang"
            label="Keadaan Barang"
            v-model="currentBarang.keadaanBarang"
            validation="required"
            :validation-messages="{
              required: 'Keadaan Barang diperlukan',
            }"
          />

          <FormKit
            type="number"
            name="kuantitiBarang"
            label="Kuantiti Barang"
            v-model="currentBarang.kuantitiBarang"
            validation="required|number|min:1"
            :validation-messages="{
              required: 'Kuantiti Barang diperlukan',
              number: 'Kuantiti Barang mesti nombor',
              min: 'Kuantiti Barang mesti sekurang-kurangnya 1',
            }"
          />

          <!-- <FormKit
            type="select"
            name="jenisBarangSiber"
            label="Jenis Barang Siber"
            v-model="currentBarang.jenisBarangSiber"
            :options="jenisBarangSiberOptions"
            validation="required"
            :validation-messages="{
              required: 'Jenis Barang Siber diperlukan',
            }"
          /> -->

          <div class="flex justify-end gap-2 mt-4">
            <rs-button
              type="button"
              btn-type="reset"
              @click="cancelBarangModal"
              variant="danger"
            >
              <Icon name="ph:x" class="w-4 h-4 mr-2" />
              Batal
            </rs-button>
            <rs-button
              type="submit"
              btn-type="submit"
              variant="success"
              :disabled="!formState.valid"
            >
              <Icon name="ci:save" class="w-4 h-4 mr-2" />
              Simpan
            </rs-button>
          </div>
        </FormKit>
      </div>
    </div>
  </div>
</template>
