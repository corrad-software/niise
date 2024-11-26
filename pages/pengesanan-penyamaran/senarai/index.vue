<script setup>
const { $swal } = useNuxtApp();

// Reactive variable to store table data
const tableData = ref([]);
const showButton = ref({});

// Fetch appointment list from API
const fetchAppointments = async () => {
  try {
    const response = await useFetch("/api/temujanji");
    if (response.data.value && response.data.value.statusCode === 200) {
      tableData.value = response.data.value.data;

      if (response.data.value.showButton) {
        showButton.value = response.data.value.showButton;
      } else {
        showButton.value = {
          tambah: false,
          keputusan: false,
          kemaskini: false,
        };
      }
    } else {
      console.error(response.data.value.message);
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

// Function to navigate to the "Add Appointment" page
const addAppointment = () => {
  navigateTo("/pengesanan-penyamaran/baru");
};

// Function to navigate to the "Update Appointment" page
const updateAppointment = (kesId) => {
  navigateTo(`/pengesanan-penyamaran/kemaskini/${kesId}`);
};

// Function to navigate to the "Result Appointment" page
const resultAppointment = (kesId) => {
  navigateTo(`/pengesanan-penyamaran/keputusan/${kesId}`);
};

// Function to delete an appointment by its kesId
const deleteAppointment = async (kesId) => {
  const confirmation = await $swal.fire({
    title: "Anda pasti?",
    text: "Anda tidak akan dapat memulihkan semula data ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapuskan!",
    cancelButtonText: "Batal",
  });

  if (confirmation.isConfirmed) {
    try {
      const { data, error } = await useFetch(`/api/temujanji/${kesId}`, {
        method: "DELETE",
      });

      if (data.value && data.value.statusCode === 200) {
        // Remove the deleted appointment from tableData
        await fetchAppointments();
        $swal.fire("Dihapuskan!", data.value.message, "success");
      } else {
        $swal.fire(
          "Error!",
          error.value?.message || "Failed to delete appointment.",
          "error"
        );
      }
    } catch (error) {
      $swal.fire("Error!", "Failed to delete appointment.", "error");
    }
  }
};

// Fetch the appointment list when the component is mounted
onMounted(() => {
  fetchAppointments();
});
</script>

<template>
  <div>
    <!-- Header with title and "Add Appointment" button -->
    <div class="flex justify-between items-center">
      <h1>Senarai Temujanji</h1>
      <rs-button
        v-if="showButton.tambah"
        @click="addAppointment"
        variant="primary"
        class="mt-2"
      >
        Tambah Temujanji
      </rs-button>
    </div>

    <!-- Table displaying the list of appointments -->
    <rs-card class="mt-4 py-2">
      <rs-table
        :data="tableData"
        :options="{
          variant: 'default',
          striped: true,
          borderless: true,
        }"
        :options-advanced="{
          sortable: true,
          filterable: false,
        }"
        advanced
      >
        <!-- Table Data Rows -->
        <template v-slot:no="data">
          {{ data.text }}
        </template>
        <template v-slot:kesId="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:namaPemohon="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:caraSemakan="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:status="data">
          <rs-badge
            :variant="
              data.text === 'Temujanji Diterima' || data.text === 'Selesai'
                ? 'success'
                : 'warning'
            "
          >
            {{ data.text || "N/A" }}
          </rs-badge>
        </template>

        <!-- Actions for each appointment -->
        <template v-slot:tindakan="data">
          <div class="flex gap-2">
            <!-- Button to navigate to the "Update" page for the selected appointment -->
            <rs-button
              v-if="showButton.keputusan"
              @click="resultAppointment(data.value.kesId)"
              variant="primary"
              size="sm"
              class="p-1 px-2"
            >
              Keputusan
            </rs-button>

            <rs-button
              v-if="showButton.kemaskini"
              @click="updateAppointment(data.value.kesId)"
              variant="info"
              size="sm"
              class="p-1 px-2"
              title="Kemaskini"
            >
              Kemaskini
            </rs-button>

            <div v-if="!showButton.kemaskini && !showButton.keputusan">-</div>

            <!-- Button to delete the selected appointment -->
            <!-- <rs-button
              @click="deleteAppointment(data.value.kesId)"
              variant="danger"
              size="sm"
              class="p-1"
              title="Hapus"
            >
              <Icon name="ic:baseline-delete" size="1.2rem" />
            </rs-button> -->
          </div>
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>
