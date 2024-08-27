<script setup>
definePageMeta({
  title: "Laporan",
  breadcrumb: [
    {
      name: "Laporan",
      type: "current",
    },
  ],
});

const data = ref([
  {
    kriteriaPertama: "Aura",
    kedua: "Hard",
    ketiga: "Business Services Sales Representative",
    keempat: "1969-04-19",
    status: "Digantung",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Chantal",
    kedua: "Nailor",
    ketiga: "Technical Services Librarian",
    keempat: "1980-01-10",
    status: "Tidak Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Cicely",
    kedua: "Sigler",
    ketiga: "Senior Research Officer",
    keempat: "1960-03-15",
    status: "Menunggu",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Coy",
    kedua: "Wollard",
    ketiga: "Customer Service Operator",
    keempat: "1982-10-12",
    status: "Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Delma",
    kedua: "Bonds",
    ketiga: "Lead Brand Manager",
    keempat: "1968-12-21",
    status: "Menunggu",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Lorin",
    kedua: "Forbes",
    ketiga: "Product Marketing Manager",
    keempat: "1974-05-08",
    status: "Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Eldon",
    kedua: "Marcellus",
    ketiga: "Software Developer",
    keempat: "1987-11-30",
    status: "Menunggu",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Allie",
    kedua: "Cordell",
    ketiga: "UX Designer",
    keempat: "1992-07-19",
    status: "Digantung",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Sheridan",
    kedua: "Caldwell",
    ketiga: "HR Manager",
    keempat: "1970-03-22",
    status: "Tidak Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Rowan",
    kedua: "Douglas",
    ketiga: "Financial Analyst",
    keempat: "1983-08-13",
    status: "Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Elvin",
    kedua: "Temple",
    ketiga: "Operations Manager",
    keempat: "1976-01-11",
    status: "Menunggu",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Gisele",
    kedua: "Erickson",
    ketiga: "Public Relations Specialist",
    keempat: "1989-09-30",
    status: "Tidak Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Taryn",
    kedua: "Ridgeway",
    ketiga: "Content Strategist",
    keempat: "1978-12-17",
    status: "Digantung",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Armand",
    kedua: "Copeland",
    ketiga: "Legal Advisor",
    keempat: "1965-04-02",
    status: "Menunggu",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Tisha",
    kedua: "Gillespie",
    ketiga: "IT Support Specialist",
    keempat: "1985-06-25",
    status: "Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Brenton",
    kedua: "Thornton",
    ketiga: "Digital Marketing Specialist",
    keempat: "1991-02-14",
    status: "Digantung",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Annis",
    kedua: "Hobson",
    ketiga: "Project Coordinator",
    keempat: "1981-05-07",
    status: "Menunggu",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Dylan",
    kedua: "Hudson",
    ketiga: "Account Manager",
    keempat: "1990-09-15",
    status: "Tidak Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Kendall",
    kedua: "Browning",
    ketiga: "Supply Chain Manager",
    keempat: "1973-07-03",
    status: "Aktif",
    tindakan: "...",
  },
  {
    kriteriaPertama: "Maris",
    kedua: "Woodard",
    ketiga: "Customer Relations Specialist",
    keempat: "1962-11-20",
    status: "Menunggu",
    tindakan: "...",
  },
]);

const criteria = ref([
  {
    label: "Kriteria 1",
    options: ["Aura", "Chantal", "Cicely", "Coy", "Delma"],
  },
  {
    label: "Kriteria 2",
    options: ["Hard", "Nailor", "Sigler", "Wollard", "Bonds"],
  },
  {
    label: "Kriteria 3",
    options: [
      "Business Services Sales Representative",
      "Technical Services Librarian",
      "Senior Research Officer",
      "Customer Service Operator",
      "Lead Brand Manager",
    ],
  },
  {
    label: "Kriteria 4",
    options: [
      "1969-04-19",
      "1980-01-10",
      "1960-03-15",
      "1982-10-12",
      "1968-12-21",
    ],
  },
  {
    label: "Kriteria 5",
    options: ["Digantung", "Tidak Aktif", "Menunggu", "Aktif"],
  },
]);

const selectedCriteria = ref({
  kriteria1: "",
  kriteria2: "",
  kriteria3: "",
  kriteria4: "",
  kriteria5: "",
});

const filteredData = ref([...data.value]);

const performSearch = () => {
  filteredData.value = data.value.filter((item) => {
    return (
      (!selectedCriteria.value.kriteria1 ||
        item.kriteriaPertama.includes(selectedCriteria.value.kriteria1)) &&
      (!selectedCriteria.value.kriteria2 ||
        item.kedua.includes(selectedCriteria.value.kriteria2)) &&
      (!selectedCriteria.value.kriteria3 ||
        item.ketiga.includes(selectedCriteria.value.kriteria3)) &&
      (!selectedCriteria.value.kriteria4 ||
        item.keempat.includes(selectedCriteria.value.kriteria4)) &&
      (!selectedCriteria.value.kriteria5 ||
        item.status.includes(selectedCriteria.value.kriteria5))
    );
  });
};

const resetFilter = () => {
  selectedCriteria.value = {
    kriteria1: "",
    kriteria2: "",
    kriteria3: "",
    kriteria4: "",
    kriteria5: "",
  };
  filteredData.value = [...data.value];
};
</script>
<template>
  <div>
    <LayoutsBreadcrumb />

    <rs-card>
      <template #header> Laporan</template>
      <template #body>
        <FormKit type="form" :actions="false">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <FormKit
              v-for="(item, index) in criteria.slice(0, 2)"
              :key="index"
              type="select"
              :name="item.label.toLowerCase().replace(' ', '_')"
              :label="item.label"
              :options="item.options"
              v-model="selectedCriteria[`kriteria${index + 1}`]"
              placeholder="Pilih pilihan"
            >
              <template #label>
                <label
                  class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
                >
                  {{ item.label }}
                </label>
              </template>
            </FormKit>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <FormKit
              v-for="(item, index) in criteria.slice(2)"
              :key="index"
              type="select"
              :name="item.label.toLowerCase().replace(' ', '_')"
              :label="item.label"
              :options="item.options"
              v-model="selectedCriteria[`kriteria${index + 3}`]"
              placeholder="Pilih pilihan"
            >
              <template #label>
                <label
                  class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
                >
                  {{ item.label }}
                </label>
              </template>
            </FormKit>
          </div>

          <div class="flex justify-end items-center gap-2">
            <rs-button @click="resetFilter" variant="primary-outline"
              >Reset</rs-button
            >
            <rs-button type="submit" @click="performSearch">
              Hantar Laporan
            </rs-button>
          </div>
        </FormKit>

        <rs-table
          class="mt-8"
          :key="filteredData"
          :data="filteredData"
          :pageSize="100"
        >
          <template v-slot:status="data">
            <rs-badge
              :variant="
                data.text === 'Aktif'
                  ? 'success'
                  : data.text === 'Menunggu'
                  ? 'warning'
                  : data.text === 'Tidak Aktif'
                  ? 'disabled'
                  : data.text === 'Digantung'
                  ? 'danger'
                  : 'default'
              "
            >
              {{ data.text }}
            </rs-badge>
          </template>
        </rs-table>
      </template>
    </rs-card>
  </div>
</template>
