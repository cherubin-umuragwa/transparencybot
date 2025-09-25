import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// CORS headers for web app access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key for full access
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Rule-based anomaly detection for budget variances
 * Detects suspicious patterns in budget allocation vs actual spending
 */
async function detectBudgetAnomalies(): Promise<any[]> {
  try {
    // Get budgets with significant variances
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*')
      .not('allocated_amount', 'is', null)
      .not('actual_expenditure', 'is', null);
    
    if (error) throw error;
    
    const anomalies = [];
    
    for (const budget of budgets || []) {
      const allocated = budget.allocated_amount || 0;
      const actual = budget.actual_expenditure || 0;
      
      if (allocated === 0) continue;
      
      const variance = Math.abs(actual - allocated) / allocated;
      let anomalyScore = 0;
      let reasons = [];
      
      // Detect over-expenditure (spending more than allocated)
      if (actual > allocated * 1.2) { // 20% over budget
        anomalyScore += 30;
        reasons.push('Over-expenditure detected');
      }
      
      // Detect under-expenditure (spending much less than allocated)
      if (actual < allocated * 0.5) { // Less than 50% spent
        anomalyScore += 20;
        reasons.push('Significant under-expenditure');
      }
      
      // Detect round numbers (suspicious)
      if (actual % 1000000 === 0 && actual > 0) { // Exact millions
        anomalyScore += 15;
        reasons.push('Suspicious round number spending');
      }
      
      // Detect zero expenditure with high allocation
      if (actual === 0 && allocated > 10000000) { // 10M+ allocated but nothing spent
        anomalyScore += 40;
        reasons.push('No expenditure despite high allocation');
      }
      
      // ML-style scoring (simple pattern matching)
      const mlScore = Math.min(variance * 50, 100);
      
      if (anomalyScore > 15 || reasons.length > 0) {
        anomalies.push({
          type: 'budget_variance',
          budget_id: budget.budget_id,
          description: `Budget anomaly in ${budget.ministry} - ${budget.programme}: ${reasons.join(', ')}`,
          rule_score: anomalyScore,
          ml_score: mlScore,
          combined_score: (anomalyScore + mlScore) / 2,
          severity: anomalyScore > 35 ? 'high' : anomalyScore > 20 ? 'medium' : 'low',
          details: {
            allocated_amount: allocated,
            actual_expenditure: actual,
            variance_percentage: (variance * 100).toFixed(2),
            ministry: budget.ministry,
            programme: budget.programme,
            district: budget.district
          }
        });
      }
    }
    
    return anomalies;
    
  } catch (error) {
    console.error('Error detecting budget anomalies:', error);
    return [];
  }
}

/**
 * Rule-based anomaly detection for contract patterns
 * Detects suspicious patterns in contract awards and values
 */
async function detectContractAnomalies(): Promise<any[]> {
  try {
    // Get contracts with related data
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select(`
        *,
        vendors(name),
        projects(activity_description, district)
      `);
    
    if (error) throw error;
    
    const anomalies = [];
    const vendorContracts = new Map();
    
    // Group contracts by vendor to detect patterns
    for (const contract of contracts || []) {
      const vendorName = contract.vendor_name || contract.vendors?.name;
      if (!vendorName) continue;
      
      if (!vendorContracts.has(vendorName)) {
        vendorContracts.set(vendorName, []);
      }
      vendorContracts.get(vendorName).push(contract);
    }
    
    // Analyze each contract and vendor patterns
    for (const contract of contracts || []) {
      const vendorName = contract.vendor_name || contract.vendors?.name;
      const contractValue = contract.contract_value || 0;
      
      let anomalyScore = 0;
      let reasons = [];
      
      // Detect high-value contracts
      if (contractValue > 100000000) { // 100M+
        anomalyScore += 25;
        reasons.push('High-value contract');
      }
      
      // Detect vendor monopoly (same vendor getting multiple contracts)
      const vendorContractCount = vendorContracts.get(vendorName)?.length || 0;
      if (vendorContractCount > 5) {
        anomalyScore += 20;
        reasons.push('Vendor concentration risk');
      }
      
      // Detect unusual contract durations
      if (contract.contract_start_date && contract.contract_target_end_date) {
        const startDate = new Date(contract.contract_start_date);
        const endDate = new Date(contract.contract_target_end_date);
        const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (durationDays < 7) { // Very short contracts
          anomalyScore += 30;
          reasons.push('Unusually short contract duration');
        } else if (durationDays > 1825) { // 5+ years
          anomalyScore += 15;
          reasons.push('Unusually long contract duration');
        }
      }
      
      // Detect round number contracts (suspicious)
      if (contractValue % 1000000 === 0 && contractValue > 0) {
        anomalyScore += 10;
        reasons.push('Suspicious round number value');
      }
      
      // ML-style scoring based on statistical patterns
      const mlScore = Math.min((contractValue / 10000000) * 10, 100);
      
      if (anomalyScore > 15 || reasons.length > 0) {
        anomalies.push({
          type: 'contract_pattern',
          contract_id: contract.contract_id,
          description: `Contract anomaly: ${vendorName} - ${reasons.join(', ')}`,
          rule_score: anomalyScore,
          ml_score: mlScore,
          combined_score: (anomalyScore + mlScore) / 2,
          severity: anomalyScore > 40 ? 'high' : anomalyScore > 25 ? 'medium' : 'low',
          details: {
            vendor_name: vendorName,
            contract_value: contractValue,
            vendor_contract_count: vendorContractCount,
            district: contract.district,
            status: contract.contract_status
          }
        });
      }
    }
    
    return anomalies;
    
  } catch (error) {
    console.error('Error detecting contract anomalies:', error);
    return [];
  }
}

/**
 * Rule-based anomaly detection for payment patterns
 * Detects suspicious patterns in payment timing and amounts
 */
async function detectPaymentAnomalies(): Promise<any[]> {
  try {
    // Get payments with related contract data
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        contracts(contract_value, vendor_name)
      `);
    
    if (error) throw error;
    
    const anomalies = [];
    
    for (const payment of payments || []) {
      const paymentAmount = payment.amount_paid || 0;
      const contractValue = payment.contracts?.contract_value || 0;
      
      let anomalyScore = 0;
      let reasons = [];
      
      // Detect overpayments
      if (contractValue > 0 && paymentAmount > contractValue * 1.1) { // 10% over contract
        anomalyScore += 40;
        reasons.push('Payment exceeds contract value');
      }
      
      // Detect large payments
      if (paymentAmount > 50000000) { // 50M+
        anomalyScore += 20;
        reasons.push('Large payment amount');
      }
      
      // Detect weekend/holiday payments (suspicious timing)
      if (payment.payment_date) {
        const paymentDate = new Date(payment.payment_date);
        const dayOfWeek = paymentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          anomalyScore += 15;
          reasons.push('Weekend payment');
        }
      }
      
      // Detect round number payments
      if (paymentAmount % 1000000 === 0 && paymentAmount > 0) {
        anomalyScore += 10;
        reasons.push('Round number payment');
      }
      
      // Check for high risk scores already flagged
      if (payment.risk_score && payment.risk_score > 70) {
        anomalyScore += payment.risk_score / 5;
        reasons.push('High system risk score');
      }
      
      // ML-style scoring
      const mlScore = Math.min((paymentAmount / 5000000) * 10, 100);
      
      if (anomalyScore > 15 || reasons.length > 0) {
        anomalies.push({
          type: 'payment_pattern',
          payment_id: payment.payment_id,
          description: `Payment anomaly: ${payment.contracts?.vendor_name || 'Unknown vendor'} - ${reasons.join(', ')}`,
          rule_score: anomalyScore,
          ml_score: mlScore,
          combined_score: (anomalyScore + mlScore) / 2,
          severity: anomalyScore > 40 ? 'high' : anomalyScore > 25 ? 'medium' : 'low',
          details: {
            payment_amount: paymentAmount,
            contract_value: contractValue,
            payment_date: payment.payment_date,
            vendor_name: payment.contracts?.vendor_name,
            district: payment.district
          }
        });
      }
    }
    
    return anomalies;
    
  } catch (error) {
    console.error('Error detecting payment anomalies:', error);
    return [];
  }
}

/**
 * Store detected anomalies in the database
 */
async function storeAnomalies(anomalies: any[]): Promise<void> {
  if (!anomalies || anomalies.length === 0) return;
  
  try {
    // Prepare anomaly records for insertion
    const anomalyRecords = anomalies.map(anomaly => ({
      contract_id: anomaly.contract_id || null,
      payment_id: anomaly.payment_id || null,
      budget_id: anomaly.budget_id || null,
      anomaly_type: anomaly.type,
      description: anomaly.description,
      severity: anomaly.severity,
      rule_score: anomaly.rule_score,
      ml_score: anomaly.ml_score,
      combined_score: anomaly.combined_score,
      investigated: false
    }));
    
    // Insert all anomalies
    const { error } = await supabase
      .from('anomalies')
      .insert(anomalyRecords);
    
    if (error) {
      console.error('Error storing anomalies:', error);
    } else {
      console.log(`Stored ${anomalyRecords.length} anomalies in database`);
    }
    
  } catch (error) {
    console.error('Error in storeAnomalies:', error);
  }
}

/**
 * Main anomaly detection orchestrator
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Starting anomaly detection scan...');
    
    // Run all anomaly detection methods in parallel
    const [budgetAnomalies, contractAnomalies, paymentAnomalies] = await Promise.all([
      detectBudgetAnomalies(),
      detectContractAnomalies(),
      detectPaymentAnomalies()
    ]);
    
    // Combine all anomalies
    const allAnomalies = [
      ...budgetAnomalies,
      ...contractAnomalies,
      ...paymentAnomalies
    ];
    
    console.log(`Detected ${allAnomalies.length} total anomalies:`, {
      budget: budgetAnomalies.length,
      contract: contractAnomalies.length,
      payment: paymentAnomalies.length
    });
    
    // Store anomalies in database
    await storeAnomalies(allAnomalies);
    
    // Return summary response
    const response = {
      success: true,
      scan_timestamp: new Date().toISOString(),
      total_anomalies: allAnomalies.length,
      anomalies_by_type: {
        budget_variance: budgetAnomalies.length,
        contract_pattern: contractAnomalies.length,
        payment_pattern: paymentAnomalies.length
      },
      anomalies_by_severity: {
        high: allAnomalies.filter(a => a.severity === 'high').length,
        medium: allAnomalies.filter(a => a.severity === 'medium').length,
        low: allAnomalies.filter(a => a.severity === 'low').length
      },
      high_priority_anomalies: allAnomalies
        .filter(a => a.severity === 'high')
        .map(a => ({
          type: a.type,
          description: a.description,
          score: a.combined_score
        }))
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Anomaly detection error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Anomaly detection failed',
        message: (error as any).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});