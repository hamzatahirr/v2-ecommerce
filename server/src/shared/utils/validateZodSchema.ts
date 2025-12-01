import { z } from 'zod';

export async function validateZodSchema<T>(schema: z.ZodSchema<T>, data: any): Promise<{ valid: boolean; validData?: T; errors?: any[] }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return {
      valid: true,
      validData: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: (err as any).received
      }));

      return {
        valid: false,
        errors
      };
    }

    return {
      valid: false,
      errors: [{ message: 'Validation failed' }]
    };
  }
}