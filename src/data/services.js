import { Activity, Heart, Baby, FlaskConical, Pill, HeartHandshake, FileText, Banknote, HeartPulse, Users, ScrollText, Briefcase, Landmark, Leaf, Wrench, Building2, Calculator, Gavel } from "lucide-react";

export const DEPARTMENTS = [
  { id: "mho", name: "Municipal Health Office", shortName: "MHO" },
  { id: "mswdo", name: "Municipal Social Welfare & Development Office", shortName: "MSWDO" },
];

export const CATEGORIES = [
  { id: "health", label: "Health & Family" },
  { id: "social", label: "Social Services" },
];

export const SERVICES = [
  { id: "mho-1", deptId: "mho", catId: "health", Icon: Activity, name: "Medical Consultation",
    desc: "General consultation with a licensed physician for illness assessment, treatment recommendations, and specialist referrals.",
    bring: "Valid government ID, PhilHealth card (if available)", time: "30–45 minutes" },
  { id: "mho-2", deptId: "mho", catId: "health", Icon: Heart, name: "Prenatal Care",
    desc: "Routine check-up for expectant mothers: vital signs, weight monitoring, fetal heartbeat assessment, and health counselling.",
    bring: "Mother and Child book, previous OB records, valid ID", time: "45–60 minutes" },
  { id: "mho-3", deptId: "mho", catId: "health", Icon: Baby, name: "Child Care",
    desc: "Pediatric wellness check, immunization update, and growth monitoring for children ages 0–5.",
    bring: "Child's immunization card, Mother and Child book, guardian's valid ID", time: "20–30 minutes" },
  { id: "mho-4", deptId: "mho", catId: "health", Icon: FlaskConical, name: "Laboratory Examination",
    desc: "Basic diagnostic services including CBC, urinalysis, fecalysis, and blood chemistry tests.",
    bring: "Laboratory request form from physician, valid ID", time: "1–2 hours (results)" },
  { id: "mho-5", deptId: "mho", catId: "health", Icon: Pill, name: "Family Planning Services",
    desc: "Counselling and provision of family planning methods including oral contraceptives, injectables, and IUD insertion.",
    bring: "Valid ID, PhilHealth card (if available)", time: "30–45 minutes" },
  { id: "mswdo-1", deptId: "mswdo", catId: "social", Icon: HeartHandshake, name: "Pre-Marriage Orientation and Counselling",
    desc: "Mandatory group session for couples applying for a marriage license in Hilongos. Certificate of completion issued after the session.",
    bring: "Valid ID of both parties, marriage license application (if available)", time: "3–4 hours (group session)" },
  { id: "mswdo-2", deptId: "mswdo", catId: "social", Icon: FileText, name: "Certificate of Indigency",
    desc: "Application and scheduled pickup of an indigency certificate, accepted by hospitals, schools, and government offices for fee waivers.",
    bring: "Barangay indigency certificate, valid ID, proof of residency", time: "Application: 20 min. Pickup: 15 min." },
  { id: "mswdo-3", deptId: "mswdo", catId: "social", Icon: Banknote, name: "Financial Assistance / AICS Application",
    desc: "Assistance to Individuals in Crisis Situation — financial aid covering burial, hospitalization, medicine, and transportation emergencies.",
    bring: "Valid ID, barangay certificate, medical abstract or burial certificate (as applicable)", time: "30–45 minutes" },
];

export const QUICK_CHIPS = [
  { label: "Medical Consultation", svcId: "mho-1" },
  { label: "Prenatal Care", svcId: "mho-2" },
  { label: "Child Care", svcId: "mho-3" },
  { label: "Certificate of Indigency", svcId: "mswdo-2" },
  { label: "Financial Assistance", svcId: "mswdo-3" },
  { label: "Family Planning", svcId: "mho-5" },
];

export const HOW_STEPS = [
  { n: "01", label: "Find your service", description: "Search by name, or browse by the office that handles it." },
  { n: "02", label: "Pick a date and time", description: "See open slots for that service and choose what works for you." },
  { n: "03", label: "Fill in your details", description: "Just your name and contact number — no account needed." },
  { n: "04", label: "Get your reference code", description: "We'll send it by SMS. Bring it with you on the day." },
  { n: "05", label: "Show up and get served", description: "Go straight to the office at your scheduled time." },
];

// Ids match the backend's real department_id (see /departments).
export const CATEGORIES_FULL = [
  { id: 1, label: "Health", Icon: HeartPulse },
  { id: 2, label: "Social Services", Icon: Users },
  { id: 3, label: "Civil Registry", Icon: ScrollText },
  { id: 4, label: "Planning & Development", Icon: Building2 },
  { id: 5, label: "Engineering", Icon: Wrench },
  { id: 6, label: "Mayor's Office", Icon: Landmark },
  { id: 7, label: "Agriculture", Icon: Leaf },
  { id: 8, label: "Assessor", Icon: Calculator },
  { id: 9, label: "Treasury", Icon: Banknote },
  { id: 10, label: "Sangguniang Bayan", Icon: Gavel },
  { id: 11, label: "SB Secretary", Icon: FileText },
  { id: 12, label: "Employment Services", Icon: Briefcase },
];

export const SERVICE_STATS = {
  "mho-1": { queue: 12, next: "2:30 PM" },
  "mho-2": { queue: 5, next: "9:00 AM" },
  "mho-3": { queue: 8, next: "10:00 AM" },
  "mho-4": { queue: 3, next: "1:00 PM" },
  "mho-5": { queue: 7, next: "3:00 PM" },
  "mswdo-1": { queue: 2, next: "8:00 AM" },
  "mswdo-2": { queue: 9, next: "2:00 PM" },
  "mswdo-3": { queue: 4, next: "1:30 PM" },
};

export const getDept = (id) => DEPARTMENTS.find(d => d.id === id) ?? DEPARTMENTS[0];
export const getSvc = (id) => SERVICES.find(s => s.id === id) ?? SERVICES[0];