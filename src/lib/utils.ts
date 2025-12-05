import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, compact: boolean = true): string {
  if (compact && Math.abs(amount) >= 1000000) {
    // Format as millions (e.g., $42.35M)
    const millions = amount / 1000000
    return `$${millions.toFixed(2)}M`
  }
  if (compact && Math.abs(amount) >= 1000) {
    // Format as thousands (e.g., $150K)
    const thousands = amount / 1000
    return `$${thousands.toFixed(thousands >= 100 ? 0 : 1)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date))
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let size = bytes

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-emerald-500'
  if (confidence >= 0.7) return 'text-amber-500'
  return 'text-red-500'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    DEADLINE: 'bg-red-50 text-red-800',
    PAYMENT: 'bg-green-50 text-green-800',
    SCOPE: 'bg-blue-50 text-blue-800',
    RESPONSIBILITY: 'bg-purple-50 text-purple-800',
    SPECIFICATION: 'bg-orange-50 text-orange-800',
    WARRANTY: 'bg-teal-50 text-teal-800',
    INSURANCE: 'bg-indigo-50 text-indigo-800',
    PENALTY: 'bg-rose-50 text-rose-800',
    OTHER: 'bg-gray-50 text-gray-800',
  }
  return colors[category] || colors.OTHER
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    DEADLINE: '📅',
    PAYMENT: '💰',
    SCOPE: '📋',
    RESPONSIBILITY: '👤',
    SPECIFICATION: '📐',
    WARRANTY: '🛡️',
    INSURANCE: '📄',
    PENALTY: '⚠️',
    OTHER: '📎',
  }
  return icons[category] || icons.OTHER
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-800',
    PROCESSING: 'bg-blue-50 text-blue-800',
    EXTRACTED: 'bg-green-50 text-green-800',
    ERROR: 'bg-red-50 text-red-800',
    UNDER_REVIEW: 'bg-blue-50 text-blue-800',
    APPROVED: 'bg-green-50 text-green-800',
    REJECTED: 'bg-red-50 text-red-800',
    IMPLEMENTED: 'bg-purple-50 text-purple-800',
  }
  return colors[status] || colors.PENDING
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isOverdue(date: Date | string): boolean {
  return daysUntil(date) < 0
}

