'use server'

import { getDataService } from "@/lib/data/factory";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { join } from "path";

import { QuoteConfig, Event, User, EventMenuItem } from "@/lib/data/types";

// Remove local QuoteConfig interface since it's now in types


const DEFAULT_QUOTE_CONFIG: QuoteConfig = {
    depositType: 'percentage',
    depositAmount: 50, // 50%
    sectionsOrder: ['header', 'details', 'menu', 'staff', 'equipment', 'terms', 'payment'],
    editableFields: [],
    showImages: true,
    showDescription: true,
    showTotals: true,
    allowClientEdit: false,
    requireDeposit: true
};

export async function getQuoteData(eventId: number) {
    const service = getDataService();
    const event = await service.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    const [client, menuItems, staff, equipment] = await Promise.all([
        event.clientId ? service.getUser(event.clientId) : null,
        service.getEventMenuItems(eventId),
        service.getEventStaff(eventId),
        service.getEventEquipment(eventId)
    ]);

    // Parse the JSON config if it exists, otherwise return default
    const config: QuoteConfig = event.quoteConfig ? (typeof event.quoteConfig === 'string' ? JSON.parse(event.quoteConfig) : event.quoteConfig) : DEFAULT_QUOTE_CONFIG;

    return {
        event,
        client,
        items: {
            menu: menuItems,
            staff,
            equipment
        },
        config,
        token: (event as any).quoteToken
    };
}

export async function updateQuoteConfig(eventId: number, config: Partial<QuoteConfig>) {
    const service = getDataService();
    // Fetch current config to merge
    const currentData = await getQuoteData(eventId);
    const newConfig = { ...currentData.config, ...config };

    // We need to implement a generic updateEvent method in IDataService if it doesn't support partial updates well, 
    // but typically we can use the existing update mechanism.
    // However, since `quoteConfig` is a new field, we might need to ensure the service layer supports passing it.
    // For now, assuming we will add `updateEventQuote` or similar to the service, or just use raw Update if available.
    // Since IDataService might not have this field exposed in its interface yet, we'll cast or need to update the service interface.

    // TEMPORARY: Direct update via service if supported, otherwise we might need to patch the service.
    // checking data service capabilities...

    await service.updateEvent(eventId, {
        quoteConfig: newConfig
    });

    revalidatePath(`/dashboard/events/${eventId}/quote`);
    return { success: true, config: newConfig };
}

export async function publishQuote(eventId: number) {
    const service = getDataService();
    const token = randomUUID();

    await service.updateEvent(eventId, {
        status: 'quote',
        quoteToken: token,
        quoteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days default
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, token };
}

export async function getQuoteByToken(token: string) {
    const service = getDataService();
    const event = service.getEventByToken ? await service.getEventByToken(token) : null;

    if (!event) return null;

    // Check expiration
    if (event.quoteExpiresAt && new Date(event.quoteExpiresAt) < new Date()) {
        throw new Error('Quote has expired');
    }

    // Reuse getQuoteData logic but we need event ID.
    // Since getQuoteData relies on ID, we can just call it now that we have the event.
    return getQuoteData(event.id);
}

export async function uploadPaymentProof(token: string, formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file uploaded' };

    const quoteData = await getQuoteByToken(token);
    if (!quoteData) return { success: false, error: 'Invalid token' };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists (assuming public/uploads exists from README structure)
        const fileName = `payment_proof_${quoteData.event.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const path = join(process.cwd(), 'public', 'uploads', fileName);

        await writeFile(path, buffer);

        const publicUrl = `/uploads/${fileName}`;

        // Update config to store proof URL
        const service = getDataService();
        const currentConfig = quoteData.config;

        await service.updateEvent(quoteData.event.id, {
            quoteConfig: {
                ...currentConfig,
                paymentProofUrl: publicUrl,
                paymentProofUploadedAt: new Date().toISOString()
            },
            status: 'approved' // Auto-approve event upon payment proof
        });

        revalidatePath(`/portal/quotes/${token}`);
        revalidatePath(`/dashboard/events/${quoteData.event.id}`);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Upload failed:', error);
        return { success: false, error: 'Upload failed' };
    }
}

import { sendEmail } from '@/lib/services/email';

export async function sendQuoteEmail(eventId: number) {
    const quoteData = await getQuoteData(eventId);
    if (!quoteData || !quoteData.token) return { success: false, error: 'Quote not published' };

    const eventName = quoteData.event.name;
    const clientEmail = (quoteData.client as any)?.email;
    if (!clientEmail) return { success: false, error: 'Client has no email' };

    const link = `https://catering-app.vercel.app/portal/quotes/${quoteData.token}`; // TODO: Use env var for base URL

    const html = `
    <div style="font-family: sans-serif; max-w-600px; margin: 0 auto; color: #333;">
        <div style="background: #111; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>Proposal for ${eventName}</h1>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
            <p>Dear ${quoteData.client?.name || 'Client'},</p>
            <p>We are pleased to present the catering proposal for your upcoming event.</p>
            <p><strong>Event:</strong> ${eventName}<br>
            <strong>Date:</strong> ${new Date(quoteData.event.startDate || '').toLocaleDateString()}</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Proposal</a>
            </div>
            
            <p style="color: #666; font-size: 0.9em;">Please review the details and accept the proposal to secure your date.</p>
        </div>
    </div>
    `;

    const result = await sendEmail({
        to: clientEmail,
        subject: `Proposal: ${eventName}`,
        html
    });

    if (result.success) {
        // Optional: Update status to 'sent' or log it
        return { success: true };
    } else {
        return { success: false, error: 'Failed to send email' };
    }
}
