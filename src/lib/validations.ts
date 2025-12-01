import { z } from 'zod';

// Auth validation schema
export const authSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .trim()
    .toLowerCase()
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
});

export type AuthFormData = z.infer<typeof authSchema>;

// Profile validation schema
export const profileSchema = z.object({
  display_name: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .trim(),
  krump_name: z.string()
    .min(1, 'Krump name is required')
    .max(50, 'Krump name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Krump name can only contain letters, numbers, and spaces')
    .trim()
    .optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .trim()
    .optional(),
  instagram_handle: z.string()
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, 'Invalid Instagram handle format')
    .trim()
    .optional()
    .or(z.literal('')),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  rank: z.enum(['new_boot', 'young', 'jr', 'sr', 'og']),
  call_out_status: z.enum(['ready_for_smoke', 'labbin']),
  battle_wins: z.number().int().min(0).default(0),
  battle_losses: z.number().int().min(0).default(0),
  battle_draws: z.number().int().min(0).default(0),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Battle challenge validation schema
export const battleChallengeSchema = z.object({
  message: z.string()
    .max(500, 'Challenge message must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type BattleChallengeFormData = z.infer<typeof battleChallengeSchema>;

// Event validation schema
export const eventSchema = z.object({
  name: z.string()
    .min(1, 'Event name is required')
    .max(200, 'Event name must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  location_name: z.string()
    .min(1, 'Location name is required')
    .max(200, 'Location must be less than 200 characters')
    .trim(),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  registration_link: z.string()
    .url('Must be a valid URL')
    .max(500, 'URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type EventFormData = z.infer<typeof eventSchema>;

// Session validation schema
export const sessionSchema = z.object({
  name: z.string()
    .min(1, 'Session name is required')
    .max(200, 'Session name must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  location_name: z.string()
    .min(1, 'Location name is required')
    .max(200, 'Location must be less than 200 characters')
    .trim(),
  rules: z.string()
    .max(1000, 'Rules must be less than 1000 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  duration_minutes: z.number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration must be less than 8 hours'),
  max_participants: z.number()
    .int()
    .min(2, 'Must allow at least 2 participants')
    .max(100, 'Maximum 100 participants allowed')
    .optional(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

// Rating validation schema
export const ratingSchema = z.object({
  comments: z.string()
    .max(500, 'Comments must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  floor_quality: z.number().int().min(1).max(10),
  safety: z.number().int().min(1).max(10),
  equipment: z.number().int().min(1).max(10),
});

export type RatingFormData = z.infer<typeof ratingSchema>;

// Fam challenge validation schema
export const famChallengeSchema = z.object({
  challenge_text: z.string()
    .min(1, 'Challenge text is required')
    .max(1000, 'Challenge text must be less than 1000 characters')
    .trim(),
});

export type FamChallengeFormData = z.infer<typeof famChallengeSchema>;
