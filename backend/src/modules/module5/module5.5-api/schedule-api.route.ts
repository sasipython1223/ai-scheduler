import { Request, Response, Router } from 'express';
import { ScheduleController } from './schedule-controller';

/**
 * Schedule API Routes
 * Defines REST endpoints for schedule calculation functionality
 * Integrates with Express.js router and schedule controller
 */
export class ScheduleApiRoutes {
  private readonly router: Router;
  private readonly scheduleController: ScheduleController;

  constructor() {
    this.router = Router();
    this.scheduleController = new ScheduleController();
    this.setupRoutes();
  }

  /**
   * Get configured router with all schedule routes
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Setup all schedule-related routes
   */
  private setupRoutes(): void {
    // Schedule calculation endpoint
    this.router.post('/calculate', this.scheduleController.calculateSchedule);

    // Health check endpoint
    this.router.get('/health', this.scheduleController.healthCheck);

    // API documentation endpoint
    this.router.get('/docs', this.getApiDocumentation);
  }

  /**
   * Get API documentation
   * GET /api/schedule/docs
   */
  private getApiDocumentation = (req: Request, res: Response): void => {
    const documentation = this.buildApiDocumentation();
    res.status(200).json(documentation);
  };

  /**
   * Build complete API documentation object
   */
  private buildApiDocumentation(): Record<string, unknown> {
    return {
      title: 'Schedule Engine API',
      version: '1.0.0',
      description:
        'REST API for Critical Path Method (CPM) schedule calculations',
      endpoints: this.getEndpointDocumentation(),
      examples: this.getExampleDocumentation(),
    };
  }

  /**
   * Get endpoint documentation
   */
  private getEndpointDocumentation(): unknown[] {
    return [this.getCalculateEndpointDoc(), this.getHealthEndpointDoc()];
  }

  /**
   * Get calculate endpoint documentation
   */
  private getCalculateEndpointDoc(): Record<string, unknown> {
    return {
      method: 'POST',
      path: '/api/schedule/calculate',
      description: 'Calculate project schedule using CPM algorithm',
      requestBody: this.getCalculateRequestSchema(),
      responses: this.getCalculateResponseSchema(),
    };
  }

  /**
   * Get health endpoint documentation
   */
  private getHealthEndpointDoc(): Record<string, unknown> {
    return {
      method: 'GET',
      path: '/api/schedule/health',
      description: 'Check schedule engine health status',
      responses: {
        200: { description: 'Service is healthy' },
        503: { description: 'Service is unhealthy' },
      },
    };
  }

  /**
   * Get calculate request schema
   */
  private getCalculateRequestSchema(): Record<string, unknown> {
    return {
      type: 'object',
      required: ['tasks', 'logicLinks'],
      properties: {
        tasks: {
          type: 'array',
          description: 'List of project tasks',
          items: {
            type: 'object',
            required: ['id', 'duration'],
            properties: {
              id: { type: 'string', description: 'Unique task identifier' },
              name: { type: 'string', description: 'Task name' },
              duration: {
                type: 'number',
                description: 'Task duration in days',
              },
              resources: { type: 'array', description: 'Assigned resources' },
              constraints: { type: 'object', description: 'Task constraints' },
            },
          },
        },
        logicLinks: {
          type: 'array',
          description: 'Task dependencies',
          items: {
            type: 'object',
            required: ['from', 'to', 'type'],
            properties: {
              from: { type: 'string', description: 'Predecessor task ID' },
              to: { type: 'string', description: 'Successor task ID' },
              type: { type: 'string', enum: ['FS', 'SS', 'FF', 'SF'] },
              lag: { type: 'number', description: 'Lag duration in days' },
            },
          },
        },
        projectStartDate: {
          type: 'string',
          description: 'Project start date (ISO format)',
        },
        options: { type: 'object', description: 'Calculation options' },
      },
    };
  }

  /**
   * Get calculate response schema
   */
  private getCalculateResponseSchema(): Record<string, unknown> {
    return {
      200: {
        description: 'Schedule calculated successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                tasks: {
                  type: 'array',
                  description: 'Tasks with calculated dates',
                },
                criticalPath: {
                  type: 'array',
                  description: 'Critical path task IDs',
                },
                projectDuration: {
                  type: 'number',
                  description: 'Total project duration',
                },
                projectEndDate: {
                  type: 'string',
                  description: 'Calculated end date',
                },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
      400: { description: 'Validation error' },
      422: { description: 'Business logic error' },
      500: { description: 'Internal server error' },
    };
  }

  /**
   * Get example documentation
   */
  private getExampleDocumentation(): Record<string, unknown> {
    return {
      calculateRequest: {
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
      },
    };
  }
}

/**
 * Factory function to create and configure schedule routes
 */
export function createScheduleRoutes(): Router {
  const scheduleRoutes = new ScheduleApiRoutes();
  return scheduleRoutes.getRouter();
}
