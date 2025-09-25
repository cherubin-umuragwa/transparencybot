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
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate a unique public ID for the report
 * This is used for tracking without exposing internal IDs
 */
function generatePublicId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate priority level based on report content
 * Higher priority for reports involving larger amounts or sensitive areas
 */
function calculatePriority(reportData: any): number {
  let priority = 1; // Default priority
  
  // Increase priority based on estimated amount
  const amountRange = reportData.estimated_amount_range?.toLowerCase() || '';
  if (amountRange.includes('billion') || amountRange.includes('million')) {
    priority = Math.min(priority + 2, 5);
  } else if (amountRange.includes('thousand')) {
    priority = Math.min(priority + 1, 5);
  }
  
  // Increase priority for sensitive sectors
  const description = (reportData.detailed_description || '').toLowerCase();
  const summary = (reportData.summary || '').toLowerCase();
  const content = description + ' ' + summary;
  
  const highPrioritySectors = ['health', 'education', 'security', 'disaster', 'emergency'];
  for (const sector of highPrioritySectors) {
    if (content.includes(sector)) {
      priority = Math.min(priority + 1, 5);
      break;
    }
  }
  
  // Increase priority for corruption types
  const highPriorityTypes = ['embezzlement', 'kickback', 'bribery', 'ghost'];
  for (const type of highPriorityTypes) {
    if (content.includes(type)) {
      priority = Math.min(priority + 1, 5);
      break;
    }
  }
  
  return priority;
}

/**
 * Create blockchain anchor for report immutability
 * This creates a cryptographic hash of the report for Web3 transparency
 */
async function createBlockchainAnchor(reportId: string, reportData: any): Promise<void> {
  try {
    // Create a hash of the report data
    const reportString = JSON.stringify({
      id: reportId,
      summary: reportData.summary,
      timestamp: new Date().toISOString(),
      source: reportData.source_of_info
    });
    
    const encoder = new TextEncoder();
    const data = encoder.encode(reportString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Get the previous hash (from the most recent anchor)
    const { data: prevAnchor } = await supabase
      .from('block_anchors')
      .select('current_hash')
      .eq('record_type', 'report')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const prevHash = prevAnchor?.[0]?.current_hash || '0'.repeat(64);
    
    // Create the blockchain anchor record
    await supabase.from('block_anchors').insert({
      record_type: 'report',
      record_id: reportId,
      prev_hash: prevHash,
      record_hash: currentHash,
      current_hash: currentHash // In a real blockchain, this would be different
    });
    
    console.log('Created blockchain anchor for report:', reportId);
  } catch (error) {
    console.error('Error creating blockchain anchor:', error);
    // Don't fail the report submission if blockchain anchoring fails
  }
}

/**
 * Process and store report evidence files
 */
async function processEvidence(reportId: string, evidence: any[]): Promise<void> {
  if (!evidence || evidence.length === 0) return;
  
  try {
    const evidenceRecords = evidence.map(file => ({
      report_id: reportId,
      filename: file.filename || 'unnamed_file',
      storage_path: file.path || '',
      mime_type: file.mimeType || 'application/octet-stream',
      file_size: file.size || 0
    }));
    
    const { error } = await supabase
      .from('report_evidence')
      .insert(evidenceRecords);
    
    if (error) {
      console.error('Error storing evidence records:', error);
    } else {
      console.log(`Stored ${evidenceRecords.length} evidence files for report:`, reportId);
    }
  } catch (error) {
    console.error('Error processing evidence:', error);
  }
}

/**
 * Process involved entities mentioned in the report
 */
async function processInvolvedEntities(reportId: string, entities: any[]): Promise<void> {
  if (!entities || entities.length === 0) return;
  
  try {
    const entityRecords = entities.map(entity => ({
      report_id: reportId,
      name: entity.name || 'Unknown',
      type: entity.type || 'Unknown',
      role: entity.role || '',
      additional_info: entity.additionalInfo || {}
    }));
    
    const { error } = await supabase
      .from('involved_entities')
      .insert(entityRecords);
    
    if (error) {
      console.error('Error storing involved entities:', error);
    } else {
      console.log(`Stored ${entityRecords.length} involved entities for report:`, reportId);
    }
  } catch (error) {
    console.error('Error processing involved entities:', error);
  }
}

/**
 * Store chat conversation data for the report
 */
async function storeChatHistory(reportId: string, messages: any[]): Promise<void> {
  if (!messages || messages.length === 0) return;
  
  try {
    const chatRecords = messages.map(msg => ({
      report_id: reportId,
      message_type: msg.sender || 'unknown',
      content: msg.content || '',
      metadata: {
        timestamp: msg.timestamp || new Date().toISOString(),
        id: msg.id
      }
    }));
    
    const { error } = await supabase
      .from('chat_messages')
      .insert(chatRecords);
    
    if (error) {
      console.error('Error storing chat history:', error);
    } else {
      console.log(`Stored ${chatRecords.length} chat messages for report:`, reportId);
    }
  } catch (error) {
    console.error('Error processing chat history:', error);
  }
}

/**
 * Main report submission handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData = await req.json();
    console.log('Received report submission:', JSON.stringify(requestData, null, 2));
    
    // Validate required fields
    if (!requestData.summary) {
      return new Response(
        JSON.stringify({ error: 'Summary is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!requestData.source_of_info) {
      return new Response(
        JSON.stringify({ error: 'Source of information is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Generate public ID for the report
    const publicId = generatePublicId();
    
    // Calculate priority level
    const priority = calculatePriority(requestData);
    
    // Prepare main report data
    const reportData = {
      public_id: publicId,
      status: 'new',
      summary: requestData.summary,
      detailed_description: requestData.detailed_description || null,
      estimated_amount_range: requestData.estimated_amount_range || null,
      source_of_info: requestData.source_of_info,
      follow_up_allowed: requestData.follow_up_allowed || false,
      contact_info: requestData.contact_info || null,
      priority_level: priority
    };
    
    // Insert the main report record
    const { data: reportRecord, error: reportError } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();
    
    if (reportError) {
      console.error('Error creating report:', reportError);
      return new Response(
        JSON.stringify({ error: 'Failed to create report' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const reportId = reportRecord.id;
    console.log('Created report with ID:', reportId, 'and public ID:', publicId);
    
    // Process additional data in parallel
    const promises = [];
    
    // Store report attributes (flexible key-value pairs)
    if (requestData.attributes && Object.keys(requestData.attributes).length > 0) {
      const attributeRecords = Object.entries(requestData.attributes).map(([key, value]) => ({
        report_id: reportId,
        attribute_key: key,
        attribute_value: String(value)
      }));
      
      promises.push(
        supabase.from('report_attributes').insert(attributeRecords)
          .then(({ error }) => {
            if (error) console.error('Error storing attributes:', error);
            else console.log(`Stored ${attributeRecords.length} attributes`);
          })
      );
    }
    
    // Process evidence files
    if (requestData.evidence) {
      promises.push(processEvidence(reportId, requestData.evidence));
    }
    
    // Process involved entities
    if (requestData.involved_entities) {
      promises.push(processInvolvedEntities(reportId, requestData.involved_entities));
    }
    
    // Store chat conversation history
    if (requestData.chat_history) {
      promises.push(storeChatHistory(reportId, requestData.chat_history));
    }
    
    // Create blockchain anchor for immutability
    promises.push(createBlockchainAnchor(reportId, reportData));
    
    // Wait for all parallel operations to complete
    await Promise.all(promises);
    
    // Return success response with public reference
    const response = {
      success: true,
      report_id: publicId,
      reference_number: `TB-${publicId}`,
      priority_level: priority,
      status: 'new',
      message: 'Your report has been submitted successfully. Thank you for contributing to transparency!',
      next_steps: [
        'Your report has been assigned a reference number for tracking',
        'It will be reviewed by our audit team within 48-72 hours',
        'High priority reports are fast-tracked for investigation',
        'You can reference this report using: TB-' + publicId
      ]
    };
    
    console.log('Report submission completed successfully:', publicId);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Report submission error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to submit report. Please try again later.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});