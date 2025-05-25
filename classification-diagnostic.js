/**
 * Classification Diagnostic Tool
 * 
 * This script helps identify where the classification issue occurs
 * by testing each component in the classification pipeline
 */

const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// Import your services
const { TaxonomyService } = require('./packages/core/dist/services/TaxonomyService');
const { TextBasedClassifier } = require('./packages/core/dist/services/TextBasedClassifier');
const { ClassificationService } = require('./packages/core/dist/services/ClassificationService');

async function runDiagnostics() {
  console.log('🔍 Starting Classification Diagnostics...\n');
  
  try {
    // Test 1: Check if taxonomy loads properly
    console.log('1️⃣ Testing Taxonomy Service...');
    const taxonomyPath = path.join(__dirname, 'resources', 'taxonomy', 'custom_knowledge_taxonomy.json');
    console.log(`   Taxonomy path: ${taxonomyPath}`);
    console.log(`   File exists: ${fs.existsSync(taxonomyPath)}`);
    
    if (!fs.existsSync(taxonomyPath)) {
      console.log('   ❌ ISSUE: Taxonomy file does not exist!');
      return;
    }
    
    const taxonomyService = new TaxonomyService(taxonomyPath);
    await taxonomyService.loadTaxonomy();
    const concepts = taxonomyService.getAllConcepts();
    console.log(`   ✅ Taxonomy loaded successfully: ${concepts.length} concepts`);
    
    if (concepts.length === 0) {
      console.log('   ❌ ISSUE: No concepts found in taxonomy!');
      return;
    }
    
    // Show sample concepts
    console.log('   Sample concepts:');
    concepts.slice(0, 3).forEach(concept => {
      console.log(`     - ${concept.id}: ${concept.prefLabel}`);
    });
    console.log('');
    
    // Test 2: Test TextBasedClassifier with sample content
    console.log('2️⃣ Testing TextBasedClassifier...');
    const textClassifier = new TextBasedClassifier(taxonomyService);
    
    const sampleTitle = "The Google Pixel 10 just showed up in one of the strangest phone leaks we've seen yet";
    const sampleText = `The Google Pixel 10 has appeared in what might be one of the most unusual phone leaks in recent memory. 
    Technology enthusiasts and industry watchers are buzzing about this unexpected development in the smartphone market.
    The device appears to feature advanced artificial intelligence capabilities and machine learning features.
    Google's latest smartphone technology represents a significant advancement in mobile computing and digital innovation.`;
    
    console.log('   Testing with sample content...');
    console.log(`   Title: ${sampleTitle}`);
    console.log(`   Text length: ${sampleText.length} characters`);
    
    const textResults = await textClassifier.classifyContent(sampleTitle, sampleText, {
      maxConcepts: 10,
      confidenceThreshold: 0.1 // Very low threshold to see any matches
    });
    
    console.log(`   ✅ TextBasedClassifier returned ${textResults.length} results`);
    if (textResults.length > 0) {
      console.log('   Top results:');
      textResults.slice(0, 5).forEach((result, index) => {
        const concept = taxonomyService.getConcept(result.conceptId);
        console.log(`     ${index + 1}. ${concept?.prefLabel || result.conceptId} (confidence: ${result.confidence.toFixed(4)})`);
      });
    } else {
      console.log('   ⚠️  WARNING: TextBasedClassifier returned no results');
      
      // Debug text extraction
      console.log('   🔍 Debugging text extraction...');
      const extractedTerms = extractTermsDebug(sampleTitle + ' ' + sampleText);
      console.log(`   Extracted ${extractedTerms.length} unique terms`);
      console.log('   Sample terms:', extractedTerms.slice(0, 10));
      
      // Check if any concept labels match
      console.log('   🔍 Checking concept label matches...');
      let foundMatches = 0;
      for (const concept of concepts.slice(0, 10)) {
        const normalizedLabel = concept.prefLabel.toLowerCase();
        const textLower = (sampleTitle + ' ' + sampleText).toLowerCase();
        if (textLower.includes(normalizedLabel) || normalizedLabel.includes('technology') || normalizedLabel.includes('phone') || normalizedLabel.includes('artificial')) {
          console.log(`     Potential match: "${concept.prefLabel}"`);
          foundMatches++;
        }
      }
      console.log(`   Found ${foundMatches} potential concept matches`);
    }
    console.log('');
    
    // Test 3: Check vector storage availability
    console.log('3️⃣ Testing Vector Storage...');
    try {
      // This will depend on your vector storage implementation
      // For now, we'll just check if the path exists
      const vectorStoragePath = path.join(__dirname, 'storage', 'vectors');
      console.log(`   Vector storage path: ${vectorStoragePath}`);
      console.log(`   Directory exists: ${fs.existsSync(vectorStoragePath)}`);
      
      if (fs.existsSync(vectorStoragePath)) {
        const files = fs.readdirSync(vectorStoragePath);
        console.log(`   Files in vector storage: ${files.length}`);
        console.log('   ✅ Vector storage appears to be set up');
      } else {
        console.log('   ⚠️  WARNING: Vector storage directory does not exist');
      }
    } catch (error) {
      console.log(`   ❌ Error checking vector storage: ${error.message}`);
    }
    console.log('');
    
    // Test 4: Check embedding model availability
    console.log('4️⃣ Testing Embedding Model...');
    const modelPath = path.join(__dirname, 'resources', 'models', 'minilm');
    console.log(`   Model path: ${modelPath}`);
    console.log(`   Directory exists: ${fs.existsSync(modelPath)}`);
    
    if (fs.existsSync(modelPath)) {
      const modelFiles = ['model.onnx', 'vocab.txt', 'config.json'];
      const existingFiles = modelFiles.filter(file => fs.existsSync(path.join(modelPath, file)));
      console.log(`   Model files found: ${existingFiles.join(', ')}`);
      
      if (existingFiles.length === modelFiles.length) {
        console.log('   ✅ All required model files are present');
      } else {
        console.log('   ⚠️  WARNING: Some model files are missing');
        console.log(`   Missing: ${modelFiles.filter(f => !existingFiles.includes(f)).join(', ')}`);
      }
    } else {
      console.log('   ❌ ISSUE: Model directory does not exist!');
    }
    console.log('');
    
    // Test 5: Content extraction debug
    console.log('5️⃣ Testing Content Extraction...');
    
    // Simulate the content that would be extracted from HTML
    const htmlContent = `<div id="readability-page-1" class="page"><div data-widget-type="contentparsed" id="content"> <section> <div> <div> <picture data-new-v2-image="true"> <source type="image/webp" srcset="https://cdn.mos.cms.futurecdn.net/W6WmYgthQzxX32LpaMo8xb-1920-80.jpg.webp 1920w, https://cdn.mos.cms.futurecdn.net/W6WmYgthQzxX32LpaMo8xb-1200-80.jpg.webp 1200w, https://cdn.mos.cms.futurecdn.net/W6WmYgthQzxX32LpaMo8xb-1024-80.jpg.webp 1024w, https://cdn.mos.cms.futurecdn.net/W6WmYgthQzxX32LpaMo8xb-970-80.jpg.webp...</div>`;
    
    const extractedText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`   Original HTML length: ${htmlContent.length} characters`);
    console.log(`   Extracted text length: ${extractedText.length} characters`);
    console.log(`   Extracted text preview: "${extractedText.substring(0, 200)}..."`);
    
    if (extractedText.length < 100) {
      console.log('   ⚠️  WARNING: Very little text extracted from HTML content');
      console.log('   This might be why classification is failing');
    } else {
      console.log('   ✅ Text extraction appears to be working');
    }
    console.log('');
    
    console.log('🎯 DIAGNOSIS SUMMARY:');
    console.log('==================');
    
    if (concepts.length === 0) {
      console.log('❌ PRIMARY ISSUE: No concepts loaded from taxonomy');
      console.log('   Solution: Check taxonomy file format and content');
    } else if (textResults.length === 0) {
      console.log('❌ PRIMARY ISSUE: TextBasedClassifier not finding matches');
      console.log('   Solution: Check classification thresholds and concept definitions');
    } else if (extractedText.length < 100) {
      console.log('❌ PRIMARY ISSUE: Poor content extraction from HTML');
      console.log('   Solution: Improve HTML content extraction in processHtml method');
    } else {
      console.log('✅ Basic components appear to be working');
      console.log('   The issue may be in the integration or configuration');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to extract terms (simplified version of what TextBasedClassifier does)
function extractTermsDebug(text) {
  const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with']);
  
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 3 && !stopWords.has(token))
    .filter((token, index, array) => array.indexOf(token) === index); // unique only
}

// Run diagnostics if this file is executed directly
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics };
