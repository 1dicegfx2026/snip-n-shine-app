/** Genera y descarga un archivo .ics para añadir la cita al calendario del teléfono. */
export function downloadICS(opts: {
  title: string;
  description: string;
  location: string;
  dateISO: string;
  time: string;
  durationMin: number;
}) {
  const [hStr, mStr] = opts.time.split(":");
  const start = new Date(`${opts.dateISO}T${(hStr ?? "9").padStart(2, "0")}:${mStr ?? "00"}:00`);
  const end = new Date(start.getTime() + opts.durationMin * 60000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(
      d.getHours(),
    ).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GILT//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@gilt`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    `LOCATION:${esc(opts.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tu cita en GILT es en 2 horas",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gilt-cita.ics";
  a.click();
  URL.revokeObjectURL(url);
}
