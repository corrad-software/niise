export default [
  {
    header: "Forensik",
    description: "",
    child: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "ph:house-duotone",
      },
      {
        title: "Semakan",
        icon: "ph:user-list-duotone",
        child: [
          {
            title: "Semua",
            path: "/kemaskini-daftar/senarai",
            child: [],
            meta: {},
          },
          {
            title: "Menunggu Pengesahan",
            path: "/kemaskini-daftar/senarai-pengesahan",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Ketua Bahagian", "Pegawai Kaunter"],
          },
        },
      },
      {
        title: "Semakan",
        icon: "ph:user-list-duotone",
        child: [
          {
            title: "Dokumen",
            path: "/kemaskini-daftar/senarai",
            child: [],
            meta: {},
          },
          {
            title: "Pengesanan Penyamaran",
            path: "/pengesanan-penyamaran/senarai",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Pegawai Forensik"],
          },
        },
      },
      {
        title: "Permohonan Temujanji",
        path: "/permohonan-temujanji/senarai",
        icon: "ph:calendar-blank-duotone",
        meta: {
          auth: {
            role: ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"],
          },
        },
      },
      {
        title: "e-library",
        path: "/e-library",
        icon: "ph:address-book-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "Dokumen e-library",
        path: "/dokumen-library",
        icon: "ph:file-archive-duotone",
      },
    ],
  },
];
