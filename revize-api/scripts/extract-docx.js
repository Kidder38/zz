const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docxFilePath = '/Users/imac/Library/CloudStorage/OneDrive-Sdílenéknihovny–Onedrive/_Revize_ZZ/vzor_revize_vezovy.docx';

async function extractTextFromDocx() {
  try {
    const result = await mammoth.extractRawText({ path: docxFilePath });
    const text = result.value;
    
    // Output the text to a file for examination
    const outputPath = path.join(__dirname, 'document-content.txt');
    fs.writeFileSync(outputPath, text);
    
    console.log(`Extracted text content to: ${outputPath}`);
    
    // Also print first 2000 characters for quick view
    console.log('\nDocument Preview:');
    console.log('=================');
    console.log(text.substring(0, 2000));
    console.log('\n...(truncated)...');
    
    // Extract tables (if any)
    try {
      const tableResult = await mammoth.convertToHtml({ path: docxFilePath });
      const htmlContent = tableResult.value;
      
      // Try to find tables in the HTML content
      const tableCount = (htmlContent.match(/<table/g) || []).length;
      console.log(`\nFound ${tableCount} tables in the document`);
      
      // Save HTML for further inspection
      const htmlOutputPath = path.join(__dirname, 'document-content.html');
      fs.writeFileSync(htmlOutputPath, htmlContent);
      console.log(`Extracted HTML content to: ${htmlOutputPath}`);
    } catch (tableError) {
      console.error('Error extracting tables:', tableError);
    }
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
  }
}

extractTextFromDocx();