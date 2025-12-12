import { ValidationError, validate } from 'class-validator';

export async function validateDto<T>(dtoClass: new () => T, data: any): Promise<{
  valid: boolean; validData?: T; errors?: any[] 
}> 
{
  const dto = new dtoClass();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      (dto as any)[key] = data[key];
    }
  }

  const validationErrors = await validate(dto as object);
  
  if (validationErrors.length > 0) {
    const errors = validationErrors.map(error => ({
      field: error.property,
      message: Object.values(error.constraints || {}).join(', '),
      value: error.value
    }));

    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    validData: dto as T
  };
}