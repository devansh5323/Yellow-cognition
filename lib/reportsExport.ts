import type { Student } from "@/data/mockData";

// Columns below are limited to fields the real 16-student dataset actually
// has (id, name, ageGroup, parentName, studentHealthScore, and the
// cognitive-performance/wellbeing sub-scores). Grade/section/pfi/csi/risk/
// gamesPlayed/gamesAssigned/daysActive/coach have no real equivalent and are
// dropped rather than exported as fabricated values.
export function downloadCsv(students: Student[], filename = "yellow-report.csv") {
  const headers = [
    "id", "name", "ageGroup", "parentName", "studentHealthScore",
    "cognitivePerformance", "attentionAndFocus", "taskEngagement",
    "behaviourAndDiscipline", "instructionalFriction", "learningReadiness",
    "wellbeing",
  ];
  const rows = students.map((s) => [
    s.id,
    s.name,
    s.ageGroup,
    s.parentName,
    s.studentHealthScore,
    s.cognitivePerformance.score,
    s.cognitivePerformance.attentionAndFocus ?? "",
    s.cognitivePerformance.taskEngagement ?? "",
    s.cognitivePerformance.behaviourAndDiscipline ?? "",
    s.cognitivePerformance.instructionalFriction ?? "",
    s.cognitivePerformance.learningReadiness.score ?? "",
    s.studentWellbeing.score ?? "",
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
