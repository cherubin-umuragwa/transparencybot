/**
 * Public Chat Page for TransparencyBot
 * ChatGPT-like interface for asking questions about public funds
 * Includes reporting functionality accessible to all users
 */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, MessageSquare, Bot, User, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { post } from '@/utils/api';
import ReportModal from '@/components/ReportModal';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  followups?: { question: string; param: string }[];
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'bot',
      content: 'Hello! I\'m TransparencyBot. I can help you explore government finances, budgets, and spending data. Ask me about ministry budgets, project progress, procurement contracts, or anything related to public funds.',
      timestamp: new Date(),
      followups: [
        { question: 'Show me education budget', param: 'Show me education budget' },
        { question: 'Find health projects', param: 'Find health projects' },
        { question: 'Infrastructure contracts', param: 'Infrastructure contracts' },
        { question: 'How to report corruption', param: 'How to report corruption' }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Make API call to Supabase chatbot function
      const response = await fetch('https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText })
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: data.content || 'I apologize, but I couldn\'t process your request at the moment.',
          timestamp: new Date(),
          followups: data.followups || []
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'I apologize, but I\'m having trouble connecting to the server. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the chatbot service. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupClick = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TransparencyBot</h1>
                <p className="text-sm text-muted-foreground">Public Finance Assistant</p>
              </div>
            </div>
            
            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Report Corruption
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Report Corruption</DialogTitle>
                </DialogHeader>
                <ReportModal onClose={() => setShowReportModal(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 mb-32">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-md'
                    : 'bg-background border rounded-tl-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Follow-up Questions */}
                  {message.followups && message.followups.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">You might also ask:</p>
                      <div className="space-y-1">
                        {message.followups.map((followup, index) => (
                          <button
                            key={index}
                            onClick={() => handleFollowupClick(followup.question)}
                            className="block w-full text-left text-xs px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                          >
                            {followup.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-card border rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">TransparencyBot is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about government spending, budgets, or report corruption..."
                className="min-h-[50px] max-h-32 resize-none"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-[50px] w-[50px] rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFollowupClick('Show me the latest education spending')}
            >
              Education Budget
            </Badge>
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFollowupClick('What are the current health projects?')}
            >
              Health Projects
            </Badge>
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFollowupClick('Show infrastructure contracts')}
            >
              Infrastructure
            </Badge>
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => setShowReportModal(true)}
            >
              Report Issue
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;