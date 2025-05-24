#!/usr/bin/env node

/**
 * Animation Name Validation Script
 * Validates all animation names across different schemes
 */

import { AnimationNameMapper } from '../src/animation/AnimationNameMapper.js'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const PRIMARY_SCHEME = process.env.PRIMARY_SCHEME || 'semantic'

async function validateAnimations () {
  console.log('🔍 Validating animation naming schemes...')
  console.log(`Primary scheme: ${PRIMARY_SCHEME}`)

  const mapper = new AnimationNameMapper()
  const results = {
    timestamp: new Date().toISOString(),
    primaryScheme: PRIMARY_SCHEME,
    validations: [],
    errors: [],
    warnings: [],
    summary: {}
  }

  try {
    // Get all animations from the mapper
    const allAnimations = mapper.getAllAnimations()
    console.log(`Found ${allAnimations.length} animations to validate`)

    // Validate each animation
    for (const animation of allAnimations) {
      const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']

      for (const scheme of schemes) {
        const animName = animation[scheme]
        if (!animName) continue

        try {
          const validation = mapper.validateAnimationName(animName)
          results.validations.push({
            name: animName,
            scheme,
            isValid: validation.isValid,
            detectedScheme: validation.scheme,
            error: validation.error
          })

          if (!validation.isValid) {
            results.errors.push({
              name: animName,
              scheme,
              error: validation.error,
              suggestions: validation.suggestions
            })
          }

          // Check for scheme mismatches
          if (validation.isValid && validation.scheme !== scheme) {
            results.warnings.push({
              name: animName,
              expectedScheme: scheme,
              detectedScheme: validation.scheme,
              message: `Animation name "${animName}" expected to be in ${scheme} scheme but detected as ${validation.scheme}`
            })
          }
        } catch (error) {
          results.errors.push({
            name: animName,
            scheme,
            error: error.message
          })
        }
      }
    }

    // Test conversions between schemes
    console.log('🔄 Testing scheme conversions...')
    for (const animation of allAnimations) {
      const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']

      for (const fromScheme of schemes) {
        for (const toScheme of schemes) {
          if (fromScheme === toScheme) continue

          const sourceName = animation[fromScheme]
          if (!sourceName) continue

          try {
            const converted = mapper.convert(sourceName, toScheme)
            const expected = animation[toScheme]

            if (converted !== expected) {
              results.errors.push({
                name: sourceName,
                scheme: `${fromScheme}->${toScheme}`,
                error: `Conversion mismatch: expected "${expected}", got "${converted}"`
              })
            }
          } catch (error) {
            results.errors.push({
              name: sourceName,
              scheme: `${fromScheme}->${toScheme}`,
              error: `Conversion failed: ${error.message}`
            })
          }
        }
      }
    }

    // Generate summary
    results.summary = {
      totalAnimations: allAnimations.length,
      totalValidations: results.validations.length,
      validAnimations: results.validations.filter(v => v.isValid).length,
      invalidAnimations: results.errors.length,
      warnings: results.warnings.length,
      successRate: ((results.validations.filter(v => v.isValid).length / results.validations.length) * 100).toFixed(2)
    }

    // Create reports directory if it doesn't exist
    if (!existsSync('reports')) {
      await mkdir('reports', { recursive: true })
    }

    // Write results to file
    await writeFile('reports/animation-validation.json', JSON.stringify(results, null, 2))

    // Print summary
    console.log('\n📊 Validation Summary:')
    console.log(`✅ Valid animations: ${results.summary.validAnimations}/${results.summary.totalValidations}`)
    console.log(`❌ Invalid animations: ${results.summary.invalidAnimations}`)
    console.log(`⚠️  Warnings: ${results.summary.warnings}`)
    console.log(`📈 Success rate: ${results.summary.successRate}%`)

    if (results.errors.length > 0) {
      console.log('\n❌ Errors found:')
      results.errors.forEach(error => {
        console.log(`  - ${error.name} (${error.scheme}): ${error.error}`)
      })
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      results.warnings.forEach(warning => {
        console.log(`  - ${warning.message}`)
      })
    }

    // Exit with error if validation failed
    if (results.errors.length > 0) {
      console.log('\n💥 Validation failed with errors')
      process.exit(1)
    } else {
      console.log('\n✅ All animations validated successfully')
      process.exit(0)
    }
  } catch (error) {
    console.error('💥 Validation script failed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateAnimations()
}
