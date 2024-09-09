<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>E-Library</h1>
    </div>

    <div class="mt-4">
      <rs-card class="py-1">
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
          <template v-slot:aksi="data">
            <div class="flex gap-2">
              <rs-button
                @click="viewItem(data.value.noSiri)"
                variant="info"
                size="sm"
                class="p-1"
                title="Lihat"
              >
                <Icon name="ic:outline-visibility" size="1.2rem" />
              </rs-button>
            </div>
          </template>
        </rs-table>
      </rs-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const tableData = ref([]);

const generateData = () => {
  const data = [];
  for (let i = 1; i <= 10; i++) {
    data.push({
      noSiri: `NS${String(i).padStart(3, "0")}`,
      pengguna: `Pengguna ${i}`,
      subjek: `Subjek ${i}`,
      tarikh: new Date(2023, 0, i).toLocaleDateString("ms-MY"),
      aksi: { noSiri: `NS${String(i).padStart(3, "0")}` },
    });
  }
  return data;
};

const viewItem = (noSiri) => {
  console.log(`View item with noSiri: ${noSiri}`);
  // Implement view functionality

  navigateTo(`/e-library/maklumat/${noSiri}`);
};

const editItem = (noSiri) => {
  console.log(`Edit item with noSiri: ${noSiri}`);
  // Implement edit functionality
};

onMounted(() => {
  tableData.value = generateData();
});
</script>

<style lang="scss" scoped></style>
