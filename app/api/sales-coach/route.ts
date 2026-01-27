
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only if key exists
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export async function POST(req: Request) {
    try {
        const { message, currentPitch } = await req.json();

        // 1. Try Real OpenAI
        if (openai) {
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        {
                            role: "system", content: `You are an expert Sales Coach for a catering software business. Your goal is to help the user brainstorm and refine their sales pitch. 
                        
                        THE SOFTWARE FEATURES (Use these to tailor the pitch):
                        - **turnkey White-Label Platform:** Self-hosted on client's infrastructure (Data Ownership).
                        - **SmartTable Technology:** Multi-select, parallel bulk deletion, high-performance data grids.
                        - **Kitchen Display System (KDS):** Real-time, secured, dynamic scaling for focused prep.
                        - **Interactive Business Plan:** 60-month exponential growth modeling, scenario planning.
                        - **Staff Portal:** Availability tracking, shift scheduling, and task management.
                        - **AI Extraction Engine:** Automates onboarding by extracting menu data from files.
                        - **Strategic Dashboard:** Popover version history, role-based access (Amir/David modes).
                        - **Financials:** Built-in profit margin calculators, ingredient tracking, and proposal generation.

                        INSTRUCTIONS:
                        - Ask clarifying questions about the prospect (Restaurant vs Renter vs Onsite).
                        - Provide punchy, persuasive variations of the pitch based on the user's answers.
                        - Be concise, professional yet conversational.` },
                        { role: "user", content: `My current pitch is: "${currentPitch}". \n\nUser input: ${message}` }
                    ],
                    model: "gpt-3.5-turbo",
                });
                return NextResponse.json({ reply: completion.choices[0].message.content });
            } catch (apiError) {
                console.error("OpenAI API failed, falling back to mock:", apiError);
                // Fallthrough to mock
            }
        }

        // 2. Mock Fallback (Robust Simulation)
        await new Promise(r => setTimeout(r, 800)); // Fake latency

        const lowerMsg = message.toLowerCase();
        let reply = "I can help with that! Could you tell me more about their setup? Do they have a restaurant?";

        if (lowerMsg.includes('restaurant') || lowerMsg.includes('owner')) {
            reply = "For **Restaurant Owners**, emphasize 'Revenue Expansion'. \n\nTry this: \"You already have the kitchen and staff. Our system lets you add a high-margin catering revenue stream without chaos. It's a one-time setup fee, no monthly commissions, and it runs on your own domain so you build YOUR brand, not ours.\"";
        } else if (lowerMsg.includes('rent') || lowerMsg.includes('kitchen') || lowerMsg.includes('commissary')) {
            reply = "For **Kitchen Renters**, focus on 'Efficiency & Speed'. \n\nTry this: \"Every hour you rent the kitchen costs money. Our system automates the prep lists and packing sheets so your team hits the ground running the second they clock in. You'll stick to the timeline and stop wasting rental fees on disorganized prep.\"";
        } else if (lowerMsg.includes('onsite') || lowerMsg.includes('venue')) {
            reply = "For **Onsite/Venue Caterers**, focus on 'Professionalism'. \n\nTry this: \"Your clients expect perfection. Our system ensures no allergy is missed and every BEO is accurate. Plus, because you own the software, your client data is 100% yours—forever.\"";
        } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
            reply = "It's a one-time licensing fee (typically $3k-$5k) plus a separate hosting cost (~$200/mo). This prevents 'SaaS fatigue' where you pay forever for software you don't own. With us, you invest once and own the capability.";
        }

        return NextResponse.json({ reply });

    } catch (error) {
        return NextResponse.json({ reply: "I'm having a brain freeze. Try asking again!" }, { status: 500 });
    }
}
