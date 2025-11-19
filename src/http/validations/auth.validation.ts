import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long.')
      .max(32, 'Username must be at most 32 characters long.')
      .trim()
      .refine(
        (val) => /^[a-zA-Z0-9]+$/.test(val),
        'Username must contain only alphanumeric characters (letters and numbers).'
      ),
    email: z.email('Invalid email format.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.')
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email format.'),
    password: z.string().min(1, 'Password is required.')
  })
})
