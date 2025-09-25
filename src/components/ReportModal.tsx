/**
 * Report Modal Component for TransparencyBot
 * Chatbot-style interface for submitting anonymous corruption reports
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Bot, User, Upload, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportModalProps {
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface Question {
  key: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'file' | 'date' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  condition?: () => boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string>('');

  const questions: Question[] = [
    {
      key: 'summary',
      question: 'Please provide a brief summary of what happened:',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the incident in a few words...'
    },
    {
      key: 'detailed_description',
      question: 'Could you provide more details about the incident?',
      type: 'textarea',
      required: false,
      placeholder: 'Share as many details as you\'re comfortable with...'
    },
    {
      key: 'issue_type',
      question: 'What type of issue best describes what you\'re reporting?',
      type: 'select',
      required: true,
      options: [
        'Bribery / Kickback',
        'Procurement Fraud',
        'Embezzlement / Theft of Funds',
        'Conflict of Interest / Nepotism',
        'Theft of Assets / Materials',
        'Manipulation of Data / Reports',
        'Absenteeism / Ghost Workers',
        'Other'
      ]
    },
    {
      key: 'entities_involved',
      question: 'Who was involved? Please provide names, positions, or the names of departments/companies.',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., \'John Doe, Project Manager\', \'ABC Construction Company\'...'
    },
    {
      key: 'organization',
      question: 'Which organization was primarily involved?',
      type: 'text',
      required: true,
      placeholder: 'e.g., \'Ministry of Health\', \'XYZ Corp\''
    },
    {
      key: 'incident_date',
      question: 'When did this incident happen?',
      type: 'date',
      required: false
    },
    {
      key: 'location',
      question: 'Where did this happen? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'City, region, or specific location...'
    },
    {
      key: 'estimated_amount_range',
      question: 'What is the estimated amount of money or value involved?',
      type: 'select',
      required: false,
      options: [
        'Not applicable / don\'t know',
        'Less than $1,000',
        '$1,000 - $10,000',
        '$10,000 - $100,000',
        'More than $100,000'
      ]
    },
    {
      key: 'source_of_info',
      question: 'How do you know this information?',
      type: 'select',
      required: true,
      options: [
        'First-hand experience (it happened to me)',
        'I witnessed it directly',
        'I was told by someone involved',
        'I have access to documents that prove it',
        'It\'s common knowledge / rumor'
      ]
    },
    {
      key: 'follow_up_allowed',
      question: 'Would you be willing to be contacted for follow-up questions?',
      type: 'radio',
      required: true,
      options: [
        'No, I prefer to remain completely anonymous',
        'Yes, I can be contacted if needed'
      ]
    },
    {
      key: 'contact_info',
      question: 'Please provide your contact information (email or phone):',
      type: 'text',
      required: false,
      placeholder: 'email@example.com or +1234567890',
      condition: () => reportData.follow_up_allowed === 'Yes, I can be contacted if needed'
    },
    {
      key: 'consent',
      question: 'Finally, please confirm that you understand this report will be handled according to our privacy policy:',
      type: 'checkbox',
      required: true
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      sender: 'bot',
      content: 'Hello! I\'m here to help you submit an anonymous report. All information is confidential. Let\'s start with a brief summary of what happened.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const getCurrentQuestion = () => {
    if (currentQuestionIndex >= questions.length) return null;
    const question = questions[currentQuestionIndex];
    if (question.condition && !question.condition()) {
      setCurrentQuestionIndex(prev => prev + 1);
      return getCurrentQuestion();
    }
    return question;
  };

  const handleResponse = (value: any) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Validate required fields
    if (currentQuestion.required && !value) {
      if (currentQuestion.type === 'checkbox' && !value) {
        toast({
          title: 'Required Field',
          description: 'Please confirm to continue',
          variant: 'destructive'
        });
        return;
      } else if (!value) {
        toast({
          title: 'Required Field',
          description: 'Please provide a response to continue',
          variant: 'destructive'
        });
        return;
      }
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: currentQuestion.type === 'checkbox' 
        ? 'I agree to the privacy policy' 
        : value?.toString() || 'No response',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setReportData(prev => ({ ...prev, [currentQuestion.key]: value }));

    // Move to next question or submit
    if (currentQuestionIndex + 1 >= questions.length) {
      submitReport({ ...reportData, [currentQuestion.key]: value });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Add next bot message
      setTimeout(() => {
        const nextQuestion = questions[currentQuestionIndex + 1];
        if (nextQuestion && (!nextQuestion.condition || nextQuestion.condition())) {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            content: nextQuestion.question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        }
      }, 500);
    }
  };

  const submitReport = async (finalReportData: Record<string, any>) => {
    try {
      console.log('Submitting report...', finalReportData);
      
      // Submit to the new Supabase backend
      const response = await fetch('https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/submit-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: finalReportData.nature || 'Corruption report',
          detailed_description: finalReportData.details || '',
          estimated_amount_range: finalReportData.amount || null,
          source_of_info: finalReportData.source || 'Anonymous report',
          follow_up_allowed: finalReportData.follow_up_allowed?.startsWith('Yes') || false,
          contact_info: finalReportData.contact ? { contact: finalReportData.contact } : null,
          attributes: finalReportData,
          chat_history: messages
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Report submitted successfully:', result);
        
        const refId = result.report_id || result.reference_number || 'UNKNOWN';
        setReportId(refId);
        setIsSubmitted(true);
        
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          sender: 'bot',
          content: `✅ Report submitted successfully! Reference: ${refId}\n\nThank you for contributing to transparency. Your report will be reviewed by our audit team within 48-72 hours.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        toast({
          title: 'Report Submitted',
          description: `Your report has been submitted with reference: ${refId}`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        content: '❌ There was an error submitting your report. Please try again later or contact support directly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Submission Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderInput = () => {
    if (isSubmitted) return null;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Input
              placeholder={currentQuestion.placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleResponse((e.target as HTMLInputElement).value);
                }
              }}
              className="w-full"
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-3">
            <Textarea
              placeholder={currentQuestion.placeholder}
              className="min-h-[100px] resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleResponse((e.target as HTMLTextAreaElement).value);
                }
              }}
            />
          </div>
        );

      case 'select':
        return (
          <Select onValueChange={handleResponse}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup onValueChange={handleResponse} className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'date':
        return (
          <Input
            type="date"
            onChange={(e) => handleResponse(e.target.value)}
            className="w-full"
          />
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                onCheckedChange={handleResponse}
              />
              <Label htmlFor="consent" className="text-sm">
                I understand and agree to the privacy policy
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Chat Messages */}
      <div className="max-h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-accent-foreground'
              }`}>
                {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <Card className={`px-3 py-2 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <p className="text-sm">{message.content}</p>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Current Question Input */}
      {!isSubmitted && (
        <div className="space-y-4">
          {renderInput()}
        </div>
      )}

      {/* Success State */}
      {isSubmitted && (
        <div className="text-center space-y-4 p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Thank You!</h3>
            <p className="text-sm text-muted-foreground">
              Your report has been recorded with reference: <Badge variant="outline">{reportId}</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You may keep this reference for follow-up. If you opted in for follow-up,
              an authorized auditor may contact you.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            <Button onClick={() => window.location.reload()}>
              Submit Another Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportModal;