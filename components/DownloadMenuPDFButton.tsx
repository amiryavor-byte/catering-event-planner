"use client";

import { FileDown, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils/cost-calculator";

import { MenuItem, RecipeItem } from "@/lib/data/types";

interface DownloadMenuPDFButtonProps {
    menuItem: MenuItem;
    recipe: RecipeItem[];
    totalCost: number;
}

export default function DownloadMenuPDFButton({ menuItem, recipe, totalCost }: DownloadMenuPDFButtonProps) {

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(menuItem.name, 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(menuItem.category || 'Uncategorized', 14, 28);

        // Description
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const splitDesc = doc.splitTextToSize(menuItem.description || "No description", 180);
        doc.text(splitDesc, 14, 38);

        let startY = 38 + (splitDesc.length * 5) + 10;

        // Ingredients Table
        const tableData = recipe.map(item => [
            item.ingredientName || 'Unknown Ingredient',
            `${item.amountRequired} ${item.unit || 'units'}`,
            formatCurrency(item.pricePerUnit || 0),
            formatCurrency((item.pricePerUnit || 0) * item.amountRequired)
        ]);

        autoTable(doc, {
            startY: startY,
            head: [['Ingredient', 'Qty / Unit', 'Unit Price', 'Line Cost']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            foot: [['', '', 'Total Cost:', formatCurrency(totalCost)]],
            footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
        });

        // Add Footer timestamp
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleDateString()} via Catering Planner`, 14, pageHeight - 10);

        doc.save(`${menuItem.name.replace(/\s+/g, '_')}_Spec.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="btn-secondary h-9 px-3 text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
            title="Download PDF Spec Sheet"
        >
            <FileDown size={16} /> Download PDF
        </button>
    );
}
