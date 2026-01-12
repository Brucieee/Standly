import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  // Handle YYYY-MM-DD string directly to avoid timezone issues
  if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-');
    return `${month}-${day}-${year}`;
  }
  
  // Fallback for Date objects or other formats
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
};

export const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  // Assumes HH:mm or HH:mm:ss format
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  const [hoursStr, minutesStr] = parts;
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};