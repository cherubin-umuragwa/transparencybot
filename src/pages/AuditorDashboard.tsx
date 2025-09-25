/**
 * Auditor Dashboard for TransparencyBot
 * Provides tools for reviewing reports and analyzing procurement transactions
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, FileText, TrendingUp, Users, LogOut, Eye, CheckCircle, XCircle, Clock, DollarSign, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: number;
  sector_id: number;
  program: string;
  vendor_id: number;
  budget_amount: number;
  actual_amount: number;
  tx_date: string;
  description: string;
  created_at: string;
}

interface Vendor {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface Report {
  id: string;
  public_id: string;
  summary: string;
  status: string;
  created_at: string;
  issue_type?: string;
  organization?: string;
  estimated_amount_range?: string;
  auditor_notes?: string;
  assigned_auditor?: string;
  detailed_description?: string;
  related_transaction_id?: number;
}

interface Anomaly {
  id: string;
  anomaly_type: string;
  description: string;
  severity: string;
  combined_score: number;
  investigated: boolean;
  created_at: string;
  investigation_notes?: string;
  related_transaction_id?: number;
}

const SECTORS = {
  1: 'Education',
  2: 'Health',
  3: 'Agriculture',
  4: 'Infrastructure',
  5: 'Other'
};

const AuditorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [notes, setNotes] = useState('');

  // Redirect if not authenticated as auditor
  useEffect(() => {
    if (!user || user.role !== 'auditor') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load data from procurement dashboard
  useEffect(() => {
    if (user) {
      loadProcurementData();
      loadReports();
    }
  }, [user]);

  const loadProcurementData = () => {
    try {
      // Load transactions from procurement dashboard
      const savedTransactions = localStorage.getItem('procurement_transactions');
      const savedVendors = localStorage.getItem('procurement_vendors');
      
      if (savedTransactions) {
        const procurementTransactions: Transaction[] = JSON.parse(savedTransactions);
        setTransactions(procurementTransactions);
        
        // Auto-generate anomalies based on procurement data
        generateAnomalies(procurementTransactions);
      }
      
      if (savedVendors) {
        setVendors(JSON.parse(savedVendors));
      }
    } catch (error) {
      console.error('Failed to load procurement data:', error);
    }
  };

  const generateAnomalies = (transactions: Transaction[]) => {
    const newAnomalies: Anomaly[] = [];
    
    transactions.forEach(transaction => {
      const variance = transaction.actual_amount - transaction.budget_amount;
      const variancePercent = (variance / transaction.budget_amount) * 100;
      
      // Detect price variance anomalies
      if (Math.abs(variancePercent) > 30) {
        newAnomalies.push({
          id: `anom-${transaction.id}-${Date.now()}`,
          anomaly_type: 'Price Variance',
          description: `Transaction ${transaction.program} has ${variancePercent > 0 ? 'over' : 'under'} spending of ${Math.abs(variancePercent).toFixed(1)}%`,
          severity: Math.abs(variancePercent) > 50 ? 'High' : 'Medium',
          combined_score: Math.min(100, Math.abs(variancePercent) + 30),
          investigated: false,
          created_at: new Date().toISOString(),
          related_transaction_id: transaction.id
        });
      }
      
      // Detect duplicate transactions (same vendor, similar amount, close dates)
      const similarTransactions = transactions.filter(t => 
        t.vendor_id === transaction.vendor_id &&
        t.id !== transaction.id &&
        Math.abs(t.actual_amount - transaction.actual_amount) / transaction.actual_amount < 0.1 // Within 10%
      );
      
      if (similarTransactions.length > 0) {
        newAnomalies.push({
          id: `anom-dup-${transaction.id}-${Date.now()}`,
          anomaly_type: 'Possible Duplicate',
          description: `Possible duplicate payment to same vendor for similar amount`,
          severity: 'Medium',
          combined_score: 65,
          investigated: false,
          created_at: new Date().toISOString(),
          related_transaction_id: transaction.id
        });
      }
    });
    
    // Save anomalies
    const savedAnomalies = localStorage.getItem('auditor_anomalies');
    const existingAnomalies = savedAnomalies ? JSON.parse(savedAnomalies) : [];
    const allAnomalies = [...existingAnomalies, ...newAnomalies];
    
    // Remove duplicates
    const uniqueAnomalies = allAnomalies.filter((anomaly, index, self) =>
      index === self.findIndex(a => a.id === anomaly.id)
    );
    
    setAnomalies(uniqueAnomalies);
    localStorage.setItem('auditor_anomalies', JSON.stringify(uniqueAnomalies));
  };

  const loadReports = async () => {
    if (!user) return;
    
    try {
      const savedReports = localStorage.getItem('auditor_reports');
      
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      } else {
        // Initialize with sample reports for demo
        const sampleReports: Report[] = [
          {
            id: '1',
            public_id: 'RPT-2024-001',
            summary: 'Suspicious procurement contract awarded without proper bidding process',
            status: 'new',
            created_at: new Date().toISOString(),
            issue_type: 'Procurement Fraud',
            organization: 'Ministry of Education',
            estimated_amount_range: '$50,000 - $100,000',
            detailed_description: 'Contract awarded to single bidder without competitive process'
          }
        ];
        
        setReports(sampleReports);
        localStorage.setItem('auditor_reports', JSON.stringify(sampleReports));
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReportsToStorage = (updatedReports: Report[]) => {
    localStorage.setItem('auditor_reports', JSON.stringify(updatedReports));
    setReports(updatedReports);
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    if (!user) return;
    
    try {
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: status as 'new' | 'investigating' | 'resolved' | 'dismissed',
              auditor_notes: notes,
              assigned_auditor: user.username || 'Auditor'
            }
          : report
      );
      
      saveReportsToStorage(updatedReports);
      
      toast({
        title: 'Success',
        description: `Report status updated to ${status}`
      });
      
      setSelectedReport(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to update report:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive'
      });
    }
  };

  const createReportFromTransaction = (transaction: Transaction) => {
    const variance = transaction.actual_amount - transaction.budget_amount;
    const variancePercent = (variance / transaction.budget_amount) * 100;
    
    const newReport: Report = {
      id: `rpt-${transaction.id}-${Date.now()}`,
      public_id: `RPT-${new Date().getFullYear()}-${(reports.length + 1).toString().padStart(3, '0')}`,
      summary: `Suspicious transaction: ${transaction.program} with ${variancePercent > 0 ? 'over' : 'under'} spending of ${Math.abs(variancePercent).toFixed(1)}%`,
      status: 'new',
      created_at: new Date().toISOString(),
      issue_type: 'Financial Irregularity',
      organization: SECTORS[transaction.sector_id as keyof typeof SECTORS],
      estimated_amount_range: `$${transaction.actual_amount.toLocaleString()}`,
      detailed_description: `Transaction details: Budget: $${transaction.budget_amount.toLocaleString()}, Actual: $${transaction.actual_amount.toLocaleString()}, Variance: $${variance.toLocaleString()} (${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(1)}%)`,
      related_transaction_id: transaction.id
    };
    
    const updatedReports = [...reports, newReport];
    saveReportsToStorage(updatedReports);
    
    toast({
      title: 'Report Created',
      description: 'New report generated from transaction analysis'
    });
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : `Vendor ${vendorId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-500';
      case 'investigating': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'dismissed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'investigating': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'dismissed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate statistics based on procurement data
  const totalSpending = transactions.reduce((sum, t) => sum + t.actual_amount, 0);
  const totalBudget = transactions.reduce((sum, t) => sum + t.budget_amount, 0);
  const totalVariance = totalSpending - totalBudget;
  const highRiskTransactions = transactions.filter(t => {
    const variance = (t.actual_amount - t.budget_amount) / t.budget_amount;
    return Math.abs(variance) > 0.3; // 30% variance
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auditor Dashboard</h1>
            <p className="text-muted-foreground">Monitoring Procurement Activities</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/chat')}>
              Public Chat
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
              <TrendingUp className={`h-4 w-4 ${totalVariance > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                ${Math.abs(totalVariance).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Transactions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highRiskTransactions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
              <Eye className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anomalies.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Procurement Transactions</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
            <TabsTrigger value="reports">Audit Reports</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Procurement Transactions Review</CardTitle>
                <CardDescription>Monitor and analyze transactions from procurement department</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const variance = transaction.actual_amount - transaction.budget_amount;
                      const variancePercent = transaction.budget_amount > 0 ? 
                        ((variance / transaction.budget_amount) * 100).toFixed(1) : '0.0';
                      const isHighRisk = Math.abs(parseFloat(variancePercent)) > 30;
                      
                      return (
                        <TableRow key={transaction.id} className={isHighRisk ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{transaction.program}</TableCell>
                          <TableCell>{SECTORS[transaction.sector_id as keyof typeof SECTORS]}</TableCell>
                          <TableCell>{getVendorName(transaction.vendor_id)}</TableCell>
                          <TableCell>${transaction.budget_amount.toLocaleString()}</TableCell>
                          <TableCell>${transaction.actual_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              variance > 0 ? 'destructive' : 
                              variance < 0 ? 'default' : 'secondary'
                            }>
                              {variance > 0 ? '+' : ''}${Math.abs(variance).toLocaleString()} ({variancePercent}%)
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(transaction.tx_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {isHighRisk && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => createReportFromTransaction(transaction)}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No procurement transactions found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
                <CardDescription>AI-detected suspicious patterns in procurement data</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Related Transaction</TableHead>
                      <TableHead>Detected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomalies.map((anomaly) => {
                      const relatedTransaction = transactions.find(t => t.id === anomaly.related_transaction_id);
                      
                      return (
                        <TableRow key={anomaly.id}>
                          <TableCell className="font-medium">{anomaly.anomaly_type}</TableCell>
                          <TableCell>{anomaly.description}</TableCell>
                          <TableCell>
                            <Badge variant={
                              anomaly.severity === 'High' ? 'destructive' : 
                              anomaly.severity === 'Medium' ? 'default' : 'secondary'
                            }>
                              {anomaly.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={anomaly.combined_score > 70 ? 'destructive' : 'secondary'}>
                              {Math.round(anomaly.combined_score)}/100
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {relatedTransaction ? (
                              <Badge variant="outline">{relatedTransaction.program}</Badge>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(anomaly.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {anomalies.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No anomalies detected in procurement data.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Reports</CardTitle>
                <CardDescription>Investigation reports generated from transaction analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {report.public_id}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status}</span>
                          </Badge>
                          {report.issue_type && (
                            <Badge variant="secondary">{report.issue_type}</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium">{report.summary}</p>
                        {report.organization && (
                          <p className="text-sm text-muted-foreground">Organization: {report.organization}</p>
                        )}
                        {report.estimated_amount_range && (
                          <p className="text-sm text-muted-foreground">Amount: {report.estimated_amount_range}</p>
                        )}
                        {report.assigned_auditor && (
                          <p className="text-sm text-muted-foreground">Assigned to: {report.assigned_auditor}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setNotes(report.auditor_notes || '');
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {reports.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No audit reports generated yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Review Modal */}
            {selectedReport && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Review Report: {selectedReport.public_id}</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(selectedReport.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Issue Type</h4>
                        <p className="text-sm">{selectedReport.issue_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Organization</h4>
                        <p className="text-sm">{selectedReport.organization || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm bg-muted p-3 rounded">{selectedReport.summary}</p>
                    </div>
                    
                    {selectedReport.detailed_description && (
                      <div>
                        <h4 className="font-medium mb-2">Detailed Description</h4>
                        <p className="text-sm bg-muted p-3 rounded">{selectedReport.detailed_description}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Auditor Notes</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your investigation notes..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Update Status</label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant={selectedReport.status === 'new' ? 'default' : 'outline'}
                          onClick={() => updateReportStatus(selectedReport.id, 'new')}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Mark New
                        </Button>
                        <Button
                          variant={selectedReport.status === 'investigating' ? 'default' : 'outline'}
                          onClick={() => updateReportStatus(selectedReport.id, 'investigating')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Mark Investigating
                        </Button>
                        <Button
                          variant={selectedReport.status === 'resolved' ? 'default' : 'outline'}
                          onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(null);
                            setNotes('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AuditorDashboard;