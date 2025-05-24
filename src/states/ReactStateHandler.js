/**
 * @fileoverview React state handler implementation
 * @module states
 */

import { StateHandler } from './StateHandler.js'
import { States, Emotions } from '../constants.js'

/**
 * Handler for the React state
 * @class
 * @extends StateHandler
 */
export class ReactStateHandler extends StateHandler {
  /**
     * Create a react state handler
     * @param {OwenAnimationContext} context - The animation context
     */
  constructor (context) {
    super(States.REACTING, context)

    /**
         * Current emotional state
         * @type {string}
         */
    this.emotion = Emotions.NEUTRAL
  }

  /**
     * Enter the react state
     * @param {string|null} [_fromState=null] - The previous state (unused)
     * @param {string} [emotion=Emotions.NEUTRAL] - The emotion to enter with
     * @returns {Promise<void>}
     */
  async enter (_fromState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Entering REACTING state with emotion: ${emotion}`)
    this.emotion = emotion

    // Play appropriate reaction
    const reactionClip = this.context.getClip('react_idle_L')
    if (reactionClip) {
      await reactionClip.play()
      this.currentClip = reactionClip
    }
  }

  /**
     * Exit the react state
     * @param {string|null} [toState=null] - The next state
     * @param {string} [emotion=Emotions.NEUTRAL] - The emotion to exit with
     * @returns {Promise<void>}
     */
  async exit (toState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Exiting REACTING state to ${toState} with emotion: ${emotion}`)

    if (this.currentClip) {
      await this.stopCurrentClip()
    }

    // Play emotional transition if available
    let transitionName
    if (emotion !== Emotions.NEUTRAL) {
      transitionName = `react_${this.emotion}2${toState}_${emotion}_T`
    } else {
      transitionName = `react_2${toState}_T`
    }

    const transition = this.context.getClip(transitionName)
    if (transition) {
      await transition.play()
      await this.waitForClipEnd(transition)
    }
  }

  /**
     * Handle a user message in react state
     * @param {string} message - The user message
     * @returns {Promise<void>}
     */
  async handleMessage (message) {
    // Analyze message sentiment to determine emotion
    const emotion = this.analyzeMessageEmotion(message)
    this.emotion = emotion

    // Play emotional reaction if needed
    if (emotion !== Emotions.NEUTRAL) {
      const emotionalReaction = this.context.getClip(`react_${emotion}_Q`)
      if (emotionalReaction) {
        if (this.currentClip) {
          await this.stopCurrentClip(0.2)
        }
        await emotionalReaction.play()
        await this.waitForClipEnd(emotionalReaction)
      }
    }
  }

  /**
     * Analyze message to determine emotional response
     * @private
     * @param {string} message - The message to analyze
     * @returns {string} The determined emotion
     */
  analyzeMessageEmotion (message) {
    const text = message.toLowerCase()

    // Check for urgent/angry indicators
    if (
      text.includes('!') ||
            text.includes('urgent') ||
            text.includes('asap') ||
            text.includes('hurry')
    ) {
      return Emotions.ANGRY
    }

    // Check for error/shocked indicators
    if (
      text.includes('error') ||
            text.includes('problem') ||
            text.includes('issue') ||
            text.includes('bug') ||
            text.includes('broken')
    ) {
      return Emotions.SHOCKED
    }

    // Check for positive/happy indicators
    if (
      text.includes('great') ||
            text.includes('awesome') ||
            text.includes('good') ||
            text.includes('excellent') ||
            text.includes('perfect')
    ) {
      return Emotions.HAPPY
    }

    // Check for sad indicators
    if (
      text.includes('sad') ||
            text.includes('disappointed') ||
            text.includes('failed') ||
            text.includes('wrong')
    ) {
      return Emotions.SAD
    }

    return Emotions.NEUTRAL
  }

  /**
     * Get available transitions from react state
     * @returns {string[]} Array of available state transitions
     */
  getAvailableTransitions () {
    return [States.TYPING, States.WAITING]
  }
}
