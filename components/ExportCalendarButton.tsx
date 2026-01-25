"use client";

import { Calendar } from "lucide-react";

import type { Event } from "@/lib/data/types";

interface ExportCalendarButtonProps {
    event: Event;
}

export default function ExportCalendarButton({ event }: ExportCalendarButtonProps) {
    const handleExport = () => {
        // Use the API route to download the ICS file
        window.location.href = `/api/calendar?eventId=${event.id}`;
    };

    return (
        <button
            onClick={handleExport}
            className="btn-secondary h-9 px-3 text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
            title="Export to Calendar"
        >
            <Calendar size={16} /> Export
        </button>
    );
}
