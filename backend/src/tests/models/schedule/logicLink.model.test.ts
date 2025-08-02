/**
 * Logic Link Model Unit Tests
 * AI Scheduler - Module 5.1: Logic Link Model Tests
 */

import {
  createLogicLink,
  LogicLinkModel,
  validateLogicLink,
} from '../../../models/schedule/logicLink.model';
import { LogicLink, LogicType } from '../../../types/scheduleTypes';
import {
  createTestLogicLink,
  invalidLogicLinks,
  mockLogicLinks,
} from '../../fixtures/mockScheduleProject';

describe('Logic Link Model', () => {
  describe('LogicLinkModel class', () => {
    let validLink: LogicLinkModel;

    beforeEach(() => {
      validLink = new LogicLinkModel(mockLogicLinks[0]); // A->B FS link
    });

    it('should create logic link with valid input', () => {
      const data = validLink.getData();
      expect(data.id).toBe('L1');
      expect(data.from).toBe('A');
      expect(data.to).toBe('B');
      expect(data.type).toBe('FS');
      expect(data.lag).toBe(0);
    });

    it('should validate successfully for valid link', () => {
      const results = validLink.validate();
      expect(results).toEqual([]);
    });

    it('should get link type correctly', () => {
      expect(validLink.getLinkType()).toBe('FS');
    });

    it('should identify finish-to-start links', () => {
      expect(validLink.isFinishToStart()).toBe(true);
      expect(validLink.isStartToStart()).toBe(false);
      expect(validLink.isFinishToFinish()).toBe(false);
      expect(validLink.isStartToFinish()).toBe(false);
    });

    it('should handle different link types', () => {
      const ssLink = new LogicLinkModel(createTestLogicLink({ type: 'SS' }));
      expect(ssLink.isStartToStart()).toBe(true);
      expect(ssLink.isFinishToStart()).toBe(false);

      const ffLink = new LogicLinkModel(createTestLogicLink({ type: 'FF' }));
      expect(ffLink.isFinishToFinish()).toBe(true);
      expect(ffLink.isFinishToStart()).toBe(false);

      const sfLink = new LogicLinkModel(createTestLogicLink({ type: 'SF' }));
      expect(sfLink.isStartToFinish()).toBe(true);
      expect(sfLink.isFinishToStart()).toBe(false);
    });

    it('should get source and target task IDs', () => {
      expect(validLink.getPredecessor()).toBe('A');
      expect(validLink.getSuccessor()).toBe('B');
    });

    it('should get lag value', () => {
      expect(validLink.getLag()).toBe(0);

      const laggedLink = new LogicLinkModel(createTestLogicLink({ lag: 5 }));
      expect(laggedLink.getLag()).toBe(5);
    });

    it('should handle missing lag field (default to 0)', () => {
      expect(validLink.getLag()).toBe(0);

      const laggedLink = new LogicLinkModel(createTestLogicLink({ lag: 3 }));
      expect(laggedLink.getLag()).toBe(3);
    });
  });

  describe('validateLogicLink function', () => {
    it('should accept valid logic link', () => {
      const results = validateLogicLink(mockLogicLinks[0]);
      expect(results).toEqual([]);
    });

    it('should reject link with missing from field', () => {
      const results = validateLogicLink(
        invalidLogicLinks.missingFrom as LogicLink
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'from',
          isValid: false,
          message: 'Predecessor task ID is required',
        })
      );
    });

    it('should reject link with missing to field', () => {
      const results = validateLogicLink(
        invalidLogicLinks.missingTo as LogicLink
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'to',
          isValid: false,
          message: 'Successor task ID is required',
        })
      );
    });

    it('should reject self-referencing links', () => {
      const results = validateLogicLink(
        invalidLogicLinks.selfLink as LogicLink
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'to',
          isValid: false,
          message: 'Task cannot be linked to itself',
        })
      );
    });

    it('should reject invalid link types', () => {
      const results = validateLogicLink(
        invalidLogicLinks.invalidType as LogicLink
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'type',
          isValid: false,
          message: 'Logic type must be FS, SS, FF, or SF',
        })
      );
    });

    it('should accept all valid link types', () => {
      const validTypes: LogicType[] = ['FS', 'SS', 'FF', 'SF'];

      validTypes.forEach((type) => {
        const link = createTestLogicLink({ type });
        const results = validateLogicLink(link);
        const typeErrors = results.filter((r) => r.field === 'type');
        expect(typeErrors).toEqual([]);
      });
    });

    it('should accept positive lag values', () => {
      const link = createTestLogicLink({ lag: 5 });
      const results = validateLogicLink(link);
      const lagErrors = results.filter((r) => r.field === 'lag');
      expect(lagErrors).toEqual([]);
    });

    it('should accept negative lag values (lead time)', () => {
      const link = createTestLogicLink({ lag: -3 });
      const results = validateLogicLink(link);
      const lagErrors = results.filter((r) => r.field === 'lag');
      expect(lagErrors).toEqual([]);
    });

    it('should accept zero lag values', () => {
      const link = createTestLogicLink({ lag: 0 });
      const results = validateLogicLink(link);
      const lagErrors = results.filter((r) => r.field === 'lag');
      expect(lagErrors).toEqual([]);
    });
  });

  describe('createLogicLink function', () => {
    it('should create logic link with minimal data', () => {
      const minimalInput = {
        id: 'MIN-L1',
        from: 'TASK-A',
        to: 'TASK-B',
        type: 'FS' as LogicType,
        lag: 0,
      };

      const link = createLogicLink(minimalInput);
      const data = link.getData();
      expect(data.id).toBe('MIN-L1');
      expect(data.from).toBe('TASK-A');
      expect(data.to).toBe('TASK-B');
      expect(data.type).toBe('FS');
      expect(data.lag).toBe(0);
    });

    it('should preserve all provided values', () => {
      const fullLink = createLogicLink(mockLogicLinks[1]); // B->C
      const data = fullLink.getData();
      expect(data.id).toBe('L2');
      expect(data.from).toBe('B');
      expect(data.to).toBe('C');
      expect(data.type).toBe('FS');
      expect(data.lag).toBe(0);
    });

    it('should validate input during creation', () => {
      expect(() =>
        createLogicLink(invalidLogicLinks.missingFrom as LogicLink)
      ).toThrow(); // Should throw because validation fails
    });
  });

  describe('Edge cases', () => {
    it('should handle very long task IDs', () => {
      const longId = 'TASK-' + 'A'.repeat(1000);
      const link = createTestLogicLink({
        from: longId,
        to: 'TASK-B',
      });
      const results = validateLogicLink(link);
      expect(results.filter((r) => r.field === 'from')).toEqual([]);
    });

    it('should handle special characters in task IDs', () => {
      const specialId = 'TASK-@#$%_émoji🚀';
      const link = createTestLogicLink({
        from: specialId,
        to: 'TASK-B',
      });
      const results = validateLogicLink(link);
      expect(results.filter((r) => r.field === 'from')).toEqual([]);
    });

    it('should handle very large lag values', () => {
      const link = createTestLogicLink({ lag: 999999 });
      const results = validateLogicLink(link);
      expect(results.filter((r) => r.field === 'lag')).toEqual([]);
    });

    it('should handle very large negative lag values', () => {
      const link = createTestLogicLink({ lag: -999999 });
      const results = validateLogicLink(link);
      expect(results.filter((r) => r.field === 'lag')).toEqual([]);
    });

    it('should handle missing lag field (default to 0)', () => {
      const linkData = {
        id: 'TEST-LINK',
        from: 'TASK-A',
        to: 'TASK-B',
        type: 'FS' as LogicType,
        // lag field omitted
      };
      const link = createLogicLink(linkData as LogicLink);
      expect(link.getLag()).toBe(0);
    });

    it('should handle undefined lag field', () => {
      const link = createTestLogicLink({ lag: undefined });
      const linkObj = createLogicLink(link);
      expect(linkObj.getLag()).toBe(0);
    });
  });

  describe('Link type specific behavior', () => {
    it('should correctly identify FS (Finish-to-Start) relationships', () => {
      const fsLink = new LogicLinkModel(createTestLogicLink({ type: 'FS' }));
      expect(fsLink.isFinishToStart()).toBe(true);
      expect(fsLink.getLinkType()).toBe('FS');
    });

    it('should correctly identify SS (Start-to-Start) relationships', () => {
      const ssLink = new LogicLinkModel(createTestLogicLink({ type: 'SS' }));
      expect(ssLink.isStartToStart()).toBe(true);
      expect(ssLink.getLinkType()).toBe('SS');
    });

    it('should correctly identify FF (Finish-to-Finish) relationships', () => {
      const ffLink = new LogicLinkModel(createTestLogicLink({ type: 'FF' }));
      expect(ffLink.isFinishToFinish()).toBe(true);
      expect(ffLink.getLinkType()).toBe('FF');
    });

    it('should correctly identify SF (Start-to-Finish) relationships', () => {
      const sfLink = new LogicLinkModel(createTestLogicLink({ type: 'SF' }));
      expect(sfLink.isStartToFinish()).toBe(true);
      expect(sfLink.getLinkType()).toBe('SF');
    });
  });
});
