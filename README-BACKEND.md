# TransparencyBot Backend System

## Overview

A comprehensive backend system for government transparency and corruption reporting, built with Supabase, featuring rule-based chatbot, anomaly detection, and Web3 integration.

## ✨ Features Implemented

### 🤖 Rule-Based Chatbot

- **Natural Language Processing**: Uses fuzzy matching to handle typos and variations
- **Intent Recognition**: Determines user intent from predefined patterns
- **Dynamic Responses**: JSON-based response system with multiple variations
- **Database Integration**: Queries government financial data in real-time
- **Smart Follow-ups**: Contextual follow-up questions based on query results

### 📊 Database Schema

- **Comprehensive Financial Data**: Budgets, projects, contracts, payments, vendors
- **User Management**: Auditors and procurement officers with role-based access
- **Corruption Reports**: Anonymous reporting with evidence support
- **Anomaly Detection**: AI-powered detection of suspicious patterns
- **Blockchain Integration**: Immutable record anchoring for transparency

### 🔍 Anomaly Detection System

- **Rule-Based Detection**: Identifies budget variances, contract patterns, payment anomalies
- **Severity Scoring**: Low, medium, high, critical severity levels
- **Multi-Factor Analysis**: Budget adherence, vendor concentration, timing patterns
- **Real-time Scoring**: Combines rule-based and statistical analysis

### 🌐 Web3 Integration

- **Blockchain Anchoring**: Cryptographic hashing of financial records
- **Immutable Audit Trail**: Tamper-proof transaction history  
- **Verification System**: Public verification of government claims
- **Transparency Hash**: Every record gets a unique blockchain hash

### 🛡️ Security Features

- **Row Level Security**: Comprehensive RLS policies for data protection
- **Anonymous Reporting**: Safe corruption reporting without identity exposure
- **Audit Logs**: Complete activity tracking for accountability
- **Input Validation**: Extensive validation to prevent injection attacks

## 🚀 API Endpoints

### Chatbot API

```
POST https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/chatbot
{
  "message": "How much was allocated to education?"
}
```

### Report Submission  

```
POST https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/submit-report
{
  "summary": "Budget irregularity detected",
  "detailed_description": "...",
  "source_of_info": "Anonymous tip"
}
```

### Anomaly Detection

```
POST https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/detect-anomalies
Authorization: Bearer <token>
```

## 📋 Database Tables

### Core Financial Data

- `budgets` - Government budget allocations and expenditures
- `projects` - Public projects with performance tracking
- `contracts` - Procurement contracts and vendor details
- `payments` - Financial transactions and payment records
- `vendors` - Contractor and vendor information

### Transparency & Reporting

- `reports` - Corruption reports with anonymous support
- `anomalies` - AI-detected irregularities with scoring
- `block_anchors` - Blockchain hashes for immutable records
- `chat_sessions` - Public user conversations

### User Management

- `users` - System users (auditors, procurement officers)
- `sectors` - Government sectors (education, health, etc.)

## 🎯 User Roles & Access

### 👥 Normal Users (Public)

- **Chat Interface**: Ask questions about government spending
- **Data Queries**: Search budgets, projects, contracts
- **Anonymous Reporting**: Report corruption safely
- **Real-time Responses**: Instant answers with follow-up suggestions

### 🔍 Auditors

- **Report Management**: View and manage corruption reports
- **Anomaly Investigation**: Access AI-detected irregularities  
- **Data Analysis**: Full read access to financial data
- **Case Tracking**: Monitor investigation progress

### 📝 Procurement Officers

- **Data Entry**: Add/edit budgets, projects, contracts
- **Vendor Management**: Manage contractor information
- **Performance Tracking**: Update project scores and outcomes
- **Statistical Overview**: View sector-wise spending summaries

## 🧠 Chatbot Capabilities

### Question Types Supported

- **Budget Queries**: "How much was allocated to health?"
- **Project Information**: "Show me education projects in Kampala"
- **Contract Details**: "Which vendors got road contracts?"
- **Vendor Analysis**: "Who worked on infrastructure projects?"
- **Performance Tracking**: "What's the completion rate for projects?"

### Smart Features

- **Typo Tolerance**: Handles misspellings and variations
- **Context Awareness**: Understands entities like districts, ministries
- **Dynamic Responses**: Varies responses to avoid repetition
- **Follow-up Generation**: Suggests relevant next questions

## 🔧 Technology Stack

### Backend Infrastructure

- **Supabase**: Database, authentication, real-time features
- **Edge Functions**: Serverless API endpoints with Deno runtime
- **PostgreSQL**: Robust relational database with advanced features
- **Row Level Security**: Built-in security and access control

### AI & Analytics

- **Rule-Based NLP**: Pattern matching with fuzzy logic
- **Statistical Analysis**: Anomaly detection algorithms
- **Scoring Systems**: Multi-factor risk assessment
- **Blockchain Hashing**: SHA-256 cryptographic verification

## 📊 Sample Data Included

The system comes with sample data for testing:

- 8 government sectors (Education, Health, Agriculture, etc.)
- 4 sample vendors with contact information
- 20+ budget entries across ministries and districts
- Test user accounts for auditor and procurement roles

## 🚀 Quick Start

1. **Database Setup**: All tables and sample data are automatically created
2. **Test Chatbot**: Visit the main page and start asking questions
3. **Report Corruption**: Click "Report Corruption" to test anonymous reporting
4. **Run Anomaly Detection**: Access the API endpoint to scan for irregularities
5. **Explore Data**: Ask questions like "Show me health budget" or "Education projects"

## 🔮 Advanced Features

### Web3 Integration

Every significant transaction and report gets:

- Cryptographic hash for immutability
- Blockchain anchor for verification  
- Public verification capability
- Tamper-proof audit trail

### AI-Powered Insights

- Automatic detection of budget irregularities
- Vendor concentration risk analysis
- Payment timing anomaly detection
- Performance score monitoring

### Real-time Transparency

- Live chat with government data
- Instant anomaly notifications
- Real-time budget tracking
- Dynamic performance dashboards

## 🎯 Next Steps

The backend is fully functional and ready for:
- **Authentication Integration**: Add user login for auditor/procurement dashboards
- **Advanced Analytics**: Machine learning models for better anomaly detection
- **Mobile App**: React Native app using the same APIs
- **Public API**: Open data API for researchers and journalists
- **Blockchain Integration**: Full blockchain deployment for maximum transparency
