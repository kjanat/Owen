#!/usr/bin/env node

/**
 * Check Naming Conflicts Script
 * Analyzes animation names across all schemes to detect potential conflicts
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANIMATION_MAPPER_PATH = path.join(PROJECT_ROOT, 'src', 'animation', 'AnimationNameMapper.js')

/**
 * Check for naming conflicts across schemes
 */
async function checkNamingConflicts () {
  try {
    console.log('🔍 Checking for animation naming conflicts...')

    // Import the AnimationNameMapper
    const animationMapperUrl = pathToFileURL(ANIMATION_MAPPER_PATH)
    const { AnimationNameMapper } = await import(animationMapperUrl)
    const mapper = new AnimationNameMapper()

    const conflicts = []
    const warnings = []
    const statistics = {
      totalAnimations: 0,
      duplicatesWithinScheme: 0,
      crossSchemeConflicts: 0,
      ambiguousNames: 0,
      validationErrors: 0
    }

    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']
    const allAnimationsByScheme = {}

    // Collect all animations by scheme
    schemes.forEach(scheme => {
      allAnimationsByScheme[scheme] = mapper.getAllAnimationsByScheme(scheme)
      statistics.totalAnimations += allAnimationsByScheme[scheme].length
    })

    console.log(`📊 Analyzing ${statistics.totalAnimations} total animations across ${schemes.length} schemes`)

    // 1. Check for duplicates within each scheme
    schemes.forEach(scheme => {
      const animations = allAnimationsByScheme[scheme]
      const seen = new Set()
      const duplicates = []

      animations.forEach(anim => {
        if (seen.has(anim)) {
          duplicates.push(anim)
          statistics.duplicatesWithinScheme++
        }
        seen.add(anim)
      })

      if (duplicates.length > 0) {
        conflicts.push({
          type: 'duplicate_within_scheme',
          scheme,
          animations: duplicates,
          severity: 'error',
          message: `Duplicate animations found within ${scheme} scheme`
        })
      }
    })

    // 2. Check for cross-scheme conflicts (same name in different schemes with different meanings)
    const nameToSchemes = {}
    schemes.forEach(scheme => {
      allAnimationsByScheme[scheme].forEach(anim => {
        if (!nameToSchemes[anim]) {
          nameToSchemes[anim] = []
        }
        nameToSchemes[anim].push(scheme)
      })
    })

    Object.entries(nameToSchemes).forEach(([animName, animSchemes]) => {
      if (animSchemes.length > 1) {
        // Check if they map to the same semantic meaning
        try {
          const allSemantic = animSchemes.map(scheme => {
            try {
              return mapper.convert(animName, 'semantic')
            } catch {
              return null
            }
          }).filter(Boolean)

          const uniqueSemantic = [...new Set(allSemantic)]
          if (uniqueSemantic.length > 1) {
            conflicts.push({
              type: 'cross_scheme_conflict',
              animationName: animName,
              schemes: animSchemes,
              semanticMappings: uniqueSemantic,
              severity: 'error',
              message: `Animation "${animName}" exists in multiple schemes but maps to different meanings`
            })
            statistics.crossSchemeConflicts++
          }
        } catch (error) {
          warnings.push({
            type: 'conversion_error',
            animationName: animName,
            schemes: animSchemes,
            error: error.message,
            severity: 'warning'
          })
        }
      }
    })

    // 3. Check for ambiguous names (could be interpreted as multiple schemes)
    const allAnimations = Object.values(allAnimationsByScheme).flat()
    const uniqueAnimations = [...new Set(allAnimations)]

    uniqueAnimations.forEach(anim => {
      const detectedScheme = mapper.detectScheme(anim)
      let possibleSchemes = 0

      // Test if name could belong to other schemes
      schemes.forEach(scheme => {
        try {
          const converted = mapper.convert(anim, scheme)
          if (converted) possibleSchemes++
        } catch {
          // Can't convert to this scheme
        }
      })

      if (possibleSchemes > 2) {
        warnings.push({
          type: 'ambiguous_name',
          animationName: anim,
          detectedScheme,
          possibleSchemes,
          severity: 'warning',
          message: `Animation "${anim}" could be interpreted as belonging to multiple schemes`
        })
        statistics.ambiguousNames++
      }
    })

    // 4. Validate all animations can be properly converted
    uniqueAnimations.forEach(anim => {
      schemes.forEach(targetScheme => {
        try {
          mapper.convert(anim, targetScheme)
        } catch (error) {
          if (!error.message.includes('not found in mapping')) {
            warnings.push({
              type: 'validation_error',
              animationName: anim,
              targetScheme,
              error: error.message,
              severity: 'warning'
            })
            statistics.validationErrors++
          }
        }
      })
    })

    // 5. Check for naming convention violations
    const conventionViolations = []

    // Legacy should follow pattern: word_word_L/S
    allAnimationsByScheme.legacy.forEach(anim => {
      if (!/^[a-z]+(_[a-z]+)*_[LS]$/.test(anim)) {
        conventionViolations.push({
          type: 'convention_violation',
          scheme: 'legacy',
          animationName: anim,
          expectedPattern: 'word_word_L/S',
          severity: 'warning'
        })
      }
    })

    // Artist should follow pattern: Owen_PascalCase
    allAnimationsByScheme.artist.forEach(anim => {
      if (!/^Owen_[A-Z][a-zA-Z]*$/.test(anim)) {
        conventionViolations.push({
          type: 'convention_violation',
          scheme: 'artist',
          animationName: anim,
          expectedPattern: 'Owen_PascalCase',
          severity: 'warning'
        })
      }
    })

    // Hierarchical should follow pattern: owen.category.subcategory
    allAnimationsByScheme.hierarchical.forEach(anim => {
      if (!/^owen(\.[a-z]+)+$/.test(anim)) {
        conventionViolations.push({
          type: 'convention_violation',
          scheme: 'hierarchical',
          animationName: anim,
          expectedPattern: 'owen.category.subcategory',
          severity: 'warning'
        })
      }
    })

    // Semantic should follow pattern: OwenPascalCase
    allAnimationsByScheme.semantic.forEach(anim => {
      if (!/^Owen[A-Z][a-zA-Z]*$/.test(anim)) {
        conventionViolations.push({
          type: 'convention_violation',
          scheme: 'semantic',
          animationName: anim,
          expectedPattern: 'OwenPascalCase',
          severity: 'warning'
        })
      }
    })

    warnings.push(...conventionViolations)

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        status: conflicts.length === 0 ? 'PASS' : 'FAIL',
        totalConflicts: conflicts.length,
        totalWarnings: warnings.length,
        statistics
      },
      conflicts,
      warnings,
      recommendations: generateRecommendations(conflicts, warnings),
      schemes: Object.fromEntries(
        schemes.map(scheme => [
          scheme,
          {
            animationCount: allAnimationsByScheme[scheme].length,
            sampleAnimations: allAnimationsByScheme[scheme].slice(0, 3)
          }
        ])
      )
    }

    // Save report
    const reportsDir = path.join(PROJECT_ROOT, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    fs.writeFileSync(
      path.join(reportsDir, 'naming-conflicts.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    )

    // Print summary
    console.log('\n📋 NAMING CONFLICT ANALYSIS SUMMARY')
    console.log('='.repeat(50))
    console.log(`Status: ${report.summary.status}`)
    console.log(`Total Conflicts: ${conflicts.length}`)
    console.log(`Total Warnings: ${warnings.length}`)
    console.log(`Animations Analyzed: ${statistics.totalAnimations}`)

    if (conflicts.length > 0) {
      console.log('\n❌ CONFLICTS:')
      conflicts.forEach((conflict, i) => {
        console.log(`${i + 1}. ${conflict.type}: ${conflict.message}`)
      })
    }

    if (warnings.length > 0 && warnings.length <= 10) {
      console.log('\n⚠️  WARNINGS:')
      warnings.slice(0, 10).forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.type}: ${warning.message || warning.animationName}`)
      })
      if (warnings.length > 10) {
        console.log(`... and ${warnings.length - 10} more warnings`)
      }
    }

    console.log(`\n📁 Full report saved to: ${path.join(reportsDir, 'naming-conflicts.json')}`)

    // Exit with error code if conflicts found
    if (conflicts.length > 0) {
      process.exit(1)
    }

    return report
  } catch (error) {
    console.error('❌ Error checking naming conflicts:', error.message)
    process.exit(1)
  }
}

/**
 * Generate recommendations based on conflicts and warnings
 */
function generateRecommendations (conflicts, warnings) {
  const recommendations = []

  if (conflicts.some(c => c.type === 'duplicate_within_scheme')) {
    recommendations.push({
      type: 'fix_duplicates',
      priority: 'high',
      action: 'Remove duplicate animation names within each scheme',
      description: 'Duplicate names can cause unpredictable behavior'
    })
  }

  if (conflicts.some(c => c.type === 'cross_scheme_conflict')) {
    recommendations.push({
      type: 'resolve_cross_scheme',
      priority: 'high',
      action: 'Ensure names in different schemes map to the same semantic meaning',
      description: 'Cross-scheme conflicts break the mapping system'
    })
  }

  const conventionViolations = warnings.filter(w => w.type === 'convention_violation')
  if (conventionViolations.length > 0) {
    recommendations.push({
      type: 'fix_conventions',
      priority: 'medium',
      action: `Fix ${conventionViolations.length} naming convention violations`,
      description: 'Consistent naming conventions improve maintainability'
    })
  }

  if (warnings.some(w => w.type === 'ambiguous_name')) {
    recommendations.push({
      type: 'clarify_ambiguous',
      priority: 'low',
      action: 'Review ambiguous animation names for clarity',
      description: 'Ambiguous names can be confusing for developers'
    })
  }

  return recommendations
}

// Run the script if called directly
if (process.argv[1] === __filename) {
  checkNamingConflicts()
    .then(report => {
      console.log('✅ Naming conflict check complete!')
    })
    .catch(error => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}
