import { z } from 'zod';

export const eventStatusEnum = z.enum(["inquiry", "quote", "approved", "active", "completed"]);
export const eventTypeEnum = z.enum(["wedding", "corporate", "bar_mitzvah", "bat_mitzvah", "bris", "baby_naming", "shiva", "shabbat", "holiday_party", "fundraiser", "other"]);

export const insertEventSchema = z.object({
    name: z.string().min(1, "Name is required"),
    clientId: z.number().int().positive().optional(),
    status: eventStatusEnum.default("inquiry"),
    eventType: eventTypeEnum.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isOutdoors: z.boolean().default(false),
    location: z.string().optional(),
    guestCount: z.number().int().positive().optional(),
    dietaryRequirements: z.string().optional(),
    estimatedBudget: z.number().positive().optional(),
    depositPaid: z.number().positive().optional(),
    notes: z.string().optional(),
});

export const selectEventSchema = insertEventSchema.extend({
    id: z.number().int(),
    createdAt: z.string().nullable(),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type SelectEvent = z.infer<typeof selectEventSchema>;
