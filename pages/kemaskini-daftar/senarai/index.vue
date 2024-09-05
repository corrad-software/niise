<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Senarai Permohonan</h1>
    </div>

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
        <template v-slot:header>
          <tr>
            <th>No</th>
            <th>No Siri</th>
            <th>Tarikh & Masa</th>
            <th>Status</th>
            <th>Butiran</th>
          </tr>
        </template>
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
          <rs-badge :variant="data.text === 'Aktif' ? 'success' : 'danger'">
            {{ data.text || "N/A" }}
          </rs-badge>
        </template>
        <template v-slot:butiran="data">
          <div class="flex flex-wrap gap-2">
            <!-- View Button -->
            <rs-button
              @click="lihat(data.value.noSiri)"
              variant="info"
              size="sm"
              class="p-1"
              title="Lihat"
            >
              <Icon name="ic:outline-visibility" size="1.2rem" />
            </rs-button>

            <!-- Edit Button -->
            <rs-button
              @click="kemaskini(data.value.noSiri)"
              variant="primary"
              size="sm"
              class="p-1"
              title="Kemaskini"
            >
              <Icon name="ic:baseline-edit" size="1.2rem" />
            </rs-button>
          </div>
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>

<script setup>
const { $swal } = useNuxtApp();

definePageMeta({
  title: "Senarai Permohonan",
});

// Reactive variable to store table data
const tableData = ref([]);

// Fetch permohonan list from API
const fetchPermohonan = async () => {
  try {
    const response = await useFetch("/api/permohonan");
    if (response.data.value.statusCode === 200) {
      // Populate tableData with the fetched permohonan list
      tableData.value = response.data.value.data;
    } else {
      console.error(response.data.value.message);
    }
  } catch (error) {
    console.error("Error fetching permohonan data:", error);
  }
};

const permohonanBaru = () => {
  navigateTo("/permohonan-temujanji/baru");
};

const kemaskini = (item) => {
  navigateTo(`/kemaskini-daftar/kemaskini/${item}`);
};

const lihat = (item) => {
  // Navigate to a detailed view page for the selected item
  navigateTo(`/kemaskini-daftar/maklumat/${item}`);
};

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
      const response = await useFetch(`/api/permohonan/${noSiri}`, {
        method: "DELETE",
      });
      if (response.data.value.statusCode === 200) {
        // Remove the deleted permohonan from tableData
        tableData.value = tableData.value.filter(
          (row) => row.noSiri !== noSiri
        );
        $swal.fire("Dihapuskan!", response.data.value.message, "success");
      } else {
        $swal.fire("Error!", response.data.value.message, "error");
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
