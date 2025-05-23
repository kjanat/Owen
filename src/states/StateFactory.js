/**
 * @fileoverview State factory for creating state handlers
 * @module states
 */

import { WaitStateHandler } from './WaitStateHandler.js';
import { ReactStateHandler } from './ReactStateHandler.js';
import { TypeStateHandler } from './TypeStateHandler.js';
import { SleepStateHandler } from './SleepStateHandler.js';
import { States } from '../constants.js';

/**
 * Factory for creating state handlers using dependency injection
 * @class
 */
export class StateFactory {
  /**
   * Create a state factory
   */
  constructor() {
    /**
     * Registry of state handler classes
     * @type {Map<string, Function>}
     * @private
     */
    this.stateHandlers = new Map();

    // Register default state handlers
    this.registerStateHandler(States.WAIT, WaitStateHandler);
    this.registerStateHandler(States.REACT, ReactStateHandler);
    this.registerStateHandler(States.TYPE, TypeStateHandler);
    this.registerStateHandler(States.SLEEP, SleepStateHandler);
  }

  /**
   * Register a state handler class
   * @param {string} stateName - The name of the state
   * @param {Function} handlerClass - The handler class constructor
   * @returns {void}
   */
  registerStateHandler(stateName, handlerClass) {
    this.stateHandlers.set(stateName, handlerClass);
  }

  /**
   * Create a state handler instance
   * @param {string} stateName - The name of the state
   * @param {OwenAnimationContext} context - The animation context
   * @returns {StateHandler} The created state handler
   * @throws {Error} If state handler is not registered
   */
  createStateHandler(stateName, context) {
    const HandlerClass = this.stateHandlers.get(stateName);
    if (!HandlerClass) {
      throw new Error(`No handler registered for state: ${stateName}`);
    }

    return new HandlerClass(context);
  }

  /**
   * Get all available state names
   * @returns {string[]} Array of registered state names
   */
  getAvailableStates() {
    return Array.from(this.stateHandlers.keys());
  }

  /**
   * Check if a state is registered
   * @param {string} stateName - The state name to check
   * @returns {boolean} True if registered, false otherwise
   */
  isStateRegistered(stateName) {
    return this.stateHandlers.has(stateName);
  }

  /**
   * Unregister a state handler
   * @param {string} stateName - The state name to unregister
   * @returns {boolean} True if removed, false if not found
   */
  unregisterStateHandler(stateName) {
    return this.stateHandlers.delete(stateName);
  }
}
