/**
 * @fileoverview Main system factory for creating the complete Owen system
 * @module factories
 */

import * as THREE from 'three'
import { OwenAnimationContext } from '../core/OwenAnimationContext.js'
import { AnimationClipFactory } from '../animation/AnimationClip.js'
import { GLTFAnimationLoader } from '../loaders/AnimationLoader.js'
import { StateFactory } from '../states/StateFactory.js'

/**
 * Main factory for creating the complete Owen animation system
 * @class
 */
export class OwenSystemFactory {
  /**
     * Create a complete Owen animation system
     * @param {THREE.Object3D} gltfModel - The loaded GLTF model
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} [options={}] - Configuration options
     * @param {THREE.GLTFLoader} [options.gltfLoader] - Custom GLTF loader
     * @returns {Promise<OwenAnimationContext>} The configured Owen system
     */
  static async createOwenSystem (gltfModel, scene, options = {}) {
    // Create Three.js animation mixer
    const mixer = new THREE.AnimationMixer(gltfModel)

    // Create GLTF loader if not provided
    const gltfLoader = options.gltfLoader || new THREE.GLTFLoader()

    // Create animation loader
    const animationLoader = new GLTFAnimationLoader(gltfLoader)

    // Preload animations from the model
    await animationLoader.preloadAnimations(gltfModel)

    // Create animation clip factory
    const animationClipFactory = new AnimationClipFactory(animationLoader)

    // Create state factory
    const stateFactory = new StateFactory()

    // Create the main Owen context
    const owenContext = new OwenAnimationContext(
      gltfModel,
      mixer,
      animationClipFactory,
      stateFactory
    )

    // Initialize the system
    await owenContext.initialize()

    return owenContext
  }

  /**
     * Create a basic Owen system with minimal configuration
     * @param {THREE.Object3D} model - The 3D model
     * @returns {Promise<OwenAnimationContext>} The configured Owen system
     */
  static async createBasicOwenSystem (model) {
    const scene = new THREE.Scene()
    scene.add(model)

    return await OwenSystemFactory.createOwenSystem(model, scene)
  }

  /**
     * Create an Owen system with custom state handlers
     * @param {THREE.Object3D} gltfModel - The loaded GLTF model
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Map<string, Function>} customStates - Map of state name to handler class
     * @returns {Promise<OwenAnimationContext>} The configured Owen system
     */
  static async createCustomOwenSystem (gltfModel, scene, customStates) {
    const system = await OwenSystemFactory.createOwenSystem(gltfModel, scene)

    // Register custom state handlers
    const stateFactory = system.stateFactory
    for (const [stateName, handlerClass] of customStates) {
      stateFactory.registerStateHandler(stateName, handlerClass)
    }

    // Reinitialize with custom states
    system.initializeStates()

    return system
  }
}
