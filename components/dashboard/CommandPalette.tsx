"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";

import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, School, FileBarChart, Settings, GraduationCap, ClipboardCheck, Gamepad2, MessageSquarePlus } from "lucide-react";
import { STUDENTS } from "@/data/mockData";
import { toast } from "sonner";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 0);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search students, pages, actions…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => go(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go(() => router.push("/students"))}>
            <Users className="mr-2 h-4 w-4" /> Students
          </CommandItem>
          <CommandItem onSelect={() => go(() => router.push("/classroom"))}>
            <School className="mr-2 h-4 w-4" /> Classroom
          </CommandItem>
          <CommandItem onSelect={() => go(() => router.push("/reports"))}>
            <FileBarChart className="mr-2 h-4 w-4" /> Reports
          </CommandItem>
          <CommandItem onSelect={() => go(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go(() => toast.success("Attendance opened"))}>
            <ClipboardCheck className="mr-2 h-4 w-4" /> Take attendance
          </CommandItem>
          <CommandItem onSelect={() => go(() => toast.success("Focus Game launched"))}>
            <Gamepad2 className="mr-2 h-4 w-4" /> Start focus game
          </CommandItem>
          <CommandItem onSelect={() => go(() => toast.success("Parent update composer opened"))}>
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Send parent update
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Students">
          {STUDENTS.slice(0, 24).map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.name} ${s.grade} ${s.section}`}
              onSelect={() => go(() => router.push(`/students/${s.id}?tab=overview`))}
            >
              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.grade} · {s.section}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
