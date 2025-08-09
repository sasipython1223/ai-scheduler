/**
 * Module 5.1 Logic Link Test
 * AI Scheduler - Module 5.1: Logic Link Model tests
 */

import { LogicLinkModel } from '../models/schedule/logicLink.model';
import { LogicType } from '../types/scheduleTypes';

describe('Module 5.1 Logic Link Tests', () => {
  describe('LogicLinkModel', () => {
    it('should create a logic link', () => {
      const linkData = {
        id: 'LINK-1',
        from: 'TASK-A',
        to: 'TASK-B',
        type: 'FS' as LogicType,
        lag: 0,
      };

      const link = new LogicLinkModel(linkData);
      const data = link.getData();

      expect(data.id).toBe('LINK-1');
      expect(data.from).toBe('TASK-A');
      expect(data.to).toBe('TASK-B');
      expect(link.getLinkType()).toBe('FS');
    });

    it('should identify link types correctly', () => {
      const fsLink = new LogicLinkModel({
        id: 'FS-1',
        from: 'A',
        to: 'B',
        type: 'FS' as LogicType,
        lag: 0,
      });

      expect(fsLink.isFinishToStart()).toBe(true);
      expect(fsLink.isStartToStart()).toBe(false);
      expect(fsLink.isFinishToFinish()).toBe(false);
      expect(fsLink.isStartToFinish()).toBe(false);
    });

    it('should handle different link types', () => {
      const linkTypes: LogicType[] = ['FS', 'SS', 'FF', 'SF'];

      linkTypes.forEach((type) => {
        const link = new LogicLinkModel({
          id: `LINK-${type}`,
          from: 'A',
          to: 'B',
          type,
          lag: 0,
        });

        expect(link.getLinkType()).toBe(type);
      });
    });

    it('should validate logic link data', () => {
      const validLink = {
        id: 'VALID-1',
        from: 'TASK-A',
        to: 'TASK-B',
        type: 'FS' as LogicType,
        lag: 0,
      };

      const link = new LogicLinkModel(validLink);
      const results = link.validate();

      expect(results).toEqual([]);
    });

    it('should detect invalid logic link data', () => {
      const invalidLink = {
        id: 'VALID-ID', // ID is not validated by LogicLinkModel
        from: '', // This should cause validation error
        to: 'TASK-B',
        type: 'FS' as LogicType,
        lag: 0,
      };

      const link = new LogicLinkModel(invalidLink);
      const results = link.validate();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].field).toBe('from');
      expect(results[0].isValid).toBe(false);
    });

    it('should handle lag values correctly', () => {
      const linkWithLag = new LogicLinkModel({
        id: 'LAG-1',
        from: 'A',
        to: 'B',
        type: 'FS' as LogicType,
        lag: 3,
      });

      expect(linkWithLag.getData().lag).toBe(3);
    });

    it('should prevent self-referencing links', () => {
      const selfLink = new LogicLinkModel({
        id: 'SELF-1',
        from: 'TASK-A',
        to: 'TASK-A',
        type: 'FS' as LogicType,
        lag: 0,
      });

      const results = selfLink.validate();

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((r) => r.message && r.message.includes('linked to itself'))
      ).toBe(true);
    });
  });
});
