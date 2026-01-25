import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type EmailOptions = {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
};

export async function sendEmail({ to, subject, html, from = 'Catering App <onboarding@resend.dev>' }: EmailOptions) {
    if (!resend) {
        console.log(`[MOCK EMAIL SERVICE]
        To: ${Array.isArray(to) ? to.join(', ') : to}
        Subject: ${subject}
        From: ${from}
        Content: ${html.substring(0, 100)}... (truncated)
        `);
        return { success: true, id: 'mock-id-' + Date.now() };
    }

    try {
        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        if (data.error) {
            console.error('Resend Error:', data.error);
            return { success: false, error: data.error };
        }

        return { success: true, id: data.data?.id };
    } catch (error) {
        console.error('Email Send Exception:', error);
        return { success: false, error };
    }
}
