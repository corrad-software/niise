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
        title: "Permohonan",
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
            role: ["Ketua Bahagian", "Pegawai Forensik", "Pegawai Kaunter"],
          },
        },
      },
      {
        title: "Permohonan Temujanji",
        path: "/permohonan-temujanji/senarai",
        icon: "ph:calendar-blank-duotone",
        meta: {
          auth: {
            role: ["Pegawai Penyiasat"],
          },
        },
      },
      {
        title: "Pengesanan Penyamaran",
        path: "/pengesanan-penyamaran/senarai",
        icon: "ph:user-rectangle-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Penyiasat", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "e-Library",
        path: "/e-library",
        icon: "ph:address-book-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "Dokumen e-Library",
        path: "/dokumen-library",
        icon: "ph:file-archive-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
    ],
  },
];
