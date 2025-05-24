/**
 * @fileoverview Animation constants with multi-scheme support for Owen Animation System
 * @module animation/AnimationConstants
 */

import { AnimationNameMapper } from './AnimationNameMapper.js'

// Create a singleton instance of the name mapper
const nameMapper = new AnimationNameMapper()

/**
 * Legacy animation names (backward compatibility)
 * @constant
 */
export const LegacyAnimations = {
  // Wait state animations
  WAIT_IDLE_LOOP: 'wait_idle_L',
  WAIT_PICK_NOSE_QUIRK: 'wait_pickNose_Q',
  WAIT_STRETCH_QUIRK: 'wait_stretch_Q',
  WAIT_YAWN_QUIRK: 'wait_yawn_Q',

  // React state animations - neutral
  REACT_IDLE_LOOP: 'react_idle_L',
  REACT_ACKNOWLEDGE_TRANSITION: 'react_acknowledge_T',
  REACT_NOD_TRANSITION: 'react_nod_T',
  REACT_LISTENING_LOOP: 'react_listening_L',

  // React state animations - angry
  REACT_ANGRY_IDLE_LOOP: 'react_angry_L',
  REACT_ANGRY_FROWN_TRANSITION: 'react_an2frown_T',
  REACT_ANGRY_GRUMBLE_QUIRK: 'react_an2grumble_Q',
  REACT_ANGRY_TO_TYPE_TRANSITION: 'react_an2type_T',

  // React state animations - happy
  REACT_HAPPY_IDLE_LOOP: 'react_happy_L',
  REACT_HAPPY_SMILE_TRANSITION: 'react_hp2smile_T',
  REACT_HAPPY_BOUNCE_QUIRK: 'react_hp2bounce_Q',
  REACT_HAPPY_TO_TYPE_TRANSITION: 'react_hp2type_T',

  // React state animations - sad
  REACT_SAD_IDLE_LOOP: 'react_sad_L',
  REACT_SAD_SIGH_TRANSITION: 'react_sd2sigh_T',
  REACT_SAD_SLUMP_QUIRK: 'react_sd2slump_Q',
  REACT_SAD_TO_TYPE_TRANSITION: 'react_sd2type_T',

  // React state animations - shocked
  REACT_SHOCKED_IDLE_LOOP: 'react_shocked_L',
  REACT_SHOCKED_GASP_TRANSITION: 'react_sh2gasp_T',
  REACT_SHOCKED_JUMP_QUIRK: 'react_sh2jump_Q',
  REACT_SHOCKED_TO_TYPE_TRANSITION: 'react_sh2type_T',

  // Type state animations
  TYPE_IDLE_LOOP: 'type_idle_L',
  TYPE_FAST_LOOP: 'type_fast_L',
  TYPE_SLOW_LOOP: 'type_slow_L',
  TYPE_THINKING_LOOP: 'type_thinking_L',
  TYPE_TO_WAIT_TRANSITION: 'type2wait_T',

  // Sleep state animations
  SLEEP_LIGHT_LOOP: 'sleep_light_L',
  SLEEP_DEEP_LOOP: 'sleep_deep_L',
  SLEEP_DREAM_QUIRK: 'sleep_dream_Q',
  SLEEP_WAKE_UP_TRANSITION: 'sleep2wake_T'
}

/**
 * Artist-friendly animation names (Blender workflow)
 * @constant
 */
export const ArtistAnimations = {
  // Wait state animations
  WAIT_IDLE: 'Owen_WaitIdle',
  WAIT_PICK_NOSE: 'Owen_PickNose',
  WAIT_STRETCH: 'Owen_Stretch',
  WAIT_YAWN: 'Owen_Yawn',

  // React state animations - neutral
  REACT_IDLE: 'Owen_ReactIdle',
  REACT_ACKNOWLEDGE: 'Owen_ReactAcknowledge',
  REACT_NOD: 'Owen_ReactNod',
  REACT_LISTENING: 'Owen_ReactListening',

  // React state animations - angry
  REACT_ANGRY_IDLE: 'Owen_ReactAngryIdle',
  REACT_ANGRY_FROWN: 'Owen_ReactAngryFrown',
  REACT_ANGRY_GRUMBLE: 'Owen_ReactAngryGrumble',
  REACT_ANGRY_TO_TYPE: 'Owen_ReactAngryToType',

  // React state animations - happy
  REACT_HAPPY_IDLE: 'Owen_ReactHappyIdle',
  REACT_HAPPY_SMILE: 'Owen_ReactHappySmile',
  REACT_HAPPY_BOUNCE: 'Owen_ReactHappyBounce',
  REACT_HAPPY_TO_TYPE: 'Owen_ReactHappyToType',

  // React state animations - sad
  REACT_SAD_IDLE: 'Owen_ReactSadIdle',
  REACT_SAD_SIGH: 'Owen_ReactSadSigh',
  REACT_SAD_SLUMP: 'Owen_ReactSadSlump',
  REACT_SAD_TO_TYPE: 'Owen_ReactSadToType',

  // React state animations - shocked
  REACT_SHOCKED_IDLE: 'Owen_ReactShockedIdle',
  REACT_SHOCKED_GASP: 'Owen_ReactShockedGasp',
  REACT_SHOCKED_JUMP: 'Owen_ReactShockedJump',
  REACT_SHOCKED_TO_TYPE: 'Owen_ReactShockedToType',

  // Type state animations
  TYPE_IDLE: 'Owen_TypeIdle',
  TYPE_FAST: 'Owen_TypeFast',
  TYPE_SLOW: 'Owen_TypeSlow',
  TYPE_THINKING: 'Owen_TypeThinking',
  TYPE_TO_WAIT: 'Owen_TypeToWait',

  // Sleep state animations
  SLEEP_LIGHT: 'Owen_SleepLight',
  SLEEP_DEEP: 'Owen_SleepDeep',
  SLEEP_DREAM: 'Owen_SleepDream',
  SLEEP_WAKE_UP: 'Owen_SleepWakeUp'
}

/**
 * Hierarchical animation names (organized structure)
 * @constant
 */
export const HierarchicalAnimations = {
  // Wait state animations
  WAIT_IDLE: 'owen.state.wait.idle.loop',
  WAIT_PICK_NOSE: 'owen.quirk.wait.picknose',
  WAIT_STRETCH: 'owen.quirk.wait.stretch',
  WAIT_YAWN: 'owen.quirk.wait.yawn',

  // React state animations - neutral
  REACT_IDLE: 'owen.state.react.idle.loop',
  REACT_ACKNOWLEDGE: 'owen.state.react.acknowledge.transition',
  REACT_NOD: 'owen.state.react.nod.transition',
  REACT_LISTENING: 'owen.state.react.listening.loop',

  // React state animations - angry
  REACT_ANGRY_IDLE: 'owen.state.react.angry.idle.loop',
  REACT_ANGRY_FROWN: 'owen.state.react.angry.frown.transition',
  REACT_ANGRY_GRUMBLE: 'owen.quirk.react.angry.grumble',
  REACT_ANGRY_TO_TYPE: 'owen.state.react.angry.totype.transition',

  // React state animations - happy
  REACT_HAPPY_IDLE: 'owen.state.react.happy.idle.loop',
  REACT_HAPPY_SMILE: 'owen.state.react.happy.smile.transition',
  REACT_HAPPY_BOUNCE: 'owen.quirk.react.happy.bounce',
  REACT_HAPPY_TO_TYPE: 'owen.state.react.happy.totype.transition',

  // React state animations - sad
  REACT_SAD_IDLE: 'owen.state.react.sad.idle.loop',
  REACT_SAD_SIGH: 'owen.state.react.sad.sigh.transition',
  REACT_SAD_SLUMP: 'owen.quirk.react.sad.slump',
  REACT_SAD_TO_TYPE: 'owen.state.react.sad.totype.transition',

  // React state animations - shocked
  REACT_SHOCKED_IDLE: 'owen.state.react.shocked.idle.loop',
  REACT_SHOCKED_GASP: 'owen.state.react.shocked.gasp.transition',
  REACT_SHOCKED_JUMP: 'owen.quirk.react.shocked.jump',
  REACT_SHOCKED_TO_TYPE: 'owen.state.react.shocked.totype.transition',

  // Type state animations
  TYPE_IDLE: 'owen.state.type.idle.loop',
  TYPE_FAST: 'owen.state.type.fast.loop',
  TYPE_SLOW: 'owen.state.type.slow.loop',
  TYPE_THINKING: 'owen.state.type.thinking.loop',
  TYPE_TO_WAIT: 'owen.state.type.towait.transition',

  // Sleep state animations
  SLEEP_LIGHT: 'owen.state.sleep.light.loop',
  SLEEP_DEEP: 'owen.state.sleep.deep.loop',
  SLEEP_DREAM: 'owen.quirk.sleep.dream',
  SLEEP_WAKE_UP: 'owen.state.sleep.wakeup.transition'
}

/**
 * Semantic animation names (readable camelCase)
 * @constant
 */
export const SemanticAnimations = {
  // Wait state animations
  WAIT_IDLE: 'OwenWaitIdleLoop',
  WAIT_PICK_NOSE: 'OwenQuirkPickNose',
  WAIT_STRETCH: 'OwenQuirkStretch',
  WAIT_YAWN: 'OwenQuirkYawn',

  // React state animations - neutral
  REACT_IDLE: 'OwenReactIdleLoop',
  REACT_ACKNOWLEDGE: 'OwenReactAcknowledgeTransition',
  REACT_NOD: 'OwenReactNodTransition',
  REACT_LISTENING: 'OwenReactListeningLoop',

  // React state animations - angry
  REACT_ANGRY_IDLE: 'OwenReactAngryIdleLoop',
  REACT_ANGRY_FROWN: 'OwenReactAngryFrownTransition',
  REACT_ANGRY_GRUMBLE: 'OwenQuirkAngryGrumble',
  REACT_ANGRY_TO_TYPE: 'OwenReactAngryToTypeTransition',

  // React state animations - happy
  REACT_HAPPY_IDLE: 'OwenReactHappyIdleLoop',
  REACT_HAPPY_SMILE: 'OwenReactHappySmileTransition',
  REACT_HAPPY_BOUNCE: 'OwenQuirkHappyBounce',
  REACT_HAPPY_TO_TYPE: 'OwenReactHappyToTypeTransition',

  // React state animations - sad
  REACT_SAD_IDLE: 'OwenReactSadIdleLoop',
  REACT_SAD_SIGH: 'OwenReactSadSighTransition',
  REACT_SAD_SLUMP: 'OwenQuirkSadSlump',
  REACT_SAD_TO_TYPE: 'OwenReactSadToTypeTransition',

  // React state animations - shocked
  REACT_SHOCKED_IDLE: 'OwenReactShockedIdleLoop',
  REACT_SHOCKED_GASP: 'OwenReactShockedGaspTransition',
  REACT_SHOCKED_JUMP: 'OwenQuirkShockedJump',
  REACT_SHOCKED_TO_TYPE: 'OwenReactShockedToTypeTransition',

  // Type state animations
  TYPE_IDLE: 'OwenTypeIdleLoop',
  TYPE_FAST: 'OwenTypeFastLoop',
  TYPE_SLOW: 'OwenTypeSlowLoop',
  TYPE_THINKING: 'OwenTypeThinkingLoop',
  TYPE_TO_WAIT: 'OwenTypeToWaitTransition',

  // Sleep state animations
  SLEEP_LIGHT: 'OwenSleepLightLoop',
  SLEEP_DEEP: 'OwenSleepDeepLoop',
  SLEEP_DREAM: 'OwenQuirkSleepDream',
  SLEEP_WAKE_UP: 'OwenSleepWakeUpTransition'
}

/**
 * Animation naming schemes enumeration
 * @constant
 */
export const NamingSchemes = {
  LEGACY: 'legacy',
  ARTIST: 'artist',
  HIERARCHICAL: 'hierarchical',
  SEMANTIC: 'semantic'
}

/**
 * Convert animation name between different schemes
 * @param {string} name - The source animation name
 * @param {string} targetScheme - The target naming scheme
 * @returns {string} The converted animation name
 */
export function convertAnimationName (name, targetScheme) {
  return nameMapper.convert(name, targetScheme)
}

/**
 * Get all naming scheme variants for an animation
 * @param {string} name - The source animation name
 * @returns {Object} Object with all scheme variants
 */
export function getAllAnimationNames (name) {
  return nameMapper.getAllNames(name)
}

/**
 * Validate an animation name
 * @param {string} name - The animation name to validate
 * @returns {Object} Validation result
 */
export function validateAnimationName (name) {
  return nameMapper.validateAnimationName(name)
}

/**
 * Get animations by state and emotion
 * @param {string} state - The state name
 * @param {string} emotion - The emotion name (optional)
 * @param {string} scheme - The naming scheme to return (default: 'semantic')
 * @returns {string[]} Array of animation names
 */
export function getAnimationsByStateAndEmotion (state, emotion = '', scheme = 'semantic') {
  const animations = nameMapper.getAnimationsByFilter({ state, emotion })
  return animations.map(anim => anim[scheme] || anim.semantic)
}
