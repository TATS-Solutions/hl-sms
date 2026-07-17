export const DEPARTMENTS = [
  { id: "mho", name: "Municipal Health Office", shortName: "MHO" },
  { id: "mswdo", name: "Municipal Social Welfare & Development Office", shortName: "MSWDO" },
];

export const CATEGORIES = [
  { id: "health", label: "Health & Family" },
  { id: "social", label: "Social Services" },
];

export const SERVICES = [
  { id: "mho-1", deptId: "mho", catId: "health", name: "Medical Consultation",
    desc: "General consultation with a licensed physician for illness assessment, treatment recommendations, and specialist referrals.",
    bring: "Valid government ID, PhilHealth card (if available)", time: "30–45 minutes" },
  { id: "mho-2", deptId: "mho", catId: "health", name: "Prenatal Care",
    desc: "Routine check-up for expectant mothers: vital signs, weight monitoring, fetal heartbeat assessment, and health counselling.",
    bring: "Mother and Child book, previous OB records, valid ID", time: "45–60 minutes" },
  { id: "mho-3", deptId: "mho", catId: "health", name: "Child Care",
    desc: "Pediatric wellness check, immunization update, and growth monitoring for children ages 0–5.",
    bring: "Child's immunization card, Mother and Child book, guardian's valid ID", time: "20–30 minutes" },
  { id: "mho-4", deptId: "mho", catId: "health", name: "Laboratory Examination",
    desc: "Basic diagnostic services including CBC, urinalysis, fecalysis, and blood chemistry tests.",
    bring: "Laboratory request form from physician, valid ID", time: "1–2 hours (results)" },
  { id: "mho-5", deptId: "mho", catId: "health", name: "Family Planning Services",
    desc: "Counselling and provision of family planning methods including oral contraceptives, injectables, and IUD insertion.",
    bring: "Valid ID, PhilHealth card (if available)", time: "30–45 minutes" },
  { id: "mswdo-1", deptId: "mswdo", catId: "social", name: "Pre-Marriage Orientation and Counselling",
    desc: "Mandatory group session for couples applying for a marriage license in Hilongos. Certificate of completion issued after the session.",
    bring: "Valid ID of both parties, marriage license application (if available)", time: "3–4 hours (group session)" },
  { id: "mswdo-2", deptId: "mswdo", catId: "social", name: "Certificate of Indigency",
    desc: "Application and scheduled pickup of an indigency certificate, accepted by hospitals, schools, and government offices for fee waivers.",
    bring: "Barangay indigency certificate, valid ID, proof of residency", time: "Application: 20 min. Pickup: 15 min." },
  { id: "mswdo-3", deptId: "mswdo", catId: "social", name: "Financial Assistance / AICS Application",
    desc: "Assistance to Individuals in Crisis Situation — financial aid covering burial, hospitalization, medicine, and transportation emergencies.",
    bring: "Valid ID, barangay certificate, medical abstract or burial certificate (as applicable)", time: "30–45 minutes" },
];

export const getDept = (id) => DEPARTMENTS.find(d => d.id === id) ?? DEPARTMENTS[0];