<template>
  <div>
    <!-- Header with title and "Permohonan Baru" button -->
    <div class="flex justify-between items-center">
      <h1>Senarai Permohonan</h1>
      <!-- Button to navigate to the "Permohonan Baru" page -->
      <rs-button @click="permohonanBaru()" variant="primary" class="mt-2">
        Permohonan Baru
      </rs-button>
    </div>

    <!-- Table displaying the list of permohonan -->
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
          responsive: true,
          filterable: false,
        }"
        advanced
      >
        <!-- Table Headers -->
        <template v-slot:header>
          <tr>
            <th>No</th>
            <th>No Siri</th>
            <th>Tarikh & Masa</th>
            <th>Status</th>
            <th>Butiran</th>
          </tr>
        </template>

        <!-- Table Data Rows -->
        <template v-slot:no="data">
          {{ data.text }}
        </template>
        <template v-slot:noSiri="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:tarikhMasa="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:status="data">
          <rs-badge
            :variant="
              data.text === 'Aktif' || data.text === 'Sah'
                ? 'success'
                : 'danger'
            "
          >
            {{ data.text || "N/A" }}
          </rs-badge>
        </template>

        <!-- Actions for each permohonan -->
        <template v-slot:butiran="data">
          <div class="flex flex-wrap gap-2" v-if="data.value.status !== 'Sah'">
            <!-- Button to navigate to the "Kemaskini" page for the selected permohonan -->
            <rs-button
              @click="kemaskini(data.value.noSiri)"
              variant="primary"
              size="sm"
              class="p-1"
              title="Kemaskini"
            >
              <Icon name="ic:baseline-edit" size="1.2rem" />
            </rs-button>

            <!-- Button to delete the selected permohonan -->
            <rs-button
              @click="hapus(data.value.noSiri)"
              variant="danger"
              size="sm"
              class="p-1"
              title="Hapus"
            >
              <Icon name="ic:baseline-delete" size="1.2rem" />
            </rs-button>
          </div>

          <!-- If permohonan has been confirmed -->
          <div v-else>
            <span>Permohonan telah disahkan</span>
          </div>
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>

<script setup>
const { $swal } = useNuxtApp();

// Reactive variable to store table data
const tableData = ref([]);

// Fetch permohonan list from API
const fetchPermohonan = async () => {
  try {
    const response = await $fetch("/api/permohonan");
    if (response.statusCode === 200) {
      // Populate tableData with the fetched permohonan list
      tableData.value = response.data;
    } else {
      console.error(response.message);
    }
  } catch (error) {
    console.error("Error fetching permohonan data:", error);
  }
};

// Function to navigate to the "Permohonan Baru" page
const permohonanBaru = () => {
  navigateTo("/permohonan-temujanji/baru");
};

// Function to navigate to the "Kemaskini" page for a specific permohonan
const kemaskini = (noSiri) => {
  navigateTo(`/permohonan-temujanji/kemaskini/${noSiri}`);
};

// Function to delete a permohonan by its noSiri
const hapus = async (noSiri) => {
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
      // Call API to delete the permohonan
      const response = await $fetch(`/api/permohonan/${noSiri}`, {
        method: "DELETE",
      });
      if (response.statusCode === 200) {
        // Remove the deleted permohonan from tableData
        tableData.value = tableData.value.filter(
          (row) => row.noSiri !== noSiri
        );
        $swal.fire("Dihapuskan!", response.message, "success");
      } else {
        $swal.fire("Error!", response.message, "error");
      }
    } catch (error) {
      $swal.fire("Error!", "Failed to delete permohonan.", "error");
    }
  }
};

// Fetch the permohonan list when the component is mounted
onMounted(() => {
  fetchPermohonan();
});
</script>
