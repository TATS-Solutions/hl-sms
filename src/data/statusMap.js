export const STATUS_MAP = {
  pending: { label: "Pending Review", color: "bg-yellow-50 text-yellow-800 border-yellow-200", note: "Application received and queued for staff review." },
  pending_assessment: { label: "Pending Fee Assessment", color: "bg-orange-50 text-orange-800 border-orange-200", note: "Staff are reviewing your documents to compute required fees." },
  pending_payment: { label: "Pending Payment", color: "bg-blue-50 text-blue-800 border-blue-200", note: "Fees assessed. Pay online by scanning the QR code and uploading your receipt below, or proceed to the Municipal Treasurer's Office (Ground Floor, Municipal Hall) and present your Reference Code to pay in person." },
  processing: { label: "Processing", color: "bg-purple-50 text-purple-800 border-purple-200", note: "Payment verified. Office is preparing your document." },
  completed: { label: "Completed", color: "bg-green-50 text-green-800 border-green-200", note: "Service complete! Ready for download or pick-up at Municipal Hall." },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-800 border-red-200", note: "This application was cancelled." },
  no_show: { label: "No Show", color: "bg-gray-100 text-gray-700 border-gray-300", note: "Scheduled appointment missed." },
};

export const getStatusInfo = (status) => STATUS_MAP[status] ?? {
  label: status, color: "bg-gray-100 text-gray-700 border-gray-300", note: "",
};