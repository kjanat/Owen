#!/usr/bin/env node

/**
 * Convert Animation Names Script
 * Converts animation names between different schemes
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANIMATION_MAPPER_PATH = path.join(PROJECT_ROOT, 'src', 'animation', 'AnimationNameMapper.js')

/**
 * Convert animation names based on command line arguments or file input
 */
async function convertAnimationNames () {
  try {
    const args = process.argv.slice(2)

    // Show help if no arguments provided
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      showHelp()
      return
    }

    console.log('🔄 Converting Animation Names...')

    // Import the AnimationNameMapper
    const { AnimationNameMapper } = await import(ANIMATION_MAPPER_PATH)
    const mapper = new AnimationNameMapper()

    const options = parseArguments(args)

    if (options.inputFile) {
      await convertFromFile(mapper, options)
    } else if (options.animationName) {
      await convertSingle(mapper, options)
    } else if (options.batchConvert) {
      await convertBatch(mapper, options)
    } else {
      console.error('❌ No input provided. Use --help for usage information.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error converting animation names:', error.message)
    process.exit(1)
  }
}

/**
 * Parse command line arguments
 */
function parseArguments (args) {
  const options = {
    animationName: null,
    fromScheme: null,
    toScheme: null,
    inputFile: null,
    outputFile: null,
    batchConvert: false,
    allSchemes: false,
    validate: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--name':
      case '-n':
        options.animationName = nextArg
        i++
        break
      case '--from':
      case '-f':
        options.fromScheme = nextArg
        i++
        break
      case '--to':
      case '-t':
        options.toScheme = nextArg
        i++
        break
      case '--input':
      case '-i':
        options.inputFile = nextArg
        i++
        break
      case '--output':
      case '-o':
        options.outputFile = nextArg
        i++
        break
      case '--batch':
      case '-b':
        options.batchConvert = true
        break
      case '--all-schemes':
      case '-a':
        options.allSchemes = true
        break
      case '--validate':
      case '-v':
        options.validate = true
        break
    }
  }

  return options
}

/**
 * Convert a single animation name
 */
async function convertSingle (mapper, options) {
  const { animationName, fromScheme, toScheme, allSchemes, validate } = options

  console.log(`\n🎯 Converting: ${animationName}`)

  if (validate) {
    const validation = mapper.validateAnimationName(animationName)
    console.log('\n✅ Validation Result:')
    console.log(`Valid: ${validation.isValid}`)
    if (validation.detectedScheme) {
      console.log(`Detected Scheme: ${validation.detectedScheme}`)
    }
    if (validation.suggestions?.length > 0) {
      console.log(`Suggestions: ${validation.suggestions.join(', ')}`)
    }
    if (validation.errors?.length > 0) {
      console.log(`Errors: ${validation.errors.join(', ')}`)
    }
  }

  if (allSchemes) {
    // Convert to all schemes
    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']
    console.log('\n🔄 Converting to all schemes:')

    schemes.forEach(scheme => {
      try {
        const converted = mapper.convert(animationName, scheme)
        console.log(`${scheme.padEnd(12)}: ${converted}`)
      } catch (error) {
        console.log(`${scheme.padEnd(12)}: ❌ ${error.message}`)
      }
    })
  } else if (toScheme) {
    // Convert to specific scheme
    try {
      const converted = mapper.convert(animationName, toScheme)
      console.log(`\n🎯 Result: ${converted}`)

      if (fromScheme) {
        console.log(`From: ${fromScheme} -> To: ${toScheme}`)
      } else {
        const detectedScheme = mapper.detectScheme(animationName)
        console.log(`From: ${detectedScheme} -> To: ${toScheme}`)
      }
    } catch (error) {
      console.error(`❌ Conversion failed: ${error.message}`)
      process.exit(1)
    }
  } else {
    console.log('ℹ️ No target scheme specified. Use --to <scheme> or --all-schemes')
  }
}

/**
 * Convert animation names from a file
 */
async function convertFromFile (mapper, options) {
  const { inputFile, outputFile, toScheme, allSchemes } = options

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`)
  }

  console.log(`📁 Reading from file: ${inputFile}`)

  const content = fs.readFileSync(inputFile, 'utf8')
  let animationNames = []

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      animationNames = parsed
    } else if (parsed.animations && Array.isArray(parsed.animations)) {
      animationNames = parsed.animations
    } else {
      animationNames = Object.values(parsed).filter(v => typeof v === 'string')
    }
  } catch {
    // If not JSON, treat as line-separated text
    animationNames = content.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
  }

  console.log(`📋 Found ${animationNames.length} animation names to convert`)

  const results = {
    timestamp: new Date().toISOString(),
    inputFile,
    totalAnimations: animationNames.length,
    conversions: [],
    errors: []
  }

  if (allSchemes) {
    // Convert each animation to all schemes
    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']

    animationNames.forEach(animName => {
      const animResult = {
        original: animName,
        conversions: {}
      }

      schemes.forEach(scheme => {
        try {
          animResult.conversions[scheme] = mapper.convert(animName, scheme)
        } catch (error) {
          animResult.conversions[scheme] = { error: error.message }
          results.errors.push(`${animName} -> ${scheme}: ${error.message}`)
        }
      })

      results.conversions.push(animResult)
    })
  } else if (toScheme) {
    // Convert to specific scheme
    animationNames.forEach(animName => {
      const animResult = {
        original: animName,
        target: toScheme
      }

      try {
        animResult.converted = mapper.convert(animName, toScheme)
        animResult.fromScheme = mapper.detectScheme(animName)
      } catch (error) {
        animResult.error = error.message
        results.errors.push(`${animName}: ${error.message}`)
      }

      results.conversions.push(animResult)
    })
  }

  // Save results
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8')
    console.log(`📄 Results saved to: ${outputFile}`)
  } else {
    // Print to console
    console.log('\n📊 Conversion Results:')
    results.conversions.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.original}`)
      if (result.conversions) {
        Object.entries(result.conversions).forEach(([scheme, value]) => {
          if (typeof value === 'string') {
            console.log(`   ${scheme}: ${value}`)
          } else {
            console.log(`   ${scheme}: ❌ ${value.error}`)
          }
        })
      } else if (result.converted) {
        console.log(`   ${result.target}: ${result.converted}`)
      } else if (result.error) {
        console.log(`   ❌ ${result.error}`)
      }
    })
  }

  if (results.errors.length > 0) {
    console.log(`\n⚠️  ${results.errors.length} errors encountered`)
    if (results.errors.length <= 5) {
      results.errors.forEach(error => console.log(`   • ${error}`))
    }
  }

  console.log(`\n✅ Processed ${results.totalAnimations} animations`)
}

/**
 * Batch convert all animations in the current mapper
 */
async function convertBatch (mapper, options) {
  const { outputFile } = options

  console.log('🔄 Batch converting all animations in the system...')

  const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']
  const allResults = {
    timestamp: new Date().toISOString(),
    totalAnimations: 0,
    schemeStats: {},
    conversionMatrix: {}
  }

  schemes.forEach(fromScheme => {
    const animations = mapper.getAllAnimationsByScheme(fromScheme)
    allResults.schemeStats[fromScheme] = animations.length
    allResults.totalAnimations += animations.length

    if (!allResults.conversionMatrix[fromScheme]) {
      allResults.conversionMatrix[fromScheme] = {}
    }

    schemes.forEach(targetScheme => {
      const conversions = []
      let errors = 0

      animations.forEach(anim => {
        try {
          const converted = mapper.convert(anim, targetScheme)
          conversions.push({ original: anim, converted })
        } catch (error) {
          conversions.push({ original: anim, error: error.message })
          errors++
        }
      })

      allResults.conversionMatrix[fromScheme][targetScheme] = {
        total: animations.length,
        successful: animations.length - errors,
        errors,
        successRate: Math.round(((animations.length - errors) / animations.length) * 100),
        conversions: conversions.slice(0, 10) // Include sample conversions
      }
    })
  })

  // Print summary
  console.log('\n📊 Batch Conversion Summary:')
  console.log(`Total animations: ${allResults.totalAnimations}`)
  console.log('\nBy scheme:')
  Object.entries(allResults.schemeStats).forEach(([scheme, count]) => {
    console.log(`  ${scheme}: ${count} animations`)
  })

  console.log('\nConversion matrix (success rates):')
  schemes.forEach(fromScheme => {
    console.log(`\n${fromScheme}:`)
    schemes.forEach(toScheme => {
      const result = allResults.conversionMatrix[fromScheme][toScheme]
      console.log(`  -> ${toScheme}: ${result.successRate}% (${result.successful}/${result.total})`)
    })
  })

  // Save results
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2), 'utf8')
    console.log(`\n📄 Full results saved to: ${outputFile}`)
  } else {
    // Save to default location
    const reportsDir = path.join(PROJECT_ROOT, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    const defaultFile = path.join(reportsDir, 'batch-conversion-results.json')
    fs.writeFileSync(defaultFile, JSON.stringify(allResults, null, 2), 'utf8')
    console.log(`\n📄 Results saved to: ${defaultFile}`)
  }
}

/**
 * Show help information
 */
function showHelp () {
  console.log(`
🎬 Animation Name Converter

Convert animation names between different naming schemes in the Owen Animation System.

USAGE:
  node convert-animation-names.js [OPTIONS]

SINGLE CONVERSION:
  --name, -n <name>      Animation name to convert
  --to, -t <scheme>      Target scheme (legacy|artist|hierarchical|semantic)
  --all-schemes, -a      Convert to all schemes
  --validate, -v         Validate the animation name

FILE CONVERSION:
  --input, -i <file>     Input file with animation names (JSON or line-separated)
  --output, -o <file>    Output file for results (optional)
  --to, -t <scheme>      Target scheme for conversion

BATCH OPERATIONS:
  --batch, -b            Convert all animations in the system
  --output, -o <file>    Output file for batch results

EXAMPLES:
  # Convert single animation to semantic scheme
  node convert-animation-names.js --name wait_idle_L --to semantic

  # Convert to all schemes
  node convert-animation-names.js --name Owen_ReactAngry --all-schemes

  # Validate an animation name
  node convert-animation-names.js --name unknown_animation --validate

  # Convert from file
  node convert-animation-names.js --input animations.json --to artist --output results.json

  # Batch convert all animations
  node convert-animation-names.js --batch --output full-conversion-matrix.json

SCHEMES:
  legacy        - e.g., wait_idle_L, react_angry_S
  artist        - e.g., Owen_WaitIdle, Owen_ReactAngry
  hierarchical  - e.g., owen.state.wait.idle.loop
  semantic      - e.g., OwenWaitIdleLoop, OwenReactAngryShort
`)
}

// Run the script if called directly
if (process.argv[1] === __filename) {
  convertAnimationNames()
    .catch(error => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}
