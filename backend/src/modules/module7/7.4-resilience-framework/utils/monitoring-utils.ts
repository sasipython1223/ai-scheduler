/**
 * Module 7.4 - Monitoring Utilities
 * 
 * Purpose: Utility functions for risk monitoring and data collection
 * 
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

import type {
  Schedule,
  RiskIndicator,
  RiskDataPoint,
  TrendDirection,
  RiskSeverity,
  RiskCategory
} from '../shared-types';

/**
 * Monitor real-time risk indicators
 */
export async function monitorRealTimeIndicators(
  schedule: Schedule,
  indicators: RiskIndicator[]
): Promise<RiskIndicator[]> {
  // TODO: Implement real-time monitoring
  // - Collect current metric values
  // - Update indicator states
  // - Calculate trends
  // - Check thresholds
  // - Return updated indicators
  
  throw new Error('monitorRealTimeIndicators not yet implemented');
}

/**
 * Collect risk metrics from schedule
 */
export async function collectRiskMetrics(
  schedule: Schedule
): Promise<Record<string, number>> {
  // TODO: Implement metric collection
  // - Extract schedule metrics
  // - Calculate derived metrics
  // - Assess risk indicators
  // - Return metric values
  
  throw new Error('collectRiskMetrics not yet implemented');
}

/**
 * Calculate trend for risk indicator
 */
export async function calculateRiskTrend(
  indicator: RiskIndicator,
  timeWindow: number = 3600000 // 1 hour in milliseconds
): Promise<TrendDirection> {
  if (!indicator.history || indicator.history.length < 2) {
    return 'stable';
  }

  const now = new Date();
  const cutoffTime = new Date(now.getTime() - timeWindow);
  
  // Filter recent data points
  const recentData = indicator.history.filter(
    point => point.timestamp >= cutoffTime
  );

  if (recentData.length < 2) {
    return 'stable';
  }

  // Calculate trend using linear regression
  const trend = calculateLinearTrend(recentData);
  
  if (Math.abs(trend.slope) < 0.01) {
    return 'stable';
  }
  
  return trend.slope > 0 ? 'degrading' : 'improving';
}

/**
 * Check if indicator exceeds threshold
 */
export function checkIndicatorThreshold(
  indicator: RiskIndicator
): {
  exceeded: boolean;
  severity: RiskSeverity;
  message: string;
} {
  const value = indicator.currentValue;
  const threshold = indicator.threshold;

  if (value <= threshold) {
    return {
      exceeded: false,
      severity: 'info',
      message: `${indicator.metric} is within normal range (${value.toFixed(2)})`
    };
  }

  // Determine severity based on how much threshold is exceeded
  const exceedanceRatio = value / threshold;
  let severity: RiskSeverity;
  
  if (exceedanceRatio < 1.2) {
    severity = 'low';
  } else if (exceedanceRatio < 1.5) {
    severity = 'medium';
  } else if (exceedanceRatio < 2.0) {
    severity = 'high';
  } else {
    severity = 'critical';
  }

  return {
    exceeded: true,
    severity,
    message: `${indicator.metric} exceeded threshold: ${value.toFixed(2)} > ${threshold.toFixed(2)} (${((exceedanceRatio - 1) * 100).toFixed(1)}% over)`
  };
}

/**
 * Update indicator history with new data point
 */
export function updateIndicatorHistory(
  indicator: RiskIndicator,
  value: number,
  context?: string
): RiskIndicator {
  const newDataPoint: RiskDataPoint = {
    timestamp: new Date(),
    value,
    context
  };

  const updatedHistory = [...(indicator.history || []), newDataPoint];
  
  // Keep only recent history (last 100 data points)
  const maxHistoryLength = 100;
  if (updatedHistory.length > maxHistoryLength) {
    updatedHistory.splice(0, updatedHistory.length - maxHistoryLength);
  }

  return {
    ...indicator,
    currentValue: value,
    lastUpdate: new Date(),
    history: updatedHistory,
    trend: calculateTrendFromHistory(updatedHistory)
  };
}

/**
 * Create new risk indicator
 */
export function createRiskIndicator(
  id: string,
  metric: string,
  currentValue: number,
  threshold: number,
  category: RiskCategory
): RiskIndicator {
  return {
    id,
    metric,
    currentValue,
    threshold,
    trend: 'stable',
    severity: 'info',
    category,
    lastUpdate: new Date(),
    history: [{
      timestamp: new Date(),
      value: currentValue
    }]
  };
}

/**
 * Calculate indicator statistics
 */
export function calculateIndicatorStatistics(
  indicator: RiskIndicator
): {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  volatility: number;
} {
  if (!indicator.history || indicator.history.length === 0) {
    return {
      mean: indicator.currentValue,
      median: indicator.currentValue,
      standardDeviation: 0,
      min: indicator.currentValue,
      max: indicator.currentValue,
      volatility: 0
    };
  }

  const values = indicator.history.map(point => point.value);
  
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues[Math.floor(sortedValues.length / 2)];
  
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Volatility as coefficient of variation
  const volatility = mean > 0 ? standardDeviation / mean : 0;

  return {
    mean,
    median,
    standardDeviation,
    min,
    max,
    volatility
  };
}

/**
 * Detect anomalies in indicator data
 */
export function detectAnomalies(
  indicator: RiskIndicator,
  threshold: number = 2.0 // Number of standard deviations
): RiskDataPoint[] {
  if (!indicator.history || indicator.history.length < 3) {
    return [];
  }

  const stats = calculateIndicatorStatistics(indicator);
  const anomalies: RiskDataPoint[] = [];

  for (const point of indicator.history) {
    const zScore = Math.abs(point.value - stats.mean) / stats.standardDeviation;
    if (zScore > threshold) {
      anomalies.push(point);
    }
  }

  return anomalies;
}

/**
 * Calculate correlation between indicators
 */
export function calculateIndicatorCorrelation(
  indicator1: RiskIndicator,
  indicator2: RiskIndicator
): number {
  if (!indicator1.history || !indicator2.history || 
      indicator1.history.length === 0 || indicator2.history.length === 0) {
    return 0;
  }

  // Align data points by timestamp (simplified - assumes same sampling)
  const minLength = Math.min(indicator1.history.length, indicator2.history.length);
  const values1 = indicator1.history.slice(-minLength).map(p => p.value);
  const values2 = indicator2.history.slice(-minLength).map(p => p.value);

  return calculatePearsonCorrelation(values1, values2);
}

/**
 * Generate monitoring alerts
 */
export function generateMonitoringAlerts(
  indicators: RiskIndicator[]
): Array<{
  indicatorId: string;
  alertType: 'threshold' | 'trend' | 'anomaly';
  severity: RiskSeverity;
  message: string;
  timestamp: Date;
}> {
  const alerts: Array<{
    indicatorId: string;
    alertType: 'threshold' | 'trend' | 'anomaly';
    severity: RiskSeverity;
    message: string;
    timestamp: Date;
  }> = [];

  for (const indicator of indicators) {
    // Check threshold violations
    const thresholdCheck = checkIndicatorThreshold(indicator);
    if (thresholdCheck.exceeded) {
      alerts.push({
        indicatorId: indicator.id,
        alertType: 'threshold',
        severity: thresholdCheck.severity,
        message: thresholdCheck.message,
        timestamp: new Date()
      });
    }

    // Check for degrading trends
    if (indicator.trend === 'degrading') {
      alerts.push({
        indicatorId: indicator.id,
        alertType: 'trend',
        severity: 'medium',
        message: `${indicator.metric} is showing a degrading trend`,
        timestamp: new Date()
      });
    }

    // Check for anomalies
    const anomalies = detectAnomalies(indicator);
    if (anomalies.length > 0) {
      alerts.push({
        indicatorId: indicator.id,
        alertType: 'anomaly',
        severity: 'medium',
        message: `${indicator.metric} has ${anomalies.length} anomalous data points`,
        timestamp: new Date()
      });
    }
  }

  return alerts;
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate linear trend from data points
 */
function calculateLinearTrend(dataPoints: RiskDataPoint[]): { slope: number; intercept: number } {
  if (dataPoints.length < 2) {
    return { slope: 0, intercept: 0 };
  }

  // Convert timestamps to numeric values (time since first point)
  const baseTime = dataPoints[0].timestamp.getTime();
  const x = dataPoints.map(p => (p.timestamp.getTime() - baseTime) / 1000); // seconds
  const y = dataPoints.map(p => p.value);

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculate trend direction from history
 */
function calculateTrendFromHistory(history: RiskDataPoint[]): TrendDirection {
  if (history.length < 2) {
    return 'stable';
  }

  const trend = calculateLinearTrend(history.slice(-10)); // Last 10 points
  
  if (Math.abs(trend.slope) < 0.01) {
    return 'stable';
  }
  
  return trend.slope > 0 ? 'degrading' : 'improving';
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}
