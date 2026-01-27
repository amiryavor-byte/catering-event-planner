'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { Event, User, EventMenuItem, QuoteConfig } from '@/lib/data/types';

interface QuoteData {
    event: Event;
    client: User | null;
    items: {
        menu: EventMenuItem[];
        staff: any[];
        equipment: any[];
    };
    config: QuoteConfig;
}

export function DownloadQuotePdfButton({ data, className }: { data: QuoteData; className?: string }) {
    const [generating, setGenerating] = useState(false);

    function generatePDF() {
        setGenerating(true);
        try {
            const doc = new jsPDF();

            // --- HEADER ---
            doc.setFillColor(33, 33, 33); // Dark Gray Background
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text('CATERING PROPOSAL', 15, 20); // Title

            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.text('Jewish Ingenuity Catering', 15, 30);

            // --- INFO GRID ---
            const startY = 50;
            doc.setTextColor(0, 0, 0);

            // Column 1: Event Info
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Event Details', 15, startY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Event: ${data.event.name}`, 15, startY + 7);
            doc.text(`Date: ${new Date(data.event.startDate || '').toLocaleDateString()}`, 15, startY + 12);
            doc.text(`Guests: ${data.event.guestCount || 'TBD'}`, 15, startY + 17);

            // Column 2: Client Info
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Client Details', 110, startY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Name: ${data.client?.name || 'Valued Client'}`, 110, startY + 7);
            doc.text(`Email: ${(data.client as any)?.email || 'N/A'}`, 110, startY + 12);

            // --- MENU TABLE ---
            // Prepare table data
            const tableRows = data.items.menu.map(item => [
                item.menuItemName || 'Unknown',
                item.description || '',
                item.quantity,
                `$${(item.priceOverride ?? item.basePrice ?? 0).toFixed(2)}`,
                `$${((item.priceOverride ?? item.basePrice ?? 0) * item.quantity).toFixed(2)}`
            ]);

            // Calculate total for footer
            const menuTotal = data.items.menu.reduce((sum, item) => sum + ((item.priceOverride ?? item.basePrice ?? 0) * item.quantity), 0);

            autoTable(doc, {
                startY: startY + 30,
                head: [['Item', 'Description', 'Qty', 'Unit Price', 'Total']],
                body: tableRows,
                headStyles: { fillColor: [16, 185, 129] }, // Emerald Green
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 40 },
                    1: { cellWidth: 70 },
                    4: { halign: 'right' }
                },
            });

            // --- TOTALS ---
            // @ts-expect-error - jspdf plugin types
            const finalY = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(10);
            doc.text('Subtotal:', 140, finalY);
            doc.setFont('helvetica', 'bold');
            doc.text(`$${menuTotal.toLocaleString()}`, 195, finalY, { align: 'right' });

            const deposit = data.config.depositType === 'percentage'
                ? menuTotal * (data.config.depositAmount / 100)
                : data.config.depositAmount;

            doc.setFont('helvetica', 'normal');
            doc.text(`Deposit Required (${data.config.depositType === 'percentage' ? data.config.depositAmount + '%' : 'Fixed'}):`, 140, finalY + 7);
            doc.setFont('helvetica', 'bold');
            doc.text(`$${deposit.toLocaleString()}`, 195, finalY + 7, { align: 'right' });

            // --- FOOTER / TERMS ---
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'italic');
            doc.text('This proposal is valid for 7 days. Please accept via the online portal to secure your date.', 105, 280, { align: 'center' });

            // Save
            const safeName = data.event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            doc.save(`proposal_${safeName}.pdf`);

        } catch (err) {
            console.error(err);
            alert('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    }

    return (
        <button
            onClick={generatePDF}
            disabled={generating}
            className={className || "flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm border border-white/5 transition-colors"}
        >
            <Download size={16} />
            <span className="hidden sm:inline">{generating ? 'Generating...' : 'Download PDF'}</span>
        </button>
    );
}
