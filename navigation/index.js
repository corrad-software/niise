export default [
  {
    header: "Forensik",
    description: "",
    child: [
      {
        title: "Semakan Forensik",
        icon: "ph:user-list-duotone",
        child: [
          {
            title: "Permohonan Temujanji",
            path: "/permohonan-temujanji/senarai",
            child: [],
            meta: {
              auth: {
                role: ["Admin", "Pegawai Penyiasat"],
              },
            },
          },
          {
            title: "Kaunter Semakan",
            path: "/kemaskini-daftar/senarai",
            child: [],
            meta: {
              auth: {
                role: ["Admin", "Pegawai Kaunter", "Ketua Bahagian", "Pegawai Forensik"],
              },
            },
          },
        ],
      },
      {
        title: "Pengesanan Penyamaran",
        icon: "ph:user-rectangle-duotone",
        child: [
          {
            title: "Senarai",
            path: "/pengesanan-penyamaran/senarai",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Admin", "Pegawai Penyiasat", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "e-Library",
        icon: "ph:address-book-duotone",
        child: [
          {
            title: "Senarai",
            path: "/e-library",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "Dokumen e-Library",
        icon: "ph:file-archive-duotone",
        child: [
          {
            title: "Senarai",
            path: "/dokumen-library",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
    ],
  },
];
