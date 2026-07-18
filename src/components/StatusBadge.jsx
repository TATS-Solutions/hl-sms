const STYLES = {
  upcoming: "bg-accent/10 text-accent border-accent/30",
  done: "bg-primary/10 text-primary border-primary/30",
  "no-show": "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const LABELS = {
  upcoming: "Upcoming",
  done: "Done",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border ${STYLES[status] || STYLES.upcoming}`}
    >
      {LABELS[status] || status}
    </span>
  );
}