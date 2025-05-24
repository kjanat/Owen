/**
 * @fileoverview Wait state handler implementation
 * @module states
 */

import { StateHandler } from './StateHandler.js'
import { States, Emotions, Config } from '../constants.js'

/**
 * Handler for the Wait/Idle state
 * @class
 * @extends StateHandler
 */
export class WaitStateHandler extends StateHandler {
  /**
     * Create a wait state handler
     * @param {OwenAnimationContext} context - The animation context
     */
  constructor (context) {
      super(States.WAITING, context)

    /**
         * The main idle animation clip
         * @type {AnimationClip|null}
         */
    this.idleClip = null

    /**
         * Available quirk animations
         * @type {AnimationClip[]}
         */
    this.quirks = []

    /**
         * Timer for quirk animations
         * @type {number}
         */
    this.quirkTimer = 0

    /**
         * Interval between quirk attempts (ms)
         * @type {number}
         */
    this.quirkInterval = Config.QUIRK_INTERVAL
  }

  /**
     * Enter the wait state
     * @param {string|null} [fromState=null] - The previous state
     * @param {string} [emotion=Emotions.NEUTRAL] - The emotion to enter with
     * @returns {Promise<void>}
     */
  async enter (fromState = null, _emotion = Emotions.NEUTRAL) {
      console.log(`Entering WAITING state from ${fromState}`)

    // Play idle loop
    this.idleClip = this.context.getClip('wait_idle_L')
    if (this.idleClip) {
      await this.idleClip.play()
      this.currentClip = this.idleClip
    }

    // Collect available quirks
    this.quirks = this.context.getClipsByPattern('wait_*_Q')
    this.quirkTimer = 0
  }

  /**
     * Exit the wait state
     * @param {string|null} [toState=null] - The next state
     * @param {string} [emotion=Emotions.NEUTRAL] - The emotion to exit with
     * @returns {Promise<void>}
     */
  async exit (toState = null, _emotion = Emotions.NEUTRAL) {
      console.log(`Exiting WAITING state to ${toState}`)

    if (this.currentClip) {
      await this.stopCurrentClip()
    }

    // Play transition if available
    const transitionName = `wait_2${toState}_T`
    const transition = this.context.getClip(transitionName)
    if (transition) {
      await transition.play()
      await this.waitForClipEnd(transition)
    }
  }

  /**
     * Update the wait state
     * @param {number} deltaTime - Time elapsed since last update (ms)
     * @returns {void}
     */
  update (deltaTime) {
    this.quirkTimer += deltaTime

    // Randomly play quirks
    if (this.quirkTimer > this.quirkInterval && Math.random() < Config.QUIRK_PROBABILITY) {
      this.playRandomQuirk()
      this.quirkTimer = 0
    }
  }

  /**
     * Play a random quirk animation
     * @private
     * @returns {Promise<void>}
     */
  async playRandomQuirk () {
    if (this.quirks.length === 0) return

    const quirk = this.quirks[Math.floor(Math.random() * this.quirks.length)]

    // Fade out idle
    if (this.idleClip) {
      await this.idleClip.stop(0.2)
    }

    // Play quirk
    await quirk.play()
    await this.waitForClipEnd(quirk)

    // Return to idle
    if (this.idleClip) {
      await this.idleClip.play()
      this.currentClip = this.idleClip
    }
  }

  /**
     * Get available transitions from wait state
     * @returns {string[]} Array of available state transitions
     */
  getAvailableTransitions () {
      return [ States.REACTING, States.SLEEPING ]
  }
}
