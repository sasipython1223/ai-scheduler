import { ResilienceAnalyzer } from '../../7.4.1-resilience-analyzer/resilience-analyzer';
import { Schedule, Task, Resource } from '../../shared-types';

function buildSyntheticSchedule(taskCount: number): Schedule {
  const tasks: Task[] = [];
  const resources: Resource[] = [];

  // Generate tasks
  for (let i = 0; i < taskCount; i++) {
    tasks.push({
      id: `task_${i}`,
      name: `Task ${i}`,
      duration: Math.floor(Math.random() * 10) + 1,
      dependencies: i > 0 ? [`task_${i - 1}`] : [],
      resourceAssignments: [],
      criticalPath: false,
      totalFloat: Math.random() * 5,
      freeFloat: Math.random() * 3,
    });
  }

  // Generate resources
  for (let i = 0; i < Math.ceil(taskCount / 10); i++) {
    resources.push({
      id: `resource_${i}`,
      name: `Resource ${i}`,
      capacity: 1,
      availability: [],
      skills: [],
      hourlyRate: 50,
    });
  }

  return {
    id: `perf_schedule_${taskCount}`,
    name: `Performance Test Schedule (${taskCount} tasks)`,
    tasks,
    resources,
    constraints: [],
    metadata: {
      createdAt: new Date(),
      lastModified: new Date(),
      version: '1.0.0',
      complexity: taskCount / 100,
      riskLevel: 'medium'
    }
  };
}

test('analyze 1k tasks < 10ms', () => {
  const ra = new ResilienceAnalyzer();
  const sched = buildSyntheticSchedule(1000);
  const t0 = performance.now();
  ra.analyzeScheduleResilience(sched);
  const dt = performance.now() - t0;
  expect(dt).toBeLessThan(10);
});
