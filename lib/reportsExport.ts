import type { Student } from "@/data/mockData";

export function downloadCsv(students: Student[], filename = "yellow-report.csv") {
  const headers = [
    "id", "name", "grade", "section", "pfi", "csi", "risk",
    "gamesPlayed", "gamesAssigned", "engagement%", "daysActive", "coach",
  ];
  const rows = students.map((s) => [
    s.id, s.name, s.grade, s.section, s.pfi, s.csi, s.risk,
    s.gamesPlayed, s.gamesAssigned,
    Math.round((s.gamesPlayed / s.gamesAssigned) * 100),
    s.daysActive, s.coach,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printPdf() {
  window.print();
}
