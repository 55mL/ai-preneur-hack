async function extractTextFromImage(imageFile, apiKey, taskType, maxTokens, temperature, topP, repetitionPenalty, pages = null) {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('task_type', taskType);
  formData.append('max_tokens', maxTokens.toString());
  formData.append('temperature', temperature.toString());
  formData.append('top_p', topP.toString());
  formData.append('repetition_penalty', repetitionPenalty.toString());

  if (pages) {
    formData.append('pages', JSON.stringify(pages));
  }

  try {
    const response = await fetch('https://api.opentyphoon.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();

      // Extract text from successful results
      const extractedTexts = [];
      for (const pageResult of result.results || []) {
        if (pageResult.success && pageResult.message) {
          let content = pageResult.message.choices[0].message.content;
          try {
            // Try to parse as JSON if it's structured output
            const parsedContent = JSON.parse(content);
            content = parsedContent.natural_text || content;
          } catch (e) {
            // Use content as-is if not JSON
          }
          extractedTexts.push(content);
        } else if (!pageResult.success) {
          console.error(`Error processing ${pageResult.filename || 'unknown'}: ${pageResult.error || 'Unknown error'}`);
        }
      }

      return extractedTexts.join('\n');
    } else {
      console.error('Error:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Usage
const apiKey = '<YOUR_API_KEY>';
const imageFile = document.getElementById('imageInput').files[0]; // or PDF file
const taskType = "default";
const maxTokens = 16000;
const temperature = 0.1;
const topP = 0.6;
const repetitionPenalty = 1.2;
const pages = null;
const rawText = await extractTextFromImage(imageFile, apiKey, taskType, maxTokens, temperature, topP, repetitionPenalty, pages);
console.log(rawText);