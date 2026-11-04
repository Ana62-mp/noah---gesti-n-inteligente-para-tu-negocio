import { Sale } from '../types';

export type KpiTone = 'cinnamon' | 'banana' | 'olive' | 'terracotta' | 'harvest';
export type KpiIcon = 'trend' | 'receipt' | 'dish' | 'orders' | 'calendar' | 'wallet';

export interface ProfileKpi {
  title: string;
  value: string;
  tone: KpiTone;
  icon: KpiIcon;
  change?: number;
  changePeriod?: string;
  subtitle?: string;
  provenance: { period: string; source: string; updatedAt: string; details?: string };
}

export interface LabeledValue {
  label: string;
  value: string;
}

export interface TourStep {
  title: string;
  description: string;
  section?: string;
  opensAssistant?: boolean;
}

export type VoiceScenarioId = 'order' | 'booking' | 'expense' | 'store_sale';

export interface PhonePeriod {
  id: string;
  label: string;
  income: number;
  outcome: number;
  note: string;
}

export interface BusinessProfile {
  sectionLabels: Record<string, string>;
  vocabulary: {
    itemsColumn: string;
    itemNoun: string;
    saleChannels: { value: Sale['channel']; label: string }[];
    defaultSaleItem: { name: string; price: number };
    defaultSupplier: string;
    inventoryColumn: string;
    stockBanner: string;
    expiringTab: string;
    staffVoiceLabel: string;
  };
  dashboard: {
    greeting: string;
    chips: string[];
    kpis: ProfileKpi[];
    weeklyTitle: string;
    weeklyNote: string;
    weekly: { day: string; current: number; previous: number }[];
    secondaryTitle: string;
    secondarySubtitle: string;
    secondary: { label: string; value: number }[];
  };
  salesSummary: LabeledValue[];
  closing: { rows: (LabeledValue & { isExpense?: boolean })[]; total: string; turn: string };
  expenseKpis: LabeledValue[];
  cashflow: { day: string; in: number; out: number }[];
  reports: {
    rankingTitle: string;
    rankingSubtitle: string;
    unit: string;
    ranking: { name: string; margin: number; volume: number }[];
    expensesTotal: number;
    expenses: { label: string; amount: number }[];
    brief: string;
  };
  tour: TourStep[];
  voiceScenarios: VoiceScenarioId[];
  phone: {
    kpis: { label: string; value: string; note: string }[];
    orbQuestion: string;
    quickQuestions: string[];
    summary: string;
    summarySpeech: string;
    periods: PhonePeriod[];
    weekBars: { day: string; current: number; previous: number }[];
    rankingTitle: string;
    tryOwner: string[];
  };
  aiFinancials: Record<string, unknown>;
}
