"use client";

import { Mail } from "lucide-react";
import { sendEventSchedule } from "@/lib/actions/notifications";
import { useState } from "react";

interface EmailScheduleButtonProps {
    eventId: number;
}

export default function EmailScheduleButton({ eventId }: EmailScheduleButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!confirm("Are you sure you want to email the schedule to all assigned staff?")) return;

        setLoading(true);
        try {
            const result = await sendEventSchedule(eventId);
            if (result.success) {
                alert(result.message);
            } else {
                alert("Error: " + result.message);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to send emails.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSend}
            disabled={loading}
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-2"
        >
            <Mail size={14} />
            {loading ? "Sending..." : "Email Schedule"}
        </button>
    );
}
