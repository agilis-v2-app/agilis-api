import { z } from 'zod'
import { Types } from 'mongoose'

export const createTaskSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Task name is required.')
      .max(255, 'Task name must be at most 255 characters.'),
    description: z.string().optional(),
    status: z.enum(['todo', 'pending', 'done'], {
      message: 'Status must be one of: todo, pending, done.'
    }),
    dueDate: z.iso.datetime('Due date must be a valid ISO format date.')
  }),
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const updateTaskSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Task name is required.')
      .max(255, 'Task name must be at most 255 characters.')
      .optional(),
    description: z.string().nullable().optional(),
    status: z
      .enum(['todo', 'pending', 'done'], {
        message: 'Status must be one of: todo, pending, done.'
      })
      .optional(),
    dueDate: z.iso
      .datetime('Due date must be a valid ISO format date.')
      .optional()
  }),
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.'),
    taskId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Task ID.')
  })
})

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.'),
    taskId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Task ID.')
  })
})

export const getTaskSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.'),
    taskId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Task ID.')
  })
})

export const getProjectTasksSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})

export const assignTaskSchema = z.object({
  body: z.object({
    assigneeId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid assignee ID.')
  }),
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.'),
    taskId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Task ID.')
  })
})

export const unassignTaskSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.'),
    taskId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Task ID.')
  })
})

export const getMyTasksInProjectSchema = z.object({
  params: z.object({
    id: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid Project ID.')
  })
})
