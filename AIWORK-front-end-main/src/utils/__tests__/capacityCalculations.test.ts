import {
  calculateCapacity,
  formatTime,
  getCapacityBarColor,
  getCapacityMessages,
  getTaskDuration,
  DEFAULT_DURATION_BY_KIND,
  SLIDER_TO_TARGET_FILL,
  type Task,
} from '../capacityCalculations';

describe('capacityCalculations', () => {
  describe('getTaskDuration', () => {
    it('should use explicit est_time if available (convert hours to minutes)', () => {
      const task: Task = {
        id: '1',
        text: 'Test task',
        est_time: 1.5, // 1.5 hours
        kind: 'core',
      };
      expect(getTaskDuration(task)).toBe(90); // 90 minutes
    });

    it('should use default duration by kind if est_time is not set', () => {
      const task: Task = {
        id: '1',
        text: 'Test task',
        kind: 'core',
      };
      expect(getTaskDuration(task)).toBe(DEFAULT_DURATION_BY_KIND.core);
    });

    it('should use manual default for unknown kind', () => {
      const task: Task = {
        id: '1',
        text: 'Test task',
        kind: 'unknown_kind',
      };
      expect(getTaskDuration(task)).toBe(DEFAULT_DURATION_BY_KIND.manual);
    });
  });

  describe('calculateCapacity', () => {
    it('should calculate breathing room capacity (≤85%)', () => {
      const tasks: Task[] = [
        { id: '1', text: 'Task 1', kind: 'core' }, // 45 min
        { id: '2', text: 'Task 2', kind: 'derivative' }, // 25 min
      ];
      const workHours = 40;
      const sliderValue = 85; // target_fill = 0.875

      const result = calculateCapacity(tasks, workHours, sliderValue);

      // target_capacity_hours = 40 * 0.875 = 35
      // planned_minutes = 45 + 25 = 70
      // planned_hours = 70 / 60 = 1.17
      // capacity_percent = (1.17 / 35) * 100 = 3.33%

      expect(result.targetCapacityHours).toBe(35);
      expect(result.plannedMinutes).toBe(70);
      expect(result.plannedHours).toBeCloseTo(1.17, 2);
      expect(result.capacityPercent).toBeCloseTo(3.33, 1);
      expect(result.capacityState).toBe('breathing_room');
    });

    it('should calculate tight fit capacity (86-100%)', () => {
      const tasks: Task[] = Array(40).fill(null)?.map((_, i) => ({
        id: `${i}`,
        text: `Task ${i}`,
        kind: 'core', // 45 min each
      }));
      const workHours = 40;
      const sliderValue = 85; // target_fill = 0.875

      const result = calculateCapacity(tasks, workHours, sliderValue);

      // target_capacity_hours = 40 * 0.875 = 35
      // planned_minutes = 40 * 45 = 1800
      // planned_hours = 1800 / 60 = 30
      // capacity_percent = (30 / 35) * 100 = 85.71%

      expect(result.targetCapacityHours).toBe(35);
      expect(result.plannedMinutes).toBe(1800);
      expect(result.plannedHours).toBe(30);
      expect(result.capacityPercent).toBeCloseTo(85.71, 1);
      expect(result.capacityState).toBe('breathing_room'); // Still under 85%
    });

    it('should calculate overbooked capacity (>100%)', () => {
      const tasks: Task[] = Array(60).fill(null)?.map((_, i) => ({
        id: `${i}`,
        text: `Task ${i}`,
        kind: 'core', // 45 min each
      }));
      const workHours = 40;
      const sliderValue = 85; // target_fill = 0.875

      const result = calculateCapacity(tasks, workHours, sliderValue);

      // target_capacity_hours = 40 * 0.875 = 35
      // planned_minutes = 60 * 45 = 2700
      // planned_hours = 2700 / 60 = 45
      // capacity_percent = (45 / 35) * 100 = 128.57%

      expect(result.targetCapacityHours).toBe(35);
      expect(result.plannedMinutes).toBe(2700);
      expect(result.plannedHours).toBe(45);
      expect(result.capacityPercent).toBeCloseTo(128.57, 1);
      expect(result.capacityState).toBe('overbooked');
    });

    it('should handle zero work hours edge case', () => {
      const tasks: Task[] = [
        { id: '1', text: 'Task 1', kind: 'core' },
      ];
      const workHours = 0;
      const sliderValue = 85;

      const result = calculateCapacity(tasks, workHours, sliderValue);

      expect(result.targetCapacityHours).toBe(0);
      expect(result.capacityPercent).toBe(0);
    });

    it('should handle no tasks edge case', () => {
      const tasks: Task[] = [];
      const workHours = 40;
      const sliderValue = 85;

      const result = calculateCapacity(tasks, workHours, sliderValue);

      expect(result.plannedMinutes).toBe(0);
      expect(result.plannedHours).toBe(0);
      expect(result.capacityPercent).toBe(0);
      expect(result.capacityState).toBe('breathing_room');
    });
  });

  describe('formatTime', () => {
    it('should format hours and minutes', () => {
      expect(formatTime(150)).toBe('2h 30m');
    });

    it('should format only hours when minutes is 0', () => {
      expect(formatTime(120)).toBe('2h');
    });

    it('should format only minutes when hours is 0', () => {
      expect(formatTime(45)).toBe('45m');
    });

    it('should round minutes', () => {
      expect(formatTime(150.7)).toBe('2h 31m');
    });
  });

  describe('getCapacityBarColor', () => {
    it('should return green for breathing room', () => {
      expect(getCapacityBarColor('breathing_room')).toBe('bg-chart-2');
    });

    it('should return yellow for tight fit', () => {
      expect(getCapacityBarColor('tight_fit')).toBe('bg-chart-4');
    });

    it('should return red for overbooked', () => {
      expect(getCapacityBarColor('overbooked')).toBe('bg-chart-5');
    });
  });

  describe('getCapacityMessages', () => {
    it('should return breathing room messages', () => {
      const messages = getCapacityMessages(75, 'breathing_room');
      expect(messages.headline).toContain('75% capacity');
      expect(messages.supporting).toContain('room this week');
    });

    it('should return tight fit messages', () => {
      const messages = getCapacityMessages(95, 'tight_fit');
      expect(messages.headline).toContain('95% capacity');
      expect(messages.supporting).toContain('right at the edge');
    });

    it('should return overbooked messages', () => {
      const messages = getCapacityMessages(150, 'overbooked');
      expect(messages.headline).toContain('150% capacity');
      expect(messages.supporting).toContain('Something will break');
    });

    it('should round capacity percent for display', () => {
      const messages = getCapacityMessages(85.7, 'breathing_room');
      expect(messages.headline).toContain('86% capacity');
    });
  });

  describe('SLIDER_TO_TARGET_FILL mapping', () => {
    it('should map breathing room range (70-80) to 0.75', () => {
      expect(SLIDER_TO_TARGET_FILL[70]).toBe(0.75);
      expect(SLIDER_TO_TARGET_FILL[75]).toBe(0.75);
      expect(SLIDER_TO_TARGET_FILL[80]).toBe(0.75);
    });

    it('should map fully engaged range (85-90) to 0.875', () => {
      expect(SLIDER_TO_TARGET_FILL[85]).toBe(0.875);
      expect(SLIDER_TO_TARGET_FILL[90]).toBe(0.875);
    });

    it('should map all in range (95-100) to 0.975', () => {
      expect(SLIDER_TO_TARGET_FILL[95]).toBe(0.975);
      expect(SLIDER_TO_TARGET_FILL[100]).toBe(0.975);
    });
  });
});
