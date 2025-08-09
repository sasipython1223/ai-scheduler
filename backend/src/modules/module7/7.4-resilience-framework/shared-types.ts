/**
 * Module 7.4 - Schedule Resilience Framework - Shared Types
 * 
 * Purpose: Common TypeScript interfaces and types for resilience analysis,
 * contingency planning, and risk management across all sub-modules.
 * 
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

/**
 * Schedule data structure for resilience analysis
 */
export interface Schedule {
  id: string;
  name: string;
  tasks: Task[];
  resources: Resource[];
  constraints: Constraint[];
  metadata: ScheduleMetadata;
}

export interface Task {
  id: string;
  name: string;
  duration: number;
  startDate?: Date;
  endDate?: Date;
  dependencies: string[];
  resourceAssignments: ResourceAssignment[];
  criticalPath: boolean;
  totalFloat: number;
  freeFloat: number;
}

export interface Resource {
  id: string;
  name: string;
  capacity: number;
  skills: string[];
  availability: AvailabilityWindow[];
  hourlyRate: number;
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  scope: string[];
  parameters: Record<string, unknown>;
  severity: 'hard' | 'soft';
}

export interface ScheduleMetadata {
  createdAt: Date;
  lastModified: Date;
  version: string;
  complexity: number;
  riskLevel: RiskLevel;
}

// ============================================================================
// RESILIENCE ANALYSIS TYPES (7.4.1)
// ============================================================================

/**
 * Comprehensive resilience metrics for schedule robustness assessment
 */
export interface ResilienceMetrics {
  overallScore: number;           // 0-100 composite resilience score
  criticalPathRisk: number;       // 0-100 critical path vulnerability
  resourceRisk: number;           // 0-100 resource availability risk
  dependencyRisk: number;         // 0-100 dependency chain risk
  bufferSufficiency: number;      // 0-100 float buffer adequacy
  complexityFactor: number;       // Schedule complexity multiplier
  stabilityIndex: number;         // Historical stability measure
}

/**
 * Vulnerability assessment report
 */
export interface VulnerabilityReport {
  scheduleId: string;
  analysisDate: Date;
  highRiskTasks: VulnerableTask[];
  criticalBottlenecks: Bottleneck[];
  resourceConstraints: ResourceConstraint[];
  timeboxViolations: TimeboxViolation[];
  recommendations: RecommendationItem[];
}

export interface ResourceConstraint {
  resourceId: string;
  type: 'availability' | 'capacity' | 'skills';
  severity: RiskSeverity;
  description: string;
  affectedTasks: string[];
  suggestedResolution: string;
}

export interface TimeboxViolation {
  taskId: string;
  violationType: 'overrun' | 'underestimated' | 'blocked';
  expectedDuration: number;
  actualDuration: number;
  impact: RiskImpact;
  causes: string[];
}

export interface VulnerableTask {
  taskId: string;
  riskScore: number;
  riskFactors: RiskFactor[];
  impact: RiskImpact;
  mitigation: string[];
}

export interface Bottleneck {
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedTasks: string[];
  alternativePaths: string[];
}

export interface RiskFactor {
  type: RiskFactorType;
  weight: number;
  description: string;
  mitigation?: string;
}

/**
 * Schedule health monitoring status
 */
export interface HealthStatus {
  overall: HealthLevel;
  indicators: HealthIndicator[];
  alerts: HealthAlert[];
  trends: TrendIndicator[];
  lastUpdate: Date;
}

export interface HealthAlert {
  id: string;
  type: 'performance' | 'capacity' | 'quality' | 'schedule';
  severity: RiskSeverity;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolutionTime?: Date;
}

export interface TrendIndicator {
  metric: string;
  direction: TrendDirection;
  velocity: number;
  confidence: number;
  timespan: number;
}

export interface HealthIndicator {
  metric: string;
  currentValue: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
}

// ============================================================================
// CONTINGENCY PLANNING TYPES (7.4.2)
// ============================================================================

/**
 * Risk scenario definition for contingency planning
 */
export interface ContingencyScenario {
  id: string;
  name: string;
  description: string;
  probability: number;            // 0-1 likelihood of occurrence
  impact: RiskImpact;            // Expected impact level
  triggers: ScenarioTrigger[];   // Conditions that activate scenario
  affectedTasks: string[];       // Tasks impacted by scenario
  affectedResources: string[];   // Resources impacted by scenario
  duration: number;              // Expected scenario duration (hours)
  category: ScenarioCategory;
}

export interface ContingencyPlan {
  id: string;
  scenarioId: string;
  name: string;
  alternativeSchedule: Schedule;
  mitigationActions: MitigationAction[];
  implementationTime: number;    // Minutes to implement plan
  resourceRequirements: ResourceRequirement[];
  successProbability: number;    // 0-1 plan success likelihood
  cost: PlanCost;
  validationResults: ValidationResult[];
}

export interface ResourceRequirement {
  resourceType: string;
  quantity: number;
  duration: number;
  skills: string[];
  availability: Date;
}

export interface PlanCost {
  estimated: number;
  currency: string;
  breakdown: CostBreakdown[];
  contingency: number;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  description: string;
}

export interface ScenarioTrigger {
  condition: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  metric: string;
}

export interface AlternativeScheduleOptions {
  preserveCriticalPath: boolean;
  allowResourceOverallocation: boolean;
  maxDelayTolerance: number;     // Days
  costConstraints: CostConstraint[];
  qualityThresholds: QualityThreshold[];
}

export interface CostConstraint {
  type: 'budget-limit' | 'cost-per-hour' | 'total-cap';
  value: number;
  currency: string;
  flexibility: number;
}

export interface QualityThreshold {
  metric: string;
  minimumValue: number;
  weight: number;
  mandatory: boolean;
}

/**
 * Scenario analysis and simulation results
 */
export interface ScenarioResult {
  scenarioId: string;
  probability: number;
  impact: RiskImpact;
  alternatives: AlternativeOutcome[];
  recommendations: string[];
  confidenceLevel: number;
}

export interface AlternativeOutcome {
  id: string;
  name: string;
  schedule: Schedule;
  cost: number;
  duration: number;
  riskReduction: number;
  viability: number;
}

export interface SimulationResult {
  iterations: number;
  successRate: number;
  averageDelay: number;
  costVariation: CostRange;
  riskDistribution: RiskDistribution;
  sensitivityAnalysis: SensitivityAnalysis;
}

// ============================================================================
// RISK MANAGEMENT TYPES (7.4.3)
// ============================================================================

/**
 * Real-time risk indicators for monitoring
 */
export interface RiskIndicator {
  id: string;
  metric: string;               // Metric being monitored
  currentValue: number;         // Current measurement
  threshold: number;            // Alert threshold
  trend: TrendDirection;        // Value trend over time
  severity: RiskSeverity;       // Risk severity level
  category: RiskCategory;       // Type of risk
  lastUpdate: Date;
  history: RiskDataPoint[];
}

export interface RiskDataPoint {
  timestamp: Date;
  value: number;
  context?: string;
}

export interface RiskAlert {
  id: string;
  indicatorId: string;
  severity: RiskSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  assignee?: string;
  estimatedResolution: Date;
  mitigationSuggestions: string[];
}

export interface RiskContext {
  scheduleId: string;
  affectedTasks: string[];
  affectedResources: string[];
  riskType: RiskCategory;
  severity: RiskSeverity;
  timeConstraints: TimeConstraint[];
  budgetConstraints: BudgetConstraint[];
  qualityRequirements: QualityRequirement[];
}

/**
 * Mitigation strategy definition and execution
 */
export interface MitigationStrategy {
  id: string;
  name: string;
  description: string;
  riskTypes: RiskCategory[];          // Risk types this strategy addresses
  executionTime: number;              // Minutes to implement
  costFactor: number;                 // Relative cost (1-10 scale)
  successRate: number;                // Historical success rate (0-1)
  prerequisites: string[];            // Required conditions
  sideEffects: SideEffect[];         // Potential negative impacts
  execute: (context: RiskContext) => Promise<MitigationResult>;
}

export interface MitigationAction {
  id: string;
  strategyId: string;
  description: string;
  targetTasks: string[];
  targetResources: string[];
  parameters: Record<string, unknown>;
  estimatedDuration: number;
  estimatedCost: number;
  priority: ActionPriority;
}

export interface MitigationResult {
  actionId: string;
  success: boolean;
  executionTime: number;
  actualCost: number;
  effectivenessScore: number;     // 0-100 how well it resolved the risk
  sideEffects: SideEffect[];
  newRisks: RiskIndicator[];
  scheduleImpact: ScheduleImpact;
  recommendations: string[];
}

// ============================================================================
// STRATEGY-SPECIFIC TYPES
// ============================================================================

export interface BufferPlan {
  totalBufferTime: number;
  distribution: BufferDistribution[];
  justification: string;
  riskReduction: number;
}

export interface BufferDistribution {
  taskId: string;
  bufferTime: number;
  reason: string;
  priority: number;
}

export interface ReallocationResult {
  movedResources: ResourceMove[];
  impactedTasks: string[];
  costImplication: number;
  timeImplication: number;
  riskReduction: number;
}

export interface ResourceMove {
  resourceId: string;
  fromTask: string;
  toTask: string;
  startDate: Date;
  duration: number;
  reasoning: string;
}

export interface ProtectionPlan {
  protectedTasks: string[];
  contingencyResources: ContingencyResource[];
  bufferAllocations: BufferAllocation[];
  monitoringPoints: MonitoringPoint[];
}

export interface ContingencyResource {
  resourceId: string;
  capacity: number;
  availability: AvailabilityWindow[];
  skills: string[];
  cost: number;
}

export interface BufferAllocation {
  taskId: string;
  bufferTime: number;
  bufferType: 'schedule' | 'resource' | 'quality';
  justification: string;
}

export interface MonitoringPoint {
  id: string;
  taskId: string;
  metric: string;
  threshold: number;
  alertLevel: RiskSeverity;
}

export interface OptimizationResult {
  originalDuration: number;
  optimizedDuration: number;
  compressionRatio: number;
  riskIncrease: number;
  qualityImpact: number;
  costImplication: number;
  modifiedTasks: TaskModification[];
}

export interface TaskModification {
  taskId: string;
  modificationType: 'duration' | 'resources' | 'dependencies' | 'constraints';
  originalValue: unknown;
  newValue: unknown;
  reason: string;
  impact: RiskImpact;
}

// ============================================================================
// UTILITY AND SUPPORT TYPES
// ============================================================================

export type RiskLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type RiskImpact = 'minimal' | 'low' | 'medium' | 'high' | 'severe';
export type RiskSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'schedule' | 'resource' | 'budget' | 'quality' | 'scope' | 'external';
export type TrendDirection = 'improving' | 'stable' | 'degrading' | 'volatile';
export type HealthLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type ActionPriority = 'immediate' | 'high' | 'medium' | 'low' | 'deferred';
export type ScenarioCategory = 'resource-shortage' | 'timeline-pressure' | 'scope-change' | 'external-dependency' | 'quality-issue';
export type RiskFactorType = 'complexity' | 'dependency' | 'resource' | 'timeline' | 'external' | 'technical';
export type ConstraintType = 'temporal' | 'resource' | 'budget' | 'quality' | 'regulatory';

export interface AvailabilityWindow {
  start: Date;
  end: Date;
  capacity: number;
}

export interface ResourceAssignment {
  resourceId: string;
  allocation: number;    // 0-1 (percentage)
  startDate: Date;
  endDate: Date;
}

export interface TimeConstraint {
  type: 'deadline' | 'milestone' | 'dependency';
  targetDate: Date;
  flexibility: number;   // Days of flexibility
}

export interface BudgetConstraint {
  maxCost: number;
  currency: string;
  flexibility: number;   // Percentage over budget allowed
}

export interface QualityRequirement {
  metric: string;
  threshold: number;
  mandatory: boolean;
}

export interface SideEffect {
  type: string;
  severity: RiskSeverity;
  description: string;
  affectedAreas: string[];
}

export interface ScheduleImpact {
  delayDays: number;
  costIncrease: number;
  qualityReduction: number;
  affectedTasks: string[];
}

export interface CostRange {
  min: number;
  max: number;
  average: number;
  standardDeviation: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface SensitivityAnalysis {
  mostSensitiveFactors: string[];
  impactCorrelations: Record<string, number>;
  recommendations: string[];
}

// ============================================================================
// ERROR AND VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;        // 0-100 validation score
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  code: string;
  message: string;
  recommendation?: string;
}

// ============================================================================
// EXECUTION AND MONITORING TYPES
// ============================================================================

export interface ExecutionResult {
  planId: string;
  success: boolean;
  executionTime: number;
  steps: ExecutionStep[];
  finalState: Schedule;
  metrics: ExecutionMetrics;
  issues: ExecutionIssue[];
}

export interface ExecutionStep {
  stepId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: unknown;
  error?: string;
}

export interface ExecutionMetrics {
  totalDuration: number;
  successRate: number;
  efficiencyScore: number;
  resourceUtilization: number;
}

export interface ExecutionIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  step: string;
  resolution?: string;
}

// ============================================================================
// ANALYSIS AND REPORTING TYPES
// ============================================================================

export interface TrendAnalysis {
  metric: string;
  direction: TrendDirection;
  velocity: number;      // Rate of change
  predictedValue: number;
  confidence: number;    // 0-1 prediction confidence
  timeframe: number;     // Days for prediction
}

export interface Dashboard {
  widgets: DashboardWidget[];
  lastUpdate: Date;
  refreshInterval: number;
  alerts: RiskAlert[];
}

export interface DashboardWidget {
  type: 'metric' | 'chart' | 'alert' | 'list';
  title: string;
  data: unknown;
  position: WidgetPosition;
  config: WidgetConfig;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetConfig {
  refreshRate: number;
  autoScale: boolean;
  showLegend: boolean;
  colorScheme: string;
}

export interface RecommendationItem {
  id: string;
  priority: ActionPriority;
  category: string;
  title: string;
  description: string;
  expectedBenefit: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  dependencies: string[];
}

/**
 * Configuration options for resilience framework
 */
export interface ResilienceConfig {
  analysis: {
    scoringWeights: ScoringWeights;
    thresholds: RiskThresholds;
    updateInterval: number;        // Seconds
  };
  contingency: {
    maxAlternatives: number;
    scenarioTimeout: number;       // Seconds
    validationStrict: boolean;
  };
  risk: {
    monitoringInterval: number;    // Seconds
    alertRetention: number;        // Days
    autoMitigation: boolean;
  };
}

export interface ScoringWeights {
  criticalPath: number;
  resource: number;
  dependency: number;
  buffer: number;
  complexity: number;
}

export interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// ============================================================================
// COMPONENT EXPORTS (will be uncommented after components are created)
// ============================================================================

// export * from './7.4.1-resilience-analyzer/index';
// export * from './7.4.2-contingency-planner/index';
// export * from './7.4.3-risk-manager/index';
