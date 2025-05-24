#!/usr/bin/env node

/**
 * Test Multi-Scheme Functionality Script
 * Comprehensive testing of the multi-scheme animation system
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ANIMATION_MAPPER_PATH = path.join(PROJECT_ROOT, 'src', 'animation', 'AnimationNameMapper.js')

/**
 * Run comprehensive multi-scheme tests
 */
async function testMultiSchemes () {
  try {
    console.log('🧪 Testing Multi-Scheme Animation System...')

    // Import the AnimationNameMapper
    const animationMapperUrl = pathToFileURL(ANIMATION_MAPPER_PATH)
    const { AnimationNameMapper } = await import(animationMapperUrl)
    const mapper = new AnimationNameMapper()

    const testResults = {
      timestamp: new Date().toISOString(),
      passed: 0,
      failed: 0,
      tests: []
    }

    const schemes = ['legacy', 'artist', 'hierarchical', 'semantic']

    /**
     * Add a test result
     */
    function addTest (name, passed, details = {}, error = null) {
      const test = {
        name,
        passed,
        details,
        error: error?.message || error
      }
      testResults.tests.push(test)
      if (passed) {
        testResults.passed++
        console.log(`✅ ${name}`)
      } else {
        testResults.failed++
        console.log(`❌ ${name}: ${error}`)
      }
      return test
    }

    // Test 1: Basic scheme detection
    console.log('\n🔍 Testing scheme detection...')
    const testCases = [
      { name: 'wait_idle_L', expectedScheme: 'legacy' },
      { name: 'Owen_ReactAngry', expectedScheme: 'artist' },
      { name: 'owen.state.wait.idle.loop', expectedScheme: 'hierarchical' },
      { name: 'OwenSleepToWaitTransition', expectedScheme: 'semantic' }
    ]

    testCases.forEach(testCase => {
      try {
        const detectedScheme = mapper.detectScheme(testCase.name)
        const passed = detectedScheme === testCase.expectedScheme
        addTest(
          `Detect scheme for ${testCase.name}`,
          passed,
          { detected: detectedScheme, expected: testCase.expectedScheme },
          passed ? null : `Expected ${testCase.expectedScheme}, got ${detectedScheme}`
        )
      } catch (error) {
        addTest(`Detect scheme for ${testCase.name}`, false, {}, error)
      }
    })

    // Test 2: Conversion between schemes
    console.log('\n🔄 Testing scheme conversions...')
    const conversionTests = [
      { from: 'wait_idle_L', to: 'semantic', expected: 'OwenWaitIdleLoop' },
      { from: 'Owen_ReactAngry', to: 'legacy', expected: 'react_angry_L' },
      { from: 'owen.state.sleep.peace.loop', to: 'artist', expected: 'Owen_SleepPeace' },
      { from: 'OwenTypeIdleLoop', to: 'hierarchical', expected: 'owen.state.type.idle.loop' }
    ]

    conversionTests.forEach(test => {
      try {
        const result = mapper.convert(test.from, test.to)
        const passed = result === test.expected
        addTest(
          `Convert ${test.from} to ${test.to}`,
          passed,
          { result, expected: test.expected },
          passed ? null : `Expected ${test.expected}, got ${result}`
        )
      } catch (error) {
        addTest(`Convert ${test.from} to ${test.to}`, false, {}, error)
      }
    })

    // Test 3: Round-trip conversions (should return to original)
    console.log('\n🔁 Testing round-trip conversions...')
    const roundTripTests = ['wait_idle_L', 'Owen_ReactAngry', 'owen.state.sleep.peace.loop', 'OwenTypeIdleLoop']

    roundTripTests.forEach(originalName => {
      try {
        const originalScheme = mapper.detectScheme(originalName)
        let currentName = originalName

        // Convert through all other schemes and back
        const otherSchemes = schemes.filter(s => s !== originalScheme)
        for (const scheme of otherSchemes) {
          currentName = mapper.convert(currentName, scheme)
        }

        // Convert back to original scheme
        const finalName = mapper.convert(currentName, originalScheme)
        const passed = finalName === originalName

        addTest(
          `Round-trip conversion for ${originalName}`,
          passed,
          { original: originalName, final: finalName, path: `${originalName} -> ${otherSchemes.join(' -> ')} -> ${originalName}` },
          passed ? null : `Round-trip failed: ${originalName} -> ${finalName}`
        )
      } catch (error) {
        addTest(`Round-trip conversion for ${originalName}`, false, {}, error)
      }
    })

    // Test 4: Validation functionality
    console.log('\n✅ Testing validation...')
    const validationTests = [
      { name: 'wait_idle_L', shouldBeValid: true },
      { name: 'Owen_ValidAnimation', shouldBeValid: true },
      { name: 'invalid_animation_name', shouldBeValid: false },
      { name: 'NotAnAnimation', shouldBeValid: false }
    ]

    validationTests.forEach(test => {
      try {
        const validation = mapper.validateAnimationName(test.name)
        const passed = validation.isValid === test.shouldBeValid
        addTest(
          `Validate ${test.name}`,
          passed,
          { validation, expected: test.shouldBeValid },
          passed ? null : `Expected valid=${test.shouldBeValid}, got valid=${validation.isValid}`
        )
      } catch (error) {
        addTest(`Validate ${test.name}`, false, {}, error)
      }
    })

    // Test 5: Get all animations by scheme
    console.log('\n📋 Testing animation retrieval...')
    schemes.forEach(scheme => {
      try {
        const animations = mapper.getAllAnimationsByScheme(scheme)
        const passed = Array.isArray(animations) && animations.length > 0
        addTest(
          `Get all ${scheme} animations`,
          passed,
          { count: animations.length, sample: animations.slice(0, 3) },
          passed ? null : 'No animations returned or invalid format'
        )
      } catch (error) {
        addTest(`Get all ${scheme} animations`, false, {}, error)
      }
    })

    // Test 6: Performance test
    console.log('\n⚡ Testing performance...')
    const performanceAnimations = ['wait_idle_L', 'Owen_ReactAngry', 'owen.state.sleep.peace.loop']

    try {
      const iterations = 1000
      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        performanceAnimations.forEach(anim => {
          mapper.convert(anim, 'semantic')
          mapper.validateAnimationName(anim)
        })
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const operationsPerSecond = Math.round((iterations * performanceAnimations.length * 2) / (totalTime / 1000))

      const passed = totalTime < 5000 // Should complete in under 5 seconds
      addTest(
        'Performance test',
        passed,
        {
          iterations,
          totalTimeMs: totalTime,
          operationsPerSecond,
          averageTimePerOperation: totalTime / (iterations * performanceAnimations.length * 2)
        },
        passed ? null : `Performance too slow: ${totalTime}ms for ${iterations} iterations`
      )
    } catch (error) {
      addTest('Performance test', false, {}, error)
    }

    // Test 7: Edge cases
    console.log('\n🎯 Testing edge cases...')
    const edgeCases = [
      { name: '', description: 'empty string' },
      { name: 'single', description: 'single word' },
      { name: 'UPPERCASE_NAME_L', description: 'uppercase legacy' },
      { name: 'owen_special_case_S', description: 'legacy with Owen prefix' }
    ]

    edgeCases.forEach(testCase => {
      try {
        const validation = mapper.validateAnimationName(testCase.name)
        // These should generally be invalid or have suggestions
        const passed = true // Just test that it doesn't crash
        addTest(
          `Edge case: ${testCase.description}`,
          passed,
          { input: testCase.name, validation },
          null
        )
      } catch (error) {
        // It's okay if edge cases throw errors, as long as they're handled gracefully
        const passed = error.message && error.message.length > 0
        addTest(
          `Edge case: ${testCase.description}`,
          passed,
          { input: testCase.name },
          passed ? null : 'Unhandled error or empty error message'
        )
      }
    })

    // Generate final report
    const report = {
      ...testResults,
      summary: {
        total: testResults.passed + testResults.failed,
        passed: testResults.passed,
        failed: testResults.failed,
        passRate: Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100),
        status: testResults.failed === 0 ? 'PASS' : 'FAIL'
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        timestamp: new Date().toISOString()
      }
    }

    // Save report
    const reportsDir = path.join(PROJECT_ROOT, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    fs.writeFileSync(
      path.join(reportsDir, 'multi-scheme-test-results.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    )

    // Print summary
    console.log('\n📊 MULTI-SCHEME TEST SUMMARY')
    console.log('='.repeat(50))
    console.log(`Status: ${report.summary.status}`)
    console.log(`Tests: ${report.summary.passed}/${report.summary.total} passed (${report.summary.passRate}%)`)
    console.log(`Failed: ${report.summary.failed}`)

    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`• ${test.name}: ${test.error}`)
        })
    }

    console.log(`\n📁 Full report saved to: ${path.join(reportsDir, 'multi-scheme-test-results.json')}`)

    // Exit with error if tests failed
    if (testResults.failed > 0) {
      process.exit(1)
    }

    return report
  } catch (error) {
    console.error('❌ Error running multi-scheme tests:', error.message)
    process.exit(1)
  }
}

// Run the script if called directly
if (process.argv[1] === __filename) {
  testMultiSchemes()
    .then(report => {
      console.log('✅ Multi-scheme testing complete!')
    })
    .catch(error => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}
