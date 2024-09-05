export default [
  {
    header: "Forensik",
    description: "",
    child: [
      {
        title: "FOR-01",
        icon: "ph:number-circle-one-fill",
        child: [
          {
            title: "Permohonan Temujanji",
            path: "/permohonan-temujanji/senarai",
            child: [],
            meta: {},
          },
          {
            title: "Kaunter Semakan ",
            path: "/kemaskini-daftar/senarai",
            child: [],
            meta: {},
          },
          // {
          //   title: "Kemaskini Daftar",
          //   path: "/kemaskini-daftar/senarai",
          //   child: [],
          //   meta: {},
          // },
        ],
      },
    ],
  },
  {
    header: "Utama",
    description: "",
    child: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "ic:outline-dashboard",
        child: [],
        meta: {},
      },
      {
        title: "Carian",
        path: "/carian",
        icon: "ph:magnifying-glass",
        child: [],
        meta: {},
      },
      {
        title: "Laporan",
        path: "/laporan",
        icon: "ph:chart-bar-fill",
        child: [],
        meta: {},
      },
    ],
    meta: {},
  },
  {
    header: "Fungsi",
    description: "",
    child: [
      {
        title: "Komponen",
        icon: "ph:gear-fine",
        child: [
          {
            title: "Amaran",
            path: "/komponen/amaran",
            child: [],
            meta: {},
          },
          {
            title: "Butang",
            path: "/komponen/butang",
            child: [],
            meta: {},
          },
          {
            title: "Lencana",
            path: "/komponen/lencana",
            child: [],
            meta: {},
          },
          {
            title: "Collapse",
            path: "/komponen/collapse",
            child: [],
            meta: {},
          },
          {
            title: "Dropdown",
            path: "/komponen/dropdown",
            child: [],
            meta: {},
          },
          {
            title: "Modal",
            path: "/komponen/modal",
            child: [],
            meta: {},
          },
          {
            title: "Progress Bar",
            path: "/komponen/progress-bar",
            child: [],
            meta: {},
          },
          {
            title: "Tab",
            path: "/komponen/tab",
            child: [],
            meta: {},
          },
        ],
      },
      {
        title: "Datatable",
        path: "/datatable",
        icon: "ph:table",
        child: [],
        meta: {},
      },
      {
        title: "Borang",
        path: "/borang",
        icon: "ph:clipboard-text",
        child: [],
      },
      {
        title: "Ikon",
        path: "/ikon",
        icon: "iconamoon:slightly-smiling-face",
        child: [],
        meta: {},
      },
      {
        title: "Tipografi",
        path: "/tipografi",
        icon: "ph:text-aa",
        child: [],
        meta: {},
      },
      {
        title: "Senarai Mesej",
        path: "/senarai-mesej",
        icon: "ic:outline-mail",
        child: [],
        meta: {},
      },
    ],
    meta: {},
  },

  {
    header: "Pengurusan",
    description: "",
    child: [
      {
        title: "Konfigurasi",
        icon: "ic:outline-settings",
        child: [
          {
            title: "Persekitaran",
            path: "/devtool/config/environment",
          },
        ],
      },
      {
        title: "Penyelia Menu",
        icon: "ci:menu-alt-03",
        path: "/devtool/menu-editor",
        child: [],
      },
      {
        title: "Penyelia Pengguna",
        path: "/devtool/user-management",
        icon: "ph:user-circle-gear",
        child: [
          {
            title: "Pengguna",
            path: "/devtool/user-management/user-list",
            icon: "",
            child: [],
          },
          {
            title: "Peranan",
            path: "/devtool/user-management/role-list",
            icon: "",
            child: [],
          },
        ],
      },
      {
        title: "Kandungan",
        icon: "mdi:pencil-ruler",
        child: [
          {
            title: "Penyelia Kandungan",
            path: "/devtool/content-editor",
          },
          {
            title: "Templat",
            path: "/devtool/content-editor/template",
          },
        ],
      },
      {
        title: "Penyelia API",
        path: "/devtool/api-editor",
        icon: "material-symbols:api-rounded",
        child: [],
      },
    ],
    meta: {
      auth: {
        role: ["Developer"],
      },
    },
  },
];
