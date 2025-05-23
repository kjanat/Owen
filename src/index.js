/**
 * @fileoverview Main entry point for the Owen Animation System
 * @module owen
 */

// Core exports
export { OwenAnimationContext } from './core/OwenAnimationContext.js';

// Animation system exports
export { AnimationClip, AnimationClipFactory } from './animation/AnimationClip.js';

// Loader exports
export { AnimationLoader, GLTFAnimationLoader } from './loaders/AnimationLoader.js';

// State system exports
export { StateHandler } from './states/StateHandler.js';
export { WaitStateHandler } from './states/WaitStateHandler.js';
export { ReactStateHandler } from './states/ReactStateHandler.js';
export { TypeStateHandler } from './states/TypeStateHandler.js';
export { SleepStateHandler } from './states/SleepStateHandler.js';
export { StateFactory } from './states/StateFactory.js';

// Factory exports
export { OwenSystemFactory } from './factories/OwenSystemFactory.js';

// Constants exports
export { ClipTypes, States, Emotions, Config } from './constants.js';

// Import for default export
import { OwenSystemFactory } from './factories/OwenSystemFactory.js';
import { OwenAnimationContext } from './core/OwenAnimationContext.js';
import { States, Emotions, ClipTypes, Config } from './constants.js';

/**
 * Default export - the main factory for easy usage
 */
export default {
  OwenSystemFactory,
  OwenAnimationContext,
  States,
  Emotions,
  ClipTypes,
  Config
};
