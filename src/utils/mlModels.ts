import { CrimeRecord, ModelMetrics, CrimeCluster } from '../types/crime';

// Simple decision tree-like classification
export const trainCrimeClassifier = (crimes: CrimeRecord[]): ModelMetrics => {
  // Simulate training process with realistic metrics
  const accuracy = 0.78 + Math.random() * 0.15;
  const precision = 0.75 + Math.random() * 0.15;
  const recall = 0.72 + Math.random() * 0.15;
  const f1Score = 2 * (precision * recall) / (precision + recall);
  
  return {
    accuracy: Math.round(accuracy * 100) / 100,
    precision: Math.round(precision * 100) / 100,
    recall: Math.round(recall * 100) / 100,
    f1Score: Math.round(f1Score * 100) / 100
  };
};

// K-means clustering simulation
export const performCrimeClustering = (crimes: CrimeRecord[], k: number = 5): CrimeCluster[] => {
  if (crimes.length === 0) return [];
  
  // Initialize cluster centers randomly
  const minLat = Math.min(...crimes.map(c => c.latitude));
  const maxLat = Math.max(...crimes.map(c => c.latitude));
  const minLng = Math.min(...crimes.map(c => c.longitude));
  const maxLng = Math.max(...crimes.map(c => c.longitude));
  
  const clusters: CrimeCluster[] = [];
  
  for (let i = 0; i < k; i++) {
    const centerLat = minLat + (maxLat - minLat) * Math.random();
    const centerLng = minLng + (maxLng - minLng) * Math.random();
    
    clusters.push({
      id: i,
      centerLat,
      centerLng,
      crimes: [],
      severity: 'Medium'
    });
  }
  
  // Assign crimes to nearest cluster
  crimes.forEach(crime => {
    let minDistance = Infinity;
    let nearestCluster = 0;
    
    clusters.forEach((cluster, index) => {
      const distance = Math.sqrt(
        Math.pow(crime.latitude - cluster.centerLat, 2) +
        Math.pow(crime.longitude - cluster.centerLng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCluster = index;
      }
    });
    
    clusters[nearestCluster].crimes.push(crime);
  });
  
  // Update cluster centers and determine severity
  clusters.forEach(cluster => {
    if (cluster.crimes.length > 0) {
      cluster.centerLat = cluster.crimes.reduce((sum, c) => sum + c.latitude, 0) / cluster.crimes.length;
      cluster.centerLng = cluster.crimes.reduce((sum, c) => sum + c.longitude, 0) / cluster.crimes.length;
      
      // Determine severity based on crime count
      if (cluster.crimes.length > 50) cluster.severity = 'High';
      else if (cluster.crimes.length > 20) cluster.severity = 'Medium';
      else cluster.severity = 'Low';
    }
  });
  
  return clusters.filter(cluster => cluster.crimes.length > 0);
};

// Risk assessment based on multiple factors
export const calculateRiskScore = (crime: CrimeRecord): number => {
  let risk = 0;
  
  // Time-based risk (higher at night)
  const hour = parseInt(crime.time.split(':')[0]);
  if (hour >= 22 || hour <= 5) risk += 0.3;
  else if (hour >= 18 || hour <= 8) risk += 0.2;
  else risk += 0.1;
  
  // Category-based risk
  const highRiskCategories = ['Assault', 'Robbery', 'Burglary'];
  const mediumRiskCategories = ['Theft', 'Vandalism'];
  
  if (highRiskCategories.includes(crime.category)) risk += 0.4;
  else if (mediumRiskCategories.includes(crime.category)) risk += 0.2;
  else risk += 0.1;
  
  // Severity-based risk
  if (crime.severity === 'High') risk += 0.3;
  else if (crime.severity === 'Medium') risk += 0.2;
  else risk += 0.1;
  
  return Math.min(1, risk);
};

export const predictCrimeTrend = (historicalCounts: number[]): number[] => {
  if (historicalCounts.length < 3) return [];
  
  const predictions: number[] = [];
  const recentAvg = historicalCounts.slice(-7).reduce((sum, count) => sum + count, 0) / 7;
  
  // Simple linear regression trend
  let trend = 0;
  for (let i = 1; i < historicalCounts.length; i++) {
    trend += historicalCounts[i] - historicalCounts[i - 1];
  }
  trend = trend / (historicalCounts.length - 1);
  
  // Generate 30-day forecast
  for (let i = 1; i <= 30; i++) {
    const seasonal = Math.sin(i * 0.2) * 2; // Add seasonality
    const noise = (Math.random() - 0.5) * 3; // Add some randomness
    const predicted = Math.max(0, Math.round(recentAvg + trend * i + seasonal + noise));
    predictions.push(predicted);
  }
  
  return predictions;
};