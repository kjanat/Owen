/**
 * @fileoverview Main animation context controller
 * @module core
 */

import { States, Emotions, Config } from '../constants.js'

/**
 * Main controller for the Owen animation system
 * Manages state transitions, animation playback, and user interactions
 * @class
 */
export class OwenAnimationContext {
  /**
   * Create an Owen animation context
   * @param {THREE.Object3D} model - The 3D character model
   * @param {THREE.AnimationMixer} mixer - The Three.js animation mixer
   * @param {AnimationClipFactory} animationClipFactory - Factory for creating clips
   * @param {StateFactory} stateFactory - Factory for creating state handlers
   */
  constructor (model, mixer, animationClipFactory, stateFactory) {
    /**
     * The 3D character model
     * @type {THREE.Object3D}
     */
    this.model = model

    /**
     * The Three.js animation mixer
     * @type {THREE.AnimationMixer}
     */
    this.mixer = mixer

    /**
     * Factory for creating animation clips
     * @type {AnimationClipFactory}
     */
    this.animationClipFactory = animationClipFactory

    /**
     * Factory for creating state handlers
     * @type {StateFactory}
     */
    this.stateFactory = stateFactory

    /**
     * Map of animation clips by name
     * @type {Map<string, AnimationClip>}
     */
    this.clips = new Map()

    /**
     * Map of state handlers by name
     * @type {Map<string, StateHandler>}
     */
    this.states = new Map()

    /**
     * Current active state
     * @type {string}
     */
      this.currentState = States.WAITING

    /**
     * Current active state handler
     * @type {StateHandler|null}
     */
    this.currentStateHandler = null

    /**
     * Timer for inactivity detection
     * @type {number}
     */
    this.inactivityTimer = 0

    /**
     * Inactivity timeout in milliseconds
     * @type {number}
     */
    this.inactivityTimeout = Config.INACTIVITY_TIMEOUT

    /**
     * Whether the system is initialized
     * @type {boolean}
     */
    this.initialized = false
  }

  /**
   * Initialize the animation system
   * @returns {Promise<void>}
   */
  async initialize () {
    if (this.initialized) return

    // Create animation clips from model
    this.clips = await this.animationClipFactory.createClipsFromModel(this.model)

    // Create actions for all clips
    for (const [, clip] of this.clips) {
      clip.createAction(this.mixer)
    }

    // Initialize state handlers
    this.initializeStates()

    // Start in wait state
      await this.transitionTo(States.WAITING)

    this.initialized = true
    console.log('Owen Animation System initialized')
  }

  /**
   * Initialize all state handlers
   * @private
   * @returns {void}
   */
  initializeStates () {
    const stateNames = this.stateFactory.getAvailableStates()

    for (const stateName of stateNames) {
      const handler = this.stateFactory.createStateHandler(stateName, this)
      this.states.set(stateName, handler)
    }
  }

  /**
   * Transition to a new state
   * @param {string} newStateName - The name of the state to transition to
   * @param {string} [emotion=Emotions.NEUTRAL] - The emotion for the transition
   * @returns {Promise<void>}
   * @throws {Error} If state is not found or transition is invalid
   */
  async transitionTo (newStateName, emotion = Emotions.NEUTRAL) {
    if (!this.states.has(newStateName)) {
      throw new Error(`State '${newStateName}' not found`)
    }

    const oldState = this.currentState
    const newStateHandler = this.states.get(newStateName)

    console.log(`Transitioning from ${oldState} to ${newStateName}`)

    // Exit current state
    if (this.currentStateHandler) {
      await this.currentStateHandler.exit(newStateName, emotion)
    }

    // Enter new state
    this.currentState = newStateName
    this.currentStateHandler = newStateHandler
    await this.currentStateHandler.enter(oldState, emotion)

    // Reset inactivity timer
    this.resetActivityTimer()
  }

  /**
   * Handle a user message
   * @param {string} message - The user message
   * @returns {Promise<void>}
   */
  async handleUserMessage (message) {
    console.log(`Handling user message: "${message}"`)

    this.onUserActivity()

    // If sleeping, wake up first
      if (this.currentState === States.SLEEPING) {
          await this.transitionTo(States.REACTING)
    }

    // Let current state handle the message
    if (this.currentStateHandler) {
      await this.currentStateHandler.handleMessage(message)
    }

    // Transition to appropriate next state based on current state
      if (this.currentState === States.WAITING) {
          await this.transitionTo(States.REACTING);
      } else if (this.currentState === States.REACTING) {
          await this.transitionTo(States.TYPING)
    }
  }

  /**
   * Called when user activity is detected
   * @returns {void}
   */
  onUserActivity () {
    this.resetActivityTimer()

    // Wake up if sleeping
      if (this.currentState === States.SLEEPING) {
          this.transitionTo(States.WAITING)
    }
  }

  /**
   * Reset the inactivity timer
   * @private
   * @returns {void}
   */
  resetActivityTimer () {
    this.inactivityTimer = 0
  }

  /**
   * Handle inactivity timeout
   * @private
   * @returns {Promise<void>}
   */
  async handleInactivity () {
    console.log('Inactivity detected, transitioning to sleep')
      await this.transitionTo(States.SLEEPING)
  }

  /**
   * Update the animation system (call every frame)
   * @param {number} deltaTime - Time elapsed since last update (ms)
   * @returns {void}
   */
  update (deltaTime) {
    if (!this.initialized) return

    // Update Three.js mixer
    this.mixer.update(deltaTime / 1000) // Convert to seconds

    // Update current state
    if (this.currentStateHandler) {
      this.currentStateHandler.update(deltaTime)
    }

    // Update inactivity timer
    this.inactivityTimer += deltaTime
      if (this.inactivityTimer > this.inactivityTimeout && this.currentState !== States.SLEEPING) {
      this.handleInactivity()
    }
  }

  /**
   * Get an animation clip by name
   * @param {string} name - The animation clip name
   * @returns {AnimationClip|undefined} The animation clip or undefined if not found
   */
  getClip (name) {
    return this.clips.get(name)
  }

  /**
   * Get animation clips matching a pattern
   * @param {string} pattern - Pattern to match (supports * wildcards)
   * @returns {AnimationClip[]} Array of matching clips
   */
  getClipsByPattern (pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const matches = []

    for (const [name, clip] of this.clips) {
      if (regex.test(name)) {
        matches.push(clip)
      }
    }

    return matches
  }

  /**
   * Get the current state name
   * @returns {string} The current state name
   */
  getCurrentState () {
    return this.currentState
  }

  /**
   * Get the current state handler
   * @returns {StateHandler|null} The current state handler
   */
  getCurrentStateHandler () {
    return this.currentStateHandler
  }

  /**
   * Get available transitions from current state
   * @returns {string[]} Array of available state transitions
   */
  getAvailableTransitions () {
    if (this.currentStateHandler) {
      return this.currentStateHandler.getAvailableTransitions()
    }
    return []
  }

  /**
   * Get all available animation clip names
   * @returns {string[]} Array of clip names
   */
  getAvailableClips () {
    return Array.from(this.clips.keys())
  }

  /**
   * Get all available state names
   * @returns {string[]} Array of state names
   */
  getAvailableStates () {
    return Array.from(this.states.keys())
  }

  /**
   * Dispose of the animation system and clean up resources
   * @returns {void}
   */
  dispose () {
    // Stop all animations
    for (const [, clip] of this.clips) {
      if (clip.action) {
        clip.action.stop()
      }
    }

    // Clear caches
    this.clips.clear()
    this.states.clear()
    this.animationClipFactory.clearCache()

    this.initialized = false
    console.log('Owen Animation System disposed')
  }
}
