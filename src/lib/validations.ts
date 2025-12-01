import { z } from 'zod';

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
