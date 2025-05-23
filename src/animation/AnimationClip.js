/**
 * @fileoverview Core animation classes for clip management and creation
 * @module animation
 */

import * as THREE from 'three'
import { ClipTypes, Config } from '../constants.js'

/**
 * Represents a single animation clip with metadata and Three.js action
 * @class
 */
export class AnimationClip {
  /**
   * Create an animation clip
   * @param {string} name - The name of the animation clip
   * @param {THREE.AnimationClip} threeAnimation - The Three.js animation clip
   * @param {Object} metadata - Parsed metadata from animation name
   */
  constructor (name, threeAnimation, metadata) {
    /**
     * The name of the animation clip
     * @type {string}
     */
    this.name = name

    /**
     * The Three.js animation clip
     * @type {THREE.AnimationClip}
     */
    this.animation = threeAnimation

    /**
     * Parsed metadata about the animation
     * @type {Object}
     */
    this.metadata = metadata

    /**
     * The Three.js animation action
     * @type {THREE.AnimationAction|null}
     */
    this.action = null

    /**
     * The animation mixer
     * @type {THREE.AnimationMixer|null}
     */
    this.mixer = null
  }

  /**
   * Create and configure a Three.js action for this clip
   * @param {THREE.AnimationMixer} mixer - The animation mixer
   * @returns {THREE.AnimationAction} The created action
   */
  createAction (mixer) {
    this.mixer = mixer
    this.action = mixer.clipAction(this.animation)

    // Configure based on type
    if (
      this.metadata.type === ClipTypes.LOOP ||
      this.metadata.type === ClipTypes.NESTED_LOOP
    ) {
      this.action.setLoop(THREE.LoopRepeat, Infinity)
    } else {
      this.action.setLoop(THREE.LoopOnce)
      this.action.clampWhenFinished = true
    }

    return this.action
  }

  /**
   * Play the animation with optional fade in
   * @param {number} [fadeInDuration=0.3] - Fade in duration in seconds
   * @returns {Promise<void>} Promise that resolves when fade in completes
   */
  play (fadeInDuration = Config.DEFAULT_FADE_IN) {
    if (this.action) {
      this.action.reset()
      this.action.fadeIn(fadeInDuration)
      this.action.play()
    }
  }

  /**
   * Stop the animation with optional fade out
   * @param {number} [fadeOutDuration=0.3] - Fade out duration in seconds
   * @returns {Promise<void>} Promise that resolves when fade out completes
   */
  stop (fadeOutDuration = Config.DEFAULT_FADE_OUT) {
    if (this.action) {
      this.action.fadeOut(fadeOutDuration)
      setTimeout(() => {
        if (this.action) {
          this.action.stop()
        }
      }, fadeOutDuration * 1000)
    }
  }

  /**
   * Check if the animation is currently playing
   * @returns {boolean} True if playing, false otherwise
   */
  isPlaying () {
    return this.action?.isRunning() || false
  }
}

/**
 * Factory for creating animation clips with parsed metadata
 * @class
 */
export class AnimationClipFactory {
  /**
   * Create an animation clip factory
   * @param {AnimationLoader} animationLoader - The animation loader instance
   */
  constructor (animationLoader) {
    /**
     * The animation loader for loading animation data
     * @type {AnimationLoader}
     */
    this.animationLoader = animationLoader

    /**
     * Cache for created animation clips
     * @type {Map<string, AnimationClip>}
     */
    this.clipCache = new Map()
  }

  /**
   * Parse animation name and create clip metadata
   * Format: [state]_[action]_[type] or [state]_[action]2[toState]_[emotion]_T
   * @param {string} name - The animation name to parse
   * @returns {Object} Parsed metadata object
   */
  parseAnimationName (name) {
    const parts = name.split('_')
    const state = parts[0]
    const action = parts[1]

    // Handle transitions with emotions
    if (parts[2]?.includes('2') && parts[3] === ClipTypes.TRANSITION) {
      const [, toState] = parts[2].split('2')
      return {
        state,
        action,
        toState,
        emotion: parts[2] || '',
        type: ClipTypes.TRANSITION,
        isTransition: true,
        hasEmotion: true
      }
    }

    // Handle regular transitions
    if (parts[2] === ClipTypes.TRANSITION) {
      return {
        state,
        action,
        type: ClipTypes.TRANSITION,
        isTransition: true
      }
    }

    // Handle nested animations
    if (parts[2] === ClipTypes.NESTED_IN || parts[2] === ClipTypes.NESTED_OUT) {
      return {
        state,
        action,
        type: parts[2],
        nestedType: parts[3],
        isNested: true
      }
    }

    // Handle nested loops and quirks
    if (
      parts[3] === ClipTypes.NESTED_LOOP ||
      parts[3] === ClipTypes.NESTED_QUIRK
    ) {
      return {
        state,
        action,
        subAction: parts[2],
        type: parts[3],
        isNested: true
      }
    }

    // Handle standard loops and quirks
    return {
      state,
      action,
      type: parts[2],
      isStandard: true
    }
  }

  /**
   * Create an animation clip from a name
   * @param {string} name - The animation name
   * @returns {Promise<AnimationClip>} The created animation clip
   */
  async createClip (name) {
    if (this.clipCache.has(name)) {
      return this.clipCache.get(name)
    }

    const metadata = this.parseAnimationName(name)
    const animation = await this.animationLoader.loadAnimation(name)

    const clip = new AnimationClip(name, animation, metadata)
    this.clipCache.set(name, clip)

    return clip
  }

  /**
   * Create all animation clips from a model's animations
   * @param {THREE.Object3D} model - The 3D model containing animations
   * @returns {Promise<Map<string, AnimationClip>>} Map of animation name to clip
   */
  async createClipsFromModel (model) {
    const clips = new Map()
    const animations = model.animations || []

    for (const animation of animations) {
      const clip = await this.createClip(animation.name, model)
      clips.set(animation.name, clip)
    }

    return clips
  }

  /**
   * Clear the clip cache
   * @returns {void}
   */
  clearCache () {
    this.clipCache.clear()
  }

  /**
   * Get cached clip by name
   * @param {string} name - The animation name
   * @returns {AnimationClip|undefined} The cached clip or undefined
   */
  getCachedClip (name) {
    return this.clipCache.get(name)
  }
}
