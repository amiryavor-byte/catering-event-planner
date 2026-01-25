'use server'

import { getDataService } from '@/lib/data/factory';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import * as XLSX from 'xlsx';
// pdf-parse will be imported dynamically

// Initialize OpenAI lazily
let openaiInstance: OpenAI | null = null;
function getOpenAI() {
    if (openaiInstance) return openaiInstance;
    openaiInstance = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
    });
    return openaiInstance;
}

interface ParsedStaffMember {
    name: string;
    email: string;
    role?: string;
    phone?: string;
}

export async function parseStaffList(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file uploaded' };

    try {
        let textContent = '';
        const fileName = file.name.toLowerCase();

        // Handle XLSX files
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            textContent = XLSX.utils.sheet_to_csv(firstSheet);
        } else {
            // Handle CSV/TXT files
            textContent = await file.text();
        }

        if (!textContent.trim()) {
            return { success: false, error: 'File is empty' };
        }

        let parsedStaff: ParsedStaffMember[] = [];

        // Try AI parsing first if OpenAI key is available
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '') {
            try {
                const aiResult = await parseWithAI(textContent);
                if (aiResult && aiResult.length > 0) {
                    parsedStaff = aiResult;
                    console.log(`✅ AI parsed ${parsedStaff.length} staff members`);
                }
            } catch (aiError) {
                console.warn('AI parsing failed, falling back to basic parsing:', aiError);
                parsedStaff = basicParse(textContent);
            }
        } else {
            // No OpenAI key, use basic parsing
            console.log('No OpenAI key found, using basic CSV parsing');
            parsedStaff = basicParse(textContent);
        }

        // Validate we have staff to process
        if (parsedStaff.length === 0) {
            return { success: false, error: 'No staff members found in file' };
        }

        // Save to database
        const service = getDataService();
        let successCount = 0;
        let tasksCreated = 0;
        const errors: string[] = [];

        for (const person of parsedStaff) {
            if (person.email && person.email.includes('@')) {
                try {
                    await service.addUser({
                        name: person.name || 'Unknown',
                        email: person.email,
                        role: (person.role as any) || 'staff',
                        status: 'active'
                    });
                    successCount++;
                } catch (e) {
                    console.error('Failed to add user:', person, e);
                    errors.push(`Failed to add ${person.name}`);
                }
            } else {
                // Create a task for entries with missing/invalid email
                try {
                    await service.addTask({
                        title: `Complete Info for ${person.name || 'Staff Member'}`,
                        description: `Imported during setup but missing valid email. Phone: ${person.phone || 'N/A'}`,
                        status: 'pending',
                        assignedTo: null
                    });
                    tasksCreated++;
                } catch (e) {
                    console.error('Failed to create task:', e);
                }
            }
        }

        try {
            revalidatePath('/dashboard/users');
        } catch (e) {
            console.warn('revalidatePath skipped (non-Next context)');
        }

        return {
            success: true,
            added: successCount,
            tasks: tasksCreated,
            total: parsedStaff.length,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (error) {
        console.error('Error parsing staff list:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

async function parseWithAI(content: string): Promise<ParsedStaffMember[]> {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a data extraction assistant. Extract staff information from the provided text/CSV data.
Return a JSON array of objects with these fields:
- name (string, required): Full name of the person.
- email (string, required if available): Professional email address.
- role (string, optional): One of "chef", "server", "manager", "staff", "admin", "bartender", "dishwasher".
- phone (string, optional): Phone number in any readable format.

Handle various column orders and formats. Be flexible with column names (e.g., "Name", "Full Name", "Employee Name" are all name fields).
If a field is missing, provide an empty string for required fields (like email) or omit optional ones.
For the "role" field, map whatever title is given to the closest category from the list above.
Return ONLY valid JSON, no markdown or explanations.`
            },
            {
                role: 'user',
                content: `Extract staff data from this:\n\n${content.substring(0, 4000)}`
            }
        ],
        temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content || '[]';

    // Clean potential markdown formatting
    const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedResult);
}

function basicParse(content: string): ParsedStaffMember[] {
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    if (lines.length === 0) return [];

    // Try to detect if first line is a header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('name') || firstLine.includes('email') || firstLine.includes('role');
    const startIndex = hasHeader ? 1 : 0;

    const staff: ParsedStaffMember[] = [];

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',').map(s => s.trim().replace(/['"]/g, ''));

        if (parts.length < 2) continue; // Need at least name and email

        // Assume format: Name, Email, Role (or Name, Email)
        staff.push({
            name: parts[0] || 'Unknown',
            email: parts[1] || '',
            role: parts[2] || 'staff',
            phone: parts[3] || undefined
        });
    }

    return staff;
}

interface ParsedMenuItem {
    name: string;
    description: string;
    category: string;
    ingredients: string[];
}

export async function parseMenuFile(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file uploaded' };

    try {
        const fileName = file.name.toLowerCase();
        const isImage = fileName.endsWith('.png') || fileName.endsWith('.jpg') ||
            fileName.endsWith('.jpeg') || fileName.endsWith('.webp');
        const isPDF = fileName.endsWith('.pdf');
        const isText = fileName.endsWith('.txt') || fileName.endsWith('.md');

        if (!isImage && !isPDF && !isText) {
            return { success: false, error: 'Invalid file type. Please upload PDF, image, or text files.' };
        }

        // Convert file to base64 for OpenAI Vision API
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');

        // Determine MIME type
        let mimeType = file.type;
        if (!mimeType) {
            if (isPDF) mimeType = 'application/pdf';
            else if (fileName.endsWith('.png')) mimeType = 'image/png';
            else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
            else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
        }

        // Check if OpenAI key is available
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
            return { success: false, error: 'AI service not configured. Please contact administrator.' };
        }

        let parsedItems: ParsedMenuItem[] = [];

        try {
            if (isPDF) {
                // Extract text from PDF and parse with LLM
                const text = await extractTextFromPDF(buffer);
                if (!text || text.trim().length === 0) {
                    throw new Error('No text found in PDF');
                }
                parsedItems = await parseMenuText(text);
            } else if (isText) {
                // Handle text files directly
                const text = await file.text();
                parsedItems = await parseMenuText(text);
            } else {
                // Use Vision API for images
                parsedItems = await parseMenuWithAI(base64, mimeType);
            }
            console.log(`✅ AI parsed ${parsedItems.length} menu items`);
        } catch (aiError) {
            console.error('AI menu parsing failed:', aiError);
            return {
                success: false,
                error: 'Failed to extract menu data. If this is a scanned PDF, please convert it to an image (JPG/PNG) and try again.'
            };
        }

        if (parsedItems.length === 0) {
            return { success: false, error: 'No menu items found in the file. Please check the file quality.' };
        }

        // Save menu items to database
        const service = getDataService();
        let itemsCreated = 0;
        let tasksCreated = 0;
        const errors: string[] = [];

        for (const item of parsedItems) {
            try {
                // Add menu item
                const menuItem = await service.addMenuItem({
                    name: item.name,
                    description: item.description || null,
                    category: item.category || 'Uncategorized',
                    basePrice: null // Will be calculated from ingredients or set manually
                });
                itemsCreated++;

                // Create tasks for predicted ingredients that need to be added to inventory
                if (item.ingredients && item.ingredients.length > 0) {
                    const ingredientsList = item.ingredients.join(', ');
                    await service.addTask({
                        title: `Add Ingredients for "${item.name}"`,
                        description: `Predicted ingredients: ${ingredientsList}. Add these to inventory and link to this menu item.`,
                        status: 'pending',
                        assignedTo: null
                    });
                    tasksCreated++;
                }
            } catch (e) {
                console.error('Failed to add menu item:', item, e);
                errors.push(`Failed to add ${item.name}`);
            }
        }

        try {
            revalidatePath('/dashboard');
            revalidatePath('/dashboard/menus');
        } catch (e) {
            console.warn('revalidatePath skipped (non-Next context)');
        }

        return {
            success: true,
            itemsFound: itemsCreated,
            total: parsedItems.length,
            tasksCreated,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (error) {
        console.error('Error parsing menu file:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

async function parseMenuWithAI(base64Data: string, mimeType: string): Promise<ParsedMenuItem[]> {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are an expert menu extraction assistant. Extract all menu items from the provided menu image/PDF.
Return a JSON array of objects with these fields:
- name (string, required): The dish name.
- description (string, optional): A clear, concise description of the dish.
- category (string, required): One of "Appetizer", "Main Course", "Dessert", "Beverage", "Salad", "Soup", "Side Dish", "KSDS".
- ingredients (string array, optional): List of 3-7 probable main ingredients based on the dish name and description. Be specific (e.g., "Salmon", "Rosemary", "Garlic" instead of just "Seasoning").

Rules:
1. Extract ALL items you can find.
2. If a dish fits multiple categories, pick the primary one.
3. If ingredients aren't listed, use your culinary knowledge to predict the most likely main ingredients.
4. Group items logically.
5. Return ONLY valid JSON, no markdown or explanations.`
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Extract all menu items from this menu:'
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`
                        }
                    }
                ]
            }
        ],
        temperature: 0.3,
        max_tokens: 4096
    });

    const result = completion.choices[0]?.message?.content || '[]';

    // Clean potential markdown formatting
    const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedResult);
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        // @ts-ignore
        const pdfLib = await import('pdf-parse');
        // Handle both CJS function export and ESM class export patterns
        if (typeof (pdfLib as any).default === 'function') {
            const data = await (pdfLib as any).default(buffer);
            return data.text;
        } else if ((pdfLib as any).PDFParse) {
            const parser = new pdfLib.PDFParse({ data: buffer });
            const data = await parser.getText();
            return data.text;
        } else {
            throw new Error('Unsupported pdf-parse export structure');
        }
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to parse PDF file');
    }
}

async function parseMenuText(text: string): Promise<ParsedMenuItem[]> {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Text model is sufficient here
        messages: [
            {
                role: 'system',
                content: `You are a menu data extraction assistant. Extract all menu items from the provided menu text.
Return a JSON array of objects with these fields:
- name (string, required): The dish name
- description (string, optional): Brief description of the dish
- category (string, required): Category like "Appetizer", "Main Course", "Dessert", "Beverage", "Salad", "Soup", etc.
- ingredients (string array, optional): List of probable main ingredients.

Be thorough. If the text looks messy (OCR artifacts), do your best to reconstruct valid menu items.
Return ONLY valid JSON, no markdown.`
            },
            {
                role: 'user',
                content: `Extract menu items from this text:\n\n${text.substring(0, 15000)}` // Limit text length just in case
            }
        ],
        temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content || '[]';
    const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResult);
}

