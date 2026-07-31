import { useEffect, useState } from "react";
import { fetchServiceAvailability } from "../api/serviceRequests";
import { to24Hour } from "../utils/time";

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
];

function getUpcomingWeekdays(count) {
  const dates = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export default function DateSlotPicker({ serviceId, selectedDate, selectedSlot, onSelectDate, onSelectSlot }) {
  const dates = getUpcomingWeekdays(10);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (!selectedDate || !serviceId) {
      setBookedSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    setBookedSlots([]);
    fetchServiceAvailability(serviceId, selectedDate.toISOString().slice(0, 10))
      .then((res) => {
        if (cancelled) return;
        setBookedSlots(res.data.data.booked_slots);
        setLoadingAvailability(false);
      })
      .catch(() => {
        if (cancelled) return;
        setBookedSlots([]);
        setLoadingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, selectedDate]);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Choose a date
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {dates.map((date) => {
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={`flex-shrink-0 w-16 rounded border py-2.5 text-center transition-colors ${
                isSelected
                  ? "bg-primary border-primary text-white"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wide opacity-70">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg font-semibold leading-tight">{date.getDate()}</div>
              <div className="text-[10px] opacity-70">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Choose a time
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(to24Hour(slot));
              return (
                <button
                  key={slot}
                  onClick={() => onSelectSlot(slot)}
                  disabled={isBooked || loadingAvailability}
                  title={isBooked ? "This slot is already booked" : undefined}
                  className={`rounded border py-2 text-sm ${
                    isBooked
                      ? "bg-secondary/40 border-border text-muted-foreground line-through cursor-not-allowed opacity-60"
                      : `transition-colors ${
                          loadingAvailability
                            ? "opacity-60 cursor-wait bg-card border-border"
                            : selectedSlot === slot
                            ? "bg-primary border-primary text-white"
                            : "bg-card border-border hover:border-primary/40"
                        }`
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}