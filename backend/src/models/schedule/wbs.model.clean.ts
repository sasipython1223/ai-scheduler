/**
 * Work Breakdown Structure (WBS) Model
 * AI Scheduler - Module 5.1: WBS Hierarchy Management
 *
 * Core WBS hierarchy management and navigation
 */

import { WBSNode, WBSStructure } from '../../types/scheduleTypes.js';

/**
 * WBS structure manager with hierarchy management
 */
export class WBSManager {
  private structure: WBSStructure;

  constructor(projectCode: string) {
    this.structure = {
      projectCode,
      nodes: new Map(),
      maxLevel: 0,
    };
  }

  /**
   * Add WBS node to the structure
   */
  public addNode(node: WBSNode): void {
    this.structure.nodes.set(node.code, node);
    this.structure.maxLevel = Math.max(this.structure.maxLevel, node.level);

    // Update parent's children array
    if (node.parentCode) {
      const parent = this.structure.nodes.get(node.parentCode);
      if (parent) {
        parent.children = parent.children || [];
        if (!parent.children.includes(node.code)) {
          parent.children.push(node.code);
        }
      }
    }
  }

  /**
   * Get node by WBS code
   */
  public getNode(code: string): WBSNode | undefined {
    return this.structure.nodes.get(code);
  }

  /**
   * Get all direct children of a node
   */
  public getChildren(code: string): WBSNode[] {
    const node = this.structure.nodes.get(code);
    if (!node?.children) return [];

    return node.children
      .map((childCode) => this.structure.nodes.get(childCode))
      .filter((child): child is WBSNode => child !== undefined);
  }

  /**
   * Get all descendants of a node (recursive)
   */
  public getDescendants(code: string): WBSNode[] {
    const descendants: WBSNode[] = [];
    const directChildren = this.getChildren(code);

    for (const child of directChildren) {
      descendants.push(child);
      descendants.push(...this.getDescendants(child.code));
    }

    return descendants;
  }

  /**
   * Get parent node
   */
  public getParent(code: string): WBSNode | undefined {
    const node = this.structure.nodes.get(code);
    if (!node?.parentCode) return undefined;
    return this.structure.nodes.get(node.parentCode);
  }

  /**
   * Get all ancestors of a node (path to root)
   */
  public getAncestors(code: string): WBSNode[] {
    const ancestors: WBSNode[] = [];
    let current = this.getParent(code);

    while (current) {
      ancestors.unshift(current); // Add to beginning for root-to-node order
      current = this.getParent(current.code);
    }

    return ancestors;
  }

  /**
   * Get WBS structure (immutable copy)
   */
  public getStructure(): WBSStructure {
    return {
      ...this.structure,
      nodes: new Map(this.structure.nodes),
    };
  }

  /**
   * Generate WBS code for new child element
   */
  public generateChildCode(parentCode: string): string {
    const parent = this.structure.nodes.get(parentCode);
    if (!parent) throw new Error(`Parent WBS code ${parentCode} not found`);

    const childCount = (parent.children?.length || 0) + 1;
    return `${parentCode}.${childCount}`;
  }

  /**
   * Get all root nodes (nodes without parents)
   */
  public getRootNodes(): WBSNode[] {
    return Array.from(this.structure.nodes.values()).filter(
      (node) => !node.parentCode
    );
  }

  /**
   * Get all leaf nodes (nodes without children)
   */
  public getLeafNodes(): WBSNode[] {
    return Array.from(this.structure.nodes.values()).filter(
      (node) => !node.children?.length
    );
  }

  /**
   * Get nodes at specific level
   */
  public getNodesAtLevel(level: number): WBSNode[] {
    return Array.from(this.structure.nodes.values()).filter(
      (node) => node.level === level
    );
  }

  /**
   * Get maximum depth of the WBS tree
   */
  public getMaxLevel(): number {
    return this.structure.maxLevel;
  }

  /**
   * Remove node and all its descendants
   */
  public removeNode(code: string): boolean {
    const node = this.structure.nodes.get(code);
    if (!node) return false;

    // Remove all descendants first
    const descendants = this.getDescendants(code);
    for (const descendant of descendants) {
      this.structure.nodes.delete(descendant.code);
    }

    // Remove from parent's children array
    if (node.parentCode) {
      const parent = this.structure.nodes.get(node.parentCode);
      if (parent?.children) {
        parent.children = parent.children.filter(
          (childCode) => childCode !== code
        );
      }
    }

    // Remove the node itself
    this.structure.nodes.delete(code);

    // Recalculate max level
    this.recalculateMaxLevel();

    return true;
  }

  /**
   * Recalculate maximum level after node removal
   */
  private recalculateMaxLevel(): void {
    this.structure.maxLevel = Math.max(
      0,
      ...Array.from(this.structure.nodes.values()).map((node) => node.level)
    );
  }
}

/**
 * Utility functions for WBS operations
 */
export function createWBSManager(projectCode: string): WBSManager {
  return new WBSManager(projectCode);
}
