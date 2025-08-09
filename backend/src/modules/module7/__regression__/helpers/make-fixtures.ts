import { readFileSync } from "fs";
import { join } from "path";

export interface Task {
  id: string;
  name: string;
  duration: number;
  skillRequirements: string[];
  priority: "critical" | "high" | "medium" | "low";
  dependencies: string[];
}

export interface Resource {
  id: string;
  name: string;
  skills: string[];
  capacity: number;
  hourlyRate: number;
}

export interface Schedule {
  tasks: Task[];
  resources: Resource[];
}

export interface TestData {
  schedule: Schedule;
  constraints: any;
  calendars: any;
  skills: any;
}

/**
 * Build test data with customizable size parameters
 */
export function makeData({
  tasks = 100,
  resources = 30,
  days = 10,
}: {
  tasks?: number;
  resources?: number;
  days?: number;
} = {}): TestData {
  // For small test sizes, use pre-built fixtures
  if (tasks <= 10) {
    return loadFixture("small");
  } else if (tasks <= 50) {
    return loadFixture("medium");
  }

  // For large test sizes, generate synthetic data
  return generateLargeData({ tasks, resources, days });
}

/**
 * Load pre-built fixture data
 */
function loadFixture(size: "small" | "medium"): TestData {
  const fixturesPath = join(__dirname, "..", "fixtures");

  const schedule = JSON.parse(
    readFileSync(join(fixturesPath, `schedule.${size}.json`), "utf-8"),
  );
  const constraints = JSON.parse(
    readFileSync(join(fixturesPath, "constraints.json"), "utf-8"),
  );
  const calendars = JSON.parse(
    readFileSync(join(fixturesPath, "calendars.json"), "utf-8"),
  );
  const skills = JSON.parse(
    readFileSync(join(fixturesPath, "skills.json"), "utf-8"),
  );

  return { schedule, constraints, calendars, skills };
}

/**
 * Generate large synthetic test data
 */
function generateLargeData({
  tasks,
  resources,
  days,
}: {
  tasks: number;
  resources: number;
  days: number;
}): TestData {
  const skillPool = [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "API Design",
    "Testing",
    "Jest",
    "DevOps",
    "Docker",
    "Security",
    "Python",
    "Machine Learning",
    "WebSockets",
    "React Native",
    "Mobile Development",
    "UI/UX",
    "Data Visualization",
    "Performance Tuning",
    "Database Optimization",
    "CI/CD",
    "Cypress",
    "Database Design",
    "GraphQL",
    "Redis",
    "AWS",
  ];

  const priorities: Array<"critical" | "high" | "medium" | "low"> = [
    "critical",
    "high",
    "medium",
    "low",
  ];

  // Generate tasks
  const generatedTasks: Task[] = [];
  for (let i = 1; i <= tasks; i++) {
    const skillCount = Math.floor(Math.random() * 3) + 1; // 1-3 skills per task
    const taskSkills = getRandomItems(skillPool, skillCount);

    const dependencyCount = Math.min(Math.floor(Math.random() * 3), i - 1); // 0-2 dependencies
    const dependencies: string[] = [];
    for (let j = 0; j < dependencyCount; j++) {
      const depIndex = Math.floor(Math.random() * (i - 1)) + 1;
      dependencies.push(`task-${depIndex}`);
    }

    generatedTasks.push({
      id: `task-${i}`,
      name: `Generated Task ${i}`,
      duration: Math.floor(Math.random() * 40) + 4, // 4-44 hours
      skillRequirements: taskSkills,
      priority: getRandomItem(priorities),
      dependencies: Array.from(new Set(dependencies)), // Remove duplicates
    });
  }

  // Generate resources
  const generatedResources: Resource[] = [];
  const namePool = [
    "Alex",
    "Jordan",
    "Sam",
    "Taylor",
    "Casey",
    "Morgan",
    "Riley",
    "Avery",
    "Quinn",
    "Blake",
  ];
  const rolePool = ["Senior", "Mid-level", "Junior", "Lead", "Principal"];
  const specialtyPool = [
    "Frontend",
    "Backend",
    "Fullstack",
    "DevOps",
    "QA",
    "Mobile",
    "Data",
    "Security",
  ];

  for (let i = 1; i <= resources; i++) {
    const skillCount = Math.floor(Math.random() * 5) + 2; // 2-6 skills per resource
    const resourceSkills = getRandomItems(skillPool, skillCount);
    const capacity = Math.floor(Math.random() * 3) + 6; // 6-8 hours capacity
    const hourlyRate = Math.floor(Math.random() * 40) + 60; // $60-100/hour

    generatedResources.push({
      id: `resource-${i}`,
      name: `${getRandomItem(namePool)} ${getRandomItem(rolePool)} ${getRandomItem(specialtyPool)}`,
      skills: resourceSkills,
      capacity,
      hourlyRate,
    });
  }

  // Generate calendars with blackouts for large datasets
  const calendars = {
    calendars: generatedResources
      .slice(0, Math.min(10, resources))
      .map((resource) => ({
        resourceId: resource.id,
        blackoutDays: generateRandomDates(days, 2), // Up to 2 blackout days
        reducedCapacityDays: generateRandomDates(days, 1).map((date) => ({
          date,
          capacity: Math.floor(resource.capacity * 0.5),
        })),
      })),
    publicHolidays: ["2025-09-01", "2025-12-25", "2025-12-26"],
  };

  const constraints = {
    constraints: {
      workingHours: { start: "09:00", end: "17:00" },
      maxOverallocPct: 15,
      skillMatchRequired: true,
      timeBudgetMs: 500,
      flags: {
        ENABLE_GA: true,
        ENABLE_SA: false,
        ENABLE_ML: false,
        ENABLE_GREEDY: true,
        ENABLE_LEVELING: false,
      },
    },
    hardCaps: {
      maxDailyHours: 10,
      maxWeeklyHours: 50,
      maxOverallocPct: 0,
    },
  };

  const skills = {
    skills: skillPool.map((skill) => ({
      id: skill,
      category: "Technical",
      level: "skill",
      prerequisites: [],
    })),
  };

  return {
    schedule: { tasks: generatedTasks, resources: generatedResources },
    constraints,
    calendars,
    skills,
  };
}

/**
 * Utility functions
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomDates(dayRange: number, maxCount: number): string[] {
  const dates: string[] = [];
  const baseDate = new Date("2025-08-09");
  const count = Math.floor(Math.random() * (maxCount + 1));

  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(Math.random() * dayRange);
    const date = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    dates.push(date.toISOString().split("T")[0]);
  }

  return Array.from(new Set(dates)); // Remove duplicates
}

/**
 * Create deterministic test data for consistent regression testing
 */
export function makeDetministicData(seed: number = 42): TestData {
  // Set seed for reproducible random generation
  let currentSeed = seed;
  const seededRandom = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  };

  // Use seeded random to generate consistent test data
  // This ensures the same test data is generated across test runs
  const tasks = Math.floor(seededRandom() * 50) + 50; // 50-99 tasks
  const resources = Math.floor(seededRandom() * 20) + 20; // 20-39 resources

  return generateLargeData({ tasks, resources, days: 14 });
}
