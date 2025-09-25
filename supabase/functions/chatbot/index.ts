import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// CORS headers for web app access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Chatbot responses data (embedded directly for performance)
const CHATBOT_RESPONSES = {
  "greetings": {
    "patterns": [
      "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
      "greetings", "salaam", "jambo", "habari", "bonjour", "hola"
    ],
    "responses": [
      "Hello! I'm TransparencyBot, your government transparency assistant. How can I help you track public funds today?",
      "Hi there! Welcome to TransparencyBot. I can help you find information about government budgets, contracts, and spending. What would you like to know?",
      "Greetings! I'm here to help you explore government financial data and transparency. What are you curious about?",
      "Hello! I'm TransparencyBot, designed to make government spending transparent. Ask me about budgets, projects, or contractors.",
      "Hi! I'm your transparency assistant. I can answer questions about public funds, government contracts, and help you report corruption. How can I assist?",
      "Welcome! I'm TransparencyBot. I'm here to help citizens like you understand how public money is being spent. What would you like to explore?",
      "Hello and welcome! I can help you track government spending, find budget information, and even report suspicious activities. What's on your mind?",
      "Hi there! I'm TransparencyBot, your window into government financial transparency. Ready to explore some public finance data?"
    ]
  },
  "farewells": {
    "patterns": [
      "bye", "goodbye", "farewell", "see you", "thanks", "thank you",
      "that's all", "nothing else", "end", "quit", "exit", "close"
    ],
    "responses": [
      "Goodbye! Remember, transparency is the foundation of good governance. Come back anytime to explore public finances!",
      "Thank you for using TransparencyBot! Keep asking questions and stay informed about public spending. See you soon!",
      "Farewell! Your interest in government transparency makes democracy stronger. Come back whenever you need information!",
      "Goodbye! Remember, every citizen has the right to know how public money is spent. Keep exploring!",
      "Thank you for your engagement! Transparency and accountability start with informed citizens like you. Take care!",
      "See you later! Don't forget - you can always report suspicious activities or request more information. Stay vigilant!",
      "Goodbye! Your commitment to transparency helps build a better society. Feel free to return anytime!",
      "Thank you for using TransparencyBot! Together, we can make government more transparent and accountable. Until next time!"
    ]
  },
  "capabilities": {
    "patterns": [
      "what can you do", "help", "capabilities", "features", "how do you work",
      "what are you", "what is this", "about", "info", "functionality"
    ],
    "responses": [
      "I can help you with several things:\n\n🔍 **Search & Query**: Ask about budgets, projects, contracts, and spending\n📊 **Budget Information**: Find allocation and spending data by ministry, sector, or district\n🏢 **Contract Details**: Learn about vendors, tender processes, and project outcomes\n📋 **Report Corruption**: Anonymously report suspicious activities or misuse of funds\n📈 **Track Projects**: Monitor project progress and performance scores\n\nTry asking: 'How much was allocated to education?' or 'Show me contracts in Kampala district'",
      
      "Here's what I can do for you:\n\n✅ **Budget Tracking**: Find how much money was allocated to different sectors and programs\n✅ **Project Monitoring**: Check project status, timelines, and performance\n✅ **Contract Analysis**: Explore tender awards, vendor information, and contract values\n✅ **Corruption Reporting**: Safely and anonymously report suspicious activities\n✅ **Data Queries**: Answer specific questions about government spending\n\nExample questions: 'What projects are running in Wakiso?' or 'Who got the road construction contract?'",
      
      "I'm your government transparency assistant! I can:\n\n🎯 **Answer Budget Questions**: Like 'How much did health sector receive this year?'\n🎯 **Track Public Projects**: Find project details, progress, and outcomes\n🎯 **Monitor Contracts**: See who won tenders and contract performance\n🎯 **Enable Reporting**: Help you report corruption or suspicious spending\n🎯 **Provide Analytics**: Show spending patterns and financial trends\n\nJust ask me about any government spending, project, or contract you're curious about!"
    ]
  },
  "corruption_reporting_advice": {
    "patterns": [
      "report corruption", "how to report", "suspicious activity", "fraud",
      "misuse of funds", "corruption case", "irregular spending", "report case"
    ],
    "responses": [
      "Here's how to report corruption safely:\n\n🔒 **Anonymous Reporting**: Click 'Report Corruption' to start an anonymous report\n📝 **Provide Details**: Include what happened, when, where, and who was involved\n📸 **Add Evidence**: Upload photos, documents, or recordings if you have them\n🆔 **Optional Contact**: You can stay anonymous or provide contact details for follow-up\n📋 **Get Reference**: You'll receive a reference number to track your report\n\n**Remember**: Your safety comes first. Only report what you know and can prove.",
      
      "To report corruption effectively:\n\n⚠️ **Be Specific**: Provide exact details - dates, amounts, locations, people involved\n📊 **Document Everything**: Gather receipts, contracts, photos, or other evidence\n🔐 **Stay Safe**: Use our anonymous reporting system to protect your identity\n📞 **Multiple Channels**: You can report through our system or directly to authorities\n⏰ **Act Quickly**: Report suspicious activities as soon as possible\n\n**What to report**: Inflated contracts, ghost workers, missing supplies, kickbacks, or any misuse of public funds.",
      
      "Reporting corruption helps everyone:\n\n🛡️ **Your Protection**: Our system keeps you anonymous unless you choose otherwise\n📋 **What We Need**: Description of the incident, estimated amounts involved, evidence if available\n🔍 **Investigation Process**: Reports go to trained auditors who investigate thoroughly\n📈 **Impact**: Your reports help recover public funds and prevent future corruption\n\n**Types of corruption to report**: Procurement fraud, embezzlement, ghost projects, inflated prices, nepotism in contracts, or any suspicious spending patterns."
    ]
  },
  "fallback_responses": [
    "I'm not sure I understand that question. I can help you with:\n• Budget information and allocations\n• Project details and progress\n• Contract and vendor information\n• Corruption reporting\n\nTry asking something like 'How much was spent on roads?' or 'Show me education projects'",
    
    "Let me help you rephrase that. I specialize in:\n• Government budget queries\n• Public project tracking\n• Contract and tender information\n• Anonymous corruption reporting\n\nCould you ask about a specific budget, project, or spending area?",
    
    "I didn't quite catch that. Here's what I'm great at:\n• Finding budget allocations by sector/ministry\n• Tracking project performance and outcomes\n• Showing contract awards and vendor details\n• Helping you report suspicious activities\n\nWhat specific government spending information are you looking for?"
  ]
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 * This helps handle typos and misspellings in user input
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLength = Math.max(len1, len2);
  return maxLength === 0 ? 1 : 1 - (matrix[len1][len2] / maxLength);
}

/**
 * Determine the intent of user message by matching against known patterns
 * Uses fuzzy matching to handle typos and variations
 */
function determineIntent(message: string): { intent: string; confidence: number } {
  const normalizedMessage = message.toLowerCase().trim();
  let bestMatch = { intent: 'fallback', confidence: 0 };
  
  // Check each intent category
  for (const [intent, data] of Object.entries(CHATBOT_RESPONSES)) {
    if (intent === 'fallback_responses') continue;
    
    const patterns = (data as any).patterns || [];
    for (const pattern of patterns) {
      // Check for exact substring match first (higher confidence)
      if (normalizedMessage.includes(pattern.toLowerCase())) {
        const confidence = pattern.length / normalizedMessage.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence: Math.min(confidence * 1.2, 1) };
        }
      } else {
        // Check for fuzzy match (lower confidence)
        const similarity = calculateSimilarity(normalizedMessage, pattern.toLowerCase());
        if (similarity > 0.7 && similarity > bestMatch.confidence) {
          bestMatch = { intent, confidence: similarity * 0.8 };
        }
      }
    }
  }
  
  return bestMatch;
}

/**
 * Extract entities (numbers, places, organizations) from user message
 * This helps in database queries
 */
function extractEntities(message: string): {
  numbers: number[];
  districts: string[];
  ministries: string[];
  sectors: string[];
  years: number[];
} {
  const normalizedMessage = message.toLowerCase();
  
  // Extract numbers (could be amounts, years, etc.)
  const numbers = Array.from(message.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g))
    .map(match => parseFloat(match[0].replace(/,/g, '')));
  
  // Extract years (4-digit numbers between 2000-2030)
  const years = numbers.filter(num => num >= 2000 && num <= 2030);
  
  // Common Ugandan districts (extend this list as needed)
  const commonDistricts = [
    'kampala', 'wakiso', 'mukono', 'jinja', 'mbarara', 'gulu', 'lira', 
    'masaka', 'fort portal', 'arua', 'soroti', 'mbale', 'kasese'
  ];
  const districts = commonDistricts.filter(district => 
    normalizedMessage.includes(district)
  );
  
  // Common ministries/sectors
  const commonSectors = [
    'education', 'health', 'agriculture', 'infrastructure', 'water',
    'transport', 'energy', 'defense', 'security', 'roads', 'hospitals'
  ];
  const sectors = commonSectors.filter(sector => 
    normalizedMessage.includes(sector)
  );
  
  return { numbers, districts, ministries: [], sectors, years };
}

/**
 * Query database for budget information based on extracted entities
 */
async function queryBudgetData(entities: any, message: string): Promise<any[]> {
  try {
    let query = supabase
      .from('budgets')
      .select(`
        *,
        sectors(name)
      `);
    
    // Apply filters based on extracted entities
    if (entities.sectors.length > 0) {
      // Join with sectors table and filter by sector name
      const { data: sectorData } = await supabase
        .from('sectors')
        .select('id, name')
        .ilike('name', `%${entities.sectors[0]}%`);
      
      if (sectorData && sectorData.length > 0) {
        query = query.eq('sector_id', sectorData[0].id);
      }
    }
    
    if (entities.districts.length > 0) {
      query = query.ilike('district', `%${entities.districts[0]}%`);
    }
    
    if (entities.years.length > 0) {
      query = query.eq('fiscal_year', entities.years[0].toString());
    }
    
    // If asking about ministry, filter by ministry
    const ministryMatch = message.toLowerCase().match(/ministry|minister/);
    if (ministryMatch) {
      query = query.not('ministry', 'is', null);
    }
    
    const { data, error } = await query.limit(10);
    
    if (error) {
      console.error('Budget query error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Budget query exception:', error);
    return [];
  }
}

/**
 * Query database for project information
 */
async function queryProjectData(entities: any, message: string): Promise<any[]> {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        budgets(ministry, programme, district)
      `);
    
    if (entities.districts.length > 0) {
      query = query.ilike('district', `%${entities.districts[0]}%`);
    }
    
    // Look for project status keywords
    if (message.toLowerCase().includes('completed')) {
      query = query.eq('status', 'completed');
    } else if (message.toLowerCase().includes('ongoing')) {
      query = query.eq('status', 'ongoing');
    }
    
    const { data, error } = await query.limit(10);
    
    if (error) {
      console.error('Project query error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Project query exception:', error);
    return [];
  }
}

/**
 * Query database for contract information
 */
async function queryContractData(entities: any, message: string): Promise<any[]> {
  try {
    let query = supabase
      .from('contracts')
      .select(`
        *,
        vendors(name),
        projects(activity_description, district)
      `);
    
    if (entities.districts.length > 0) {
      query = query.ilike('district', `%${entities.districts[0]}%`);
    }
    
    // Look for vendor-related queries
    if (message.toLowerCase().includes('vendor') || message.toLowerCase().includes('company')) {
      query = query.not('vendor_name', 'is', null);
    }
    
    const { data, error } = await query.limit(10);
    
    if (error) {
      console.error('Contract query error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Contract query exception:', error);
    return [];
  }
}

/**
 * Format database results into human-readable response
 */
function formatDataResponse(data: any[], queryType: string, entities: any): string {
  if (!data || data.length === 0) {
    return `I couldn't find any ${queryType} data matching your query. Try being more specific or ask about a different area.`;
  }
  
  let response = `Here's what I found:\n\n`;
  
  if (queryType === 'budget') {
    data.slice(0, 5).forEach((item, index) => {
      response += `💰 **${item.ministry || 'Ministry'}** - ${item.programme || 'Programme'}\n`;
      response += `   📍 District: ${item.district || 'Not specified'}\n`;
      response += `   💵 Allocated: UGX ${item.allocated_amount?.toLocaleString() || 'N/A'}\n`;
      response += `   📊 Spent: UGX ${item.actual_expenditure?.toLocaleString() || 'N/A'}\n`;
      if (index < data.length - 1) response += '\n';
    });
  } else if (queryType === 'project') {
    data.slice(0, 5).forEach((item, index) => {
      response += `🏗️ **Project**: ${item.activity_description || 'Description not available'}\n`;
      response += `   📍 District: ${item.district || 'Not specified'}\n`;
      response += `   📊 Status: ${item.status || 'Unknown'}\n`;
      response += `   📈 Overall Score: ${item.overall_quality_score || 'Not rated'}/100\n`;
      if (index < data.length - 1) response += '\n';
    });
  } else if (queryType === 'contract') {
    data.slice(0, 5).forEach((item, index) => {
      response += `📄 **Contract**: ${item.vendor_name || 'Vendor name not available'}\n`;
      response += `   💰 Value: UGX ${item.contract_value?.toLocaleString() || 'N/A'}\n`;
      response += `   📍 District: ${item.district || 'Not specified'}\n`;
      response += `   📊 Status: ${item.contract_status || 'Unknown'}\n`;
      if (index < data.length - 1) response += '\n';
    });
  }
  
  if (data.length > 5) {
    response += `\n... and ${data.length - 5} more results. Try being more specific to narrow down the search.`;
  }
  
  return response;
}

/**
 * Generate follow-up questions based on query results and context
 */
function generateFollowUps(queryType: string, data: any[], entities: any): Array<{question: string, param: string}> {
  const followUps: Array<{question: string, param: string}> = [];
  
  if (queryType === 'budget' && data.length > 0) {
    const firstItem = data[0];
    if (firstItem.ministry) {
      followUps.push({
        question: `Tell me more about ${firstItem.ministry}`,
        param: `ministry ${firstItem.ministry}`
      });
    }
    if (firstItem.district) {
      followUps.push({
        question: `What other projects are in ${firstItem.district}?`,
        param: `projects in ${firstItem.district}`
      });
    }
    followUps.push({
      question: "Show me project performance in this area",
      param: "project performance " + (entities.sectors[0] || entities.districts[0] || '')
    });
  }
  
  if (queryType === 'project' && data.length > 0) {
    followUps.push({
      question: "Who are the contractors for these projects?",
      param: "contractors " + (entities.districts[0] || '')
    });
    followUps.push({
      question: "What's the budget for these projects?",
      param: "budget for projects " + (entities.districts[0] || '')
    });
  }
  
  if (queryType === 'contract' && data.length > 0) {
    followUps.push({
      question: "How are these contracts performing?",
      param: "contract performance " + (entities.districts[0] || '')
    });
    followUps.push({
      question: "Are there any payment issues?",
      param: "payments " + (entities.districts[0] || '')
    });
  }
  
  // Always add reporting option
  followUps.push({
    question: "Report suspicious activity",
    param: "report corruption"
  });
  
  return followUps;
}

/**
 * Main chatbot logic - processes user message and returns appropriate response
 */
async function processChatMessage(message: string): Promise<{
  content: string;
  followups?: Array<{question: string, param: string}>;
}> {
  try {
    console.log('Processing message:', message);
    
    // Determine intent using pattern matching
    const { intent, confidence } = determineIntent(message);
    console.log('Detected intent:', intent, 'with confidence:', confidence);
    
    // Handle predefined intents (greetings, farewells, etc.)
    if (confidence > 0.6 && intent !== 'fallback') {
      const responses = (CHATBOT_RESPONSES as any)[intent]?.responses;
      if (responses && responses.length > 0) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add contextual follow-ups
        const followUps = [
          { question: "How much was allocated to education?", param: "education budget" },
          { question: "Show me projects in Kampala", param: "projects kampala" },
          { question: "Which vendors got road contracts?", param: "road contracts vendors" },
          { question: "Report corruption", param: "report corruption" }
        ];
        
        return {
          content: randomResponse,
          followups: followUps.slice(0, 3) // Limit to 3 follow-ups
        };
      }
    }
    
    // Extract entities for database queries
    const entities = extractEntities(message);
    console.log('Extracted entities:', entities);
    
    // Determine what type of data query this might be
    const messageWords = message.toLowerCase();
    let queryType = 'budget'; // default
    let data: any[] = [];
    
    if (messageWords.includes('project') || messageWords.includes('implementation')) {
      queryType = 'project';
      data = await queryProjectData(entities, message);
    } else if (messageWords.includes('contract') || messageWords.includes('vendor') || messageWords.includes('tender')) {
      queryType = 'contract';  
      data = await queryContractData(entities, message);
    } else if (messageWords.includes('budget') || messageWords.includes('allocation') || messageWords.includes('spending')) {
      queryType = 'budget';
      data = await queryBudgetData(entities, message);
    } else {
      // Try all types if query intent is unclear
      data = await queryBudgetData(entities, message);
      if (data.length === 0) {
        data = await queryProjectData(entities, message);
        queryType = 'project';
      }
      if (data.length === 0) {
        data = await queryContractData(entities, message);
        queryType = 'contract';
      }
    }
    
    // Format response based on results
    const response = formatDataResponse(data, queryType, entities);
    const followUps = generateFollowUps(queryType, data, entities);
    
    console.log('Returning response with', data.length, 'results');
    
    return {
      content: response,
      followups: followUps.slice(0, 3)
    };
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    
    // Return fallback response
    const fallbackResponses = CHATBOT_RESPONSES.fallback_responses;
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      content: randomFallback,
      followups: [
        { question: "How much was spent on healthcare?", param: "healthcare spending" },
        { question: "Show me road projects", param: "road projects" },
        { question: "Report corruption", param: "report corruption" }
      ]
    };
  }
}

/**
 * Main Edge Function handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Process the chat message
    const result = await processChatMessage(message.trim());
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Chatbot function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        content: "I'm sorry, I'm having technical difficulties. Please try again later or contact support.",
        followups: [
          { question: "Try a simple budget query", param: "education budget" },
          { question: "Report technical issues", param: "report issue" }
        ]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});