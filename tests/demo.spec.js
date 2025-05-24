import { test, expect } from '@playwright/test'

test.describe('Owen Animation System Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page before each test
    await page.goto('/')
  })

  test('should load the main demo page', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Owen Animation System/)

    // Check that the main heading is present
    await expect(page.locator('h1')).toContainText('Owen Animation System')

    // Check that the demo content is loaded
    await expect(page.locator('.demo-content')).toBeVisible()
  })

  test('should display animation name converter', async ({ page }) => {
    // Check that the converter section is present
    await expect(page.locator('.converter-section')).toBeVisible()

    // Check input fields
    await expect(page.locator('#animationName')).toBeVisible()
    await expect(page.locator('#sourceScheme')).toBeVisible()
    await expect(page.locator('#targetScheme')).toBeVisible()

    // Check convert button
    await expect(page.locator('#convertBtn')).toBeVisible()
  })

  test('should convert animation names', async ({ page }) => {
    // Fill in the converter form
    await page.fill('#animationName', 'char_walk_01')
    await page.selectOption('#sourceScheme', 'artist')
    await page.selectOption('#targetScheme', 'semantic')

    // Click convert button
    await page.click('#convertBtn')

    // Check that result is displayed
    await expect(page.locator('#conversionResult')).toBeVisible()
    await expect(page.locator('#conversionResult')).toContainText('character.movement.walk')
  })

  test('should validate animation names', async ({ page }) => {
    // Test with invalid animation name
    await page.fill('#animationName', 'invalid-name-123!@#')
    await page.selectOption('#sourceScheme', 'semantic')
    await page.click('#convertBtn')

    // Should show validation error
    await expect(page.locator('.error-message')).toBeVisible()

    // Test with valid animation name
    await page.fill('#animationName', 'character.idle.basic')
    await page.click('#convertBtn')

    // Should show success
    await expect(page.locator('.success-message')).toBeVisible()
  })

  test('should show scheme comparison', async ({ page }) => {
    // Check that scheme cards are present
    await expect(page.locator('.scheme-card')).toHaveCount(4)

    // Check that each scheme is represented
    await expect(page.locator('.scheme-card')).toContainText(['Legacy', 'Artist', 'Hierarchical', 'Semantic'])
  })

  test('should handle batch conversion', async ({ page }) => {
    // Click on batch conversion tab
    await page.click('[data-tab="batch"]')

    // Fill in batch input
    const batchInput = [
      'char_walk_01',
      'char_run_02',
      'prop_door_open'
    ].join('\n')

    await page.fill('#batchInput', batchInput)
    await page.selectOption('#batchSourceScheme', 'artist')
    await page.selectOption('#batchTargetScheme', 'semantic')

    // Click convert batch button
    await page.click('#convertBatchBtn')

    // Check that results are displayed
    await expect(page.locator('#batchResults')).toBeVisible()
    await expect(page.locator('.batch-result-item')).toHaveCount(3)
  })

  test('should export results', async ({ page }) => {
    // Convert some animation names first
    await page.fill('#animationName', 'char_walk_01')
    await page.selectOption('#sourceScheme', 'artist')
    await page.selectOption('#targetScheme', 'semantic')
    await page.click('#convertBtn')

    // Wait for result
    await expect(page.locator('#conversionResult')).toBeVisible()

    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.click('#exportBtn')
    const download = await downloadPromise

    // Check that file was downloaded
    expect(download.suggestedFilename()).toMatch(/animation-conversions.*\.json/)
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile navigation is present
    await expect(page.locator('.mobile-nav')).toBeVisible()

    // Check that converter still works
    await page.fill('#animationName', 'test_animation')
    await page.selectOption('#sourceScheme', 'legacy')
    await page.selectOption('#targetScheme', 'semantic')
    await page.click('#convertBtn')

    await expect(page.locator('#conversionResult')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Test with empty input
    await page.click('#convertBtn')
    await expect(page.locator('.error-message')).toContainText('Animation name is required')

    // Test with same source and target scheme
    await page.fill('#animationName', 'test_animation')
    await page.selectOption('#sourceScheme', 'semantic')
    await page.selectOption('#targetScheme', 'semantic')
    await page.click('#convertBtn')

    await expect(page.locator('.warning-message')).toContainText('Source and target schemes are the same')
  })

  test('should show performance metrics', async ({ page }) => {
    // Check that performance section is present
    await expect(page.locator('.performance-section')).toBeVisible()

    // Convert some animations to generate metrics
    await page.fill('#animationName', 'char_walk_01')
    await page.selectOption('#sourceScheme', 'artist')
    await page.selectOption('#targetScheme', 'semantic')
    await page.click('#convertBtn')

    // Check that metrics are updated
    await expect(page.locator('.conversion-time')).toContainText(/\d+ms/)
    await expect(page.locator('.total-conversions')).toContainText(/\d+/)
  })
})
