#!/usr/bin/env node

/**
 * Generate Animation Constants Script
 * Automatically generates/updates AnimationConstants.js based on current AnimationNameMapper definitions
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANIMATION_CONSTANTS_PATH = path.join(PROJECT_ROOT, 'src', 'animation', 'AnimationConstants.js')
const ANIMATION_MAPPER_PATH = path.join(PROJECT_ROOT, 'src', 'animation', 'AnimationNameMapper.js')

/**
 * Generate animation constants file content
 */
async function generateAnimationConstants () {
  try {
    console.log('🔧 Generating Animation Constants...')

    // Import the AnimationNameMapper to get current definitions
    const animationMapperUrl = pathToFileURL(ANIMATION_MAPPER_PATH)
    const { AnimationNameMapper } = await import(animationMapperUrl)
    const mapper = new AnimationNameMapper()

    // Get all animation names by scheme
    const legacyAnimations = mapper.getAllAnimationsByScheme('legacy')
    const artistAnimations = mapper.getAllAnimationsByScheme('artist')
    const hierarchicalAnimations = mapper.getAllAnimationsByScheme('hierarchical')
    const semanticAnimations = mapper.getAllAnimationsByScheme('semantic')

    const timestamp = new Date().toISOString()

    const constantsContent = `/**
 * Animation Constants - Auto-generated file
 *
 * This file contains type-safe constants for all animation naming schemes
 * supported by the Owen Animation System.
 *
 * Generated: ${timestamp}
 *
 * @fileoverview Auto-generated animation constants for all naming schemes
 * @module AnimationConstants
 */

// Import the core mapper for utility functions
import { AnimationNameMapper } from './AnimationNameMapper.js'

/**
 * Naming scheme enumeration
 * @readonly
 * @enum {string}
 */
export const NamingSchemes = Object.freeze({
  LEGACY: 'legacy',
  ARTIST: 'artist',
  HIERARCHICAL: 'hierarchical',
  SEMANTIC: 'semantic'
})

/**
 * Legacy animation names (e.g., wait_idle_L)
 * @readonly
 */
export const LegacyAnimations = Object.freeze({
${legacyAnimations.map(anim => {
  const constantName = anim.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return `  ${constantName}: '${anim}'`
}).join(',\n')}
})

/**
 * Artist-friendly animation names (e.g., Owen_WaitIdle)
 * @readonly
 */
export const ArtistAnimations = Object.freeze({
${artistAnimations.map(anim => {
  const constantName = anim.replace(/^Owen_/, '').toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return `  ${constantName}: '${anim}'`
}).join(',\n')}
})

/**
 * Hierarchical animation names (e.g., owen.state.wait.idle.loop)
 * @readonly
 */
export const HierarchicalAnimations = Object.freeze({
${hierarchicalAnimations.map(anim => {
  const constantName = anim.replace(/owen\./, '').split('.').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('_').toUpperCase()
  return `  ${constantName}: '${anim}'`
}).join(',\n')}
})

/**
 * Semantic animation names (e.g., OwenWaitIdleLoop)
 * @readonly
 */
export const SemanticAnimations = Object.freeze({
${semanticAnimations.map(anim => {
  const constantName = anim.replace(/^Owen/, '').replace(/([A-Z])/g, '_$1').toUpperCase().substring(1)
  return `  ${constantName}: '${anim}'`
}).join(',\n')}
})

/**
 * All animation constants grouped by scheme
 * @readonly
 */
export const AnimationsByScheme = Object.freeze({
  [NamingSchemes.LEGACY]: LegacyAnimations,
  [NamingSchemes.ARTIST]: ArtistAnimations,
  [NamingSchemes.HIERARCHICAL]: HierarchicalAnimations,
  [NamingSchemes.SEMANTIC]: SemanticAnimations
})

// Create global mapper instance for utility functions
const mapper = new AnimationNameMapper()

/**
 * Convert an animation name between schemes
 * @param {string} animationName - The animation name to convert
 * @param {string} targetScheme - The target naming scheme
 * @returns {string} The converted animation name
 * @throws {Error} If conversion fails
 */
export function convertAnimationName(animationName, targetScheme) {
  return mapper.convert(animationName, targetScheme)
}

/**
 * Get all animation names for a specific scheme
 * @param {string} scheme - The naming scheme
 * @returns {string[]} Array of animation names
 */
export function getAllAnimationNames(scheme) {
  return mapper.getAllAnimationsByScheme(scheme)
}

/**
 * Validate an animation name and get suggestions
 * @param {string} animationName - The animation name to validate
 * @returns {Object} Validation result with isValid flag and suggestions
 */
export function validateAnimationName(animationName) {
  return mapper.validateAnimationName(animationName)
}

/**
 * Get animations filtered by state and emotion
 * @param {string} state - The animation state (wait, react, sleep, etc.)
 * @param {string} [emotion] - Optional emotion filter (angry, happy, etc.)
 * @param {string} [scheme='semantic'] - The naming scheme to use
 * @returns {string[]} Array of matching animation names
 */
export function getAnimationsByStateAndEmotion(state, emotion = null, scheme = 'semantic') {
  const allAnimations = getAllAnimationNames(scheme)

  return allAnimations.filter(anim => {
    const lowerAnim = anim.toLowerCase()
    const hasState = lowerAnim.includes(state.toLowerCase())
    const hasEmotion = !emotion || lowerAnim.includes(emotion.toLowerCase())

    return hasState && hasEmotion
  })
}

/**
 * Animation metadata for development tools
 * @readonly
 */
export const AnimationMetadata = Object.freeze({
  totalAnimations: ${legacyAnimations.length},
  schemes: Object.keys(NamingSchemes).length,
  generatedAt: '${timestamp}',
  version: '1.0.0'
})

// Default export for convenience
export default {
  NamingSchemes,
  LegacyAnimations,
  ArtistAnimations,
  HierarchicalAnimations,
  SemanticAnimations,
  AnimationsByScheme,
  convertAnimationName,
  getAllAnimationNames,
  validateAnimationName,
  getAnimationsByStateAndEmotion,
  AnimationMetadata
}
`

    // Write the generated constants file
    fs.writeFileSync(ANIMATION_CONSTANTS_PATH, constantsContent, 'utf8')

    console.log('✅ Animation Constants generated successfully!')
    console.log(`📝 Generated ${legacyAnimations.length} animation constants across 4 schemes`)
    console.log(`📍 File: ${ANIMATION_CONSTANTS_PATH}`)

    // Generate summary report
    const report = {
      generated: timestamp,
      totalAnimations: legacyAnimations.length,
      schemes: {
        legacy: legacyAnimations.length,
        artist: artistAnimations.length,
        hierarchical: hierarchicalAnimations.length,
        semantic: semanticAnimations.length
      },
      outputFile: ANIMATION_CONSTANTS_PATH
    }

    // Ensure reports directory exists
    const reportsDir = path.join(PROJECT_ROOT, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Write report
    fs.writeFileSync(
      path.join(reportsDir, 'animation-constants-generation.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    )

    return report
  } catch (error) {
    console.error('❌ Error generating Animation Constants:', error.message)
    process.exit(1)
  }
}

// Run the script if called directly
if (process.argv[1] === __filename) {
  generateAnimationConstants()
    .then(report => {
      console.log('📊 Generation complete!')
      console.log(JSON.stringify(report, null, 2))
    })
    .catch(error => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}
