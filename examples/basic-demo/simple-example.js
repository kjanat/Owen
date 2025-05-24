/**
 * @fileoverview Simple usage example for Node.js environment
 * @author Owen Animation System
 */

import { OwenSystemFactory, States } from '../../src/index.js'

/**
 * Simple example of using Owen Animation System
 * This example shows how to use the system without a browser environment
 */
class SimpleOwenExample {
  constructor () {
    this.owenSystem = null
  }

  /**
   * Initialize the Owen system with a mock model
   * @returns {Promise<void>}
   */
  async init () {
    try {
      // Create a mock GLTF model for demonstration
      const mockModel = this.createMockModel()

      // Create the Owen system
      this.owenSystem = await OwenSystemFactory.createBasicOwenSystem(mockModel)

      console.log('✅ Owen Animation System initialized successfully!')
      console.log('📊 System Info:')
      console.log(`   Available States: ${this.owenSystem.getAvailableStates().join(', ')}`)
      console.log(`   Current State: ${this.owenSystem.getCurrentState()}`)

      // Run some example interactions
      await this.runExamples()
    } catch (error) {
      console.error('❌ Failed to initialize Owen system:', error.message)
    }
  }

  /**
   * Create a mock 3D model for demonstration purposes
   * @returns {Object} Mock model object
   */
  createMockModel () {
    return {
      animations: [
        { name: 'wait_idle_L' },
        { name: 'wait_quirk1_Q' },
        { name: 'wait_quirk2_Q' },
        { name: 'react_idle_L' },
        { name: 'react_angry_Q' },
        { name: 'react_happy_Q' },
        { name: 'type_idle_L' },
        { name: 'type_angry_L' },
        { name: 'sleep_idle_L' },
        { name: 'wait_2react_T' },
        { name: 'react_2type_T' },
        { name: 'type_2wait_T' },
        { name: 'wait_2sleep_T' },
        { name: 'sleep_2wait_T' }
      ],
      scene: {},
      userData: {}
    }
  }

  /**
   * Run example interactions with the Owen system
   * @returns {Promise<void>}
   */
  async runExamples () {
    console.log('\n🎬 Running example interactions...\n')

    // Example 1: Basic state transitions
    console.log('📝 Example 1: Manual state transitions')
    await this.demonstrateStateTransitions()

    // Example 2: Message handling
    console.log('\n📝 Example 2: Message handling with emotions')
    await this.demonstrateMessageHandling()

    // Example 3: System update loop
    console.log('\n📝 Example 3: System update simulation')
    this.demonstrateUpdateLoop()

    console.log('\n✨ All examples completed!')
  }

  /**
   * Demonstrate manual state transitions
   * @returns {Promise<void>}
   */
  async demonstrateStateTransitions () {
      const states = [ States.REACTING, States.TYPING, States.WAITING, States.SLEEPING ]

    for (const state of states) {
      console.log(`🔄 Transitioning to ${state.toUpperCase()} state...`)
      await this.owenSystem.transitionTo(state)
      console.log(`   ✓ Current state: ${this.owenSystem.getCurrentState()}`)
      console.log(`   ✓ Available transitions: ${this.owenSystem.getAvailableTransitions().join(', ')}`)

      // Simulate some time passing
      await this.sleep(500)
    }
  }

  /**
   * Demonstrate message handling with emotional responses
   * @returns {Promise<void>}
   */
  async demonstrateMessageHandling () {
    const messages = [
      { text: 'Hello Owen!', expected: 'neutral response' },
      { text: 'This is urgent!', expected: 'angry/urgent response' },
      { text: 'Great work!', expected: 'happy response' },
      { text: 'There\'s an error in the system', expected: 'shocked response' },
      { text: 'I\'m feeling sad today', expected: 'sad response' }
    ]

    for (const message of messages) {
      console.log(`💬 Sending message: "${message.text}"`)
      console.log(`   Expected: ${message.expected}`)

      await this.owenSystem.handleUserMessage(message.text)
      console.log(`   ✓ Current state after message: ${this.owenSystem.getCurrentState()}`)

      await this.sleep(300)
    }
  }

  /**
   * Demonstrate the system update loop
   * @returns {void}
   */
  demonstrateUpdateLoop () {
    console.log('⏱️  Simulating update loop for 3 seconds...')

    let iterations = 0
    const startTime = Date.now()

    const updateLoop = () => {
      const deltaTime = 16.67 // ~60 FPS
      this.owenSystem.update(deltaTime)
      iterations++

      if (Date.now() - startTime < 3000) {
        setTimeout(updateLoop, 16)
      } else {
        console.log(`   ✓ Completed ${iterations} update iterations`)
        console.log(`   ✓ Final state: ${this.owenSystem.getCurrentState()}`)
      }
    }

    updateLoop()
  }

  /**
   * Simple sleep utility for demonstrations
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Owen Animation System Example\n')

  const example = new SimpleOwenExample()
  example.init()
    .then(() => {
      console.log('\n🎉 Example completed successfully!')
      console.log('💡 Try modifying this example or check out the browser demo in examples/index.html')
    })
    .catch(error => {
      console.error('\n💥 Example failed:', error)
    })
}

export default SimpleOwenExample
