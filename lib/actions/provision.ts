'use server';

import { z } from 'zod';
import { provisionClient } from '../services/provisioning';
import * as path from 'path';

const ProvisionSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    user: z.string().min(1, 'User is required'),
    password: z.string().min(1, 'Password is required'),
    remotePath: z.string().min(1, 'Remote path is required'),
});

export type ProvisionState = {
    success?: boolean;
    message?: string;
    details?: Array<{ file: string; status: 'uploaded' | 'failed' | 'skipped'; error?: string; size?: number }>;
    errors?: {
        host?: string[];
        user?: string[];
        password?: string[];
        remotePath?: string[];
    };
};

export async function provisionClientAction(prevState: ProvisionState, formData: FormData): Promise<ProvisionState> {
    const validatedFields = ProvisionSchema.safeParse({
        host: formData.get('host'),
        user: formData.get('user'),
        password: formData.get('password'),
        remotePath: formData.get('remotePath'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation Failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { host, user, password, remotePath } = validatedFields.data;

    try {
        const phpApiPath = path.join(process.cwd(), 'php_api');

        const result = await provisionClient({
            host,
            user,
            password,
            remotePath,
        }, phpApiPath);

        return {
            success: result.success,
            message: result.message,
            details: result.files,
        };

    } catch (error) {
        return {
            success: false,
            message: `System Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}
