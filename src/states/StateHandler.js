/**
 * @fileoverview Base state handler class and utilities
 * @module StateHandler
 */

import { Emotions, Config } from '../constants.js'

/**
 * Abstract base class for state handlers
 * @abstract
 * @class
 */
export class StateHandler {
  /**
   * Create a state handler
   * @param {string} stateName - The name of the state
   * @param {OwenAnimationContext} context - The animation context
   */
  constructor (stateName, context) {
    /**
     * The name of this state
     * @type {string}
     */
    this.stateName = stateName

    /**
     * The animation context
     * @type {OwenAnimationContext}
     */
    this.context = context

    /**
     * Currently playing animation clip
     * @type {AnimationClip|null}
     */
    this.currentClip = null

    /**
     * Nested state information
     * @type {Object|null}
     */
    this.nestedState = null
  }

  /**
   * Enter this state
   * @abstract
   * @param {string|null} [_fromState=null] - The previous state (unused in base class)
   * @param {string} [_emotion=Emotions.NEUTRAL] - The emotion to enter with (unused in base class)
   * @returns {Promise<void>}
   * @throws {Error} Must be implemented by subclasses
   */
  async enter (_fromState = null, _emotion = Emotions.NEUTRAL) {
    throw new Error('enter method must be implemented by subclasses')
  }

  /**
   * Exit this state
   * @abstract
   * @param {string|null} [_toState=null] - The next state (unused in base class)
   * @param {string} [_emotion=Emotions.NEUTRAL] - The emotion to exit with (unused in base class)
   * @returns {Promise<void>}
   * @throws {Error} Must be implemented by subclasses
   */
  async exit (_toState = null, _emotion = Emotions.NEUTRAL) {
    throw new Error('exit method must be implemented by subclasses')
  }

  /**
   * Update this state (called every frame)
   * @param {number} _deltaTime - Time elapsed since last update (ms, unused in base class)
   * @returns {void}
   */
  update (_deltaTime) {
    // Override in subclasses if needed
  }

  /**
   * Handle a user message while in this state
   * @param {string} _message - The user message (unused in base class)
   * @returns {Promise<void>}
   */
  async handleMessage (_message) {
    // Override in subclasses if needed
  }

  /**
   * Get available transitions from this state
   * @returns {string[]} Array of state names that can be transitioned to
   */
  getAvailableTransitions () {
    return []
  }

  /**
   * Wait for an animation clip to finish playing
   * @protected
   * @param {AnimationClip} clip - The animation clip to wait for
   * @returns {Promise<void>} Promise that resolves when the clip finishes
   */
  async waitForClipEnd (clip) {
    return new Promise((resolve) => {
      const checkFinished = () => {
        if (!clip.isPlaying()) {
          resolve()
        } else {
          requestAnimationFrame(checkFinished)
        }
      }
      checkFinished()
    })
  }

  /**
   * Stop the currently playing clip
   * @protected
   * @param {number} [fadeOutDuration] - Fade out duration
   * @returns {Promise<void>}
   */
  async stopCurrentClip (fadeOutDuration = Config.DEFAULT_FADE_OUT) {
    if (this.currentClip) {
      await this.currentClip.stop(fadeOutDuration)
      this.currentClip = null
    }
  }
}
