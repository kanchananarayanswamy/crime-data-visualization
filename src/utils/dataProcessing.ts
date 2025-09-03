import { CrimeRecord, TimeSeriesData, CategoryData, HourlyData } from '../types/crime';

export const generateSampleCrimeData = (): CrimeRecord[] => {
  const categories = ['Theft', 'Assault', 'Burglary', 'Vandalism', 'Drug Offense', 'Fraud', 'Robbery'];
  const districts = ['Downtown', 'Northside', 'Southside', 'Westend', 'Eastside'];
  const severities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
  
  const data: CrimeRecord[] = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 500; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    
    // Create crime hotspots with clustering
    const hotspotCenters = [
      { lat: 40.7128, lng: -74.0060 }, // NYC area
      { lat: 40.7589, lng: -73.9851 },
      { lat: 40.6892, lng: -74.0445 },
    ];
    
    const hotspot = hotspotCenters[Math.floor(Math.random() * hotspotCenters.length)];
    const latitude = hotspot.lat + (Math.random() - 0.5) * 0.05;
    const longitude = hotspot.lng + (Math.random() - 0.5) * 0.05;
    
    data.push({
      id: `crime_${i + 1}`,
      date: date.toISOString().split('T')[0],
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      description: `Crime incident ${i + 1}`,
      latitude,
      longitude,
      district: districts[Math.floor(Math.random() * districts.length)],
      severity: severities[Math.floor(Math.random() * severities.length)]
    });
  }
  
  return data;
};

export const processTimeSeriesData = (crimes: CrimeRecord[]): TimeSeriesData[] => {
  const grouped = crimes.reduce((acc, crime) => {
    const date = crime.date;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const generateForecastData = (historicalData: TimeSeriesData[]): TimeSeriesData[] => {
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const forecast: TimeSeriesData[] = [];
  
  // Simple trend-based forecasting
  const recentTrend = historicalData.slice(-30).reduce((sum, d) => sum + d.count, 0) / 30;
  const seasonality = 0.1;
  
  for (let i = 1; i <= 30; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Add some randomness and seasonality
    const predicted = Math.max(0, Math.round(
      recentTrend + 
      Math.sin(i * 0.2) * seasonality * recentTrend +
      (Math.random() - 0.5) * 2
    ));
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      count: predicted,
      predicted: true
    });
  }
  
  return forecast;
};

export const processCategoryData = (crimes: CrimeRecord[]): CategoryData[] => {
  const total = crimes.length;
  const grouped = crimes.reduce((acc, crime) => {
    acc[crime.category] = (acc[crime.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

export const processHourlyData = (crimes: CrimeRecord[]): HourlyData[] => {
  const grouped = crimes.reduce((acc, crime) => {
    const hour = parseInt(crime.time.split(':')[0]);
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: grouped[hour] || 0
  }));
};

export const parseCSV = (csvText: string): CrimeRecord[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const record: any = {};
    
    headers.forEach((header, i) => {
      record[header] = values[i]?.trim() || '';
    });
    
    return {
      id: record.id || `imported_${index + 1}`,
      date: record.date || new Date().toISOString().split('T')[0],
      time: record.time || '00:00',
      category: record.category || 'Unknown',
      description: record.description || 'No description',
      latitude: parseFloat(record.latitude || record.lat) || 40.7128,
      longitude: parseFloat(record.longitude || record.lng || record.lon) || -74.0060,
      district: record.district,
      severity: (record.severity as 'Low' | 'Medium' | 'High') || 'Medium'
    };
  });
};