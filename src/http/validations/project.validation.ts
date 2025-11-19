import { z } from 'zod'
import { Types } from 'mongoose'

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Project name is required.')
      .max(50, 'Project name must be at most 50 characters.'),
    description: z
      .string()
      .max(500, 'Project description must be at most 500 characters.')
      .optional()
  })
})

export const updateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Project name is required.')
      .max(255, 'Project name must be at most 255 characters.')
      .optional(),
    description: z.string().nullable().optional()
  }),
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const deleteProjectSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const getProjectByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const addProjectMemberSchema = z.object({
  body: z.object({
    memberId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Member ID.')
  }),
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const removeProjectMemberSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.'),
    memberId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Member ID.')
  })
})

export const getProjectsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val >= 1,
        'Page must be a valid positive integer.'
      )
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val >= 1 && val <= 100,
        'Limit must be a valid integer between 1 and 100.'
      )
      .optional()
  })
})
