/**
 * Schedule Models Unit Tests
 * AI Scheduler - Module 5.1: Data Models Testing
 */

import {
  LogicLinkModel,
  ScheduleEngine,
  ScheduleUtils,
  Task,
  WBSManager,
  addWorkingDays,
  calculateWorkingDays,
  checkCircularDependency,
} from '../../models/schedule/index';
import {
  LogicLink,
  ScheduleCalculationRequest,
  TaskInput,
  TaskStatus,
  ValidationResult,
  WBSNode,
} from '../../types/scheduleTypes';

describe('Task Model', () => {
  let validTaskInput: TaskInput;

  beforeEach(() => {
    validTaskInput = {
      id: 'task-001',
      name: 'Design Phase',
      duration: 5,
      wbs: '1.1',
      predecessors: [],
    };
  });

  test('should create task with valid input', () => {
    const task = new Task(validTaskInput);
    const data = task.getData();

    expect(data.id).toBe('task-001');
    expect(data.name).toBe('Design Phase');
    expect(data.duration).toBe(5);
  });

  test('should validate required fields', () => {
    const invalidTask = new Task({
      id: '',
      name: '',
      duration: -1,
    });

    const validationResults = invalidTask.validate();
    expect(validationResults).toHaveLength(3);
    expect(validationResults[0].field).toBe('id');
    expect(validationResults[1].field).toBe('name');
    expect(validationResults[2].field).toBe('duration');
  });

  test('should validate ISO date format', () => {
    const taskWithInvalidDate = new Task({
      ...validTaskInput,
      start: 'invalid-date',
    });

    const validationResults = taskWithInvalidDate.validate();
    expect(
      validationResults.some((r: ValidationResult) => r.field === 'start')
    ).toBe(true);
  });

  test('should check if task has predecessors', () => {
    const taskWithPredecessors = new Task({
      ...validTaskInput,
      predecessors: ['task-000'],
    });

    expect(taskWithPredecessors.hasPredecessors()).toBe(true);

    const taskWithoutPredecessors = new Task(validTaskInput);
    expect(taskWithoutPredecessors.hasPredecessors()).toBe(false);
  });

  test('should calculate WBS level correctly', () => {
    const task1 = new Task({ ...validTaskInput, wbs: '1' });
    expect(task1.getWBSLevel()).toBe(1);

    const task2 = new Task({ ...validTaskInput, wbs: '1.2.3' });
    expect(task2.getWBSLevel()).toBe(3);

    const taskNoWBS = new Task({ ...validTaskInput, wbs: undefined });
    expect(taskNoWBS.getWBSLevel()).toBe(0);
  });
});

describe('LogicLink Model', () => {
  let validLogicLink: LogicLink;

  beforeEach(() => {
    validLogicLink = {
      id: 'link-001',
      from: 'task-001',
      to: 'task-002',
      type: 'FS',
      lag: 0,
    };
  });

  test('should create logic link with valid input', () => {
    const link = new LogicLinkModel(validLogicLink);
    const data = link.getData();

    expect(data.from).toBe('task-001');
    expect(data.to).toBe('task-002');
    expect(data.type).toBe('FS');
  });

  test('should validate required fields', () => {
    const invalidLink = new LogicLinkModel({
      id: 'link-001',
      from: '',
      to: '',
      type: 'FS',
      lag: 0,
    });

    const validationResults = invalidLink.validate();
    expect(validationResults).toHaveLength(2);
    expect(validationResults[0].field).toBe('from');
    expect(validationResults[1].field).toBe('to');
  });

  test('should prevent self-referencing links', () => {
    const selfLink = new LogicLinkModel({
      ...validLogicLink,
      from: 'task-001',
      to: 'task-001',
    });

    const validationResults = selfLink.validate();
    expect(
      validationResults.some((r: ValidationResult) =>
        r.message?.includes('itself')
      )
    ).toBe(true);
  });

  test('should detect circular dependencies', () => {
    const links: LogicLink[] = [
      { id: 'link-1', from: 'A', to: 'B', type: 'FS', lag: 0 },
      { id: 'link-2', from: 'B', to: 'C', type: 'FS', lag: 0 },
    ];

    const circularLink: LogicLink = {
      id: 'link-3',
      from: 'C',
      to: 'A',
      type: 'FS',
      lag: 0,
    };

    const hasCycle = checkCircularDependency(links, circularLink);
    expect(hasCycle).toBe(true);
  });

  test('should allow valid dependency chains', () => {
    const links: LogicLink[] = [
      { id: 'link-1', from: 'A', to: 'B', type: 'FS', lag: 0 },
      { id: 'link-2', from: 'B', to: 'C', type: 'FS', lag: 0 },
    ];

    const validLink: LogicLink = {
      id: 'link-3',
      from: 'C',
      to: 'D',
      type: 'FS',
      lag: 0,
    };

    const hasCycle = checkCircularDependency(links, validLink);
    expect(hasCycle).toBe(false);
  });
});

describe('WBS Manager', () => {
  let wbsManager: WBSManager;

  beforeEach(() => {
    wbsManager = new WBSManager('PROJECT-001');
  });

  test('should create WBS manager with project code', () => {
    const structure = wbsManager.getStructure();
    expect(structure.projectCode).toBe('PROJECT-001');
    expect(structure.maxLevel).toBe(0);
  });

  test('should add WBS nodes and maintain hierarchy', () => {
    const rootNode = {
      code: '1',
      name: 'Phase 1',
      level: 1,
      children: [],
      taskIds: [],
    };

    const childNode = {
      code: '1.1',
      name: 'Subphase 1.1',
      level: 2,
      parentCode: '1',
      children: [],
      taskIds: [],
    };

    wbsManager.addNode(rootNode);
    wbsManager.addNode(childNode);

    const structure = wbsManager.getStructure();
    expect(structure.maxLevel).toBe(2);

    const retrievedRoot = wbsManager.getNode('1');
    expect(retrievedRoot?.children).toContain('1.1');
  });

  test('should generate child codes correctly', () => {
    const rootNode = {
      code: '1',
      name: 'Phase 1',
      level: 1,
      children: ['1.1'],
      taskIds: [],
    };

    wbsManager.addNode(rootNode);

    const newChildCode = wbsManager.generateChildCode('1');
    expect(newChildCode).toBe('1.2');
  });

  test('should get children of a node', () => {
    const rootNode = {
      code: '1',
      name: 'Phase 1',
      level: 1,
      children: [],
      taskIds: [],
    };

    const child1 = {
      code: '1.1',
      name: 'Subphase 1.1',
      level: 2,
      parentCode: '1',
      children: [],
      taskIds: [],
    };

    const child2 = {
      code: '1.2',
      name: 'Subphase 1.2',
      level: 2,
      parentCode: '1',
      children: [],
      taskIds: [],
    };

    wbsManager.addNode(rootNode);
    wbsManager.addNode(child1);
    wbsManager.addNode(child2);

    const children = wbsManager.getChildren('1');
    expect(children).toHaveLength(2);
    expect(children.map((c: WBSNode) => c.code)).toContain('1.1');
    expect(children.map((c: WBSNode) => c.code)).toContain('1.2');
  });
});

describe('Schedule Utils', () => {
  test('should create scheduled task from input', () => {
    const input: TaskInput = {
      id: 'task-001',
      name: 'Test Task',
      duration: 5,
    };

    const scheduleEngine = new ScheduleEngine();
    const scheduledTask = scheduleEngine.createScheduledTask(input);

    expect(scheduledTask.id).toBe('task-001');
    expect(scheduledTask.totalFloat).toBe(0);
    expect(scheduledTask.isCritical).toBe(false);
    expect(scheduledTask.status).toBe(TaskStatus.NOT_STARTED);
  });

  test('should calculate working days correctly', () => {
    // Monday to Friday (5 working days)
    const start = '2025-08-04T09:00:00.000Z'; // Monday
    const finish = '2025-08-08T17:00:00.000Z'; // Friday

    const workingDays = calculateWorkingDays(start, finish);
    expect(workingDays).toBe(5);
  });

  test('should add working days correctly', () => {
    // Start on Monday, add 5 working days should end on Monday next week
    const startDate = '2025-08-04T09:00:00.000Z'; // Monday
    const resultDate = addWorkingDays(startDate, 5);

    const resultDay = new Date(resultDate).getDay();
    expect(resultDay).toBe(1); // Monday (next week)
  });

  test('should validate schedule calculation request', () => {
    const invalidRequest: ScheduleCalculationRequest = {
      projectId: '',
      tasks: [],
      logicLinks: [],
    };

    const validationResults = ScheduleUtils.validateRequest(invalidRequest);
    expect(validationResults).toHaveLength(2);
    expect(validationResults[0].field).toBe('projectId');
    expect(validationResults[1].field).toBe('tasks');
  });

  test('should provide default calculation options', () => {
    const options = ScheduleUtils.getDefaultOptions();

    expect(options.includeFloat).toBe(true);
    expect(options.includeCriticalPath).toBe(true);
    expect(options.includeStatistics).toBe(true);
    expect(options.validateInput).toBe(true);
    expect(options.optimizePerformance).toBe(false);
  });
});
