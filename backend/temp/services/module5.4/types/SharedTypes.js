"use strict";
/**
 * Module 5.4 - Shared Types
 * Purpose: Common type definitions for float calculation and critical path analysis
 * Requirements:
 * - Use epsilon-based float comparison (0.001)
 * - Support multiple critical paths
 * - Maintain clean type safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskLevel = void 0;
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
