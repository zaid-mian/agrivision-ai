import { chromium } from '../../demo-studio/node_modules/playwright/index.mjs';
import path from 'path';

async function testWorkflow() {
  console.log('[test-workflow] Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('[test-workflow] Navigating to login...');
  await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle' });
  
  const demoBtn = page.locator('button:has-text("Explore Live Demo as Model Farmer")');
  await demoBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('[test-workflow] Found demo login button, clicking...');
  await demoBtn.click();

  console.log('[test-workflow] Waiting for dashboard...');
  await page.waitForSelector('text=ecological diagnostics', { timeout: 10000 });
  console.log('[test-workflow] Dashboard reached successfully!');

  console.log('[test-workflow] Navigating to Disease Detection...');
  const diseaseLink = page.locator('aside a[href="#/disease"]');
  await diseaseLink.click();
  await page.waitForSelector('text=Crop Disease Detection', { timeout: 10000 });
  console.log('[test-workflow] Disease Detection page loaded!');

  console.log('[test-workflow] Setting file on input[type=file]...');
  const testImagePath = path.resolve('app/uploads/leaf-1781288230956-797817476.jpg');
  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  
  console.log('[test-workflow] Waiting for Analyze Health button...');
  const analyzeBtn = page.locator('button:has-text("Analyze Health")');
  await analyzeBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('[test-workflow] Clicking Analyze Health button...');
  await analyzeBtn.click();

  console.log('[test-workflow] Waiting for inference result...');
  await page.waitForSelector('text=Tomato Late Blight', { timeout: 15000 });
  console.log('[test-workflow] Diagnostic result displayed: Tomato Late Blight found!');

  const attentionMapBtn = page.locator('button:has-text("AI Attention Map")');
  await attentionMapBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('[test-workflow] Clicking AI Attention Map toggle...');
  await attentionMapBtn.click();
  await page.waitForTimeout(1000);
  console.log('[test-workflow] Attention Map toggled successfully!');

  console.log('[test-workflow] Navigating to AI Assistant...');
  const assistantLink = page.locator('aside a[href="#/assistant"]');
  await assistantLink.click();
  await page.waitForSelector('input[type="text"]', { timeout: 10000 });
  console.log('[test-workflow] AI Assistant loaded!');

  const input = page.locator('input[type="text"]');
  await input.fill('What is the recommended fungicide treatment for Tomato Late Blight during wet weather?');
  const sendBtn = page.locator('button[type="submit"]');
  await sendBtn.click();
  console.log('[test-workflow] Waiting for BM25 RAG answer...');
  await page.waitForSelector('text=BM25 Retrieval', { timeout: 10000 });
  console.log('[test-workflow] BM25 RAG response received with latency badge!');

  console.log('[test-workflow] Navigating to Reports...');
  const reportsLink = page.locator('aside a[href="#/reports"]');
  await reportsLink.click();
  await page.waitForSelector('text=Farm Performance Reports', { timeout: 10000 });
  console.log('[test-workflow] Reports page loaded successfully!');

  await browser.close();
  console.log('[test-workflow] ALL WORKFLOW STEPS PASSED PERFECTLY!');
}

testWorkflow().catch((err) => {
  console.error('[test-workflow] FAILED:', err);
  process.exit(1);
});
