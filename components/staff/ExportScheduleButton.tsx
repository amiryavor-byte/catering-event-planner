'use client';

import { downloadMyScheduleIcs } from '@/lib/actions/calendar';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ExportScheduleButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const icsData = await downloadMyScheduleIcs();
            if (!icsData) {
                alert("No scheduled work found to export.");
                return;
            }

            const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my_schedule.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(error);
            alert("Failed to export schedule.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors"
        >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Sync Calendar
        </button>
    );
}
