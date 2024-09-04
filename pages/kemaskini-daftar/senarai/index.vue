<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Senarai Permohonan</h1>
    </div>

    <rs-card class="mt-4 py-2">
      <rs-table
        :data="tableData"
        :options='{
          variant: "default",
          striped: true,
          borderless: true
        }'
        :options-advanced='{
          sortable: true,
          responsive: true,
          filterable: false
        }'
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
import { ref } from "vue";
const { $swal } = useNuxtApp();

definePageMeta({
  title: "Senarai Permohonan",
});

const tableData = ref([
  {
    no: 1,
    noSiri: "1234567890",
    tarikhMasa: "2024-01-01 12:00:00",
    status: "Aktif",
    butiran: 1,
  },
  {
    no: 2,
    noSiri: "0987654321",
    tarikhMasa: "2024-02-01 14:30:00",
    status: "Aktif",
    butiran: 2,
  },
  {
    no: 3,
    noSiri: "1122334455",
    tarikhMasa: "2024-03-01 09:15:00",
    status: "Aktif",
    butiran: 3,
  },
  {
    no: 4,
    noSiri: "5566778899",
    tarikhMasa: "2024-04-01 16:45:00",
    status: "Aktif",
    butiran: 4,
  },
  {
    no: 5,
    noSiri: "6677889900",
    tarikhMasa: "2024-05-01 11:00:00",
    status: "Aktif",
    butiran: 5,
  },
]);

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

const hapus = (item) => {
  $swal
    .fire({
      title: "Anda pasti?",
      text: "Anda tidak akan dapat memulihkan semula data ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapuskan!",
      cancelButtonText: "Batal",
    })
    .then((result) => {
      if (result.isConfirmed) {
        // Perform deletion logic here
        console.log("Deleting item:", item);
        // Remove the item from the tableData
        const index = tableData.value.findIndex((row) => row.noSiri === item);
        if (index !== -1) {
          tableData.value.splice(index, 1);
        }
        $swal.fire("Dihapuskan!", "Data telah dihapuskan.", "success");
      }
    });
};
</script>
