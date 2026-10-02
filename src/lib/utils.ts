import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitize<T,>(docs: T[]): T[] {
  return JSON.parse(JSON.stringify(docs));
}