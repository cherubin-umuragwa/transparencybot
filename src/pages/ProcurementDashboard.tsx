/**
 * Procurement Dashboard for TransparencyBot
 * Provides tools for managing transactions and viewing spending analytics
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Users, LogOut, Plus, Edit, Trash2, Building2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface TransactionForm {
  sector_id: number;
  program: string;
  vendor_id: number;
  budget_amount: number;
  actual_amount: number;
  tx_date: string;
  description: string;
}

interface Vendor {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

const SECTORS = {
  1: 'Education',
  2: 'Health',
  3: 'Agriculture',
  4: 'Infrastructure',
  5: 'Other'
};

// Initial vendors - will be loaded from localStorage
const INITIAL_VENDORS: Vendor[] = [
  { id: 1, name: 'ABC Supplies', contact_email: 'contact@abcsupplies.com', phone: '+256-XXX-XXXX', address: 'Kampala, Uganda', created_at: new Date().toISOString() },
  { id: 2, name: 'XYZ Services', contact_email: 'info@xyzservices.com', phone: '+256-XXX-XXXX', address: 'Kampala, Uganda', created_at: new Date().toISOString() },
  { id: 3, name: 'Best Goods', contact_email: 'sales@bestgoods.com', phone: '+256-XXX-XXXX', address: 'Kampala, Uganda', created_at: new Date().toISOString() },
  { id: 4, name: 'Quality Products', contact_email: 'info@qualityproducts.com', phone: '+256-XXX-XXXX', address: 'Kampala, Uganda', created_at: new Date().toISOString() },
  { id: 5, name: 'Reliable Services', contact_email: 'contact@reliableservices.com', phone: '+256-XXX-XXXX', address: 'Kampala, Uganda', created_at: new Date().toISOString() }
];

const ProcurementDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateVendorModal, setShowCreateVendorModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<TransactionForm>({
    sector_id: 1,
    program: '',
    vendor_id: 1,
    budget_amount: 0,
    actual_amount: 0,
    tx_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    contact_email: '',
    phone: '',
    address: ''
  });

  // Redirect if not authenticated as procurement
  useEffect(() => {
    if (!user || user.role !== 'procurement') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (user) {
      loadTransactions();
      loadVendors();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const savedTransactions = localStorage.getItem('procurement_transactions');
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        const sampleTransactions: Transaction[] = [
          {
            id: 1,
            sector_id: 1,
            program: 'School Supplies Procurement',
            vendor_id: 1,
            budget_amount: 50000,
            actual_amount: 48000,
            tx_date: '2024-01-15',
            description: 'Purchase of textbooks and learning materials',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            sector_id: 2,
            program: 'Medical Equipment',
            vendor_id: 2,
            budget_amount: 75000,
            actual_amount: 72000,
            tx_date: '2024-01-20',
            description: 'Hospital medical equipment upgrade',
            created_at: new Date().toISOString()
          }
        ];
        
        setTransactions(sampleTransactions);
        localStorage.setItem('procurement_transactions', JSON.stringify(sampleTransactions));
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = () => {
    try {
      const savedVendors = localStorage.getItem('procurement_vendors');
      
      if (savedVendors) {
        setVendors(JSON.parse(savedVendors));
      } else {
        setVendors(INITIAL_VENDORS);
        localStorage.setItem('procurement_vendors', JSON.stringify(INITIAL_VENDORS));
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        variant: 'destructive'
      });
    }
  };

  const saveTransactionsToStorage = (updatedTransactions: Transaction[]) => {
    localStorage.setItem('procurement_transactions', JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);
  };

  const saveVendorsToStorage = (updatedVendors: Vendor[]) => {
    localStorage.setItem('procurement_vendors', JSON.stringify(updatedVendors));
    setVendors(updatedVendors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.program.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Program name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingTransaction) {
        const updatedTransactions = transactions.map(tx =>
          tx.id === editingTransaction.id
            ? { ...tx, ...formData }
            : tx
        );
        saveTransactionsToStorage(updatedTransactions);
        
        toast({
          title: 'Success',
          description: 'Transaction updated successfully'
        });
      } else {
        const newTransaction: Transaction = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString()
        };
        
        const updatedTransactions = [...transactions, newTransaction];
        saveTransactionsToStorage(updatedTransactions);
        
        toast({
          title: 'Success',
          description: 'Transaction created successfully'
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to save transaction',
        variant: 'destructive'
      });
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorFormData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Vendor name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingVendor) {
        // Update existing vendor
        const updatedVendors = vendors.map(vendor =>
          vendor.id === editingVendor.id
            ? { ...vendor, ...vendorFormData }
            : vendor
        );
        saveVendorsToStorage(updatedVendors);
        
        toast({
          title: 'Success',
          description: 'Vendor updated successfully'
        });
      } else {
        // Create new vendor
        const newVendor: Vendor = {
          id: Date.now(),
          name: vendorFormData.name,
          contact_email: vendorFormData.contact_email,
          phone: vendorFormData.phone,
          address: vendorFormData.address,
          created_at: new Date().toISOString()
        };
        
        const updatedVendors = [...vendors, newVendor];
        saveVendorsToStorage(updatedVendors);
        
        toast({
          title: 'Success',
          description: 'Vendor created successfully'
        });
      }
      
      setVendorFormData({
        name: '',
        contact_email: '',
        phone: '',
        address: ''
      });
      setEditingVendor(null);
      setShowCreateVendorModal(false);
    } catch (error) {
      console.error('Failed to save vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vendor',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const updatedTransactions = transactions.filter(tx => tx.id !== id);
      saveTransactionsToStorage(updatedTransactions);
      
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVendor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor? This will remove them from the vendor list.')) return;

    try {
      const updatedVendors = vendors.filter(vendor => vendor.id !== id);
      saveVendorsToStorage(updatedVendors);
      
      toast({
        title: 'Success',
        description: 'Vendor deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vendor',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      sector_id: 1,
      program: '',
      vendor_id: 1,
      budget_amount: 0,
      actual_amount: 0,
      tx_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingTransaction(null);
    setShowCreateModal(false);
  };

  const resetVendorForm = () => {
    setVendorFormData({
      name: '',
      contact_email: '',
      phone: '',
      address: ''
    });
    setEditingVendor(null);
    setShowCreateVendorModal(false);
  };

  const startEdit = (transaction: Transaction) => {
    setFormData({
      sector_id: transaction.sector_id,
      program: transaction.program,
      vendor_id: transaction.vendor_id,
      budget_amount: transaction.budget_amount,
      actual_amount: transaction.actual_amount,
      tx_date: transaction.tx_date,
      description: transaction.description
    });
    setEditingTransaction(transaction);
    setShowCreateModal(true);
  };

  const startEditVendor = (vendor: Vendor) => {
    setVendorFormData({
      name: vendor.name,
      contact_email: vendor.contact_email || '',
      phone: vendor.phone || '',
      address: vendor.address || ''
    });
    setEditingVendor(vendor);
    setShowCreateVendorModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Convert vendors array to object for the dropdown
  const vendorsObject = vendors.reduce((acc, vendor) => {
    acc[vendor.id] = vendor.name;
    return acc;
  }, {} as Record<number, string>);

  // Calculate statistics
  const totalSpending = transactions.reduce((sum, t) => sum + t.actual_amount, 0);
  const totalBudget = transactions.reduce((sum, t) => sum + t.budget_amount, 0);
  const variance = totalSpending - totalBudget;
  const avgTransaction = transactions.length > 0 ? totalSpending / transactions.length : 0;

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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Procurement Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.username}</p>
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
      <main className="container mx-auto px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpending.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
              <TrendingUp className={`h-4 w-4 ${variance > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                ${Math.abs(variance).toLocaleString()}
                <span className="text-sm ml-1">{variance > 0 ? 'over' : 'under'}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgTransaction.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transaction Management</TabsTrigger>
            <TabsTrigger value="analytics">Spending Analytics</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transaction Management</CardTitle>
                  <CardDescription>Create, edit, and manage transactions</CardDescription>
                </div>
                
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTransaction ? 'Edit Transaction' : 'Create New Transaction'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sector">Sector</Label>
                          <Select 
                            value={formData.sector_id.toString()} 
                            onValueChange={(value) => setFormData({...formData, sector_id: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(SECTORS).map(([id, name]) => (
                                <SelectItem key={id} value={id}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="vendor">Vendor</Label>
                          <Select 
                            value={formData.vendor_id.toString()} 
                            onValueChange={(value) => setFormData({...formData, vendor_id: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(vendorsObject).map(([id, name]) => (
                                <SelectItem key={id} value={id}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="program">Program/Project Name</Label>
                        <Input
                          id="program"
                          value={formData.program}
                          onChange={(e) => setFormData({...formData, program: e.target.value})}
                          placeholder="Enter program name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="budget">Budget Amount ($)</Label>
                          <Input
                            id="budget"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.budget_amount}
                            onChange={(e) => setFormData({...formData, budget_amount: parseFloat(e.target.value) || 0})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="actual">Actual Amount ($)</Label>
                          <Input
                            id="actual"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.actual_amount}
                            onChange={(e) => setFormData({...formData, actual_amount: parseFloat(e.target.value) || 0})}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="date">Transaction Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.tx_date}
                          onChange={(e) => setFormData({...formData, tx_date: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Enter transaction description"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingTransaction ? 'Update' : 'Create'} Transaction
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
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
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.program}</TableCell>
                          <TableCell>{SECTORS[transaction.sector_id as keyof typeof SECTORS]}</TableCell>
                          <TableCell>{vendorsObject[transaction.vendor_id] || 'Unknown Vendor'}</TableCell>
                          <TableCell>${transaction.budget_amount.toLocaleString()}</TableCell>
                          <TableCell>${transaction.actual_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={variance > 0 ? 'destructive' : variance < 0 ? 'default' : 'secondary'}>
                              {variance > 0 ? '+' : ''}${Math.abs(variance).toLocaleString()} ({variancePercent}%)
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(transaction.tx_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(transaction)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(transaction.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found. Create your first transaction!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Analytics</CardTitle>
                <CardDescription>Financial insights and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Spending by Sector</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.entries(SECTORS).map(([id, name]) => {
                          const sectorSpending = transactions
                            .filter(tx => tx.sector_id === parseInt(id))
                            .reduce((sum, tx) => sum + tx.actual_amount, 0);
                          
                          return (
                            <div key={id} className="flex justify-between py-2 border-b">
                              <span>{name}</span>
                              <span>${sectorSpending.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Vendor Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {vendors.map((vendor) => {
                          const vendorTransactions = transactions.filter(tx => tx.vendor_id === vendor.id);
                          const totalSpending = vendorTransactions.reduce((sum, tx) => sum + tx.actual_amount, 0);
                          
                          return (
                            <div key={vendor.id} className="flex justify-between py-2 border-b">
                              <span>{vendor.name}</span>
                              <span>${totalSpending.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vendor Management</CardTitle>
                  <CardDescription>Manage vendor relationships and performance</CardDescription>
                </div>
                
                <Dialog open={showCreateVendorModal} onOpenChange={setShowCreateVendorModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleVendorSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="vendorName">Vendor Name *</Label>
                        <Input
                          id="vendorName"
                          value={vendorFormData.name}
                          onChange={(e) => setVendorFormData({...vendorFormData, name: e.target.value})}
                          placeholder="Enter vendor name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="vendorEmail">Contact Email</Label>
                        <Input
                          id="vendorEmail"
                          type="email"
                          value={vendorFormData.contact_email}
                          onChange={(e) => setVendorFormData({...vendorFormData, contact_email: e.target.value})}
                          placeholder="vendor@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="vendorPhone">Phone Number</Label>
                        <Input
                          id="vendorPhone"
                          value={vendorFormData.phone}
                          onChange={(e) => setVendorFormData({...vendorFormData, phone: e.target.value})}
                          placeholder="+256-XXX-XXXX"
                        />
                      </div>

                      <div>
                        <Label htmlFor="vendorAddress">Address</Label>
                        <Textarea
                          id="vendorAddress"
                          value={vendorFormData.address}
                          onChange={(e) => setVendorFormData({...vendorFormData, address: e.target.value})}
                          placeholder="Enter vendor address"
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={resetVendorForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingVendor ? 'Update' : 'Create'} Vendor
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {vendors.map((vendor) => {
                    const vendorTransactions = transactions.filter(tx => tx.vendor_id === vendor.id);
                    const totalSpending = vendorTransactions.reduce((sum, tx) => sum + tx.actual_amount, 0);
                    const avgVariance = vendorTransactions.length > 0 ? 
                      vendorTransactions.reduce((sum, tx) => sum + (tx.actual_amount - tx.budget_amount), 0) / vendorTransactions.length : 0;
                    
                    return (
                      <Card key={vendor.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{vendor.name}</CardTitle>
                            <CardDescription>
                              Total Transactions: {vendorTransactions.length} | Total Spending: ${totalSpending.toLocaleString()}
                            </CardDescription>
                            {vendor.contact_email && (
                              <p className="text-sm text-muted-foreground mt-1">Email: {vendor.contact_email}</p>
                            )}
                            {vendor.phone && (
                              <p className="text-sm text-muted-foreground">Phone: {vendor.phone}</p>
                            )}
                            {vendor.address && (
                              <p className="text-sm text-muted-foreground">Address: {vendor.address}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditVendor(vendor)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteVendor(vendor.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            Average Variance: ${avgVariance.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {vendors.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No vendors found. Create your first vendor!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProcurementDashboard;