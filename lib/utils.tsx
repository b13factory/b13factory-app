import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Format currency to Rupiah
export function formatCurrency(amount: number | string): string {
  const number = parseFloat(String(amount)) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// Format date to Indonesian format
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Format date for input fields
export function formatDateInput(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}