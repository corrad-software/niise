<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Maklumat Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Semak Permohonan",
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

// Add this to your script section where other refs are defined
const kelulusanKetuaBahagian = ref(null);
const ulasanKetuaBahagian = ref("");

// Add this computed property after other refs
const hasForensicOfficer = computed(() => forensicOfficers.value.length > 0);

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
      showForensicOfficersSection.value =
        data.value.showForensicApproval || false;
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
      // showForensicOfficersSection.value = data.value.showSection || false;
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
  if (hasForensicOfficer.value) {
    $swal.fire({
      title: "Tidak Dibenarkan",
      text: "Hanya seorang pegawai forensik dibenarkan",
      icon: "warning",
    });
    return;
  }
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

// Add a new function to refetch all data
const refetchAllData = async () => {
  await fetchStatusData();
  await fetchAssignedOfficers();
  await fetchReports();
  await fetchAppointmentData();
  await fetchTimelineData();
};

// Update the handleSemakSubmit function
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
      await refetchAllData(); // Replace fetchStatusData with refetchAllData
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menyimpan semakan.", "error");
  }
  closeSemakModal();
};

// Update the handleSemakSubmitKetua function
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
      await refetchAllData(); // Replace multiple fetch calls with refetchAllData
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menyimpan semakan.", "error");
  }
  closeSemakKetuaModal();
};

// Update the handleTerimaSubmit function
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
      await refetchAllData(); // Replace multiple fetch calls with refetchAllData
    } else {
      $swal.fire("Error", response.data.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", "Gagal menerima permohonan.", "error");
  }
  closeTerimaModal();
};

// Update the handleTolakSubmit function
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
      await $swal.fire("Berjaya", "Permohonan telah ditolak", "success");
      navigateTo("/kemaskini-daftar/senarai");
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
onMounted(async () => {
  fetchStatusData();
  fetchAssignedOfficers();
  fetchReports(); // Fetch reports related to the permohonan
  fetchAppointmentData(); // Add this line
  fetchTimelineData(); // Add this line

  const existingData = await fetchExistingData();

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

    await fetchReportsData();
  }
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
// const kelulusanKetuaBahagian = ref(null);

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
  }

  // else {
  //   showSemakModal.value = true;
  // }
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
const fetchExistingData = async () => {
  try {
    const response = await $fetch(`/api/permohonan/${route.params.noSiri}`);
    if (response.statusCode === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching existing data:", error);
  }
};

// Fetch reports data
const fetchReportsData = async () => {
  try {
    const response = await $fetch(
      `/api/permohonan/${route.params.noSiri}/reports?type=maklumat`
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
          v-if="buttonPermissions.tolak"
          @click="openTolakModal"
          variant="danger"
        >
          <Icon name="ph:x" class="mr-2 w-4 h-4" />
          Tolak
        </rs-button>
        <rs-button
          v-if="buttonPermissions.terima"
          @click="openTerimaModal"
          variant="success"
        >
          <Icon name="ph:check" class="mr-2 w-4 h-4" />
          Terima
        </rs-button>
      </div>
    </div>

    <!-- CARD: Status Semakan & Status Penerimaan -->
    <!-- <rs-card class="p-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Status Penyerahan</h3>
        <rs-badge
          :variant="statusSemakan === 'Selesai' ? 'success' : 'warning'"
        >
          {{ statusSemakan }}
        </rs-badge>
      </div>
    </rs-card> -->

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
    <div
      v-if="showForensicOfficersSection"
      class="flex items-center justify-between space-y-2"
    >
      <div>
        <h3 class="text-2xl font-bold tracking-tight">
          Pegawai Forensik Yang Terlibat
        </h3>
      </div>
      <rs-button
        v-if="isKetuaBahagian && !hasForensicOfficer"
        @click="openAddModal"
        variant="primary"
      >
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
              variant="primary-outline"
              size="sm"
            >
              <Icon name="ph:pencil" class="mr-2 w-4 h-4" />
              Kemaskini
            </rs-button>
            <rs-button
              @click="confirmDelete(data.text.userID, data.text.assignID)"
              variant="danger-outline"
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
    <div
      v-if="visibleOfficers.length > 0"
      class="flex items-center justify-between space-y-2"
    >
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

    <!-- Header section with improved spacing and hierarchy -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Maklumat Pemohon</h3>
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

    <div class="flex justify-end gap-2">
      <rs-button
        variant="danger"
        @click="navigateTo('/kemaskini-daftar/senarai')"
      >
        <Icon name="pajamas:reply" class="mr-2 w-4 h-4" />
        Kembali
      </rs-button>
    </div>

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
        <h3>FR 2: Borang Semakan Permohonan Analisis</h3>
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
            v-model="kelulusanKetuaBahagian"
            :options="[
              { label: 'Sila Pilih', value: '' },
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
            v-model="ulasanKetuaBahagian"
            :validation="kelulusanKetuaBahagian === 'Ditolak' ? 'required' : ''"
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
