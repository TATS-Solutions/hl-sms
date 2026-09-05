import { FileText, Banknote, HeartPulse, Users, ScrollText, Briefcase, Landmark, Leaf, Wrench, Building2, Calculator, Gavel } from "lucide-react";

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
