import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule-service';
import { ScheduleValidator } from '../validators/schedule-validator';

/**
 * Schedule Controller
 * Handles HTTP requests for schedule calculation endpoints
 * Follows clean architecture principles with proper separation of concerns
 */
export class ScheduleController {
  private readonly scheduleService: ScheduleService;
  private readonly scheduleValidator: ScheduleValidator;

  constructor() {
    this.scheduleService = new ScheduleService();
    this.scheduleValidator = new ScheduleValidator();
  }

  /**
   * Calculate schedule using CPM algorithm
   * POST /api/schedule/calculate
   */
  public calculateSchedule = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Validate request body
      const validationResult = this.scheduleValidator.validateScheduleRequest(
        req.body
      );

      if (!validationResult.isValid) {
        this.sendValidationError(res, validationResult.errors);
        return;
      }

      // Process schedule calculation
      const result = await this.scheduleService.runScheduleCalculation(
        req.body
      );

      // Send success response
      this.sendSuccessResponse(res, result);
    } catch (error) {
      this.handleCalculationError(res, error);
    }
  };

  /**
   * Health check endpoint for schedule engine
   * GET /api/schedule/health
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'schedule-engine',
        version: '1.0.0',
        dependencies: {
          'forward-pass': 'available',
          'backward-pass': 'available',
          'float-analysis': 'available',
        },
      };

      res.status(200).json(health);
    } catch (error) {
      this.handleHealthError(res, error);
    }
  };

  /**
   * Send validation error response
   */
  private sendValidationError(res: Response, errors: string[]): void {
    const response = {
      success: false,
      error: {
        type: 'ValidationError',
        message: 'Invalid request data',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
  }

  /**
   * Send success response
   */
  private sendSuccessResponse(res: Response, data: unknown): void {
    const response = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  /**
   * Handle calculation errors
   */
  private handleCalculationError(res: Response, error: unknown): void {
    console.error('Schedule calculation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    const isBusinessError = this.isBusinessLogicError(error);

    const response = {
      success: false,
      error: {
        type: isBusinessError ? 'BusinessLogicError' : 'InternalServerError',
        message: isBusinessError
          ? errorMessage
          : 'Failed to calculate schedule',
        details: isBusinessError ? [] : ['Please try again or contact support'],
      },
      timestamp: new Date().toISOString(),
    };

    const statusCode = isBusinessError ? 422 : 500;
    res.status(statusCode).json(response);
  }

  /**
   * Handle health check errors
   */
  private handleHealthError(res: Response, error: unknown): void {
    console.error('Health check error:', error);

    const response = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    };

    res.status(503).json(response);
  }

  /**
   * Determine if error is business logic related
   */
  private isBusinessLogicError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const businessErrorPatterns = [
      'circular dependency',
      'invalid task',
      'invalid logic link',
      'calculation failed',
      'schedule validation',
    ];

    const errorMessage = error.message.toLowerCase();
    return businessErrorPatterns.some((pattern) =>
      errorMessage.includes(pattern)
    );
  }
}
