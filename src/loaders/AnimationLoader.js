/**
 * @fileoverview Animation loader interfaces and implementations
 * @module loaders
 */

/**
 * Abstract base class for animation loaders
 * @abstract
 * @class
 */
export class AnimationLoader {
  /**
     * Load an animation by name
     * @abstract
     * @param {string} _name - The animation name to load (unused in base class)
     * @returns {Promise<THREE.AnimationClip>} The loaded animation clip
     * @throws {Error} Must be implemented by subclasses
     */
  async loadAnimation (_name) {
    throw new Error('loadAnimation method must be implemented by subclasses')
  }
}

/**
 * GLTF animation loader implementation
 * @class
 * @extends AnimationLoader
 */
export class GLTFAnimationLoader extends AnimationLoader {
  /**
     * Create a GLTF animation loader
     * @param {THREE.GLTFLoader} gltfLoader - The Three.js GLTF loader instance
     */
  constructor (gltfLoader) {
    super()

    /**
         * The Three.js GLTF loader
         * @type {THREE.GLTFLoader}
         */
    this.gltfLoader = gltfLoader

    /**
         * Cache for loaded animations
         * @type {Map<string, THREE.AnimationClip>}
         */
    this.animationCache = new Map()
  }

  /**
     * Load an animation from GLTF by name
     * @param {string} name - The animation name to load
     * @returns {Promise<THREE.AnimationClip>} The loaded animation clip
     * @throws {Error} If animation is not found
     */
  async loadAnimation (name) {
    if (this.animationCache.has(name)) {
      return this.animationCache.get(name)
    }

    // In a real implementation, this would load from GLTF files
    // For now, we'll assume animations are already loaded in the model
    throw new Error(`Animation '${name}' not found. Implement GLTF loading logic.`)
  }

  /**
     * Preload animations from a GLTF model
     * @param {Object} gltfModel - The loaded GLTF model
     * @returns {Promise<void>}
     */
  async preloadAnimations (gltfModel) {
    if (gltfModel.animations) {
      for (const animation of gltfModel.animations) {
        this.animationCache.set(animation.name, animation)
      }
    }
  }

  /**
     * Clear the animation cache
     * @returns {void}
     */
  clearCache () {
    this.animationCache.clear()
  }

  /**
     * Get all cached animation names
     * @returns {string[]} Array of cached animation names
     */
  getCachedAnimationNames () {
    return Array.from(this.animationCache.keys())
  }
}
