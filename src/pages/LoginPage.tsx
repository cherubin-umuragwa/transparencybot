/**
 * Login Page for TransparencyBot
 * Handles authentication for auditors and procurement officers
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'auditor') {
        navigate('/auditor');
      } else if (user.role === 'procurement') {
        navigate('/procurement');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(username, password);
      
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to TransparencyBot!',
        });
        
        // Navigation will be handled by the useEffect above
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">TransparencyBot</h1>
          <p className="text-muted-foreground mt-2">Secure Portal Access</p>
        </div>

        <Card className="glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/chat')}
              >
                Continue as Guest (Chat Only)
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Auditor Access</p>
                <p className="text-sm text-muted-foreground">
                  Username: <code className="bg-muted px-1 py-0.5 rounded">auditor_demo</code><br />
                  Password: <code className="bg-muted px-1 py-0.5 rounded">auditor_demo_pass</code>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Procurement Access</p>
                <p className="text-sm text-muted-foreground">
                  Username: <code className="bg-muted px-1 py-0.5 rounded">procurement_demo</code><br />
                  Password: <code className="bg-muted px-1 py-0.5 rounded">procure_demo_pass</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;