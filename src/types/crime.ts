export interface CrimeRecord {
  id: string;
  date: string;
  time: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  district?: string;
  severity?: 'Low' | 'Medium' | 'High';
}

export interface CrimeCluster {
  id: number;
  centerLat: number;
  centerLng: number;
  crimes: CrimeRecord[];
  severity: 'Low' | 'Medium' | 'High';
}

export interface TimeSeriesData {
  date: string;
  count: number;
  predicted?: boolean;
}

export interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface HourlyData {
  hour: number;
  count: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}