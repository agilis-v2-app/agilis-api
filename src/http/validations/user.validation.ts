import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long.')
      .max(32, 'Username must be at most 32 characters long.')
      .trim()
      .refine(
        (val) => /^[a-zA-Z0-9]+$/.test(val),
        'Username must contain only alphanumeric characters (letters and numbers).'
      )
      .optional(),
    email: z.email().optional()
  })
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters')
  })
})
