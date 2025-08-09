/**
 * Mock Schedule Project Test Fixtures
 * AI Scheduler - Module 5.1: Test Data
 *
 * Reusable test data for unit and integration tests
 */

import {
  LogicLink,
  ScheduleCalculationRequest,
  TaskInput,
  TaskPriority,
  WBSNode,
} from '../../types/scheduleTypes';

/**
 * Valid mock tasks for testing
 */
export const mockTasks: TaskInput[] = [
  {
    id: 'A',
    name: 'Project Start',
    duration: 0, // Milestone
    wbs: '1.0',
    priority: 'HIGH' as TaskPriority,
    resourceIds: ['PM001'],
  },
  {
    id: 'B',
    name: 'Requirements Analysis',
    duration: 5,
    wbs: '1.1',
    predecessors: ['A'],
    priority: 'HIGH' as TaskPriority,
    resourceIds: ['BA001', 'PM001'],
  },
  {
    id: 'C',
    name: 'System Design',
    duration: 8,
    wbs: '1.2',
    predecessors: ['B'],
    priority: 'HIGH' as TaskPriority,
    resourceIds: ['ARCH001'],
  },
  {
    id: 'D',
    name: 'Database Design',
    duration: 3,
    wbs: '1.2.1',
    predecessors: ['B'],
    priority: 'MEDIUM' as TaskPriority,
    resourceIds: ['DBA001'],
  },
  {
    id: 'E',
    name: 'UI Design',
    duration: 6,
    wbs: '1.2.2',
    predecessors: ['B'],
    priority: 'MEDIUM' as TaskPriority,
    resourceIds: ['UI001'],
  },
  {
    id: 'F',
    name: 'Development',
    duration: 15,
    wbs: '1.3',
    predecessors: ['C', 'D'],
    priority: 'HIGH' as TaskPriority,
    resourceIds: ['DEV001', 'DEV002'],
  },
  {
    id: 'G',
    name: 'Testing',
    duration: 8,
    wbs: '1.4',
    predecessors: ['F'],
    priority: 'HIGH' as TaskPriority,
    resourceIds: ['QA001', 'QA002'],
  },
  {
    id: 'H',
    name: 'Deployment',
    duration: 2,
    wbs: '1.5',
    predecessors: ['G'],
    priority: 'HIGH' as TaskPriority,
    resourceIds: ['OPS001'],
  },
];

/**
 * Valid logic links for testing
 */
export const mockLogicLinks: LogicLink[] = [
  {
    id: 'L1',
    from: 'A',
    to: 'B',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L2',
    from: 'B',
    to: 'C',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L3',
    from: 'B',
    to: 'D',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L4',
    from: 'B',
    to: 'E',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L5',
    from: 'C',
    to: 'F',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L6',
    from: 'D',
    to: 'F',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L7',
    from: 'F',
    to: 'G',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'L8',
    from: 'G',
    to: 'H',
    type: 'FS',
    lag: 0,
  },
];

/**
 * WBS nodes for testing
 */
export const mockWBSNodes: WBSNode[] = [
  {
    code: '1.0',
    name: 'Software Development Project',
    level: 1,
    children: ['1.1', '1.2', '1.3', '1.4', '1.5'],
    taskIds: ['A'],
  },
  {
    code: '1.1',
    name: 'Analysis Phase',
    level: 2,
    parentCode: '1.0',
    children: [],
    taskIds: ['B'],
  },
  {
    code: '1.2',
    name: 'Design Phase',
    level: 2,
    parentCode: '1.0',
    children: ['1.2.1', '1.2.2'],
    taskIds: ['C'],
  },
  {
    code: '1.2.1',
    name: 'Database Design',
    level: 3,
    parentCode: '1.2',
    children: [],
    taskIds: ['D'],
  },
  {
    code: '1.2.2',
    name: 'UI Design',
    level: 3,
    parentCode: '1.2',
    children: [],
    taskIds: ['E'],
  },
  {
    code: '1.3',
    name: 'Development Phase',
    level: 2,
    parentCode: '1.0',
    children: [],
    taskIds: ['F'],
  },
  {
    code: '1.4',
    name: 'Testing Phase',
    level: 2,
    parentCode: '1.0',
    children: [],
    taskIds: ['G'],
  },
  {
    code: '1.5',
    name: 'Deployment Phase',
    level: 2,
    parentCode: '1.0',
    children: [],
    taskIds: ['H'],
  },
];

/**
 * Complete schedule calculation request for testing
 */
export const mockScheduleRequest: ScheduleCalculationRequest = {
  projectId: 'PROJ-001',
  tasks: mockTasks,
  logicLinks: mockLogicLinks,
  options: {
    includeFloat: true,
    includeCriticalPath: true,
    includeStatistics: true,
    validateInput: true,
    optimizePerformance: false,
  },
};

/**
 * Invalid test data for negative testing
 */
export const invalidTaskData = {
  missingId: {
    id: '',
    name: 'Invalid Task',
    duration: 5,
  },
  missingName: {
    id: 'INVALID-1',
    name: '',
    duration: 5,
  },
  negativeDuration: {
    id: 'INVALID-2',
    name: 'Invalid Duration',
    duration: -5,
  },
  zeroDurationNonMilestone: {
    id: 'INVALID-3',
    name: 'Zero Duration',
    duration: 0,
    predecessors: ['A'], // Non-milestone with zero duration
  },
};

/**
 * Invalid logic links for testing
 */
export const invalidLogicLinks = {
  selfLink: {
    id: 'INVALID-L1',
    from: 'A',
    to: 'A', // Self-referencing
    type: 'FS',
    lag: 0,
  },
  missingFrom: {
    id: 'INVALID-L2',
    from: '',
    to: 'B',
    type: 'FS',
    lag: 0,
  },
  missingTo: {
    id: 'INVALID-L3',
    from: 'A',
    to: '',
    type: 'FS',
    lag: 0,
  },
  invalidType: {
    id: 'INVALID-L4',
    from: 'A',
    to: 'B',
    type: 'INVALID',
    lag: 0,
  },
};

/**
 * Circular dependency test data
 */
export const circularDependencyLinks: LogicLink[] = [
  {
    id: 'CIRC-1',
    from: 'A',
    to: 'B',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'CIRC-2',
    from: 'B',
    to: 'C',
    type: 'FS',
    lag: 0,
  },
  {
    id: 'CIRC-3',
    from: 'C',
    to: 'A', // Creates circular dependency
    type: 'FS',
    lag: 0,
  },
];

/**
 * Invalid WBS codes for testing
 */
export const invalidWBSCodes = [
  '1.', // Ends with dot
  '.1', // Starts with dot
  '1..2', // Double dots
  'A.1', // Non-numeric
  '1.0.', // Trailing dot
  '', // Empty
  '1-2', // Wrong separator
];

/**
 * Valid WBS codes for testing
 */
export const validWBSCodes = [
  '1',
  '1.1',
  '1.1.1',
  '1.2.3.4.5',
  '10.20.30',
  '1.10.2',
];

/**
 * Test date ranges for working days calculations
 */
export const testDateRanges = {
  mondayToFriday: {
    start: '2025-08-04T09:00:00.000Z', // Monday
    end: '2025-08-08T17:00:00.000Z', // Friday
    expectedWorkingDays: 5,
  },
  acrossWeekend: {
    start: '2025-08-01T09:00:00.000Z', // Friday
    end: '2025-08-05T17:00:00.000Z', // Tuesday
    expectedWorkingDays: 3, // Fri, Mon, Tue
  },
  singleDay: {
    start: '2025-08-04T09:00:00.000Z', // Monday
    end: '2025-08-04T17:00:00.000Z', // Same Monday
    expectedWorkingDays: 1,
  },
  weekend: {
    start: '2025-08-02T09:00:00.000Z', // Saturday
    end: '2025-08-03T17:00:00.000Z', // Sunday
    expectedWorkingDays: 0,
  },
};

/**
 * US Federal Holidays for 2025 (test data)
 */
export const testHolidays2025 = [
  '2025-01-01', // New Year's Day
  '2025-07-04', // Independence Day
  '2025-12-25', // Christmas Day
  '2025-05-26', // Memorial Day (last Monday in May)
  '2025-09-01', // Labor Day (first Monday in September)
  '2025-11-27', // Thanksgiving (fourth Thursday in November)
];

/**
 * Helper function to create test task with minimal data
 */
export function createTestTask(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    id: 'TEST-TASK',
    name: 'Test Task',
    duration: 5,
    ...overrides,
  };
}

/**
 * Helper function to create test logic link
 */
export function createTestLogicLink(
  overrides: Partial<LogicLink> = {}
): LogicLink {
  return {
    id: 'TEST-LINK',
    from: 'TASK-A',
    to: 'TASK-B',
    type: 'FS',
    lag: 0,
    ...overrides,
  };
}
