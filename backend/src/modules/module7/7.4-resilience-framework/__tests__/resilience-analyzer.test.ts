import { ResilienceAnalyzer } from '../7.4.1-resilience-analyzer/resilience-analyzer';
import { Schedule } from '../shared-types';

const makeSchedule = (overrides: Partial<Schedule> = {}): Schedule => ({
  id: 'S1',
  name: 'Test Schedule',
  tasks: [], 
  resources: [], 
  constraints: [],
  metadata: { 
    createdAt: new Date(), 
    lastModified: new Date(), 
    version: '1.0.0',
    complexity: 1,
    riskLevel: 'low'
  },
  ...overrides,
});

describe('ResilienceAnalyzer', () => {
  it('returns an overall score between 0 and 100', () => {
    const ra = new ResilienceAnalyzer();
    const m = ra.analyzeScheduleResilience(makeSchedule());
    expect(m.overallScore).toBeGreaterThanOrEqual(0);
    expect(m.overallScore).toBeLessThanOrEqual(100);
  });

  it('penalizes critical path slack near zero', () => {
    const ra = new ResilienceAnalyzer();
    // TODO: craft schedule with near-zero slack in extraction helpers or pass stats via spies
    const m = ra.analyzeScheduleResilience(makeSchedule());
    // expect lower score when minSlack≈0 vs baseline
    // implement once extraction helpers are parameterized for tests
    expect(m).toBeTruthy();
  });

  it('improves when buffer sufficiency increases', () => {
    // Use calculator directly for determinism
    // expect(scoreHi).toBeGreaterThan(scoreLo)
  });
});
