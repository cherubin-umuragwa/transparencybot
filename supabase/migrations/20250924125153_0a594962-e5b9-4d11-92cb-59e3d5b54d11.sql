-- =======================================
-- TransparencyBot Unified Database Schema
-- =======================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('auditor', 'procurement');
CREATE TYPE report_status AS ENUM ('new', 'investigating', 'resolved', 'dismissed');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Users table for authentication (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sectors table for categorizing
CREATE TABLE public.sectors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- Modular Public Finance Dataset
-- ==============================

-- 1. Budget Module
CREATE TABLE public.budgets (
    budget_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fiscal_year TEXT NOT NULL,
    ministry TEXT,
    programme TEXT,
    subprogramme TEXT,
    activity TEXT,
    district TEXT,
    sector_id UUID REFERENCES public.sectors(id),
    allocated_amount DECIMAL(15,2) CHECK(allocated_amount >= 0),
    revised_amount DECIMAL(15,2) CHECK(revised_amount >= 0),
    actual_expenditure DECIMAL(15,2) CHECK(actual_expenditure >= 0),
    funding_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Oversight & Performance (Projects)
CREATE TABLE public.projects (
    project_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID REFERENCES public.budgets(budget_id) ON DELETE SET NULL,
    district TEXT,
    activity_description TEXT,
    project_start_date DATE,
    project_target_end_date DATE,
    project_actual_end_date DATE,
    status TEXT,
    planned_output TEXT,
    achieved_output TEXT,
    monitoring_report TEXT,
    -- Quality scores (0-100)
    timeliness_score DECIMAL(5,2) CHECK(timeliness_score BETWEEN 0 AND 100),
    budget_adherence_score DECIMAL(5,2) CHECK(budget_adherence_score BETWEEN 0 AND 100),
    procurement_compliance_score DECIMAL(5,2) CHECK(procurement_compliance_score BETWEEN 0 AND 100),
    output_achievement_score DECIMAL(5,2) CHECK(output_achievement_score BETWEEN 0 AND 100),
    audit_findings_score DECIMAL(5,2) CHECK(audit_findings_score BETWEEN 0 AND 100),
    overall_quality_score DECIMAL(5,2) CHECK(overall_quality_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Procurement Module (Tenders)
CREATE TABLE public.tenders (
    tender_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    procurement_method TEXT,
    tender_title TEXT,
    tender_description TEXT,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE SET NULL,
    district TEXT,
    tender_issue_date DATE,
    tender_close_date DATE,
    award_date DATE,
    tender_status TEXT,
    estimated_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Procurement Module (Contracts)
CREATE TABLE public.contracts (
    contract_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id UUID REFERENCES public.tenders(tender_id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE SET NULL,
    district TEXT,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    vendor_name TEXT,
    contract_value DECIMAL(15,2) CHECK(contract_value >= 0),
    award_date DATE,
    contract_start_date DATE,
    contract_target_end_date DATE,
    contract_actual_end_date DATE,
    contract_status TEXT,
    performance_rating DECIMAL(3,2) CHECK(performance_rating BETWEEN 0 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payments Module (Cash Flows)
CREATE TABLE public.payments (
    payment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(contract_id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE SET NULL,
    district TEXT,
    payment_date DATE,
    amount_paid DECIMAL(15,2) CHECK(amount_paid >= 0),
    payment_type TEXT,
    balance_remaining DECIMAL(15,2) CHECK(balance_remaining >= 0),
    payment_reference TEXT,
    -- Suspicion/review fields
    risk_score DECIMAL(5,2) CHECK(risk_score BETWEEN 0 AND 100),
    flag_reason TEXT,
    review_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports (Corruption Reports)
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    public_id TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
    status report_status DEFAULT 'new',
    summary TEXT NOT NULL,
    detailed_description TEXT,
    estimated_amount_range TEXT,
    source_of_info TEXT NOT NULL,
    follow_up_allowed BOOLEAN DEFAULT FALSE,
    contact_info JSONB,
    auditor_notes TEXT,
    priority_level INTEGER DEFAULT 1 CHECK(priority_level BETWEEN 1 AND 5),
    assigned_auditor UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report attributes (flexible key-value pairs)
CREATE TABLE public.report_attributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    attribute_key TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Involved entities in reports
CREATE TABLE public.involved_entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    role TEXT,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report evidence files
CREATE TABLE public.report_evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages for reports
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomalies (AI-detected irregularities)
CREATE TABLE public.anomalies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(contract_id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(payment_id) ON DELETE SET NULL,
    budget_id UUID REFERENCES public.budgets(budget_id) ON DELETE SET NULL,
    anomaly_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity anomaly_severity DEFAULT 'medium',
    rule_score DECIMAL(5,2) NOT NULL CHECK(rule_score >= 0 AND rule_score <= 100),
    ml_score DECIMAL(5,2) NOT NULL CHECK(ml_score >= 0 AND ml_score <= 100),
    combined_score DECIMAL(5,2) NOT NULL CHECK(combined_score >= 0 AND combined_score <= 100),
    investigated BOOLEAN DEFAULT FALSE,
    investigation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blockchain anchors for transparency
CREATE TABLE public.block_anchors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_type TEXT NOT NULL,
    record_id UUID NOT NULL,
    prev_hash TEXT NOT NULL,
    record_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    block_number BIGINT,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions for public users
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    user_ip TEXT,
    conversation_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ==============================
-- Enable Row Level Security
-- ==============================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.involved_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- ==============================
-- RLS Policies
-- ==============================

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can view all users" ON public.users FOR SELECT TO authenticated USING (true);

-- Public read access for sectors and vendors
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Anyone can view vendors" ON public.vendors FOR SELECT USING (true);

-- Budget data - public read, authenticated write
CREATE POLICY "Anyone can view budgets" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Procurement users can manage budgets" ON public.budgets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'procurement')
);

-- Projects - public read, authenticated write
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Procurement users can manage projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'procurement')
);

-- Tenders - public read, authenticated write
CREATE POLICY "Anyone can view tenders" ON public.tenders FOR SELECT USING (true);
CREATE POLICY "Procurement users can manage tenders" ON public.tenders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'procurement')
);

-- Contracts - public read, authenticated write
CREATE POLICY "Anyone can view contracts" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Procurement users can manage contracts" ON public.contracts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'procurement')
);

-- Payments - public read, authenticated write
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Procurement users can manage payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'procurement')
);

-- Reports - public can create, auditors can manage
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view reports by public_id" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Auditors can manage all reports" ON public.reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);

-- Report related tables inherit report permissions
CREATE POLICY "Anyone can create report attributes" ON public.report_attributes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view report attributes" ON public.report_attributes FOR SELECT USING (true);
CREATE POLICY "Auditors can manage report attributes" ON public.report_attributes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);

CREATE POLICY "Anyone can create involved entities" ON public.involved_entities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view involved entities" ON public.involved_entities FOR SELECT USING (true);
CREATE POLICY "Auditors can manage involved entities" ON public.involved_entities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);

CREATE POLICY "Anyone can create report evidence" ON public.report_evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view report evidence" ON public.report_evidence FOR SELECT USING (true);
CREATE POLICY "Auditors can manage report evidence" ON public.report_evidence FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);

CREATE POLICY "Anyone can create chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Auditors can manage chat messages" ON public.chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);

-- Anomalies - only authenticated users can view/manage
CREATE POLICY "Auditors can view anomalies" ON public.anomalies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);
CREATE POLICY "System can create anomalies" ON public.anomalies FOR INSERT WITH CHECK (true);
CREATE POLICY "Auditors can update anomalies" ON public.anomalies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'auditor')
);

-- Block anchors - public read, system write
CREATE POLICY "Anyone can view block anchors" ON public.block_anchors FOR SELECT USING (true);
CREATE POLICY "System can create block anchors" ON public.block_anchors FOR INSERT WITH CHECK (true);

-- Chat sessions - public access for anonymous chatting
CREATE POLICY "Anyone can manage their chat session" ON public.chat_sessions FOR ALL USING (true);

-- ==============================
-- Indexes for Performance
-- ==============================
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_budgets_sector ON public.budgets(sector_id);
CREATE INDEX idx_budgets_fiscal_year ON public.budgets(fiscal_year);
CREATE INDEX idx_budgets_ministry ON public.budgets(ministry);
CREATE INDEX idx_budgets_district ON public.budgets(district);

CREATE INDEX idx_projects_budget ON public.projects(budget_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_district ON public.projects(district);

CREATE INDEX idx_tenders_project ON public.tenders(project_id);
CREATE INDEX idx_tenders_status ON public.tenders(tender_status);

CREATE INDEX idx_contracts_tender ON public.contracts(tender_id);
CREATE INDEX idx_contracts_project ON public.contracts(project_id);
CREATE INDEX idx_contracts_vendor ON public.contracts(vendor_id);
CREATE INDEX idx_contracts_status ON public.contracts(contract_status);

CREATE INDEX idx_payments_contract ON public.payments(contract_id);
CREATE INDEX idx_payments_project ON public.payments(project_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_risk_score ON public.payments(risk_score);

CREATE INDEX idx_reports_public_id ON public.reports(public_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at);

CREATE INDEX idx_report_attributes_report_id ON public.report_attributes(report_id);
CREATE INDEX idx_involved_entities_report_id ON public.involved_entities(report_id);
CREATE INDEX idx_report_evidence_report_id ON public.report_evidence(report_id);
CREATE INDEX idx_chat_messages_report_id ON public.chat_messages(report_id);

CREATE INDEX idx_anomalies_contract ON public.anomalies(contract_id);
CREATE INDEX idx_anomalies_payment ON public.anomalies(payment_id);
CREATE INDEX idx_anomalies_score ON public.anomalies(combined_score);
CREATE INDEX idx_anomalies_severity ON public.anomalies(severity);

CREATE INDEX idx_chat_sessions_token ON public.chat_sessions(session_token);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at);

-- ==============================
-- Functions and Triggers
-- ==============================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON public.tenders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_anomalies_updated_at BEFORE UPDATE ON public.anomalies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();