/**
 * Formatting and business calculation utilities for NOAH (Ecuadorian locale standard)
 */

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `$${amount.toFixed(2)}`;
  }
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)} %`;
};

export const formatDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-');
    if (day && month && year) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatTime = (timeStr: string): string => {
  return timeStr; // Keep 24-hour time "14:30"
};

/**
 * Pure business calculation functions
 */

export const calculateDishCost = (
  ingredients: { quantity: number; unitCost: number }[]
): number => {
  return ingredients.reduce((sum, ing) => sum + ing.quantity * ing.unitCost, 0);
};

export const calculateGrossMargin = (sellingPrice: number, cost: number): number => {
  if (sellingPrice <= 0) return 0;
  return (sellingPrice - cost) / sellingPrice;
};

export const compareWeeks = (currentWeekSales: number, prevWeekSales: number) => {
  if (prevWeekSales <= 0) return { diffAmount: currentWeekSales, diffPercent: 0, trend: 'up' as const };
  const diffAmount = currentWeekSales - prevWeekSales;
  const diffPercent = diffAmount / prevWeekSales;
  return {
    diffAmount,
    diffPercent,
    trend: diffAmount >= 0 ? ('up' as const) : ('down' as const),
  };
};

export const hasAppointmentOverlap = (
  existingAppointments: { date: string; time: string; durationMinutes: number; barberName: string }[],
  newDate: string,
  newTime: string,
  newDuration: number,
  barberName: string
): boolean => {
  const [newH, newM] = newTime.split(':').map(Number);
  const newStart = newH * 60 + newM;
  const newEnd = newStart + newDuration;

  return existingAppointments.some((appt) => {
    if (appt.date !== newDate || appt.barberName !== barberName) return false;
    const [exH, exM] = appt.time.split(':').map(Number);
    const exStart = exH * 60 + exM;
    const exEnd = exStart + appt.durationMinutes;

    // Overlap condition: startA < endB && endA > startB
    return newStart < exEnd && newEnd > exStart;
  });
};

export const detectOverstock = (stock: number, optimalStock: number): boolean => {
  return stock > optimalStock * 1.35;
};

export const LOW_MARGIN_THRESHOLD = 0.30;
export const CRITICAL_MARGIN_THRESHOLD = 0.20;
export const EXPIRY_WARNING_DAYS = 3;
