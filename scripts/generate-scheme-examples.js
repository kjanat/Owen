#!/usr/bin/env node

/**
 * Generate Scheme Examples Script
 * Creates example files for each naming scheme
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANIMATION_MAPPER_PATH = path.join(PROJECT_ROOT, 'src', 'animation', 'AnimationNameMapper.js')

/**
 * Generate scheme examples
 */
async function generateSchemeExamples () {
  try {
    console.log('🎨 Generating Scheme Examples...')

    // Import the AnimationNameMapper
    const { AnimationNameMapper } = await import(ANIMATION_MAPPER_PATH)
    const mapper = new AnimationNameMapper()

    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']
    const examplesDir = path.join(PROJECT_ROOT, 'examples', 'scheme-examples')

    // Create examples directory
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true })
    }

    // Generate examples for each scheme
    for (const scheme of schemes) {
      await generateSchemeExample(mapper, scheme, examplesDir)
    }

    // Generate comparison example
    await generateComparisonExample(mapper, examplesDir)

    // Generate integration examples
    await generateIntegrationExamples(mapper, examplesDir)

    console.log('✅ Scheme examples generated successfully!')
  } catch (error) {
    console.error('❌ Error generating scheme examples:', error.message)
    process.exit(1)
  }
}

/**
 * Generate example for a specific scheme
 */
async function generateSchemeExample (mapper, scheme, examplesDir) {
  const animations = mapper.getAllAnimationsByScheme(scheme)
  const schemeTitle = scheme.charAt(0).toUpperCase() + scheme.slice(1)

  const content = `# ${schemeTitle} Scheme Examples

This example demonstrates using animations with the **${scheme}** naming scheme.

## Animation Names (${animations.length} total)

${animations.map(name => `- \`${name}\``).join('\n')}

## Usage Example

\`\`\`javascript
import { OwenAnimationContext } from '@kjanat/owen'

const context = new OwenAnimationContext(gltf)

// Load ${scheme} scheme animations
${animations.slice(0, 5).map(name => `const clip${animations.indexOf(name) + 1} = context.getClip('${name}')`).join('\n')}

// Play the first animation
clip1.play()
\`\`\`

## Scheme Characteristics

${getSchemeCharacteristics(scheme)}

## Converting to Other Schemes

\`\`\`javascript
import { AnimationNameMapper } from '@kjanat/owen'

const mapper = new AnimationNameMapper()

// Convert ${scheme} animations to other schemes
${animations.slice(0, 3).map(name => {
  const otherSchemes = ['legacy', 'artist', 'hierarchical', 'semantic'].filter(s => s !== scheme)
  return `
// ${name}
${otherSchemes.map(targetScheme => {
    try {
      const converted = mapper.convert(name, targetScheme)
      return `const ${targetScheme} = mapper.convert('${name}', '${targetScheme}') // '${converted}'`
    } catch {
      return `// Cannot convert to ${targetScheme}`
    }
  }).join('\n')}`
}).join('\n')}
\`\`\`

## Best Practices for ${schemeTitle} Scheme

${getSchemeBestPractices(scheme)}
`

  fs.writeFileSync(path.join(examplesDir, `${scheme}-example.md`), content, 'utf8')
  console.log(`📄 Generated: ${scheme}-example.md`)
}

/**
 * Generate comparison example
 */
async function generateComparisonExample (mapper, examplesDir) {
  const sampleAnimations = ['wait_idle_L', 'react_angry_S', 'sleep_peace_L', 'type_idle_L']

  const content = `# Multi-Scheme Comparison Example

This example shows the same animations represented in all four naming schemes.

## Side-by-Side Comparison

| Animation | Legacy | Artist | Hierarchical | Semantic |
|-----------|---------|--------|--------------|----------|
${sampleAnimations.map(legacyName => {
  try {
    const artist = mapper.convert(legacyName, 'artist')
    const hierarchical = mapper.convert(legacyName, 'hierarchical')
    const semantic = mapper.convert(legacyName, 'semantic')
    return `| Base | \`${legacyName}\` | \`${artist}\` | \`${hierarchical}\` | \`${semantic}\` |`
  } catch {
    return `| Base | \`${legacyName}\` | - | - | - |`
  }
}).join('\n')}

## Loading the Same Animation in Different Schemes

\`\`\`javascript
import { OwenAnimationContext, AnimationNameMapper } from '@kjanat/owen'

const context = new OwenAnimationContext(gltf)
const mapper = new AnimationNameMapper()

// These all load the same animation clip
const clip1 = context.getClip('wait_idle_L')                    // Legacy
const clip2 = context.getClip('Owen_WaitIdle')                 // Artist
const clip3 = context.getClip('owen.state.wait.idle.loop')     // Hierarchical
const clip4 = context.getClip('OwenWaitIdleLoop')             // Semantic

// All clips are identical
console.log(clip1 === clip2 === clip3 === clip4) // true
\`\`\`

## Dynamic Scheme Conversion

\`\`\`javascript
function loadAnimationInScheme(animationName, targetScheme) {
  const mapper = new AnimationNameMapper()

  try {
    // Convert to target scheme
    const convertedName = mapper.convert(animationName, targetScheme)
    console.log(\`Converted \${animationName} to \${convertedName}\`)

    // Load the animation
    return context.getClip(convertedName)
  } catch (error) {
    console.error('Conversion failed:', error.message)
    return null
  }
}

// Usage examples
const semanticClip = loadAnimationInScheme('wait_idle_L', 'semantic')
const artistClip = loadAnimationInScheme('OwenReactAngryShort', 'artist')
const hierarchicalClip = loadAnimationInScheme('Owen_SleepPeace', 'hierarchical')
\`\`\`

## Scheme Detection and Auto-Conversion

\`\`\`javascript
function smartLoadAnimation(animationName, preferredScheme = 'semantic') {
  const mapper = new AnimationNameMapper()

  // Detect the current scheme
  const currentScheme = mapper.detectScheme(animationName)
  console.log(\`Detected scheme: \${currentScheme}\`)

  if (currentScheme === preferredScheme) {
    // Already in preferred scheme
    return context.getClip(animationName)
  } else {
    // Convert to preferred scheme
    const converted = mapper.convert(animationName, preferredScheme)
    console.log(\`Converted to \${preferredScheme}: \${converted}\`)
    return context.getClip(converted)
  }
}

// Examples
smartLoadAnimation('wait_idle_L')           // Converts to semantic
smartLoadAnimation('Owen_ReactAngry')       // Converts to semantic
smartLoadAnimation('OwenSleepPeaceLoop')    // Already semantic, no conversion
\`\`\`

## Validation Across Schemes

\`\`\`javascript
function validateAndConvert(animationName) {
  const mapper = new AnimationNameMapper()
  const validation = mapper.validateAnimationName(animationName)

  if (validation.isValid) {
    console.log(\`✅ Valid animation: \${animationName}\`)
    console.log(\`Detected scheme: \${validation.detectedScheme}\`)

    // Show all scheme variants
    const allNames = mapper.getAllNames(animationName)
    console.log('All scheme variants:', allNames)

    return allNames
  } else {
    console.log(\`❌ Invalid animation: \${animationName}\`)
    console.log('Suggestions:', validation.suggestions.slice(0, 3))

    return null
  }
}

// Test with various inputs
validateAndConvert('wait_idle_L')      // Valid
validateAndConvert('Owen_Unknown')     // Invalid, shows suggestions
validateAndConvert('typing_fast_L')    // Valid if exists
\`\`\`

## Use Case Examples

### For Artists (Blender Workflow)
\`\`\`javascript
// Artists work with Owen_AnimationName format
const artistAnimations = [
  'Owen_WaitIdle',
  'Owen_ReactAngry',
  'Owen_SleepPeace',
  'Owen_TypeFast'
]

// Automatically convert to code-friendly names
const codeAnimations = artistAnimations.map(anim =>
  mapper.convert(anim, 'semantic')
)

console.log(codeAnimations)
// ['OwenWaitIdleLoop', 'OwenReactAngryShort', 'OwenSleepPeaceLoop', 'OwenTypeFastLoop']
\`\`\`

### For Developers (Type Safety)
\`\`\`javascript
import { SemanticAnimations, AnimationsByScheme } from '@kjanat/owen'

// Type-safe animation loading
context.getClip(SemanticAnimations.WAIT_IDLE_LOOP)
context.getClip(SemanticAnimations.REACT_ANGRY_SHORT)

// Scheme-specific constants
const legacyAnimations = AnimationsByScheme.legacy
const artistAnimations = AnimationsByScheme.artist
\`\`\`

### For Large Projects (Organization)
\`\`\`javascript
// Use hierarchical scheme for better organization
const waitAnimations = mapper.getAllAnimationsByScheme('hierarchical')
  .filter(anim => anim.includes('.wait.'))

const reactAnimations = mapper.getAllAnimationsByScheme('hierarchical')
  .filter(anim => anim.includes('.react.'))

console.log('Wait animations:', waitAnimations)
console.log('React animations:', reactAnimations)
\`\`\`

This example demonstrates the flexibility and power of the multi-scheme animation system!
`

  fs.writeFileSync(path.join(examplesDir, 'comparison-example.md'), content, 'utf8')
  console.log('📄 Generated: comparison-example.md')
}

/**
 * Generate integration examples
 */
async function generateIntegrationExamples (mapper, examplesDir) {
  const content = `# Integration Examples

Real-world integration examples for different frameworks and use cases.

## React Integration

\`\`\`jsx
import React, { useState, useEffect } from 'react'
import { OwenAnimationContext, AnimationNameMapper } from '@kjanat/owen'

function AnimationPlayer({ gltf }) {
  const [context] = useState(() => new OwenAnimationContext(gltf))
  const [mapper] = useState(() => new AnimationNameMapper())
  const [currentAnimation, setCurrentAnimation] = useState('OwenWaitIdleLoop')
  const [scheme, setScheme] = useState('semantic')

  const availableAnimations = mapper.getAllAnimationsByScheme(scheme)

  const playAnimation = (animationName) => {
    try {
      const clip = context.getClip(animationName)
      clip.play()
      setCurrentAnimation(animationName)
    } catch (error) {
      console.error('Failed to play animation:', error)
    }
  }

  return (
    <div>
      <h3>Animation Player</h3>

      <select value={scheme} onChange={(e) => setScheme(e.target.value)}>
        <option value="legacy">Legacy</option>
        <option value="artist">Artist</option>
        <option value="hierarchical">Hierarchical</option>
        <option value="semantic">Semantic</option>
      </select>

      <div>
        <h4>Available Animations ({scheme} scheme)</h4>
        {availableAnimations.map(anim => (
          <button
            key={anim}
            onClick={() => playAnimation(anim)}
            disabled={anim === currentAnimation}
          >
            {anim}
          </button>
        ))}
      </div>

      <p>Currently playing: {currentAnimation}</p>
    </div>
  )
}
\`\`\`

## Vue.js Integration

\`\`\`vue
<template>
  <div class="animation-controller">
    <h3>Animation Controller</h3>

    <div class="scheme-selector">
      <label>Naming Scheme:</label>
      <select v-model="selectedScheme">
        <option value="legacy">Legacy</option>
        <option value="artist">Artist</option>
        <option value="hierarchical">Hierarchical</option>
        <option value="semantic">Semantic</option>
      </select>
    </div>

    <div class="animation-grid">
      <div
        v-for="animation in availableAnimations"
        :key="animation"
        class="animation-card"
        :class="{ active: animation === currentAnimation }"
        @click="playAnimation(animation)"
      >
        {{ animation }}
      </div>
    </div>

    <div class="conversion-display" v-if="currentAnimation">
      <h4>Current Animation in All Schemes:</h4>
      <div v-for="(name, scheme) in allSchemeNames" :key="scheme">
        <strong>{{ scheme }}:</strong> {{ name }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { OwenAnimationContext, AnimationNameMapper } from '@kjanat/owen'

export default {
  props: ['gltf'],
  setup(props) {
    const context = new OwenAnimationContext(props.gltf)
    const mapper = new AnimationNameMapper()

    const selectedScheme = ref('semantic')
    const currentAnimation = ref('')

    const availableAnimations = computed(() =>
      mapper.getAllAnimationsByScheme(selectedScheme.value)
    )

    const allSchemeNames = computed(() => {
      if (!currentAnimation.value) return {}

      try {
        return mapper.getAllNames(currentAnimation.value)
      } catch {
        return {}
      }
    })

    const playAnimation = (animationName) => {
      try {
        const clip = context.getClip(animationName)
        clip.play()
        currentAnimation.value = animationName
      } catch (error) {
        console.error('Failed to play animation:', error)
      }
    }

    // Set default animation when scheme changes
    watch(selectedScheme, (newScheme) => {
      const animations = mapper.getAllAnimationsByScheme(newScheme)
      if (animations.length > 0) {
        playAnimation(animations[0])
      }
    }, { immediate: true })

    return {
      selectedScheme,
      currentAnimation,
      availableAnimations,
      allSchemeNames,
      playAnimation
    }
  }
}
</script>
\`\`\`

## Node.js Build Script Integration

\`\`\`javascript
// build-animations.js
import fs from 'fs'
import path from 'path'
import { AnimationNameMapper } from '@kjanat/owen'

class AnimationBuildProcessor {
  constructor() {
    this.mapper = new AnimationNameMapper()
  }

  async processBlenderAssets(inputDir, outputDir) {
    console.log('Processing Blender animation assets...')

    const blenderFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.blend'))

    const processedAssets = []

    for (const blenderFile of blenderFiles) {
      const baseName = path.basename(blenderFile, '.blend')

      // Convert artist naming to semantic for code
      try {
        const semanticName = this.mapper.convert(baseName, 'semantic')

        processedAssets.push({
          blenderFile: baseName,
          semanticName,
          artistName: baseName,
          legacyName: this.mapper.convert(semanticName, 'legacy'),
          hierarchicalName: this.mapper.convert(semanticName, 'hierarchical')
        })

        console.log(\`Processed: \${baseName} -> \${semanticName}\`)
      } catch (error) {
        console.warn(\`Skipped invalid animation name: \${baseName}\`)
      }
    }

    // Generate animation manifest
    const manifest = {
      buildTime: new Date().toISOString(),
      totalAssets: processedAssets.length,
      assets: processedAssets,
      schemes: {
        artist: processedAssets.map(a => a.artistName),
        semantic: processedAssets.map(a => a.semanticName),
        legacy: processedAssets.map(a => a.legacyName),
        hierarchical: processedAssets.map(a => a.hierarchicalName)
      }
    }

    fs.writeFileSync(
      path.join(outputDir, 'animation-manifest.json'),
      JSON.stringify(manifest, null, 2)
    )

    return manifest
  }

  generateTypescriptConstants(manifest, outputFile) {
    const content = \`// Auto-generated animation constants
export const AnimationAssets = {
\${manifest.assets.map(asset => \`  '\${asset.semanticName}': {
    semantic: '\${asset.semanticName}',
    artist: '\${asset.artistName}',
    legacy: '\${asset.legacyName}',
    hierarchical: '\${asset.hierarchicalName}',
    blenderFile: '\${asset.blenderFile}.blend'
  }\`).join(',\\n')}
} as const

export type AnimationName = keyof typeof AnimationAssets
\`

    fs.writeFileSync(outputFile, content)
    console.log(\`Generated TypeScript constants: \${outputFile}\`)
  }
}

// Usage in build pipeline
const processor = new AnimationBuildProcessor()

processor.processBlenderAssets('./assets/blender', './dist')
  .then(manifest => {
    processor.generateTypescriptConstants(manifest, './src/generated/animations.ts')
    console.log('Animation build complete!')
  })
  .catch(console.error)
\`\`\`

## Webpack Plugin Integration

\`\`\`javascript
// webpack-animation-plugin.js
import { AnimationNameMapper } from '@kjanat/owen'

class AnimationValidationPlugin {
  constructor(options = {}) {
    this.options = {
      schemes: ['semantic', 'artist'],
      validateOnBuild: true,
      generateConstants: true,
      ...options
    }
    this.mapper = new AnimationNameMapper()
  }

  apply(compiler) {
    compiler.hooks.afterCompile.tap('AnimationValidationPlugin', (compilation) => {
      if (this.options.validateOnBuild) {
        this.validateAnimations(compilation)
      }
    })

    if (this.options.generateConstants) {
      compiler.hooks.emit.tap('AnimationValidationPlugin', (compilation) => {
        this.generateConstants(compilation)
      })
    }
  }

  validateAnimations(compilation) {
    // Find animation references in source code
    const animationReferences = this.findAnimationReferences(compilation)

    animationReferences.forEach(ref => {
      const validation = this.mapper.validateAnimationName(ref.name)

      if (!validation.isValid) {
        const error = new Error(
          \`Invalid animation name: "\${ref.name}" in \${ref.file}:\${ref.line}\`
        )
        compilation.errors.push(error)
      }
    })
  }

  generateConstants(compilation) {
    const constants = this.generateAnimationConstants()

    compilation.assets['animations.generated.js'] = {
      source: () => constants,
      size: () => constants.length
    }
  }

  findAnimationReferences(compilation) {
    // Implementation to find animation references in source files
    // Returns array of { name, file, line }
    return []
  }

  generateAnimationConstants() {
    const schemes = this.options.schemes
    let content = '// Auto-generated animation constants\\n\\n'

    schemes.forEach(scheme => {
      const animations = this.mapper.getAllAnimationsByScheme(scheme)
      content += \`export const \${scheme.toUpperCase()}_ANIMATIONS = [\`
      content += animations.map(anim => \`'\${anim}'\`).join(', ')
      content += \`]\\n\\n\`
    })

    return content
  }
}

// webpack.config.js
import AnimationValidationPlugin from './webpack-animation-plugin.js'

export default {
  // ... other config
  plugins: [
    new AnimationValidationPlugin({
      schemes: ['semantic', 'artist'],
      validateOnBuild: true,
      generateConstants: true
    })
  ]
}
\`\`\`

## Testing Integration

\`\`\`javascript
// animation-test-utils.js
import { AnimationNameMapper, OwenAnimationContext } from '@kjanat/owen'

export class AnimationTestHelper {
  constructor(mockGltf) {
    this.context = new OwenAnimationContext(mockGltf)
    this.mapper = new AnimationNameMapper()
  }

  expectAnimationExists(animationName) {
    expect(() => this.context.getClip(animationName)).not.toThrow()
  }

  expectAnimationScheme(animationName, expectedScheme) {
    const detectedScheme = this.mapper.detectScheme(animationName)
    expect(detectedScheme).toBe(expectedScheme)
  }

  expectConversionWorks(fromName, toScheme, expectedName) {
    const converted = this.mapper.convert(fromName, toScheme)
    expect(converted).toBe(expectedName)
  }

  expectRoundTripConversion(animationName) {
    const originalScheme = this.mapper.detectScheme(animationName)
    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']

    // Convert through all schemes and back
    let current = animationName
    schemes.forEach(scheme => {
      current = this.mapper.convert(current, scheme)
    })

    const final = this.mapper.convert(current, originalScheme)
    expect(final).toBe(animationName)
  }

  getAllSchemeVariants(animationName) {
    return this.mapper.getAllNames(animationName)
  }
}

// Usage in tests
describe('Animation System Integration', () => {
  let helper

  beforeEach(() => {
    helper = new AnimationTestHelper(mockGltf)
  })

  test('all schemes work', () => {
    helper.expectAnimationExists('wait_idle_L')
    helper.expectAnimationExists('Owen_WaitIdle')
    helper.expectAnimationExists('owen.state.wait.idle.loop')
    helper.expectAnimationExists('OwenWaitIdleLoop')
  })

  test('scheme detection', () => {
    helper.expectAnimationScheme('wait_idle_L', 'legacy')
    helper.expectAnimationScheme('Owen_WaitIdle', 'artist')
    helper.expectAnimationScheme('owen.state.wait.idle.loop', 'hierarchical')
    helper.expectAnimationScheme('OwenWaitIdleLoop', 'semantic')
  })

  test('conversions work correctly', () => {
    helper.expectConversionWorks('wait_idle_L', 'semantic', 'OwenWaitIdleLoop')
    helper.expectConversionWorks('Owen_ReactAngry', 'legacy', 'react_angry_S')
  })

  test('round-trip conversions', () => {
    helper.expectRoundTripConversion('wait_idle_L')
    helper.expectRoundTripConversion('Owen_WaitIdle')
    helper.expectRoundTripConversion('OwenSleepPeaceLoop')
  })
})
\`\`\`

These integration examples show how to effectively use the multi-scheme animation system in real-world applications and build processes.
`

  fs.writeFileSync(path.join(examplesDir, 'integration-examples.md'), content, 'utf8')
  console.log('📄 Generated: integration-examples.md')
}

/**
 * Get characteristics for a specific scheme
 */
function getSchemeCharacteristics (scheme) {
  const characteristics = {
    legacy: `
- **Lowercase with underscores**: Easy to type, traditional format
- **Suffix notation**: \`_L\` for Loop, \`_S\` for Short animations
- **Compact names**: Shorter than other schemes
- **Technical focus**: Designed for developers, not artists`,

    artist: `
- **Owen prefix**: Consistent branding across all animations
- **PascalCase format**: Easy to read and professional looking
- **Artist-friendly**: No technical jargon or suffixes
- **Blender optimized**: Perfect for animation asset naming`,

    hierarchical: `
- **Dot notation**: Clear hierarchical structure
- **Category organization**: Groups related animations logically
- **IDE friendly**: Excellent autocomplete support
- **Extensible**: Easy to add new categories and subcategories`,

    semantic: `
- **Self-documenting**: Animation purpose is immediately clear
- **Modern naming**: Follows contemporary naming conventions
- **Descriptive**: Includes context like duration and emotion
- **Code readable**: Perfect for maintainable codebases`
  }

  return characteristics[scheme] || 'No characteristics defined for this scheme.'
}

/**
 * Get best practices for a specific scheme
 */
function getSchemeBestPractices (scheme) {
  const practices = {
    legacy: `
1. **Maintain suffix consistency**: Always use \`_L\` for loops, \`_S\` for short animations
2. **Use descriptive words**: Choose clear, short words that describe the animation
3. **Follow underscore convention**: Separate words with underscores, keep lowercase
4. **Document duration**: The suffix should accurately reflect animation type`,

    artist: `
1. **Always use Owen prefix**: Maintain consistent \`Owen_\` branding
2. **Use PascalCase**: Capitalize each word, no spaces or underscores
3. **Be descriptive**: Choose names that clearly describe the animation's purpose
4. **Keep it simple**: Avoid technical terms, focus on what the animation shows`,

    hierarchical: `
1. **Follow the hierarchy**: Use \`owen.category.subcategory.type\` structure
2. **Be consistent**: Use the same categories for similar animations
3. **Plan the structure**: Think about organization before adding new categories
4. **Document categories**: Keep a reference of what each category contains`,

    semantic: `
1. **Be descriptive**: Names should clearly indicate the animation's purpose
2. **Include context**: Add emotional state, duration, or other relevant details
3. **Use PascalCase**: Follow modern JavaScript naming conventions
4. **Stay consistent**: Use similar naming patterns for related animations`
  }

  return practices[scheme] || 'No best practices defined for this scheme.'
}

// Run the script if called directly
if (process.argv[1] === __filename) {
  generateSchemeExamples()
    .catch(error => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}
