
import api from './api';
import serperService from './serper.service';

interface OpenAIResponse {
  text: string;
  success: boolean;
  relatedQuestions?: string[];
}

export const generateText = async (prompt: string): Promise<OpenAIResponse> => {
  try {
    console.log("Generating text with Serper for prompt:", prompt);
    
    // Get search results from Serper instead of OpenAI
    const searchResults = await serperService.getEducationalResources(prompt);
    
    if (searchResults?.organic && searchResults.organic.length > 0) {
      // Format the search results into a readable text
      const formattedText = formatSerperResultsAsText(searchResults.organic);
      
      // Generate related questions based on the results 
      const relatedQuestions = generateRelatedQuestionsFromResults(searchResults.organic, prompt);
      
      return {
        text: formattedText,
        success: true,
        relatedQuestions
      };
    } else {
      // Fallback for when the API doesn't return expected results
      console.warn("Using fallback for Serper response");
      return {
        text: `Search results for: ${prompt}. No detailed information is available at this time.`,
        success: true
      };
    }
  } catch (error) {
    console.error('Error generating text with Serper:', error);
    return {
      text: 'Failed to generate text. Please try again later.',
      success: false
    };
  }
};

// Helper function to format Serper results as readable text
const formatSerperResultsAsText = (results: any[]): string => {
  if (!results || results.length === 0) {
    return "No results found.";
  }

  let text = "# Search Results\n\n";

  results.slice(0, 5).forEach((result, index) => {
    text += `## ${index + 1}. ${result.title}\n`;
    text += `${result.snippet}\n\n`;
    text += `Source: [${result.source || result.displayLink || 'Link'}](${result.link})\n\n`;
  });

  text += "---\n\n";
  text += "These results were compiled from various educational resources across the web. For the most up-to-date information, consider visiting the source links directly.";

  return text;
};

// Helper function to generate related questions from search results
const generateRelatedQuestionsFromResults = (results: any[], originalQuery: string): string[] => {
  const questions = [];
  
  // Add variations of the original query
  questions.push(`What are the best practices for ${originalQuery}?`);
  questions.push(`How to learn more about ${originalQuery}?`);
  
  // Extract keywords from the results to create new questions
  if (results[0] && results[0].title) {
    questions.push(`What are examples of ${results[0].title.split(' ').slice(0, 3).join(' ')}?`);
  }
  
  if (results[1] && results[1].title) {
    questions.push(`How do I start learning ${results[1].title.split(' ').slice(0, 3).join(' ')}?`);
  }
  
  return questions.slice(0, 5); // Limit to 5 questions
};

export const analyzeDocument = async (document: string): Promise<OpenAIResponse> => {
  try {
    console.log("Analyzing document with Serper:", document);
    
    // For document analysis, we'll extract key terms and search for them
    const keyTerms = document.split(' ')
      .filter(word => word.length > 5)
      .slice(0, 5)
      .join(' ');
    
    const searchResults = await serperService.getEducationalResources(keyTerms);
    
    if (searchResults?.organic) {
      const analysis = `# Document Analysis\n\nBased on the content provided, here are some relevant resources:\n\n` + 
        formatSerperResultsAsText(searchResults.organic);
      
      return {
        text: analysis,
        success: true
      };
    } else {
      return {
        text: `Analysis of document: The document appears to cover topics related to ${keyTerms}`,
        success: true
      };
    }
  } catch (error) {
    console.error('Error analyzing document with Serper:', error);
    return {
      text: 'Failed to analyze document. Please try again later.',
      success: false
    };
  }
};

export const summarizeText = async (text: string): Promise<OpenAIResponse> => {
  try {
    console.log("Summarizing text with Serper:", text);
    
    // Extract key terms from the text to search
    const keyTerms = text.split(' ')
      .filter(word => word.length > 5)
      .slice(0, 6)
      .join(' ');
    
    // Look for resources related to the key terms
    const searchResults = await serperService.getEducationalResources(keyTerms);
    
    if (searchResults?.organic) {
      // Create a simple summary with related resources
      const summary = `# Summary\n\nThe content discusses topics related to ${keyTerms}.\n\n` +
        "## Related Resources\n\n" +
        searchResults.organic.slice(0, 3).map((result: any, i: number) => 
          `${i+1}. **${result.title}**: ${result.snippet.substring(0, 100)}...`
        ).join('\n\n');
      
      return {
        text: summary,
        success: true
      };
    } else {
      return {
        text: `Summary: The content contains information about ${keyTerms}`,
        success: true
      };
    }
  } catch (error) {
    console.error('Error summarizing text with Serper:', error);
    return {
      text: 'Failed to summarize text. Please try again later.',
      success: false
    };
  }
};
