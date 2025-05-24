/**
 * Owen Animation System Demo - Main JavaScript
 *
 * This file provides the interactive functionality for the demo pages.
 * It demonstrates the core features of the Owen Animation System.
 */

// Import Owen Animation System (simulated for demo)
// In a real implementation, this would import from the actual package
const OwenDemo = {
  // Mock AnimationNameMapper for demo purposes
  AnimationNameMapper: class {
    constructor () {
      this.animations = {
        legacy: [
          'walk_forward', 'walk_backward', 'run_fast', 'run_slow',
          'jump_high', 'jump_low', 'idle_breathing', 'idle_looking',
          'attack_sword', 'attack_bow', 'defend_shield', 'defend_dodge',
          'death_forward', 'death_backward', 'hurt_light', 'hurt_heavy',
          'climb_up', 'climb_down', 'swim_forward', 'swim_idle'
        ],
        artist: [
          'WalkForward', 'WalkBackward', 'RunFast', 'RunSlow',
          'JumpHigh', 'JumpLow', 'IdleBreathing', 'IdleLooking',
          'AttackSword', 'AttackBow', 'DefendShield', 'DefendDodge',
          'DeathForward', 'DeathBackward', 'HurtLight', 'HurtHeavy',
          'ClimbUp', 'ClimbDown', 'SwimForward', 'SwimIdle'
        ],
        hierarchical: [
          'character.movement.walk.forward', 'character.movement.walk.backward',
          'character.movement.run.fast', 'character.movement.run.slow',
          'character.movement.jump.high', 'character.movement.jump.low',
          'character.idle.breathing', 'character.idle.looking',
          'character.combat.attack.sword', 'character.combat.attack.bow',
          'character.combat.defend.shield', 'character.combat.defend.dodge',
          'character.state.death.forward', 'character.state.death.backward',
          'character.state.hurt.light', 'character.state.hurt.heavy',
          'character.movement.climb.up', 'character.movement.climb.down',
          'character.movement.swim.forward', 'character.movement.swim.idle'
        ],
        semantic: [
          'character_walk_forward', 'character_walk_backward',
          'character_run_fast', 'character_run_slow',
          'character_jump_high', 'character_jump_low',
          'character_idle_breathing', 'character_idle_looking',
          'character_attack_sword', 'character_attack_bow',
          'character_defend_shield', 'character_defend_dodge',
          'character_death_forward', 'character_death_backward',
          'character_hurt_light', 'character_hurt_heavy',
          'character_climb_up', 'character_climb_down',
          'character_swim_forward', 'character_swim_idle'
        ]
      }

      // Create conversion mappings
      this.conversionMap = this.createConversionMap()
    }

    createConversionMap () {
      const map = {}
      const schemes = Object.keys(this.animations)

      schemes.forEach(scheme => {
        map[scheme] = {}
        schemes.forEach(targetScheme => {
          map[scheme][targetScheme] = {}
          this.animations[scheme].forEach((anim, index) => {
            map[scheme][targetScheme][anim] = this.animations[targetScheme][index]
          })
        })
      })

      return map
    }

    getAllAnimationsByScheme (scheme) {
      return this.animations[scheme] || []
    }

    convert (animationName, targetScheme, sourceScheme = null) {
      // If no source scheme provided, try to detect it
      if (!sourceScheme) {
        sourceScheme = this.detectScheme(animationName)
      }

      if (!sourceScheme) {
        throw new Error(`Unable to detect scheme for animation: ${animationName}`)
      }

      if (!this.conversionMap[sourceScheme] || !this.conversionMap[sourceScheme][targetScheme]) {
        throw new Error(`Conversion from ${sourceScheme} to ${targetScheme} not supported`)
      }

      const converted = this.conversionMap[sourceScheme][targetScheme][animationName]
      if (!converted) {
        throw new Error(`Animation "${animationName}" not found in ${sourceScheme} scheme`)
      }

      return converted
    }

    detectScheme (animationName) {
      for (const [scheme, animations] of Object.entries(this.animations)) {
        if (animations.includes(animationName)) {
          return scheme
        }
      }
      return null
    }

    convertBatch (animations, sourceScheme, targetScheme) {
      return animations.map(anim => {
        try {
          return {
            original: anim,
            converted: this.convert(anim, targetScheme, sourceScheme),
            success: true
          }
        } catch (error) {
          return {
            original: anim,
            error: error.message,
            success: false
          }
        }
      })
    }

    suggestCorrections (animationName, scheme) {
      const animations = this.animations[scheme] || []
      return animations.filter(anim =>
        anim.toLowerCase().includes(animationName.toLowerCase()) ||
        animationName.toLowerCase().includes(anim.toLowerCase())
      ).slice(0, 3)
    }
  },

  // Mock OwenAnimationContext for demo purposes
  OwenAnimationContext: class {
    constructor (options = {}) {
      this.namingScheme = options.namingScheme || 'semantic'
      this.autoConvert = options.autoConvert !== false
      this.container = options.container
      this.currentAnimation = null
      this.isPlaying = false
      this.mapper = new OwenDemo.AnimationNameMapper()
    }

    async loadModel (modelPath) {
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Model loaded:', modelPath)
    }

    async playAnimation (animationName) {
      try {
        // Convert animation name if needed
        let targetName = animationName
        if (this.autoConvert) {
          const detectedScheme = this.mapper.detectScheme(animationName)
          if (detectedScheme && detectedScheme !== this.namingScheme) {
            targetName = this.mapper.convert(animationName, this.namingScheme, detectedScheme)
          }
        }

        this.currentAnimation = targetName
        this.isPlaying = true

        console.log(`Playing animation: ${targetName} (original: ${animationName})`)

        // Simulate animation playback
        return new Promise(resolve => {
          setTimeout(() => {
            console.log(`Animation ${targetName} completed`)
            resolve()
          }, 2000)
        })
      } catch (error) {
        console.error('Failed to play animation:', error)
        throw error
      }
    }

    stopAnimation () {
      this.isPlaying = false
      this.currentAnimation = null
      console.log('Animation stopped')
    }

    dispose () {
      this.stopAnimation()
      console.log('Animation context disposed')
    }
  }
}

// Demo Application State
const DemoState = {
  currentScheme: 'semantic',
  selectedAnimation: null,
  animationContext: null,
  mapper: new OwenDemo.AnimationNameMapper(),

  init () {
    this.setupEventListeners()
    this.updateAnimationList()
    this.setupConversionTool()
    this.setupTabSwitching()
    this.initAnimationContext()
  },

  setupEventListeners () {
    // Naming scheme change
    const schemeSelect = document.getElementById('naming-scheme')
    if (schemeSelect) {
      schemeSelect.addEventListener('change', (e) => {
        this.currentScheme = e.target.value
        this.updateAnimationList()
        this.updateCodeExamples()
      })
    }

    // Animation selection
    const animationSelect = document.getElementById('animation-select')
    if (animationSelect) {
      animationSelect.addEventListener('change', (e) => {
        this.selectedAnimation = e.target.value
        this.updatePlayButtons()
      })
    }

    // Playback controls
    const playBtn = document.getElementById('play-animation')
    const pauseBtn = document.getElementById('pause-animation')
    const stopBtn = document.getElementById('stop-animation')

    if (playBtn) {
      playBtn.addEventListener('click', () => this.playSelectedAnimation())
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseAnimation())
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopAnimation())
    }

    // Start demo button
    const startBtn = document.getElementById('start-demo')
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startInteractiveDemo())
    }
  },

  updateAnimationList () {
    const select = document.getElementById('animation-select')
    if (!select) return

    const animations = this.mapper.getAllAnimationsByScheme(this.currentScheme)

    select.innerHTML = '<option value="">Select an animation...</option>'
    animations.forEach(anim => {
      const option = document.createElement('option')
      option.value = anim
      option.textContent = anim
      select.appendChild(option)
    })

    this.updatePlayButtons()
  },

  updatePlayButtons () {
    const hasSelection = !!this.selectedAnimation
    const playBtn = document.getElementById('play-animation')
    const pauseBtn = document.getElementById('pause-animation')
    const stopBtn = document.getElementById('stop-animation')

    if (playBtn) playBtn.disabled = !hasSelection
    if (pauseBtn) pauseBtn.disabled = !hasSelection
    if (stopBtn) stopBtn.disabled = !hasSelection
  },

  setupConversionTool () {
    const input = document.getElementById('input-animation')
    const schemeSelect = document.getElementById('input-scheme')
    const convertBtn = document.getElementById('convert-btn')

    if (!input || !schemeSelect || !convertBtn) return

    const updateConversion = () => {
      const animationName = input.value.trim()
      const sourceScheme = schemeSelect.value

      if (!animationName) {
        this.clearConversionResults()
        return
      }

      this.performConversion(animationName, sourceScheme)
    }

    input.addEventListener('input', updateConversion)
    schemeSelect.addEventListener('change', updateConversion)
    convertBtn.addEventListener('click', updateConversion)
  },

  performConversion (animationName, sourceScheme) {
    const results = {
      legacy: '-',
      artist: '-',
      hierarchical: '-',
      semantic: '-'
    }

    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']

    schemes.forEach(targetScheme => {
      try {
        results[targetScheme] = this.mapper.convert(animationName, targetScheme, sourceScheme)
      } catch (error) {
        results[targetScheme] = `Error: ${error.message}`
      }
    })

    this.displayConversionResults(results)
  },

  displayConversionResults (results) {
    Object.entries(results).forEach(([scheme, result]) => {
      const element = document.getElementById(`result-${scheme}`)
      if (element) {
        element.textContent = result
        element.className = result.startsWith('Error:') ? 'error' : 'success'
      }
    })
  },

  clearConversionResults () {
    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']
    schemes.forEach(scheme => {
      const element = document.getElementById(`result-${scheme}`)
      if (element) {
        element.textContent = '-'
        element.className = ''
      }
    })
  },

  setupTabSwitching () {
    const tabButtons = document.querySelectorAll('.tab-button')
    const tabPanes = document.querySelectorAll('.tab-pane')

    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab

        // Update button states
        tabButtons.forEach(btn => btn.classList.remove('active'))
        e.target.classList.add('active')

        // Update pane visibility
        tabPanes.forEach(pane => {
          pane.classList.remove('active')
          if (pane.id === `${targetTab}-tab`) {
            pane.classList.add('active')
          }
        })

        this.updateCodeExamples()
      })
    })
  },

  updateCodeExamples () {
    // Update code examples based on current scheme and selection
    const jsOutput = document.getElementById('js-code-output')
    const reactOutput = document.getElementById('react-code-output')
    const vueOutput = document.getElementById('vue-code-output')

    if (jsOutput) {
      jsOutput.textContent = this.generateJavaScriptExample()
    }
    if (reactOutput) {
      reactOutput.textContent = this.generateReactExample()
    }
    if (vueOutput) {
      vueOutput.textContent = this.generateVueExample()
    }
  },

  generateJavaScriptExample () {
    const animation = this.selectedAnimation || 'character_walk_forward'
    return `import { OwenAnimationContext } from '@kjanat/owen'

// Initialize with ${this.currentScheme} naming scheme
const animationContext = new OwenAnimationContext({
  namingScheme: '${this.currentScheme}',
  autoConvert: true
})

// Load your character model
await animationContext.loadModel('./path/to/character.gltf')

// Play animation using ${this.currentScheme} scheme
await animationContext.playAnimation('${animation}')

// The system automatically handles conversions between schemes
// You can use any naming scheme and it will convert automatically`
  },

  generateReactExample () {
    const animation = this.selectedAnimation || 'character_walk_forward'
    return `import React, { useEffect, useRef, useState } from 'react'
import { OwenAnimationContext } from '@kjanat/owen'

export function AnimatedCharacter() {
  const containerRef = useRef()
  const [animationContext, setAnimationContext] = useState(null)
  const [currentAnimation, setCurrentAnimation] = useState('${animation}')

  useEffect(() => {
    const context = new OwenAnimationContext({
      namingScheme: '${this.currentScheme}',
      container: containerRef.current
    })

    context.loadModel('./character.gltf').then(() => {
      setAnimationContext(context)
    })

    return () => context?.dispose()
  }, [])

  const playAnimation = async (animationName) => {
    if (animationContext) {
      await animationContext.playAnimation(animationName)
      setCurrentAnimation(animationName)
    }
  }

  return (
    <div className="animated-character">
      <div ref={containerRef} className="viewport" />
      <button onClick={() => playAnimation('${animation}')}>
        Play Animation
      </button>
    </div>
  )
}`
  },

  generateVueExample () {
    const animation = this.selectedAnimation || 'character_walk_forward'
    return `<template>
  <div class="animated-character">
    <div ref="viewport" class="viewport"></div>
    <button @click="playAnimation('${animation}')">
      Play Animation
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { OwenAnimationContext } from '@kjanat/owen'

const viewport = ref(null)
const animationContext = ref(null)
const currentAnimation = ref('${animation}')

onMounted(async () => {
  const context = new OwenAnimationContext({
    namingScheme: '${this.currentScheme}',
    container: viewport.value
  })

  await context.loadModel('./character.gltf')
  animationContext.value = context
})

onUnmounted(() => {
  animationContext.value?.dispose()
})

const playAnimation = async (animationName) => {
  if (animationContext.value) {
    await animationContext.value.playAnimation(animationName)
    currentAnimation.value = animationName
  }
}
</script>`
  },

  async initAnimationContext () {
    const canvas = document.getElementById('demo-canvas')
    if (!canvas) return

    this.animationContext = new OwenDemo.OwenAnimationContext({
      namingScheme: this.currentScheme,
      container: canvas
    })

    // Simulate model loading
    try {
      await this.animationContext.loadModel('basic-character.gltf')
      console.log('Demo character loaded successfully')
    } catch (error) {
      console.error('Failed to load demo character:', error)
    }
  },

  async playSelectedAnimation () {
    if (!this.selectedAnimation || !this.animationContext) return

    try {
      await this.animationContext.playAnimation(this.selectedAnimation)
    } catch (error) {
      console.error('Failed to play animation:', error)
      window.alert(`Failed to play animation: ${error.message}`)
    }
  },

  pauseAnimation () {
    // In a real implementation, this would pause the current animation
    console.log('Animation paused')
  },

  stopAnimation () {
    if (this.animationContext) {
      this.animationContext.stopAnimation()
    }
  },

  startInteractiveDemo () {
    // Navigate to interactive page or start guided tour
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      window.location.href = 'interactive.html'
    } else {
      // Already on a page with interactive features
      this.scrollToSection('.live-demo-section')
    }
  },

  scrollToSection (selector) {
    const element = document.querySelector(selector)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// Copy code functionality
function setupCodeCopying () {
  document.querySelectorAll('.copy-code-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const targetId = e.target.dataset.target
      const codeElement = document.getElementById(targetId)

      if (codeElement) {
        try {
          await navigator.clipboard.writeText(codeElement.textContent)

          // Visual feedback
          const originalText = e.target.textContent
          e.target.textContent = 'Copied!'
          e.target.style.background = 'var(--success-color)'

          setTimeout(() => {
            e.target.textContent = originalText
            e.target.style.background = ''
          }, 2000)
        } catch (error) {
          console.error('Failed to copy code:', error)
          window.alert('Failed to copy code to clipboard')
        }
      }
    })
  })
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  DemoState.init()
  setupCodeCopying()

  // Add some visual feedback for interactions
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
      e.target.style.transform = 'scale(0.98)'
      setTimeout(() => {
        e.target.style.transform = ''
      }, 150)
    }
  })
})

// Export for use in other demo files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OwenDemo, DemoState }
} else {
  window.OwenDemo = OwenDemo
  window.DemoState = DemoState
}
