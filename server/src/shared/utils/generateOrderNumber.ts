/**
 * Generates a unique order number
 * Format: ORD-YYYYMMDD-XXXXXX (e.g., ORD-20240115-A1B2C3)
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `ORD-${year}${month}${day}-${randomPart}`;
}

