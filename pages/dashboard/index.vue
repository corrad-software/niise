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
const { data: dashboardResponse } = await useFetch("/api/dashboard");

// Add watchers to debug API responses
watch(dashboardResponse, (newVal) => {
  console.log("Dashboard Data:", newVal);
});

const lastLoginDetail = computed(() => {
  const loginData = dashboardResponse.value?.data?.lastLogin;
  if (!loginData) {
    return {
      date: DateTime.now().toFormat("yyyy-MM-dd"),
      time: DateTime.now().toFormat("HH:mm:ss"),
      ip: "192.168.1.1",
    };
  }
  return loginData;
});

// const notifications = computed(() => {
//   const notifData = notificationsResponse.value?.data;
//   if (!notifData || !Array.isArray(notifData) || notifData.length === 0) {
//     return [
//       {
//         title: "Permohonan Baru",
//         message: "Permohonan #12345 telah dihantar",
//         time: "2 jam yang lalu",
//       },
//       {
//         title: "Permohonan Diluluskan",
//         message: "Permohonan #12340 telah diluluskan",
//         time: "5 jam yang lalu",
//       },
//     ];
//   }
//   return notifData;
// });

// Role-specific summary data
const summaryData = computed(() => {
  const stats = dashboardResponse.value?.data?.stats || {};
  console.log("Stats data:", stats);

  if (
    ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(userStore.roles[0])
  ) {
    return [
      {
        title: "Login Terakhir",
        value: formatLastLogin(lastLoginDetail.value),
        icon: "ic:outline-access-time",
        color: "cyan",
      },
      {
        title: "Jumlah Permohonan Dihantar",
        value: stats.dihantar?.toString() || "0",
        icon: "ic:outline-send",
        color: "blue",
      },
      {
        title: "Jumlah Permohonan Draf",
        value: stats.draft?.toString() || "0",
        icon: "material-symbols:draft",
        color: "orange",
      },
      {
        title: "Jumlah Permohonan Ditolak",
        value: stats.rejected?.toString() || "0",
        icon: "ic:outline-cancel",
        color: "red",
      },
      {
        title: "Jumlah Permohonan Diluluskan",
        value: stats.approved?.toString() || "0",
        icon: "ic:outline-check-circle",
        color: "green",
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
        color: "cyan",
      },
      {
        title: "Jumlah Permohonan Dihantar",
        value: stats.dihantar?.toString() || "0",
        icon: "ic:outline-send",
        color: "blue",
      },
      {
        title: "Jumlah Permohonan Ditolak",
        value: stats.ditolak?.toString() || "0",
        icon: "ic:outline-cancel",
        color: "red",
      },
      {
        title: "Jumlah Permohonan Diluluskan",
        value: stats.diluluskan?.toString() || "0",
        icon: "ic:outline-check-circle",
        color: "green",
      },
    ];
  } else if (userStore.roles[0] === "Pegawai Forensik") {
    return [
      {
        title: "Login Terakhir",
        value: formatLastLogin(lastLoginDetail.value),
        icon: "ic:outline-access-time",
        color: "cyan",
      },
      {
        title: "Jumlah Permohonan Dihantar",
        value: stats.dihantar?.toString() || "0",
        icon: "ic:outline-send",
        color: "blue",
      },
      {
        title: "Jumlah Permohonan Selesai",
        value: stats.completed?.toString() || "0",
        icon: "ic:outline-task-alt",
        color: "green",
      },
    ];
  }
  return [];
});

// Modified chart data structure based on API response
const series = computed(() => {
  console.log("Monthly Stats:", dashboardResponse.value?.data?.monthlyStats);
  const monthlyData = dashboardResponse.value?.data?.monthlyStats || [];
  const months = Array(12).fill(0);

  // Process monthly data based on role
  monthlyData.forEach((stat) => {
    if (stat._count && stat.create_at) {
      const month = new Date(stat.create_at).getMonth();
      if (month >= 0 && month < 12) {
        // For PP, show all permohonan
        // For others, only show diluluskan
        if (
          ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(
            userStore.roles[0]
          )
        ) {
          months[month] += stat._count;
        } else if (stat.status_permohonan === "Permohonan Diluluskan") {
          months[month] += stat._count;
        }
      }
    }
  });

  return [
    {
      name: ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(
        userStore.roles[0]
      )
        ? "Total Permohonan"
        : "Permohonan Diluluskan",
      data: months,
    },
  ];
});

// Modified chart options
const chartOptions = computed(() => ({
  chart: {
    id: "apexChart",
    type: "line",
    toolbar: {
      show: true,
    },
    zoom: {
      enabled: true,
    },
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  colors: ["#0EA5E9"], // Tailwind blue-500
  grid: {
    borderColor: "#E2E8F0", // Tailwind gray-200
    row: {
      colors: ["transparent"],
      opacity: 0.5,
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
  },
  theme: {
    mode: "light",
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
    axisBorder: {
      show: true,
      color: "#E2E8F0", // Tailwind gray-200
    },
    axisTicks: {
      show: true,
      color: "#E2E8F0", // Tailwind gray-200
    },
    labels: {
      style: {
        colors: "#64748B", // Tailwind gray-500
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    title: {
      text: "Jumlah Permohonan",
      style: {
        fontSize: "14px",
        fontWeight: 500,
        color: "#64748B", // Tailwind gray-500
      },
    },
    min: 0,
    forceNiceScale: true,
    labels: {
      style: {
        colors: "#64748B", // Tailwind gray-500
        fontSize: "12px",
      },
      formatter: function (value) {
        return Math.round(value);
      },
    },
  },
  markers: {
    size: 5,
    colors: ["#0EA5E9"], // Tailwind blue-500
    strokeColors: "#fff",
    strokeWidth: 2,
  },
  tooltip: {
    theme: "light",
    y: {
      formatter: function (value) {
        return value + " permohonan";
      },
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

// For pie chart - evidence type statistics
const pieChartSeries = computed(() => {
  console.log("Evidence Stats:", dashboardResponse.value?.data?.evidenceStats); // Debug log
  const evidenceStats = dashboardResponse.value?.data?.evidenceStats || [];
  return evidenceStats.map((stat) => stat._count || 0);
});

const pieChartOptions = computed(() => {
  const evidenceStats = dashboardResponse.value?.data?.evidenceStats || [];
  const labels = evidenceStats.map((stat) => stat.nama) || [
    "Passport",
    "Mallpass",
    "Dokumen",
    "Lain-lain",
  ];

  return {
    chart: {
      id: "pieChart",
      type: "pie",
      toolbar: {
        show: true,
      },
    },
    labels,
    colors: [
      "#0EA5E9", // blue-500
      "#22C55E", // green-500
      "#EAB308", // yellow-500
      "#EF4444", // red-500
      "#8B5CF6", // purple-500
      "#EC4899", // pink-500
    ],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: function (seriesName, opts) {
        return [seriesName, " - ", opts.w.globals.series[opts.seriesIndex]];
      },
    },
    stroke: {
      width: 0,
      colors: ["#fff"],
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontFamily: "inherit",
        fontWeight: "normal",
      },
      dropShadow: {
        enabled: false,
      },
      formatter: function (val, opts) {
        return opts.w.config.labels[opts.seriesIndex];
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: function (val) {
          return val + " barang bukti";
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%",
        },
        expandOnClick: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            position: "bottom",
            fontSize: "12px",
          },
        },
      },
    ],
  };
});

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

const getNotificationIcon = (title) => {
  if (title.includes("Baru") || title.includes("Dihantar")) {
    return "ic:outline-mail";
  }
  if (title.includes("Diterima") || title.includes("Diluluskan")) {
    return "ic:outline-check-circle";
  }
  if (title.includes("Ditolak")) {
    return "ic:outline-cancel";
  }
  return "ic:outline-info";
};

// Conditionally show pie chart only for Pegawai Penyiasat
const showPieChart = computed(() => {
  return ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(
    userStore.roles[0]
  );
});
</script>

<template>
  <div>
    <LayoutsBreadcrumb />

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      <rs-card
        v-for="(item, index) in summaryData"
        :key="index"
        class="transition-all duration-300 hover:shadow-lg mb-0"
      >
        <div class="pt-3 pb-3 px-5 flex items-center gap-4">
          <div
            class="p-5 flex justify-center items-center rounded-2xl"
            :class="{
              'bg-cyan-500/20': item.color === 'cyan',
              'bg-blue-500/20': item.color === 'blue',
              'bg-orange-500/20': item.color === 'orange',
              'bg-red-500/20': item.color === 'red',
              'bg-green-500/20': item.color === 'green',
              'bg-purple-500/20': item.color === 'purple',
              'bg-indigo-500/20': item.color === 'indigo',
              'bg-yellow-500/20': item.color === 'yellow',
            }"
          >
            <Icon
              :name="item.icon"
              class="text-3xl"
              :class="{
                'text-cyan-600': item.color === 'cyan',
                'text-blue-600': item.color === 'blue',
                'text-orange-600': item.color === 'orange',
                'text-red-600': item.color === 'red',
                'text-green-600': item.color === 'green',
                'text-purple-600': item.color === 'purple',
                'text-indigo-600': item.color === 'indigo',
                'text-yellow-600': item.color === 'yellow',
              }"
            />
          </div>
          <div class="flex-1 truncate">
            <span
              class="block font-bold text-2xl leading-tight"
              :class="{
                'text-cyan-600': item.color === 'cyan',
                'text-blue-600': item.color === 'blue',
                'text-orange-600': item.color === 'orange',
                'text-red-600': item.color === 'red',
                'text-green-600': item.color === 'green',
                'text-purple-600': item.color === 'purple',
                'text-indigo-600': item.color === 'indigo',
                'text-yellow-600': item.color === 'yellow',
              }"
            >
              {{ item.value }}
            </span>
            <span class="text-sm font-medium text-gray-600">
              {{ item.title }}
            </span>
          </div>
        </div>
      </rs-card>
    </div>

    <!-- Line Graph -->
    <rs-card class="mb-6">
      <template #header>
        <h2 class="text-xl font-bold text-primary">
          {{
            ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(
              userStore.roles[0]
            )
              ? "Total Permohonan Tahunan"
              : "Total Permohonan Diluluskan Tahunan"
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

    <!-- Pie Chart - Only show for Pegawai Penyiasat -->
    <rs-card v-if="showPieChart" class="mb-6">
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
