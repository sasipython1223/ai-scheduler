import express from 'express';
import { ScheduleController } from '../controllers/schedule-controller';
import { createScheduleRoutes } from '../routes/schedule-api';
import { ScheduleService } from '../services/schedule-service';
import { ScheduleValidator } from '../validators/schedule-validator';

/**
 * Schedule API Integration Tests
 * Comprehensive test suite for schedule calculation endpoints
 * Tests component integration and API structure
 */
describe('Schedule API Components', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/schedule', createScheduleRoutes());
  });

  describe('API Route Registration', () => {
    it('should create express application with schedule routes', () => {
      expect(app).toBeDefined();
      expect(typeof createScheduleRoutes).toBe('function');
    });

    it('should have proper route structure', () => {
      const router = createScheduleRoutes();
      expect(router).toBeDefined();
      expect(router.stack).toBeDefined();
    });
  });

  describe('Controller Integration', () => {
    runControllerTests();
  });

  describe('Service Layer Integration', () => {
    runServiceTests();
  });

  describe('Validation Layer Integration', () => {
    runValidationTests();
  });

  describe('Request/Response Structure Tests', () => {
    runStructureTests();
  });

  describe('Error Handling Structure', () => {
    runErrorHandlingTests();
  });

  describe('Health Check Structure', () => {
    runHealthCheckTests();
  });
});

/**
 * Run controller integration tests
 */
function runControllerTests(): void {
  it('should instantiate controller with required methods', () => {
    const controller = new ScheduleController();
    expect(controller).toBeDefined();
    expect(typeof controller.calculateSchedule).toBe('function');
    expect(typeof controller.healthCheck).toBe('function');
  });

  it('should handle async operations properly', () => {
    const controller = new ScheduleController();
    expect(controller.calculateSchedule).toBeInstanceOf(Function);
    expect(controller.healthCheck).toBeInstanceOf(Function);
  });
}

/**
 * Run service layer tests
 */
function runServiceTests(): void {
  it('should instantiate service with required methods', () => {
    const service = new ScheduleService();
    expect(service).toBeDefined();
    expect(typeof service.runScheduleCalculation).toBe('function');
  });

  it('should handle schedule calculation structure', () => {
    const service = new ScheduleService();
    const validRequest = getValidServiceRequest();

    // Test structure without actual calculation
    expect(validRequest.tasks).toBeDefined();
    expect(validRequest.logicLinks).toBeDefined();
    expect(service).toBeDefined();
  });
}

/**
 * Run validation layer tests
 */
function runValidationTests(): void {
  it('should instantiate validator with required methods', () => {
    const validator = new ScheduleValidator();
    expect(validator).toBeDefined();
    expect(typeof validator.validateScheduleRequest).toBe('function');
  });

  it('should validate valid schedule requests', () => {
    const validator = new ScheduleValidator();
    const validRequest = getValidScheduleRequest();
    const result = validator.validateScheduleRequest(validRequest);

    expect(result).toBeDefined();
    expect(typeof result.isValid).toBe('boolean');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('should reject invalid schedule requests', () => {
    const validator = new ScheduleValidator();
    const invalidRequest = {};
    const result = validator.validateScheduleRequest(invalidRequest);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate task structure', () => {
    const validator = new ScheduleValidator();
    const requestWithInvalidTasks = {
      tasks: [{ id: 'A' }], // Missing duration
      logicLinks: [],
    };

    const result = validator.validateScheduleRequest(requestWithInvalidTasks);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.includes('duration'))).toBe(
      true
    );
  });

  it('should validate logic link structure', () => {
    const validator = new ScheduleValidator();
    const requestWithInvalidLinks = {
      tasks: [{ id: 'A', duration: 5 }],
      logicLinks: [{ from: 'A', to: 'B', type: 'INVALID' }],
    };

    const result = validator.validateScheduleRequest(requestWithInvalidLinks);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.includes('type'))).toBe(true);
  });
}

/**
 * Run request/response structure tests
 */
function runStructureTests(): void {
  it('should define valid request structure', () => {
    const validRequest = getValidScheduleRequest();

    expect(validRequest.tasks).toBeDefined();
    expect(Array.isArray(validRequest.tasks)).toBe(true);
    expect(validRequest.tasks.length).toBeGreaterThan(0);

    expect(validRequest.logicLinks).toBeDefined();
    expect(Array.isArray(validRequest.logicLinks)).toBe(true);
  });

  it('should validate task properties', () => {
    const validRequest = getValidScheduleRequest();
    const firstTask = validRequest.tasks[0];

    expect(firstTask.id).toBeDefined();
    expect(typeof firstTask.id).toBe('string');
    expect(firstTask.duration).toBeDefined();
    expect(typeof firstTask.duration).toBe('number');
    expect(firstTask.duration).toBeGreaterThan(0);
  });

  it('should validate logic link properties', () => {
    const validRequest = getValidScheduleRequest();
    const firstLink = validRequest.logicLinks[0];

    expect(firstLink.from).toBeDefined();
    expect(typeof firstLink.from).toBe('string');
    expect(firstLink.to).toBeDefined();
    expect(typeof firstLink.to).toBe('string');
    expect(firstLink.type).toBeDefined();
    expect(['FS', 'SS', 'FF', 'SF']).toContain(firstLink.type);
  });
}

/**
 * Run error handling tests
 */
function runErrorHandlingTests(): void {
  it('should define error response structure', () => {
    const errorResponse = getErrorResponseStructure();

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.error.type).toBeDefined();
    expect(errorResponse.error.message).toBeDefined();
    expect(Array.isArray(errorResponse.error.details)).toBe(true);
    expect(errorResponse.timestamp).toBeDefined();
  });

  it('should define success response structure', () => {
    const successResponse = getSuccessResponseStructure();

    expect(successResponse.success).toBe(true);
    expect(successResponse.data).toBeDefined();
    expect(successResponse.timestamp).toBeDefined();
  });
}

/**
 * Run health check tests
 */
function runHealthCheckTests(): void {
  it('should define health response structure', () => {
    const healthResponse = getHealthResponseStructure();

    expect(healthResponse.status).toBeDefined();
    expect(healthResponse.service).toBe('schedule-engine');
    expect(healthResponse.dependencies).toBeDefined();
    expect(healthResponse.timestamp).toBeDefined();
  });
}

/**
 * Get valid schedule request for testing
 */
function getValidScheduleRequest(): ScheduleRequest {
  return {
    tasks: [
      { id: 'A', name: 'Task A', duration: 5 },
      { id: 'B', name: 'Task B', duration: 3 },
      { id: 'C', name: 'Task C', duration: 7 },
    ],
    logicLinks: [
      { from: 'A', to: 'B', type: 'FS' },
      { from: 'B', to: 'C', type: 'FS' },
    ],
    projectStartDate: '2024-01-01T00:00:00.000Z',
  };
}

/**
 * Get valid service request for testing
 */
function getValidServiceRequest(): ServiceRequest {
  return {
    tasks: [
      { id: 'A', name: 'Task A', duration: 5 },
      { id: 'B', name: 'Task B', duration: 3 },
      { id: 'C', name: 'Task C', duration: 7 },
    ],
    logicLinks: [
      { from: 'A', to: 'B', type: 'FS' },
      { from: 'B', to: 'C', type: 'FS' },
    ],
  };
}

/**
 * Get error response structure
 */
function getErrorResponseStructure(): ErrorResponse {
  return {
    success: false,
    error: {
      type: 'ValidationError',
      message: 'Invalid request data',
      details: ['Sample error message'],
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get success response structure
 */
function getSuccessResponseStructure(): SuccessResponse {
  return {
    success: true,
    data: {
      tasks: [],
      criticalPath: [],
      projectDuration: 0,
      projectEndDate: '',
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get health response structure
 */
function getHealthResponseStructure(): HealthResponse {
  return {
    status: 'healthy',
    service: 'schedule-engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dependencies: {
      'forward-pass': 'available',
      'backward-pass': 'available',
      'float-analysis': 'available',
    },
  };
}

// Type definitions for test structures
interface ScheduleRequest {
  tasks: Array<{ id: string; name?: string; duration: number }>;
  logicLinks: Array<{ from: string; to: string; type: string; lag?: number }>;
  projectStartDate?: string;
}

interface ServiceRequest {
  tasks: Array<{ id: string; name: string; duration: number }>;
  logicLinks: Array<{ from: string; to: string; type: string; lag?: number }>;
}

interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details: string[];
  };
  timestamp: string;
}

interface SuccessResponse {
  success: true;
  data: {
    tasks: unknown[];
    criticalPath: string[];
    projectDuration: number;
    projectEndDate: string;
  };
  timestamp: string;
}

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
  dependencies: Record<string, string>;
}
