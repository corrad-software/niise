<script setup>
import { useUserStore } from "~/stores/user";
import { DateTime } from "luxon";

definePageMeta({
  title: "Dashboard",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Dashboard",
      path: "/",
    },
  ],
});

const userStore = useUserStore();

// Common data for all roles
const lastLoginDetail = ref({
  date: DateTime.now().toFormat("yyyy-MM-dd"),
  time: DateTime.now().toFormat("HH:mm:ss"),
  ip: "192.168.1.1",
});

const notifications = ref([
  {
    title: "Permohonan Baru",
    message: "Permohonan #12345 telah dihantar",
    time: "2 jam yang lalu",
  },
  {
    title: "Permohonan Diluluskan",
    message: "Permohonan #12340 telah diluluskan",
    time: "5 jam yang lalu",
  },
  // Add more notifications as needed
]);

// Role-specific summary data
const summaryData = computed(() => {
  if (
    ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(userStore.roles[0])
  ) {
    return [
      {
        title: "Login Terakhir",
        value: formatLastLogin(lastLoginDetail.value),
        icon: "ic:outline-access-time",
      },
      {
        title: "Jumlah Permohonan Dihantar",
        value: "45",
        icon: "ic:outline-send",
      },
      {
        title: "Jumlah Permohonan Draf",
        value: "12",
        icon: "material-symbols:draft",
      },
      {
        title: "Jumlah Permohonan Ditolak",
        value: "5",
        icon: "ic:outline-cancel",
      },
      {
        title: "Jumlah Permohonan Diluluskan",
        value: "28",
        icon: "ic:outline-check-circle",
      },
    ];
  } else if (
    ["Ketua Bahagian", "Pegawai Kaunter"].includes(userStore.roles[0])
  ) {
    return [
      {
        title: "Login Terakhir",
        value: formatLastLogin(lastLoginDetail.value),
        icon: "ic:outline-access-time",
      },
      {
        title: "Jumlah Permohonan Dihantar",
        value: "85",
        icon: "ic:outline-send",
      },
      {
        title: "Jumlah Permohonan Ditolak",
        value: "15",
        icon: "ic:outline-cancel",
      },
      {
        title: "Jumlah Permohonan Diluluskan",
        value: "70",
        icon: "ic:outline-check-circle",
      },
    ];
  } else if (userStore.roles[0] === "Pegawai Forensik") {
    return [
      {
        title: "Login Terakhir",
        value: formatLastLogin(lastLoginDetail.value),
        icon: "ic:outline-access-time",
      },
      {
        title: "Jumlah Permohonan Dihantar",
        value: "65",
        icon: "ic:outline-send",
      },
      {
        title: "Jumlah Permohonan Selesai",
        value: "50",
        icon: "ic:outline-task-alt",
      },
    ];
  }
  return [];
});

// Modified chart data structure
const series = ref([
  {
    name: "Permohonan",
    data: [30, 40, 35, 50, 45, 60, 55, 65, 70, 80, 75, 85], // Default data
  },
]);

// Modified chart options
const chartOptions = computed(() => ({
  chart: {
    id: "apexChart",
    height: 350,
    type: "line",
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  legend: {
    position: "top",
  },
  theme: {
    mode: "light",
    palette: "palette1",
  },
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  yaxis: {
    title: {
      text: "Jumlah Permohonan",
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: {
          position: "bottom",
        },
      },
    },
  ],
}));

// For pie chart
const pieChartSeries = ref([150, 100, 75, 50]); // Values from evidenceTypeData

const pieChartOptions = computed(() => ({
  chart: {
    id: "pieChart",
  },
  labels: ["Passport", "Mallpass", "Dokumen", "Lain-lain"],
  theme: {
    mode: "light",
    palette: "palette1",
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: "bottom" },
      },
    },
  ],
}));

// Format function using Luxon
const formatLastLogin = (login) => {
  if (!login || !login.date || !login.time) return "-";

  try {
    const dateTime = DateTime.fromFormat(
      `${login.date} ${login.time}`,
      "yyyy-MM-dd HH:mm:ss"
    );

    return dateTime.toFormat("dd/MM/yyyy HH:mm");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      <!-- Login Card -->
      <rs-card class="transition-all duration-300 hover:shadow-lg mb-0">
        <div class="pt-3 pb-3 px-5 flex items-center gap-4">
          <div
            class="p-5 flex justify-center items-center bg-cyan-500/20 rounded-2xl"
          >
            <Icon
              class="text-cyan-600 text-3xl"
              name="ic:outline-access-time"
            />
          </div>
          <div class="flex-1 truncate">
            <span class="block font-bold text-2xl leading-tight text-cyan-600">
              {{ formatLastLogin(lastLoginDetail) }}
            </span>
            <span class="text-sm font-medium text-gray-600">
              Login Terakhir
            </span>
          </div>
        </div>
      </rs-card>

      <!-- Permohonan Dihantar Card -->
      <rs-card class="transition-all duration-300 hover:shadow-lg mb-0">
        <div class="pt-3 pb-3 px-5 flex items-center gap-4">
          <div
            class="p-5 flex justify-center items-center bg-blue-500/20 rounded-2xl"
          >
            <Icon class="text-blue-600 text-3xl" name="ic:outline-send" />
          </div>
          <div class="flex-1 truncate">
            <span class="block font-bold text-2xl leading-tight text-blue-600"
              >45</span
            >
            <span class="text-sm font-medium text-gray-600">
              Jumlah Permohonan Dihantar
            </span>
          </div>
        </div>
      </rs-card>

      <!-- Permohonan Draf Card -->
      <rs-card class="transition-all duration-300 hover:shadow-lg mb-0">
        <div class="pt-3 pb-3 px-5 flex items-center gap-4">
          <div
            class="p-5 flex justify-center items-center bg-amber-500/20 rounded-2xl"
          >
            <Icon
              class="text-amber-600 text-3xl"
              name="material-symbols:draft"
            />
          </div>
          <div class="flex-1 truncate">
            <span class="block font-bold text-2xl leading-tight text-amber-600"
              >12</span
            >
            <span class="text-sm font-medium text-gray-600">
              Jumlah Permohonan Draf
            </span>
          </div>
        </div>
      </rs-card>

      <!-- Permohonan Ditolak Card -->
      <rs-card class="transition-all duration-300 hover:shadow-lg mb-0">
        <div class="pt-3 pb-3 px-5 flex items-center gap-4">
          <div
            class="p-5 flex justify-center items-center bg-red-500/20 rounded-2xl"
          >
            <Icon class="text-red-600 text-3xl" name="ic:outline-cancel" />
          </div>
          <div class="flex-1 truncate">
            <span class="block font-bold text-2xl leading-tight text-red-600"
              >5</span
            >
            <span class="text-sm font-medium text-gray-600">
              Jumlah Permohonan Ditolak
            </span>
          </div>
        </div>
      </rs-card>

      <!-- Permohonan Diluluskan Card -->
      <rs-card class="transition-all duration-300 hover:shadow-lg mb-0">
        <div class="pt-3 pb-3 px-5 flex items-center gap-4">
          <div
            class="p-5 flex justify-center items-center bg-green-500/20 rounded-2xl"
          >
            <Icon
              class="text-green-600 text-3xl"
              name="ic:outline-check-circle"
            />
          </div>
          <div class="flex-1 truncate">
            <span class="block font-bold text-2xl leading-tight text-green-600"
              >28</span
            >
            <span class="text-sm font-medium text-gray-600">
              Jumlah Permohonan Diluluskan
            </span>
          </div>
        </div>
      </rs-card>
    </div>

    <!-- Notifications -->
    <rs-card class="mb-6">
      <template #header>
        <h2 class="text-xl font-bold text-primary">Notifikasi</h2>
      </template>
      <template #body>
        <div class="divide-y">
          <div
            v-for="(notification, index) in notifications"
            :key="index"
            class="py-4 flex justify-between items-start"
          >
            <div>
              <h3 class="font-semibold">{{ notification.title }}</h3>
              <p class="text-gray-600">{{ notification.message }}</p>
            </div>
            <span class="text-sm text-gray-500">{{ notification.time }}</span>
          </div>
        </div>
      </template>
    </rs-card>

    <!-- Line Graph -->
    <rs-card class="mb-6">
      <template #header>
        <h2 class="text-xl font-bold text-primary">
          {{
            userStore.roles[0] === "Pegawai Forensik"
              ? "Total Permohonan Selesai Tahunan"
              : "Total Permohonan Tahunan"
          }}
        </h2>
      </template>
      <template #body>
        <client-only>
          <VueApexCharts
            width="100%"
            height="350"
            type="line"
            :options="chartOptions"
            :series="series"
          />
        </client-only>
      </template>
    </rs-card>

    <!-- Pie Chart -->
    <rs-card
      v-if="
        ['Pegawai Penyiasat', 'Pegawai Penyiasat JIM'].includes(
          userStore.roles[0]
        )
      "
      class="mb-6"
    >
      <template #header>
        <h2 class="text-xl font-bold text-primary">Jumlah Bahan Bukti</h2>
      </template>
      <template #body>
        <client-only>
          <VueApexCharts
            width="100%"
            height="350"
            type="pie"
            :options="pieChartOptions"
            :series="pieChartSeries"
          />
        </client-only>
      </template>
    </rs-card>
  </div>
</template>
