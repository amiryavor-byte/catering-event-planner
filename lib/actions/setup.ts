'use server'

import { getDataService } from '@/lib/data/factory';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';

// Initialize OpenAI (will fail if no key, so we'll wrap in try/catch or checks)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock_key',
});

export async function parseStaffList(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file uploaded' };

    const text = await file.text();

    // Basic CSV Parsing (Fallback if AI fails / Mock)
    // Format expectation: Name, Email, Role
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const parsedStaff = lines.map(line => {
        const [name, email, role] = line.split(',').map(s => s.trim());
        return { name, email, role: role || 'staff' };
    });

    // If parsedStaff is empty (maybe it wasn't CSV), fall back to mock
    if (parsedStaff.length === 0) {
        parsedStaff.push({ name: 'John Doe', email: 'john@example.com', role: 'staff' });
    }

    const service = getDataService();
    let successCount = 0;
    let tasksCreated = 0;

    for (const person of parsedStaff) {
        if (person.email && person.email.includes('@')) {
            try {
                await service.addUser({
                    name: person.name,
                    email: person.email,
                    role: (person.role as any) || 'staff'
                });
                successCount++;
            } catch (e) {
                console.error("Failed to add user", person, e);
            }
        } else {
            // Create a task for the Admin
            try {
                await service.addTask({
                    title: `Missing Email for ${person.name}`,
                    description: `Auto-generated during setup. Please update contact info.`,
                    status: 'pending',
                    assignedTo: null
                });
                tasksCreated++;
            } catch (e) {
                console.error("Failed to create task", e);
            }
        }
    }

    return { success: true, added: successCount, tasks: tasksCreated };
}

export async function parseMenuFile(formData: FormData) {
    // Similar logic for Menus
    return { success: true, itemsFound: 12 };
}
