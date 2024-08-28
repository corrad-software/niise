export default [
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
    ],
    meta: {},
  },
  {
    header: "Administration",
    description: "",
    child: [
      {
        title: "Configuration",
        icon: "ic:outline-settings",
        child: [
          {
            title: "Environment",
            path: "/devtool/config/environment",
          },
        ],
      },
      {
        title: "Menu Editor",
        icon: "ci:menu-alt-03",
        path: "/devtool/menu-editor",
        child: [],
      },
      {
        title: "Manage Users",
        path: "/devtool/user-management",
        icon: "ph:user-circle-gear",
        child: [
          {
            title: "User List",
            path: "/devtool/user-management/user-list",
            icon: "",
            child: [],
          },
          {
            title: "Role List",
            path: "/devtool/user-management/role-list",
            icon: "",
            child: [],
          },
        ],
      },
      {
        title: "Content",
        icon: "mdi:pencil-ruler",
        child: [
          {
            title: "Editor",
            path: "/devtool/content-editor",
          },
          {
            title: "Template",
            path: "/devtool/content-editor/template",
          },
        ],
      },
      {
        title: "API Editor",
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