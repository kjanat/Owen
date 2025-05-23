/**
 * @fileoverview Sleep state handler implementation
 * @module states
 */

import { StateHandler } from './StateHandler.js';
import { States, Emotions } from '../constants.js';

/**
 * Handler for the Sleep state
 * @class
 * @extends StateHandler
 */
export class SleepStateHandler extends StateHandler {
  /**
   * Create a sleep state handler
   * @param {OwenAnimationContext} context - The animation context
   */
  constructor(context) {
    super(States.SLEEP, context);

    /**
     * Sleep animation clip
     * @type {AnimationClip|null}
     */
    this.sleepClip = null;

    /**
     * Whether the character is in deep sleep
     * @type {boolean}
     */
    this.isDeepSleep = false;
  }

  /**
   * Enter the sleep state
   * @param {string|null} [fromState=null] - The previous state
   * @param {string} [_emotion=Emotions.NEUTRAL] - The emotion to enter with (unused)
   * @returns {Promise<void>}
   */
  async enter(fromState = null, _emotion = Emotions.NEUTRAL) {
    console.log(`Entering SLEEP state from ${fromState}`);

    // Play sleep transition if available
    const sleepTransition = this.context.getClip('wait_2sleep_T');
    if (sleepTransition) {
      await sleepTransition.play();
      await this.waitForClipEnd(sleepTransition);
    }

    // Start sleep loop
    this.sleepClip = this.context.getClip('sleep_idle_L');
    if (this.sleepClip) {
      await this.sleepClip.play();
      this.currentClip = this.sleepClip;
    }

    this.isDeepSleep = true;
  }

  /**
   * Exit the sleep state
   * @param {string|null} [toState=null] - The next state
   * @param {string} [emotion=Emotions.NEUTRAL] - The emotion to exit with
   * @returns {Promise<void>}
   */
  async exit(toState = null, _emotion = Emotions.NEUTRAL) {
    console.log(`Exiting SLEEP state to ${toState}`);
    this.isDeepSleep = false;

    if (this.currentClip) {
      await this.stopCurrentClip();
    }

    // Play wake up animation
    const wakeUpClip = this.context.getClip('sleep_wakeup_T');
    if (wakeUpClip) {
      await wakeUpClip.play();
      await this.waitForClipEnd(wakeUpClip);
    }

    // Play transition to next state if available
    const transitionName = `sleep_2${toState}_T`;
    const transition = this.context.getClip(transitionName);
    if (transition) {
      await transition.play();
      await this.waitForClipEnd(transition);
    }
  }

  /**
   * Update the sleep state
   * @param {number} _deltaTime - Time elapsed since last update (ms, unused)
   * @returns {void}
   */
  update(_deltaTime) {
    // Sleep state doesn't need regular updates
    // Character remains asleep until external stimulus
  }

  /**
   * Handle a user message in sleep state (wake up)
   * @param {string} _message - The user message (unused, just triggers wake up)
   * @returns {Promise<void>}
   */
  async handleMessage(_message) {
    // Any message should wake up the character
    if (this.isDeepSleep) {
      console.log('Waking up due to user message');
      // This will trigger a state transition to REACT
      await this.context.transitionTo(States.REACT);
    }
  }

  /**
   * Get available transitions from sleep state
   * @returns {string[]} Array of available state transitions
   */
  getAvailableTransitions() {
    return [ States.WAIT, States.REACT ];
  }

  /**
   * Check if in deep sleep
   * @returns {boolean} True if in deep sleep, false otherwise
   */
  isInDeepSleep() {
    return this.isDeepSleep;
  }

  /**
   * Force wake up from sleep
   * @returns {Promise<void>}
   */
  async wakeUp() {
    if (this.isDeepSleep) {
      await this.context.transitionTo(States.WAIT);
    }
  }
}
