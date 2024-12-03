<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Maklumat Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Kaunter Semakan",
      path: "/kemaskini-daftar/senarai",
    },
    {
      name: "Butiran",
      type: "current",
    },
  ],
});

const route = useRoute();
const { $swal } = useNuxtApp();
const roles = useUserStore().roles;

// Status data
const statusSemakan = ref("Selesai");
const statusPenerimaan = ref("Diterima");

// State variables
const showModal = ref(false);
const forensicOfficers = ref([]);
const pegawaiOption = ref([]);
const selectedPegawai = ref(null);
const editMode = ref(false);
const currentOfficerID = ref(null);
const currentAssignID = ref(null);
const isKetuaBahagian = ref(true);
const isKetuaJabatan = ref(false);

const sebabPenolakanOptions = ref([]);

// Status Section
const showStatusSection = ref(false);

// Forensic Officers Section
const showForensicOfficersSection = ref(false);

// Evidence Data
const evidences = ref([]);

// Add these new refs to store button visibility states
const buttonPermissions = ref({
  semak: false,
  terima: false,
  tolak: false,
});

// Add these refs
const appointmentData = ref(null);

// Add this ref
const timelineEvents = ref([]);

// Fetch the status data
const fetchStatusData = async () => {
  try {
    const { data } = await useFetch(
      `/api/permohonan/${route.params.noSiri}/status`
    );

    if (data.value.statusCode === 200) {
      statusSemakan.value = data.value.data.statusSemakan || "Belum Disemak";
      statusPenerimaan.value =
        data.value.data.statusPenerimaan || "Belum Diterima";
      showStatusSection.value = data.value.showSection || false;
      // Store the button permissions
      buttonPermissions.value = data.value.showButtonObj || {
        semak: false,
        terima: false,
        tolak: false,
      };
    } else {
      $swal.fire(
        "Error",
        "Gagal mendapatkan status semakan dan penerimaan.",
        "error"
      );
    }
  } catch (error) {
    $swal.fire("Error", "Gagal memuatkan data status.", "error");
  }
};

// Fetch reports (Bahan Bukti)
const fetchReports = async () => {
  try {
    const { data } = await useFetch(
      `/api/permohonan/${route.params.noSiri}/reports`
    );

    if (data.value.statusCode === 200) {
      evidences.value = data.value.data || [];
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
    $swal.fire("Error", "Gagal mendapatkan senarai bahan bukti.", "error");
  }
};

// Fetch existing forensic officers and available officers
const fetchAssignedOfficers = async () => {
  try {
    const { data } = await useFetch(
      `/api/permohonan/${route.params.noSiri}/forensik/list`
    );
    if (data.value.statusCode === 200) {
      forensicOfficers.value = data.value.data || [];
      showForensicOfficersSection.value = data.value.showSection || false;
    }
  } catch (error) {
    console.error("Error fetching forensic officers:", error);
    $swal.fire("Error", "Gagal mendapatkan senarai pegawai forensik.", "error");
  }
};

const fetchAvailableOfficers = async () => {
  try {
    const { data } = await useFetch(
      `/api/permohonan/${route.params.noSiri}/forensik/available`
    );

    if (data.value.statusCode === 200) {
      pegawaiOption.value = data.value.data || [];
    }
  } catch (error) {
    console.error("Error fetching available officers:", error);
    $swal.fire("Error", "Gagal mendapatkan senarai pegawai tersedia.", "error");
  }
};

const fetchSebabPenolakanOptions = async () => {
  try {
    const { data } = await useFetch("/api/lookup?type=sebab_penolakan");
    if (data.value.statusCode === 200) {
      sebabPenolakanOptions.value = data.value.data;
    } else {
      $swal.fire("Error", "Failed to fetch sebab penolakan options", "error");
    }
  } catch (error) {
    $swal.fire("Error", "Failed to load lookup data", "error");
  }
};

// Add this function to fetch appointment data
const fetchAppointmentData = async () => {
  try {
    const response = await useFetch(
      `/api/kemaskini-daftar/appointment/${route.params.noSiri}`
    );
    if (response.data.value?.statusCode === 200) {
      appointmentData.value = response.data.value.data;
    }
  } catch (error) {
    console.error("Error fetching appointment data:", error);
  }
};

// Add this function to fetch timeline data
const fetchTimelineData = async () => {
  try {
    const response = await useFetch(
      `/api/kemaskini-daftar/timeline/${route.params.noSiri}`
    );
    if (response.data.value?.statusCode === 200) {
      timelineEvents.value = response.data.value.data;
    }
  } catch (error) {
    console.error("Error fetching timeline data:", error);
  }
};

// Open modals
const openAddModal = () => {
  editMode.value = false;
  selectedPegawai.value = null;
  fetchAvailableOfficers();
  showModal.value = true;
};

const openEditModal = (userID, assignID) => {
  editMode.value = true;
  currentOfficerID.value = userID;
  currentAssignID.value = assignID;
  selectedPegawai.value = null;
  fetchAvailableOfficers(); // Get updated available officers for edit mode
  showModal.value = true;
};

const confirmDelete = (userID, assignID) => {
  $swal
    .fire({
      title: "Apakah anda pasti?",
      text: "Anda tidak akan dapat mengembalikannya!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
    })
    .then((result) => {
      if (result.isConfirmed) {
        deletePegawai(userID, assignID);
      }
    });
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedPegawai.value = null;
};

// Add new officer
const addNewPegawai = async () => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/forensik/add`,
      {
        method: "POST",
        body: { pegawaiID: selectedPegawai.value },
      }
    );

    if (response.data.value.statusCode === 200) {
      await fetchAssignedOfficers();
      $swal.fire("Berjaya", "Pegawai baru telah ditambah", "success");
      closeModal();
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menambah pegawai.", "error");
  }
};

// Edit existing officer
const updatePegawai = async () => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/forensik/edit`,
      {
        method: "PUT",
        body: {
          assignID: currentAssignID.value,
          newPegawaiID: selectedPegawai.value,
        },
      }
    );

    if (response.data.value.statusCode === 200) {
      await fetchAssignedOfficers(); // Refresh the list of officers
      $swal.fire("Berjaya", "Maklumat pegawai telah dikemaskini", "success");
      closeModal();
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal mengemaskini maklumat pegawai.", "error");
  }
};

// Delete officer
const deletePegawai = async (officer, assignID) => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/forensik/delete`,
      {
        method: "DELETE",
        body: { assignID: assignID },
      }
    );

    if (response.data.value.statusCode === 200) {
      await fetchAssignedOfficers();
      $swal.fire("Dihapuskan!", "Pegawai telah dipadam.", "success");
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal memadam pegawai.", "error");
  }
};

// Submit Semak form
const handleSemakSubmit = async (formData) => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/semak`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.data.value.statusCode === 200) {
      $swal.fire("Berjaya", "Maklumat semakan telah disimpan", "success");
      await fetchStatusData();
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menyimpan semakan.", "error");
  }
  closeSemakModal();
};

const handleSemakSubmitKetua = async (formData) => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/semak-ketua`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.data.value.statusCode === 200) {
      $swal.fire("Berjaya", "Maklumat semakan telah disimpan", "success");
      await fetchStatusData();
      await fetchAssignedOfficers();
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menyimpan semakan.", "error");
  }
  closeSemakKetuaModal();
};

// Submit Terima form
const handleTerimaSubmit = async (formData) => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/terima`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.data.value.statusCode === 200) {
      $swal.fire("Berjaya", "Permohonan telah diterima", "success");
      await fetchStatusData();
      await fetchAssignedOfficers();
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menerima permohonan.", "error");
  }
  closeTerimaModal();
};

// Submit Tolak form
const handleTolakSubmit = async (formData) => {
  try {
    const response = await useFetch(
      `/api/permohonan/${route.params.noSiri}/tolak`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.data.value.statusCode === 200) {
      $swal.fire("Berjaya", "Permohonan telah ditolak", "success");
      // navigateTo("/kemaskini-daftar/senarai");
      await fetchStatusData();
      // await fetchAssignedOfficers();
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menolak permohonan.", "error");
  }
  closeTolakModal();
};

// Handle form submission (add/edit)
const handleSubmit = () => {
  if (editMode.value) {
    updatePegawai();
  } else {
    addNewPegawai();
  }
};

// Fetch officers when the component mounts
onMounted(() => {
  fetchStatusData();
  fetchAssignedOfficers();
  fetchReports(); // Fetch reports related to the permohonan
  fetchAppointmentData(); // Add this line
  fetchTimelineData(); // Add this line
});

const generateReport = (bahanBukti) => {
  console.log("Generate Report for:", bahanBukti);
  navigateTo(`/kemaskini-daftar/laporan/${bahanBukti}`);
};

// Semak Modal Controls
const showSemakModal = ref(false);

const closeSemakModal = () => {
  showSemakModal.value = false;
};

// User role (you might want to fetch this from your auth system)
const userRole = ref("Pegawai Kaunter"); // Change this to 'Ketua Bahagian' to test the other form

// For ketua bahagian form
const kelulusanKetuaBahagian = ref(null);

// Terima Modal Controls
const showTerimaModal = ref(false);

const openTerimaModal = () => {
  showTerimaModal.value = true;
};

const closeTerimaModal = () => {
  showTerimaModal.value = false;
};

// Tolak Modal Controls
const showTolakModal = ref(false);

const openTolakModal = async () => {
  await fetchSebabPenolakanOptions();
  showTolakModal.value = true;
};

const closeTolakModal = () => {
  showTolakModal.value = false;
};

// Add new ref for Ketua Bahagian modal
const showSemakKetuaModal = ref(false);

// Modify openSemakModal function
const openSemakModal = () => {
  const userRoles = roles;
  if (userRoles.includes("Ketua Bahagian")) {
    showSemakKetuaModal.value = true;
  } else {
    showSemakModal.value = true;
  }
};

// Add new close function for Ketua modal
const closeSemakKetuaModal = () => {
  showSemakKetuaModal.value = false;
};

// Compute which officers to show based on role
const visibleOfficers = computed(() => {
  switch (roles[0]) {
    case "Pegawai Kaunter":
      return [
        {
          title: "Maklumat Pegawai",
          officers: [
            {
              bil: 1,
              nama: appointmentData.value?.pegawaiPemohon?.nama || "-",
              pangkat: appointmentData.value?.pegawaiPemohon?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiPemohon?.noPegawai || "-",
            },
            {
              bil: 2,
              nama: appointmentData.value?.pegawaiPenghantar?.nama || "-",
              pangkat: appointmentData.value?.pegawaiPenghantar?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiPenghantar?.noPegawai || "-",
            },
          ],
        },
      ];
    case "Ketua Bahagian":
      return [
        {
          title: "Maklumat Pegawai",
          officers: [
            {
              bil: 1,
              nama: appointmentData.value?.pegawaiPemohon?.nama || "-",
              pangkat: appointmentData.value?.pegawaiPemohon?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiPemohon?.noPegawai || "-",
            },
            {
              bil: 2,
              nama: appointmentData.value?.pegawaiPenghantar?.nama || "-",
              pangkat: appointmentData.value?.pegawaiPenghantar?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiPenghantar?.noPegawai || "-",
            },
            {
              bil: 3,
              nama: appointmentData.value?.pegawaiKaunter?.nama || "-",
              pangkat: appointmentData.value?.pegawaiKaunter?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiKaunter?.noPegawai || "-",
            },
          ],
        },
      ];
    case "Pegawai Forensik":
      return [
        {
          title: "Maklumat Pegawai",
          officers: [
            {
              bil: 1,
              nama: appointmentData.value?.pegawaiPemohon?.nama || "-",
              pangkat: appointmentData.value?.pegawaiPemohon?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiPemohon?.noPegawai || "-",
            },
            {
              bil: 2,
              nama: appointmentData.value?.pegawaiPenghantar?.nama || "-",
              pangkat: appointmentData.value?.pegawaiPenghantar?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiPenghantar?.noPegawai || "-",
            },
            {
              bil: 3,
              nama: appointmentData.value?.pegawaiKaunter?.nama || "-",
              pangkat: appointmentData.value?.pegawaiKaunter?.pangkat || "-",
              noPegawai:
                appointmentData.value?.pegawaiKaunter?.noPegawai || "-",
            },
            {
              bil: 4,
              nama: appointmentData.value?.ketuaBahagian?.nama || "-",
              pangkat: appointmentData.value?.ketuaBahagian?.pangkat || "-",
              noPegawai: appointmentData.value?.ketuaBahagian?.noPegawai || "-",
            },
          ],
        },
      ];
    default:
      return [];
  }
});
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Status Permohonan</h3>
      </div>
      <div class="flex gap-x-2">
        <rs-button
          v-if="buttonPermissions.semak"
          @click="openSemakModal"
          variant="primary"
        >
          <Icon name="ph:check" class="mr-2 w-4 h-4" />
          Semak
        </rs-button>
        <rs-button
          v-if="buttonPermissions.terima"
          @click="openTerimaModal"
          variant="success"
        >
          <Icon name="ph:check" class="mr-2 w-4 h-4" />
          Terima
        </rs-button>
        <rs-button
          v-if="buttonPermissions.tolak"
          @click="openTolakModal"
          variant="danger"
        >
          <Icon name="ph:x" class="mr-2 w-4 h-4" />
          Tolak
        </rs-button>
      </div>
    </div>

    <!-- CARD: Status Semakan & Status Penerimaan -->
    <rs-card class="p-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Status Penyerahan</h3>
        <rs-badge
          :variant="statusSemakan === 'Selesai' ? 'success' : 'warning'"
        >
          {{ statusSemakan }}
        </rs-badge>
      </div>
    </rs-card>

    <rs-card class="p-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Status Penerimaan</h3>
        <rs-badge
          :variant="statusPenerimaan === 'Diterima' ? 'success' : 'danger'"
        >
          {{ statusPenerimaan }}
        </rs-badge>
      </div>
    </rs-card>

    <!-- Header section with improved spacing and hierarchy -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">
          Maklumat Status Permohonan
        </h3>
      </div>
    </div>

    <!-- Add this section after the status cards -->
    <template v-for="(section, index) in visibleOfficers" :key="index">
      <rs-card class="py-6">
        <rs-table
          :data="section.officers"
          :field="['bil', 'nama', 'pangkat', 'noPegawai']"
          :options="{
            variant: 'default',
            striped: true,
            borderless: false,
          }"
          :options-advanced="{
            sortable: true,
            filterable: false,
          }"
          advanced
        >
        </rs-table>
      </rs-card>
    </template>

    <!-- Add this section where you want to display the timeline -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">
          Garis Masa Status Permohonan
        </h3>
      </div>
    </div>

    <rs-card class="p-6">
      <Timeline :events="timelineEvents" />
    </rs-card>

    <!-- Header section with improved spacing and hierarchy -->
    <div
      v-if="showForensicOfficersSection"
      class="flex items-center justify-between space-y-2"
    >
      <div>
        <h3 class="text-2xl font-bold tracking-tight">
          Pegawai Forensik Yang Terlibat
        </h3>
      </div>
      <rs-button v-if="isKetuaBahagian" @click="openAddModal" variant="primary">
        <Icon name="ph:plus" class="mr-2 w-4 h-4" />
        Tambah Pegawai
      </rs-button>
    </div>

    <!-- LIST: Pegawai Forensic Yang Terlibat -->
    <rs-card class="py-6" v-if="showForensicOfficersSection">
      <rs-table
        v-if="forensicOfficers.length > 0"
        :data="forensicOfficers"
        :options="{
          variant: 'default',
          striped: true,
          borderless: false,
        }"
        :options-advanced="{
          sortable: true,

          filterable: false,
        }"
        advanced
      >
        <template v-slot:header>
          <tr>
            <th>Pangkat</th>
            <th>Nama</th>
            <th>No Pegawai</th>
            <th>Tindakan</th>
          </tr>
        </template>
        <template v-slot:pangkat="data">
          {{ data.text }}
        </template>
        <template v-slot:nama="data">
          {{ data.text }}
        </template>
        <template v-slot:noPegawai="data">
          {{ data.text }}
        </template>
        <template v-slot:tindakan="data">
          <div class="flex gap-2">
            <rs-button
              @click="openEditModal(data.text.userID, data.text.assignID)"
              variant="warning"
              size="sm"
            >
              <Icon name="ph:pencil" class="mr-2 w-4 h-4" />
              Kemaskini
            </rs-button>
            <rs-button
              @click="confirmDelete(data.text.userID, data.text.assignID)"
              variant="danger"
              size="sm"
            >
              <Icon name="ph:trash" class="mr-2 w-4 h-4" />
              Hapus
            </rs-button>
          </div>
        </template>
      </rs-table>
      <div v-else class="text-center p-10">
        <p>Tidak ada pegawai forensik yang terlibat.</p>
      </div>
    </rs-card>

    <!-- Header section with improved spacing and hierarchy -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Bahan Bukti</h3>
      </div>
    </div>

    <!-- LIST: Bahan Bukti -->
    <rs-card class="py-6">
      <rs-table
        v-if="evidences.length > 0"
        :data="evidences"
        :options="{
          variant: 'default',
          striped: true,
          borderless: false,
        }"
        :options-advanced="{
          sortable: true,

          filterable: false,
        }"
        advanced
      >
        <template v-slot:jenisBarang="data">
          {{ data.text }}
        </template>
        <template v-slot:tagNo="data">
          {{ data.text }}
        </template>
        <template v-slot:keadaan="data">
          {{ data.text }}
        </template>
        <template v-slot:kuantiti="data">
          {{ data.text }}
        </template>
        <template v-slot:tindakan="data">
          <rs-button
            @click="generateReport(data.text)"
            variant="primary"
            size="sm"
          >
            <Icon name="ph:file" class="mr-2 w-4 h-4" />
            Jana Laporan
          </rs-button>
        </template>
      </rs-table>
      <div v-else class="text-center p-10">
        <p>Tidak ada bahan bukti yang terlibat.</p>
      </div>
    </rs-card>

    <!-- Add/Edit Modal -->
    <rs-modal v-model="showModal" @close="closeModal">
      <template #header>
        <h3>
          {{ editMode ? "Edit Pegawai Forensik" : "Tambah Pegawai Forensik" }}
        </h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleSubmit">
          <FormKit
            type="select"
            name="id"
            label="Pilih Pegawai"
            :options="pegawaiOption"
            v-model="selectedPegawai"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih pegawai',
            }"
          />

          <div class="flex justify-end gap-2">
            <rs-button variant="secondary" @click="closeModal">
              <Icon name="ph:x" class="mr-2 w-4 h-4" />
              Tutup
            </rs-button>
            <rs-button variant="primary" btn-type="submit">
              <Icon name="ci:save" class="mr-2 w-4 h-4" />
              Simpan
            </rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer> </template>
    </rs-modal>

    <rs-modal v-model="showSemakModal" @close="closeSemakModal">
      <template #header>
        <h3>FR2 : Borang Semakan Permohonan Analisis</h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleSemakSubmit">
          <!-- Existing form for kaunter role -->
          <FormKit
            type="radio"
            name="peralatanBaik"
            label="Peralatan dalam keadaan baik"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="pegawaiBerkelayakan"
            label="Pegawai berkelayakan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="kaedahDapatDilakukan"
            label="Kaedah dapat dilakukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="subkontrakDiperlukan"
            label="Subkontrak diperlukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="tugasanDiterima"
            label="Tugasan diterima"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="textarea"
            name="ulasanPegawaiKaunter"
            label="Ulasan pegawai kaunter"
            validation="required"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="danger" @click="closeSemakModal"
              >Batal</rs-button
            >
            <rs-button variant="primary" btn-type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
    </rs-modal>

    <!-- Terima Modal -->
    <rs-modal v-model="showTerimaModal" @close="closeTerimaModal">
      <template #header>
        <h3>FR 3: Borang Akuan Penerimaan Barang Kes</h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleTerimaSubmit">
          <FormKit
            type="radio"
            name="peralatanBaik"
            label="Peralatan dalam keadaan baik"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="pegawaiBerkelayakan"
            label="Pegawai berkelayakan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="kaedahDapatDilakukan"
            label="Kaedah dapat dilakukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="subkontrakDiperlukan"
            label="Subkontrak diperlukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="tugasanDiterima"
            label="Tugasan diterima"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="textarea"
            name="ulasanPegawaiKaunter"
            label="Ulasan pegawai kaunter"
            validation="required"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="danger" @click="closeTerimaModal"
              >Batal</rs-button
            >
            <rs-button variant="primary" btn-type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
    </rs-modal>

    <!-- Tolak Modal -->
    <rs-modal v-model="showTolakModal" @close="closeTolakModal">
      <template #header>
        <h3>FR 4 : Borang Akuan Penolakan Barang Kes</h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleTolakSubmit">
          <FormKit
            type="select"
            name="sebabPenolakan"
            label="Sebab penolakan permohonan"
            :options="sebabPenolakanOptions"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih sebab penolakan',
            }"
          />
          <FormKit
            type="textarea"
            name="lainLainSebab"
            label="Lain-lain sebab"
            validation="required_if:sebabPenolakan,Lain-lain"
            :validation-messages="{
              required_if: 'Sila nyatakan sebab lain',
            }"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="secondary" @click="closeTolakModal"
              >Batal</rs-button
            >
            <rs-button variant="danger" btn-type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
    </rs-modal>

    <!-- Ketua Bahagian Modal -->
    <rs-modal v-model="showSemakKetuaModal" @close="closeSemakKetuaModal">
      <template #header>
        <h3>Semak Permohonan</h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleSemakSubmitKetua">
          <FormKit
            type="select"
            name="kelulusanKetuaBahagian"
            label="Kelulusan Ketua Bahagian"
            :options="[
              { label: 'Diterima', value: 'Diterima' },
              { label: 'Ditolak', value: 'Ditolak' },
            ]"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih kelulusan',
            }"
          />
          <FormKit
            type="textarea"
            name="ulasanKetuaBahagian"
            label="Ulasan Ketua Bahagian"
            validation="required"
            :validation-messages="{
              required: 'Sila masukkan ulasan',
            }"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="danger" @click="closeSemakKetuaModal"
              >Batal</rs-button
            >
            <rs-button variant="primary" btn-type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
    </rs-modal>
  </div>
</template>
