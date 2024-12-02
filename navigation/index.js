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
                role: [
                  "Admin",
                  "Pegawai Kaunter",
                  "Ketua Bahagian",
                  "Pegawai Forensik",
                ],
              },
            },
          },
        ],
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
