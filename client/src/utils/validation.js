import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  clientId: z.string().min(1, 'Client is required'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
});

export const projectRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assetLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'awaiting_assets', 'in_progress', 'in_review', 'paid', 'declined']),
});

export const bulkUpdateStatusSchema = z.object({
  projectIds: z.array(z.string()).min(1, 'At least one project ID required'),
  status: z.enum(['pending', 'awaiting_assets', 'in_progress', 'in_review', 'paid', 'declined']),
});

export const bulkArchiveSchema = z.object({
  projectIds: z.array(z.string()).min(1, 'At least one project ID required'),
});

// Bulk client creation validation
export const bulkClientSchema = z.object({
  csvData: z.string().min(1, 'CSV data is required'),
});

// CSV row validation
export const clientRowSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Onboarding validation
export const onboardingSchema = z.object({
  studioName: z.string().min(2, 'Studio name must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization must be at least 2 characters'),
});

// Helper function to validate and return errors or data
export const validateForm = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = {};
    result.error.errors.forEach((error) => {
      errors[error.path[0]] = error.message;
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
};
