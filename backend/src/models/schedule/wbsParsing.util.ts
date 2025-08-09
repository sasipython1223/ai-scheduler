/**
 * WBS Parsing Utilities
 * AI Scheduler - Module 5.1: WBS Parsing and Validation
 *
 * Utilities for parsing WBS codes and validating hierarchy
 */

import { WBSNode } from '../../types/scheduleTypes';
import { WBSManager } from './wbs.model';

/**
 * WBS parsing utilities
 */
export class WBSParser {
  /**
   * Parse WBS hierarchy from flat task list
   */
  public static parseFromTasks(
    tasks: Array<{ id: string; wbs?: string; name: string }>
  ): WBSManager {
    const manager = new WBSManager('PROJECT');
    const nodeMap = new Map<string, WBSNode>();

    // First pass: create all nodes
    for (const task of tasks) {
      if (!task.wbs) continue;

      if (!WBSCodeValidator.isValidWBSCode(task.wbs)) {
        console.warn(`Invalid WBS code: ${task.wbs}`);
        continue;
      }

      const level = WBSCodeValidator.parseWBSLevel(task.wbs);
      const parentCode = WBSCodeValidator.getParentCode(task.wbs);

      const node: WBSNode = {
        code: task.wbs,
        name: task.name,
        level,
        parentCode,
        children: [],
        taskIds: [task.id],
      };

      nodeMap.set(task.wbs, node);
    }

    // Second pass: add nodes to manager
    const nodeList = Array.from(nodeMap.values());
    for (const node of nodeList) {
      manager.addNode(node);
    }

    return manager;
  }

  /**
   * Validate WBS hierarchy consistency
   */
  public static validateHierarchy(manager: WBSManager): string[] {
    const errors: string[] = [];
    const structure = manager.getStructure();

    const nodeList = Array.from(structure.nodes.values());
    for (const node of nodeList) {
      // Check parent exists if parentCode is specified
      if (node.parentCode && !structure.nodes.has(node.parentCode)) {
        errors.push(`Node ${node.code}: Parent ${node.parentCode} not found`);
      }

      // Check level consistency
      const expectedLevel = WBSCodeValidator.parseWBSLevel(node.code);
      if (node.level !== expectedLevel) {
        errors.push(
          `Node ${node.code}: Level mismatch (expected ${expectedLevel}, got ${node.level})`
        );
      }

      // Check children exist
      if (node.children) {
        for (const childCode of node.children) {
          if (!structure.nodes.has(childCode)) {
            errors.push(`Node ${node.code}: Child ${childCode} not found`);
          }
        }
      }
    }

    return errors;
  }
}

/**
 * WBS Code validation utilities
 */
export class WBSCodeValidator {
  /**
   * Check if a code is valid WBS format
   */
  public static isValidWBSCode(code: string): boolean {
    const wbsPattern = /^(\d+\.)*\d+$/;
    return wbsPattern.test(code);
  }

  /**
   * Parse WBS level from code
   */
  public static parseWBSLevel(code: string): number {
    if (!this.isValidWBSCode(code)) return 0;
    return code.split('.').length;
  }

  /**
   * Get parent code from WBS code
   */
  public static getParentCode(code: string): string | undefined {
    if (!this.isValidWBSCode(code)) return undefined;
    const parts = code.split('.');
    if (parts.length <= 1) return undefined;
    return parts.slice(0, -1).join('.');
  }

  /**
   * Sort WBS codes in hierarchical order
   */
  public static sortWBSCodes(codes: string[]): string[] {
    return codes.sort((a, b) => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);

      const maxLength = Math.max(partsA.length, partsB.length);

      for (let i = 0; i < maxLength; i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;

        if (numA !== numB) {
          return numA - numB;
        }
      }

      return 0;
    });
  }

  /**
   * Get all descendant codes from a parent code
   */
  public static getDescendantCodes(
    parentCode: string,
    allCodes: string[]
  ): string[] {
    return allCodes.filter(
      (code) => code.startsWith(parentCode + '.') && code !== parentCode
    );
  }

  /**
   * Get all ancestor codes from a child code
   */
  public static getAncestorCodes(childCode: string): string[] {
    const ancestors: string[] = [];
    const parts = childCode.split('.');

    for (let i = 1; i < parts.length; i++) {
      ancestors.push(parts.slice(0, i).join('.'));
    }

    return ancestors;
  }
}

/**
 * Utility functions for WBS parsing
 */
export function parseWBSFromTasks(
  tasks: Array<{ id: string; wbs?: string; name: string }>
): WBSManager {
  return WBSParser.parseFromTasks(tasks);
}

export function validateWBSHierarchy(manager: WBSManager): string[] {
  return WBSParser.validateHierarchy(manager);
}

export function validateWBSCode(code: string): boolean {
  return WBSCodeValidator.isValidWBSCode(code);
}

export function sortWBSCodes(codes: string[]): string[] {
  return WBSCodeValidator.sortWBSCodes(codes);
}
