/**
 * @fileoverview Type state handler implementation
 * @module states
 */

import { StateHandler } from './StateHandler.js'
import { States, Emotions } from '../constants.js'

/**
 * Handler for the Type state
 * @class
 * @extends StateHandler
 */
export class TypeStateHandler extends StateHandler {
  /**
   * Create a type state handler
   * @param {OwenAnimationContext} context - The animation context
   */
  constructor (context) {
    super(States.TYPE, context)

    /**
     * Current emotional state
     * @type {string}
     */
    this.emotion = Emotions.NEUTRAL

    /**
     * Whether currently typing
     * @type {boolean}
     */
    this.isTyping = false
  }

  /**
   * Enter the type state
   * @param {string|null} [_fromState=null] - The previous state (unused)
   * @param {string} [emotion=Emotions.NEUTRAL] - The emotion to enter with
   * @returns {Promise<void>}
   */
  async enter (_fromState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Entering TYPE state with emotion: ${emotion}`)
    this.emotion = emotion
    this.isTyping = true

    // Play appropriate typing animation
    let typingClipName = 'type_idle_L'
    if (emotion !== Emotions.NEUTRAL) {
      typingClipName = `type_${emotion}_L`
    }

    const typingClip = this.context.getClip(typingClipName)
    if (typingClip) {
      await typingClip.play()
      this.currentClip = typingClip
    }
  }

  /**
   * Exit the type state
   * @param {string|null} [toState=null] - The next state
   * @param {string} [_emotion=Emotions.NEUTRAL] - The emotion to exit with (unused)
   * @returns {Promise<void>}
   */
  async exit (toState = null, _emotion = Emotions.NEUTRAL) {
    console.log(`Exiting TYPE state to ${toState}`)
    this.isTyping = false

    if (this.currentClip) {
      await this.stopCurrentClip()
    }

    // Play transition if available
    let transitionName = `type_2${toState}_T`
    if (this.emotion !== Emotions.NEUTRAL) {
      transitionName = `type_${this.emotion}2${toState}_T`
    }

    const transition = this.context.getClip(transitionName)
    if (transition) {
      await transition.play()
      await this.waitForClipEnd(transition)
    }
  }

  /**
   * Finish typing and prepare to transition
   * @returns {Promise<void>}
   */
  async finishTyping () {
    if (!this.isTyping) return

    // Play typing finish animation if available
    const finishClip = this.context.getClip('type_finish_Q')
    if (finishClip && this.currentClip) {
      await this.stopCurrentClip(0.2)
      await finishClip.play()
      await this.waitForClipEnd(finishClip)
    }

    this.isTyping = false
  }

  /**
   * Get available transitions from type state
   * @returns {string[]} Array of available state transitions
   */
  getAvailableTransitions () {
    return [States.WAIT, States.REACT]
  }

  /**
   * Check if currently typing
   * @returns {boolean} True if typing, false otherwise
   */
  getIsTyping () {
    return this.isTyping
  }

  /**
   * Set typing state
   * @param {boolean} typing - Whether currently typing
   * @returns {void}
   */
  setTyping (typing) {
    this.isTyping = typing
  }
}
