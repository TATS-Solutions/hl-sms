import { Activity, Heart, Baby, FlaskConical, Pill, HeartHandshake, FileText, Banknote, HeartPulse, Users, ScrollText, Briefcase, Landmark, Leaf, Wrench, TreePine, ShieldCheck, GraduationCap } from "lucide-react";

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
  { n: "01", label: "Choose Service" },
  { n: "02", label: "Select Schedule" },
  { n: "03", label: "Get Confirmation" },
  { n: "04", label: "Visit Office" },
  { n: "05", label: "Complete Service" },
];

export const CATEGORIES_FULL = [
  { id: "health", label: "Health", Icon: HeartPulse, active: true },
  { id: "social", label: "Social Services", Icon: Users, active: true },
  { id: "civil", label: "Civil Registry", Icon: ScrollText, active: false },
  { id: "biz", label: "Business", Icon: Briefcase, active: false },
  { id: "treasury", label: "Treasury", Icon: Landmark, active: false },
  { id: "agri", label: "Agriculture", Icon: Leaf, active: false },
  { id: "eng", label: "Engineering", Icon: Wrench, active: false },
  { id: "env", label: "Environment", Icon: TreePine, active: false },
  { id: "safety", label: "Public Safety", Icon: ShieldCheck, active: false },
  { id: "edu", label: "Education", Icon: GraduationCap, active: false },
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