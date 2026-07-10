import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Link2, Calendar as CalendarIcon, 
  Edit3, CheckSquare, Layers, Bot, Sliders, Database, 
  TrendingUp, Users, Bell, CreditCard, User, Folder, 
  LogOut, Sun, Moon, Plus, Trash2, Play, Check, 
  X, Send, Smartphone, Sparkles, 
  RefreshCw, ChevronRight, ChevronLeft, 
  Clock, Lock, Unlock, CheckCircle, AlertCircle
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Category {
  id: string;
  name: string;
  isCustom: boolean;
  priority: 'High' | 'Medium' | 'Low';
  frequency: number;
}

interface Post {
  id: string;
  title: string;
  body: string;
  linkedinCopy: string;
  hashtags: string[];
  imageUrl: string;
  summary: string;
  category: string;
  status: 'pending_approval' | 'scheduled' | 'published' | 'rejected' | 'draft';
  scheduledTime?: string;
  rejectionFeedback?: string;
  sourceType: string;
  sourceUrl?: string;
  tone: string;
  publishedAt?: string;
  impressions?: number;
  engagement?: number;
  estimatedReach: string; // reach prediction
}

interface StrategyDay {
  day: string;
  type: string;
  description: string;
}

// ==========================================
// MOCK DATA SEED
// ==========================================

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Technology', isCustom: false, priority: 'High', frequency: 5 },
  { id: 'cat-2', name: 'Artificial Intelligence', isCustom: false, priority: 'High', frequency: 7 },
  { id: 'cat-3', name: 'SaaS', isCustom: false, priority: 'Medium', frequency: 4 },
  { id: 'cat-4', name: 'Startups', isCustom: false, priority: 'High', frequency: 5 },
  { id: 'cat-5', name: 'Entrepreneurship', isCustom: false, priority: 'Medium', frequency: 3 },
  { id: 'cat-6', name: 'Marketing', isCustom: false, priority: 'Low', frequency: 2 },
  { id: 'cat-7', name: 'Finance', isCustom: false, priority: 'Medium', frequency: 3 }
];

const initialPosts: Post[] = [
  {
    id: 'post-101',
    title: 'The AI Shift: How Agentic Workflows Will Transform Modern B2B SaaS in 2026',
    body: 'In 2026, standard chat integrations are no longer enough. B2B SaaS platforms are pivoting to agentic autonomous models. These agents do not wait for human instructions; they actively identify optimization pathways, trigger background API pipelines, and surface high-level results...',
    linkedinCopy: 'The next evolution of SaaS is here: Agentic Workflows! 🚀\n\nTraditional systems are reactive, but the future belongs to autonomous agents that anticipate needs and execute multi-step routines. Here is what this shift means for B2B operators in 2026.\n\nRead the analysis below 👇',
    hashtags: ['SaaS', 'AI', 'Automation', 'AgenticWorkflows'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
    summary: 'A deep-dive analysis on the operational transition from reactive software to proactive AI agent structures.',
    category: 'Artificial Intelligence',
    status: 'pending_approval',
    sourceType: 'trending_news',
    sourceUrl: 'https://techcrunch.com/agentic-saas-future',
    tone: 'Thoughtful',
    estimatedReach: '4.8k impressions'
  },
  {
    id: 'post-102',
    title: '5 Crucial Bootstrapping Lessons for Early-Stage Tech Teams',
    body: 'Capital efficiency is the ultimate advantage. While raising venture capital remains popular, bootstrapped operations enforce product clarity and organic retention metrics early on. Focus on customer cash flows, build robust modular architectures, and stay lean...',
    linkedinCopy: 'Before chasing venture capital, focus on capital efficiency. 💡\n\nHere are 5 core scaling lessons we learned while bootstrapping our technical roadmap to positive unit economics.\n\n#Startups #Bootstrapping #Founders #SaaS',
    hashtags: ['Startups', 'Bootstrapping', 'Founders', 'SaaS'],
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800',
    summary: 'Key insights and metrics targets for bootstrapped startups to achieve growth cycles.',
    category: 'Startups',
    status: 'scheduled',
    scheduledTime: '2026-07-09 at 10:00 AM',
    sourceType: 'user_topic',
    tone: 'Professional',
    estimatedReach: '3.2k impressions'
  },
  {
    id: 'post-103',
    title: 'Designing Ultra-Fast Frontend Frameworks: A Case Study on Asset Delivery',
    body: 'Frontend loading speed is tightly coupled with customer retention rates. In this case study, we review how optimizing bundler layouts, deferring non-essential CSS, and configuring advanced pre-fetching routines shaved off 1.4 seconds from standard paint metrics...',
    linkedinCopy: 'Performance = Conversions. ⚡️\n\nWe reduced our main bundle size and optimized client asset pre-fetching, leading to a 1.4s reduction in paint loading times. Here is our full breakdown.\n\n#Technology #Frontend #WebPerformance',
    hashtags: ['Technology', 'Frontend', 'WebPerformance'],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800',
    summary: 'Technical review of bundler layout configurations to reduce layout cumulative shift.',
    category: 'Technology',
    status: 'published',
    publishedAt: '2026-07-07 at 02:30 PM',
    impressions: 4850,
    engagement: 184,
    sourceType: 'rss_feed',
    sourceUrl: 'https://dev.to/performance-metrics-case-study',
    tone: 'Analytical',
    estimatedReach: '5.2k impressions'
  }
];

const weeklyStrategyMatrix: StrategyDay[] = [
  { day: 'Monday', type: 'Industry Insight', description: 'Deep scan of trending news and developments in your focus categories.' },
  { day: 'Tuesday', type: 'Educational Post', description: 'Teardown framework, step-by-step tutorials, or code optimization checklists.' },
  { day: 'Wednesday', type: 'Case Study', description: 'Metric-backed analytics review of products, scaling, or operational roadmaps.' },
  { day: 'Thursday', type: 'Thought Leadership', description: 'High-level strategy forecasts, industry predictions, and organizational methodologies.' },
  { day: 'Friday', type: 'Business Tips', description: 'Actionable productivity checklists, bootstrapping metrics, and cash flow advice.' },
  { day: 'Saturday', type: 'Trending Topic', description: 'Viral talking points or current social discourse scraped from active tech channels.' },
  { day: 'Sunday', type: 'Personal Branding Story', description: 'Relatable lessons, founder histories, or career reflections highlighting brand identity.' }
];

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('landing'); // landing, login, register, dashboard, categories, queue, generator, editor, approval, whatsapp, calendar, linkedin, analytics, pricing, profile, admin, notifications, history, aisettings, team
  
  // App States
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userRole, setUserRole] = useState<'super_admin' | 'content_manager' | 'end_user'>('end_user');
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  
  // LinkedIn Autopilot Settings
  const [autopilotStatus, setAutopilotStatus] = useState<'active' | 'paused'>('active');
  const [approvalMode, setApprovalMode] = useState<'full_approval' | 'weekly_approval' | 'trusted_ai'>('full_approval');
  const [postingFrequency, setPostingFrequency] = useState<'daily' | 'twice_daily' | 'weekly'>('daily');

  // Active/Edit States
  const [activeQueueTab, setActiveQueueTab] = useState<'pending' | 'scheduled' | 'published' | 'rejected' | 'draft'>('pending');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedPostForApprovalId, setSelectedPostForApprovalId] = useState<string>('post-101');
  const [aiGenCategory, setAiGenCategory] = useState('Artificial Intelligence');
  const [aiGenTone, setAiGenTone] = useState('Professional');
  const [aiGenSource, setAiGenSource] = useState('trending_news');
  const [aiGenLength, setAiGenLength] = useState('Medium Post');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  
  // LinkedIn connection state
  const [linkedinAccounts, setLinkedinAccounts] = useState([
    { id: 'acc-1', name: 'Jane Dev (Personal Profile)', type: 'Profile', connected: true, status: 'Active' },
    { id: 'acc-2', name: 'DevOps Solutions (Company Page)', type: 'Company Page', connected: false, status: 'Not Connected' }
  ]);

  // Auth Inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaPrompt, setShowMfaPrompt] = useState(false);

  // New Registration State Inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regPhoneInput, setRegPhoneInput] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');

  // Notification settings
  const [notifChannels, setNotifChannels] = useState({
    whatsapp: true,
    sms: false,
    email: true,
    push: true
  });
  
  // Team state
  const [teamMembers, setTeamMembers] = useState([
    { name: 'John Admin', email: 'john@autopilot-ai.com', role: 'Super Admin', status: 'Active' },
    { name: 'Jane Dev', email: 'jane@autopilot-ai.com', role: 'End User', status: 'Active' },
    { name: 'Marcus Editor', email: 'marcus@autopilot-ai.com', role: 'Content Manager', status: 'Active' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Content Manager');

  // WhatsApp Broadcast States
  const [whatsappTab, setWhatsappTab] = useState<'settings' | 'broadcast'>('settings');
  const [syncedContacts, setSyncedContacts] = useState<{ name: string; phoneNumber: string }[]>([]);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);

  // WhatsApp Simulator State
  const [whatsappChat, setWhatsappChat] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    { 
      sender: 'bot', 
      text: '🤖 Welcome to LinkedIn Autopilot AI!\n\nI will manage your strategy and post updates. Notifications arrive here for approvals. You can also send standard commands directly to control settings.',
      time: '12:00 PM'
    }
  ]);
  const [whatsappInput, setWhatsappInput] = useState('');

  // Apply dark class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync simulator notification when posts change
  useEffect(() => {
    const pending = posts.find(p => p.status === 'pending_approval');
    if (pending) {
      const alreadyNotified = whatsappChat.some(msg => msg.text.includes(pending.title));
      if (!alreadyNotified && autopilotStatus === 'active') {
        // Trigger a simulated incoming message
        setTimeout(() => {
          setWhatsappChat(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `Your LinkedIn post is ready.\n\nTitle:\n${pending.title}\n\nPreview:\n${pending.linkedinCopy.slice(0, 300)}...\n\nEstimated Reach:\n${pending.estimatedReach}\n\nOptions:\n1 = Approve\n2 = Edit Link\n3 = Reject\n4 = Regenerate`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 1500);
      }
    }
  }, [posts, autopilotStatus]);

  const handleRegister = async () => {
    if (!regEmail || !regPassword || !regFullName) {
      alert('Please fill in your name, email, and password.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          phoneNumber: regPhoneInput
        })
      });
      const data = await response.json();
      if (response.ok && data.id) {
        alert('Registration successful! Please log in.');
        setRegEmail('');
        setRegPassword('');
        setRegFullName('');
        setRegPhoneInput('');
        navigateTo('login');
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (e) {
      alert('Failed to connect to the backend server. Make sure it is running on port 3000.');
    }
  };

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) {
      alert('Please enter both email and password.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput
        })
      });
      const data = await response.json();
      if (response.ok && data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken);
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        alert(`Welcome back, ${data.user.fullName}!`);
        navigateTo('dashboard');
      } else {
        alert(data.message || 'Invalid email or password.');
      }
    } catch (e) {
      alert('Failed to connect to the backend auth database.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      console.log('Backend offline.');
    }
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
    navigateTo('landing');
  };

  const handleSendOtp = async () => {
    if (!phoneInput) {
      alert('Please enter your registered phone number first.');
      return;
    }
    setDebugOtp(null);
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneInput })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'OTP Code sent successfully!');
        if (data.debugOtpCode) {
          setDebugOtp(data.debugOtpCode);
        }
      } else {
        alert(data.message || 'Failed to send OTP.');
      }
    } catch (e) {
      alert('Failed to connect to the backend server. Make sure it is running.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!phoneInput || !otpInput) {
      alert('Please enter both your phone number and the OTP code received.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneInput,
          code: otpInput
        })
      });
      const data = await response.json();
      if (response.ok && data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken);
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        setDebugOtp(null);
        alert(`Welcome back, ${data.user.fullName}!`);
        navigateTo('dashboard');
      } else {
        alert(data.message || 'Invalid or expired OTP code.');
      }
    } catch (e) {
      alert('Failed to verify OTP code. Make sure backend is running.');
    }
  };

  const handleSyncContacts = async () => {
    setIsSyncingContacts(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/whatsapp/contacts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+91 9893854811' })
      });
      if (!response.ok) {
        throw new Error('Backend HTTP request failed.');
      }
      
      const contactsRes = await fetch('http://localhost:3000/api/v1/whatsapp/contacts');
      const contactsList = await contactsRes.json();
      
      if (contactsList && contactsList.length > 0) {
        setSyncedContacts(contactsList.map((c: any) => ({
          name: c.name,
          phoneNumber: c.phoneNumber
        })));
        setIsSyncingContacts(false);
        alert(`Successfully fetched ${contactsList.length} live contacts from +91 9893854811!`);
        return;
      }
    } catch (e) {
      console.log('Backend server is offline or Whapi token is not set. Falling back to sandbox simulator.', e);
    }

    // Fallback Mock Data
    setTimeout(() => {
      setSyncedContacts([
        { name: 'Amit Sharma (Investor)', phoneNumber: '+91 98111 22233' },
        { name: 'Sarah Jenkins (Marketing)', phoneNumber: '+91 98777 88899' },
        { name: 'Rajesh Patel (Co-founder)', phoneNumber: '+91 90111 22233' },
        { name: 'Michael Scott (Client)', phoneNumber: '+1 (555) 123-4567' },
        { name: 'Elena Rostova (SaaS Advisor)', phoneNumber: '+44 77123 45678' }
      ]);
      setIsSyncingContacts(false);
      alert('Synced 5 contacts associated with +91 9893854811 successfully! (Sandbox Simulator)');
    }, 2000);
  };

  const handleBroadcastOneShot = async () => {
    if (!broadcastMessage.trim()) {
      alert('Please compose a message first.');
      return;
    }
    if (syncedContacts.length === 0) {
      alert('Please sync contacts first.');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastProgress(0);
    setBroadcastLogs([]);

    try {
      await fetch('http://localhost:3000/api/v1/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastMessage })
      });
    } catch (e) {
      console.log('Backend server is offline. Simulating broadcast logs locally.', e);
    }

    const total = syncedContacts.length;
    let index = 0;

    const interval = setInterval(() => {
      if (index >= total) {
        clearInterval(interval);
        setIsBroadcasting(false);
        setBroadcastMessage('');
        alert('One-shot broadcast sent to all contacts successfully!');
        return;
      }

      const contact = syncedContacts[index];
      setBroadcastLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] Dispatching to ${contact.name} (${contact.phoneNumber})... SUCCESS`]);
      
      // Update simulator chat
      setWhatsappChat(prev => [
        ...prev,
        {
          sender: 'user',
          text: `[Broadcast from Autopilot to ${contact.name}]:\n${broadcastMessage}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      index++;
      setBroadcastProgress(Math.round((index / total) * 100));
    }, 1000);
  };

  // Process WhatsApp reply command
  const handleSendWhatsappMessage = async (customText?: string) => {
    const text = (customText || whatsappInput).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWhatsappChat(prev => [...prev, {
      sender: 'user' as const,
      text: text,
      time: timeStr
    }]);
    setWhatsappInput('');

    // Attempt to dispatch request to real NestJS backend webhook
    const userPhone = phoneInput || '+919893854811';
    try {
      const res = await fetch('http://localhost:3000/api/v1/whatsapp/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          From: userPhone.startsWith('whatsapp:') ? userPhone : `whatsapp:${userPhone}`,
          Body: text
        })
      });

      if (res.ok) {
        const twiml = await res.text();
        const msgMatch = twiml.match(/<Message>([\s\S]+?)<\/Message>/);
        const replyText = msgMatch ? msgMatch[1].trim() : 'Command processed successfully.';

        // Append real bot response
        setWhatsappChat(prev => [...prev, {
          sender: 'bot' as const,
          text: replyText,
          time: timeStr
        }]);

        // Reflect state locally on dashboard UI if approved
        if (text === '1' || text.toUpperCase() === 'APPROVE' || text.toUpperCase() === 'POST NOW') {
          const pending = posts.find(p => p.status === 'pending_approval' || p.status === 'scheduled');
          if (pending) {
            setPosts(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'published', publishedAt: 'Just Now' } : p));
          }
        }
        return; // Success
      }
    } catch (e) {
      console.log('Backend offline or error occurred. Running local sandbox mocks.');
    }

    // Local Sandbox Mock Fallback (if backend is offline)
    const command = text.toUpperCase().trim();
    const pending = posts.find(p => p.status === 'pending_approval');
    
    setTimeout(() => {
      // 1. Process Autonomous Autopilot Commands
      if (command === 'PAUSE') {
        setAutopilotStatus('paused');
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: '⏸️ Autopilot PAUSED. Automatically generated posts will remain in draft status and will not publish without manual overrides.',
          time: timeStr
        }]);
        return;
      }

      if (command === 'RESUME') {
        setAutopilotStatus('active');
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: '▶️ Autopilot RESUMED. Weekly content strategy matrix is active and scheduled postings are reinstated.',
          time: timeStr
        }]);
        return;
      }

      if (command === 'GENERATE NEW') {
        const genTitle = 'Autonomous Scaling Frameworks in B2B SaaS';
        const newPost: Post = {
          id: `post-${Date.now()}`,
          title: genTitle,
          body: 'Implementing robust queue frameworks is critical to support autonomous agent workloads. The scale of microservice telemetry data requires automated pipelines...',
          linkedinCopy: `Let's discuss autonomous scaling structures in B2B SaaS! 🚀\n\nOptimizing telemetry throughput ensures that agents process tasks efficiently. Here is our checklist.\n\n#SaaS #AI #Scaling`,
          hashtags: ['SaaS', 'AI', 'Scaling'],
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800',
          summary: 'Structural guide for scaling telemetry workloads.',
          category: 'SaaS',
          status: 'pending_approval',
          sourceType: 'trending_news',
          tone: 'Professional',
          estimatedReach: '4.2k reach prediction'
        };
        setPosts(prev => [newPost, ...prev]);
        setSelectedPostForApprovalId(newPost.id);
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `✨ Triggered New Generation! Researching trending topics now...\n\nDraft Ready Preview:\nTitle: ${genTitle}\nReach Prediction: 4.2k impressions\n\nReply '1' or 'APPROVE' to schedule.`,
          time: timeStr
        }]);
        return;
      }

      if (command === 'POST NOW') {
        const latestPending = posts.find(p => p.status === 'pending_approval' || p.status === 'scheduled');
        if (!latestPending) {
          setWhatsappChat(prev => [...prev, {
            sender: 'bot',
            text: 'There are no queued or pending posts ready for immediate publication.',
            time: timeStr
          }]);
          return;
        }
        setPosts(prev => prev.map(p => p.id === latestPending.id ? { ...p, status: 'published', publishedAt: 'Just Now' } : p));
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `🚀 Dispatched Instantly! "${latestPending.title}" is now live on your connected LinkedIn profile.`,
          time: timeStr
        }]);
        return;
      }

      if (command === 'SHOW ANALYTICS') {
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `📈 Weekly Analytics Report:\n• Posts Published: 5\n• Total Reach: 14,840 impressions\n• Total Engagement: 1,180 interactions\n• Top Post: 'Agentic SaaS in 2026' (4.8k impressions)\n• Follower Growth: +124 followers\n\nAI Autopilot recommendation: 'AI & SaaS' content performs best on Tuesdays. Posting frequency remains daily.`,
          time: timeStr
        }]);
        return;
      }

      if (command.startsWith('CHANGE CATEGORY TO ')) {
        const catName = text.substring(19).trim();
        setAiGenCategory(catName);
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `🎯 Category Focus Updated! Primary autopilot target set to: "${catName}". Subsequent daily generations will align with this vertical.`,
          time: timeStr
        }]);
        return;
      }

      if (command === 'POST TWICE DAILY') {
        setPostingFrequency('twice_daily');
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: '📅 Posting frequency updated to: Twice Daily. Generating updates for morning (09:00) and evening (17:00) LinkedIn activity spikes.',
          time: timeStr
        }]);
        return;
      }

      if (command === 'POST DAILY') {
        setPostingFrequency('daily');
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: '📅 Posting frequency updated to: Daily. Autopilot will deliver one post daily according to target calendar spikes.',
          time: timeStr
        }]);
        return;
      }

      // 2. Process pending items approval/rejections
      if (!pending) {
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: 'You do not have any pending LinkedIn posts in your Autopilot queue right now. Send commands like RESUME, PAUSE, or SHOW ANALYTICS to control.',
          time: timeStr
        }]);
        return;
      }

      if (text === '1' || command === 'APPROVE') {
        setPosts(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'scheduled', scheduledTime: 'Today at 05:00 PM' } : p));
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `✅ Post Approved! "${pending.title}" has been added to your LinkedIn queue.`,
          time: timeStr
        }]);
      } else if (text === '2' || command === 'EDIT') {
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `🔗 Edit Post Link:\nOpen this address in your browser to modify before publishing:\nhttps://autopilot-ai.com/editor/${pending.id}`,
          time: timeStr
        }]);
      } else if (text === '3' || command === 'REJECT') {
        setPosts(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'rejected', rejectionFeedback: 'Rejected via WhatsApp text' } : p));
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `❌ Post Rejected! "${pending.title}" was removed from the queue. Reply with comments to refine style guides.`,
          time: timeStr
        }]);
      } else if (text === '4' || command === 'REGENERATE') {
        setWhatsappChat(prev => [...prev, {
          sender: 'bot',
          text: `🔄 Regenerating draft for post "${pending.title}"... A new preview will be sent shortly.`,
          time: timeStr
        }]);
        // Simulate regeneration completion
        setTimeout(() => {
          const regeneratedTitle = `[Regenerated] ${pending.title}`;
          setPosts(prev => prev.map(p => p.id === pending.id ? {
            ...p,
            title: regeneratedTitle,
            linkedinCopy: `New Draft: Check out our refreshed analysis on B2B setups!\n\n#SaaS #Business #Tech`
          } : p));
        }, 1500);
      } else {
        const rejected = posts.find(p => p.status === 'rejected');
        if (rejected && text.length > 2) {
          setPosts(prev => prev.map(p => p.id === rejected.id ? { ...p, rejectionFeedback: text } : p));
          setWhatsappChat(prev => [...prev, {
            sender: 'bot',
            text: `📝 Feedback logged: "${text}". Future generations will adjust branding rules accordingly.`,
            time: timeStr
          }]);
        } else {
          setWhatsappChat(prev => [...prev, {
            sender: 'bot',
            text: 'Invalid response. Reply:\n1 = Approve\n2 = Get Edit Link\n3 = Reject\n4 = Regenerate\n\nOr try: PAUSE, RESUME, SHOW ANALYTICS',
            time: timeStr
          }]);
        }
      }
    }, 1000);
  };

  // Helper Actions
  const handleAddCategory = () => {
    if (!customCategoryInput.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: customCategoryInput.trim(),
      isCustom: true,
      priority: 'Medium',
      frequency: 3
    };
    setCategories([...categories, newCat]);
    setCustomCategoryInput('');
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        title: `Scaling ${aiGenCategory} operations: Strategy & Execution`,
        body: `Integrating ${aiGenCategory} is no longer a luxury—it is the baseline for modern SaaS execution. Teams that adopt automated loops see up to a 60% boost in operations delivery...`,
        linkedinCopy: `Let's discuss scaling #${aiGenCategory.replace(/\s+/g, '')} loops! 💡\n\nTransitioning from manual workflows to structured, automated systems is key. Here is a framework that matches engineering outcomes with product velocity.\n\n#SaaS #Management #Innovation`,
        hashtags: [aiGenCategory.replace(/\s+/g, ''), 'SaaS', 'Innovation'],
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800',
        summary: `Strategic implementation roadmap for scaling systems in ${aiGenCategory}.`,
        category: aiGenCategory,
        status: 'pending_approval',
        sourceType: aiGenSource,
        tone: aiGenTone,
        estimatedReach: '3.8k impressions'
      };
      setPosts([newPost, ...posts]);
      setSelectedPostForApprovalId(newPost.id);
      setIsGenerating(false);
      
      // If Trusted AI Mode is active, immediately schedule it automatically
      if (approvalMode === 'trusted_ai') {
        newPost.status = 'scheduled';
        newPost.scheduledTime = 'Today at 05:00 PM';
      }

      setCurrentView('queue');
      setActiveQueueTab(approvalMode === 'trusted_ai' ? 'scheduled' : 'pending');
    }, 2000);
  };

  const handleApproveFromDashboard = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'scheduled', scheduledTime: 'Today at 05:00 PM' } : p));
  };

  const handleRejectFromDashboard = (postId: string, feedback: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'rejected', rejectionFeedback: feedback } : p));
  };

  const handleEditClick = (postId: string) => {
    setEditingPostId(postId);
    setCurrentView('editor');
  };

  const navigateTo = (view: string) => {
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      
      {/* 1. SIDEBAR */}
      {currentView !== 'landing' && currentView !== 'login' && currentView !== 'register' && (
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="flex-center" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary)' }}>
              <Bot size={20} color="#fff" />
            </div>
            <span className="sidebar-logo-text">Autopilot AI</span>
          </div>

          <div className="sidebar-menu">
            <div className="sidebar-section-title">Operations</div>
            
            <a className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
              <LayoutDashboard size={18} />
              <span>Monitoring Panel</span>
            </a>
            
            <a className={`sidebar-item ${currentView === 'generator' ? 'active' : ''}`} onClick={() => navigateTo('generator')}>
              <Bot size={18} />
              <span>AI Content Engine</span>
            </a>

            <a className={`sidebar-item ${currentView === 'queue' ? 'active' : ''}`} onClick={() => navigateTo('queue')}>
              <CheckSquare size={18} />
              <span>Content Queue</span>
            </a>

            <a className={`sidebar-item ${currentView === 'editor' ? 'active' : ''}`} onClick={() => navigateTo('editor')}>
              <Edit3 size={18} />
              <span>Content Editor</span>
            </a>

            <a className={`sidebar-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => navigateTo('calendar')}>
              <CalendarIcon size={18} />
              <span>Content Calendar</span>
            </a>

            <div className="sidebar-section-title">Integrations</div>

            <a className={`sidebar-item ${currentView === 'linkedin' ? 'active' : ''}`} onClick={() => navigateTo('linkedin')}>
              <Link2 size={18} />
              <span>LinkedIn settings</span>
            </a>

            <a className={`sidebar-item ${currentView === 'whatsapp' ? 'active' : ''}`} onClick={() => navigateTo('whatsapp')}>
              <Smartphone size={18} />
              <span>WhatsApp Integration</span>
            </a>

            <div className="sidebar-section-title">Analytics & Billing</div>

            <a className={`sidebar-item ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => navigateTo('analytics')}>
              <TrendingUp size={18} />
              <span>Analytics & Metrics</span>
            </a>

            <a className={`sidebar-item ${currentView === 'pricing' ? 'active' : ''}`} onClick={() => navigateTo('pricing')}>
              <CreditCard size={18} />
              <span>Plans & Pricing</span>
            </a>

            <a className={`sidebar-item ${currentView === 'categories' ? 'active' : ''}`} onClick={() => navigateTo('categories')}>
              <Layers size={18} />
              <span>Categories</span>
            </a>

            <div className="sidebar-section-title">Settings</div>

            <a className={`sidebar-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => navigateTo('profile')}>
              <User size={18} />
              <span>User Profile</span>
            </a>

            <a className={`sidebar-item ${currentView === 'team' ? 'active' : ''}`} onClick={() => navigateTo('team')}>
              <Users size={18} />
              <span>Team Settings</span>
            </a>

            <a className={`sidebar-item ${currentView === 'aisettings' ? 'active' : ''}`} onClick={() => navigateTo('aisettings')}>
              <Sliders size={18} />
              <span>AI Configuration</span>
            </a>

            <a className={`sidebar-item ${currentView === 'notifications' ? 'active' : ''}`} onClick={() => navigateTo('notifications')}>
              <Bell size={18} />
              <span>Notifications Center</span>
            </a>

            <a className={`sidebar-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => navigateTo('history')}>
              <Folder size={18} />
              <span>Publishing History</span>
            </a>

            {userRole === 'super_admin' && (
              <a className={`sidebar-item ${currentView === 'admin' ? 'active' : ''}`} onClick={() => navigateTo('admin')}>
                <Database size={18} />
                <span>Super Admin</span>
              </a>
            )}
          </div>

          <div className="sidebar-footer">
            <div className="flex-center gap-sm">
              <Sun size={14} className="cursor-pointer" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Role: </span>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as any)}
                style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '0.75rem', fontWeight: 600 }}
              >
                <option value="end_user">End User</option>
                <option value="content_manager">Content Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <LogOut size={16} className="cursor-pointer" onClick={handleLogout} style={{ color: 'var(--status-error)' }} />
          </div>
        </aside>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="main-content">
        
        {/* TOP HEADER */}
        {currentView !== 'landing' && currentView !== 'login' && currentView !== 'register' && (
          <header className="top-header">
            <div className="flex-center gap-md">
              <h2 style={{ fontSize: '1.25rem' }}>Sandy Autopilot AI Panel</h2>
              
              {/* Autopilot active status */}
              {autopilotStatus === 'active' ? (
                <span className="badge badge-success flex-center gap-sm" style={{ animation: 'pulse 2s infinite' }}>
                  <Play size={12} />
                  <span>AUTOPILOT: ACTIVE</span>
                </span>
              ) : (
                <span className="badge badge-warning flex-center gap-sm">
                  <AlertCircle size={12} />
                  <span>AUTOPILOT: PAUSED</span>
                </span>
              )}

              {/* Active Approval Mode indicator */}
              <span className="badge badge-info">
                Mode: {approvalMode === 'full_approval' ? 'Full Approval' : approvalMode === 'weekly_approval' ? 'Weekly Approval' : 'Trusted AI'}
              </span>
            </div>
            <div className="flex-center gap-md">
              <button className="btn btn-secondary btn-sm" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <div className="badge badge-info flex-center gap-sm">
                <Sparkles size={12} />
                <span>Credits: 84 / 100</span>
              </div>
              <div className="avatar-placeholder" style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--brand-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {currentUser ? currentUser.fullName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() : 'JD'}
              </div>
            </div>
          </header>
        )}

        {/* VIEW ROUTING CONTROLLER */}
        <div className="view-container">

          {/* ==========================================
              1. LANDING PAGE
             ========================================== */}
          {currentView === 'landing' && (
            <div className="animate-fade-in" style={{ padding: '2rem 1rem' }}>
              <div className="flex-between" style={{ paddingBottom: '3rem' }}>
                <div className="flex-center gap-sm">
                  <Bot size={28} color="var(--brand-primary)" />
                  <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>LinkedIn Autopilot AI</h1>
                </div>
                <div className="flex-center gap-md">
                  <button className="btn btn-outline" onClick={() => navigateTo('login')}>Sign In</button>
                  <button className="btn btn-accent" onClick={() => navigateTo('register')}>Start Autopilot Free</button>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '6rem 0', maxWidth: '850px', margin: '0 auto' }}>
                <span className="badge badge-info" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  🤖 Fully Autonomous LinkedIn Employee
                </span>
                <h1 style={{ fontSize: '3.75rem', lineHeight: '1.15', fontWeight: 800, marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
                  A completely hands-off system. Zero writing or scheduling required.
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
                  Our AI researches daily topics, writes posts, forecasts reach, generates cards, and publishes directly. Spend less than 30 seconds per day reviewing drafts via simple WhatsApp clicks.
                </p>
                <div className="flex-center gap-md">
                  <button className="btn btn-accent btn-lg" onClick={() => navigateTo('register')} style={{ padding: '0.875rem 2rem', fontSize: '1.1rem' }}>
                    Launch Autopilot AI
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={() => navigateTo('login')}>
                    Sign In
                  </button>
                </div>
              </div>

              <div className="grid-3 mt-lg" style={{ paddingTop: '4rem' }}>
                <div className="card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--brand-accent-glow)', color: 'var(--brand-accent)', marginBottom: '1rem' }}>
                    <Bot size={24} />
                  </div>
                  <h3>Weekly Strategy Matrix</h3>
                  <p className="mt-md">Automatically aligns copy to daily topics: Insights Mondays, Case Study Wednesdays, Story Sundays, etc. without manual setup.</p>
                </div>

                <div className="card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', marginBottom: '1rem' }}>
                    <Smartphone size={24} />
                  </div>
                  <h3>WhatsApp-First Interface</h3>
                  <p className="mt-md">Approve, reject, pause, resume, change categories, or pull report logs via simple text commands directly from WhatsApp.</p>
                </div>

                <div className="card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)', marginBottom: '1rem' }}>
                    <Sliders size={24} />
                  </div>
                  <h3>3 Smart Approval Modes</h3>
                  <p className="mt-md">Choose Full Approval, Weekly batch confirmations, or activate Trusted AI mode to publish autonomously without review loops.</p>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              2. LOGIN SCREEN
             ========================================== */}
          {currentView === 'login' && (
            <div className="flex-center animate-fade-in" style={{ minHeight: '75vh' }}>
              <div className="card" style={{ width: '450px', padding: '2.5rem' }}>
                <div className="flex-center gap-sm mb-lg" style={{ flexDirection: 'column' }}>
                  <Bot size={36} color="var(--brand-primary)" />
                  <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>LinkedIn Autopilot Login</h2>
                  <p>Access your monitoring dashboard workspace</p>
                </div>

                {!showMfaPrompt ? (
                  <>
                    {/* Sub-tabs selector for Login Methods */}
                    <div className="tabs mb-lg" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span 
                        className={`tab ${loginMethod === 'email' ? 'active' : ''}`} 
                        onClick={() => setLoginMethod('email')}
                        style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '0.5rem 0', fontWeight: 600 }}
                      >
                        Email & Password
                      </span>
                      <span 
                        className={`tab ${loginMethod === 'otp' ? 'active' : ''}`} 
                        onClick={() => setLoginMethod('otp')}
                        style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '0.5rem 0', fontWeight: 600 }}
                      >
                        WhatsApp OTP
                      </span>
                    </div>

                    {loginMethod === 'email' ? (
                      <div className="animate-fade-in">
                        <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input 
                            type="email" 
                            className="form-input" 
                            placeholder="john@company.com" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Password</label>
                          <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                          <label className="flex-center gap-sm cursor-pointer">
                            <input type="checkbox" /> Keep logged in
                          </label>
                          <a href="#" style={{ color: 'var(--brand-accent)', textDecoration: 'none' }} onClick={async (e) => {
                            e.preventDefault();
                            if (!emailInput) { alert('Please enter your email first.'); return; }
                            try {
                              const res = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: emailInput })
                              });
                              const data = await res.json();
                              alert(data.message);
                            } catch {
                              alert('Backend offline.');
                            }
                          }}>Forgot Password?</a>
                        </div>

                        <button 
                          className="btn btn-accent" 
                          style={{ width: '100%', padding: '0.75rem' }}
                          onClick={handleLogin}
                        >
                          Login to Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <div className="form-group">
                          <label className="form-label">WhatsApp Number</label>
                          <div className="flex-center gap-sm">
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Enter your number" 
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                            />
                            <button className="btn btn-secondary" onClick={handleSendOtp}>Send Code</button>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Enter OTP Code</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="123456" 
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                          />
                          {debugOtp && (
                            <div style={{ 
                              marginTop: '0.75rem', 
                              padding: '0.75rem', 
                              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                              border: '1px solid #ffc107', 
                              borderRadius: 'var(--radius-sm)', 
                              fontSize: '0.8rem', 
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              animation: 'pulse 2s infinite'
                            }}>
                              <span>🔑 <strong>Sent Code:</strong> {debugOtp}</span>
                              <button 
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                onClick={() => setOtpInput(debugOtp)}
                              >
                                Auto-Fill
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <button className="btn btn-accent" style={{ width: '100%', padding: '0.75rem' }} onClick={handleVerifyOtp}>
                          Verify OTP & Authorize
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="flex-center gap-sm mb-md" style={{ color: 'var(--status-warning)' }}>
                      <Lock size={28} />
                      <h3 style={{ fontSize: '1.25rem' }}>MFA Verification Required</h3>
                    </div>
                    <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      Open your Google Authenticator app and enter the 6-digit verification code.
                    </p>
                    <div className="form-group">
                      <label className="form-label">Authenticator Code</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="000000" 
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                      />
                    </div>
                    <div className="flex-center gap-md">
                      <button className="btn btn-secondary" onClick={() => setShowMfaPrompt(false)}>Cancel</button>
                      <button className="btn btn-accent" onClick={() => navigateTo('dashboard')}>Verify & Authorize</button>
                    </div>
                  </div>
                )}
                
                <p className="mt-md" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                  New user? <a href="#" onClick={() => navigateTo('register')} style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>Create account</a>
                </p>
              </div>
            </div>
          )}

          {/* ==========================================
              3. REGISTRATION / SIGNUP SCREEN
             ========================================== */}
          {currentView === 'register' && (
            <div className="flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
              <div className="card" style={{ width: '550px', padding: '2.5rem' }}>
                <div className="flex-center gap-sm mb-lg" style={{ flexDirection: 'column' }}>
                  <Bot size={36} color="var(--brand-primary)" />
                  <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>Deploy Autopilot Autopilot</h2>
                  <p>Configure your workspace parameters in seconds</p>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="Jane Doe" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input type="text" className="form-input" placeholder="Acme SaaS Solutions" value={regOrgName} onChange={(e) => setRegOrgName(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="jane@company.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input type="text" className="form-input" value={regPhoneInput} onChange={(e) => setRegPhoneInput(e.target.value)} placeholder="Enter your number" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>This is the primary channel for approvals, commands, and weekly reports.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Industries (Onboarding Setup)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex-center gap-sm justify-start cursor-pointer" style={{ fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={['Technology', 'Artificial Intelligence', 'SaaS', 'Startups', 'Entrepreneurship'].includes(cat.name)} />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="btn btn-accent" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} onClick={handleRegister}>
                  Deploy Autopilot AI Employee
                </button>

                <p className="mt-md" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                  Already have an account? <a href="#" onClick={() => navigateTo('login')} style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>Login here</a>
                </p>
              </div>
            </div>
          )}

          {/* ==========================================
              4. MONITORING DASHBOARD (Hands-Off Focused)
             ========================================== */}
          {currentView === 'dashboard' && (
            <div className="animate-fade-in">
              
              {/* Alert to remind user dashboard is primarily for monitoring */}
              <div style={{ backgroundColor: 'var(--status-info-bg)', border: '1px solid var(--status-info)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Smartphone size={24} style={{ color: 'var(--status-info)' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>WhatsApp-First Control Mode Active</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    LinkedIn Autopilot operates autonomously in the background. Use the WhatsApp widget on the right to approve, reject, pause, or resume operations without dashboard logins.
                  </p>
                </div>
              </div>

              <div className="flex-between mb-lg">
                <div>
                  <h1>LinkedIn Autopilot Overview</h1>
                  <p>Real-time telemetry monitoring, strategy matrix states, and active queue health.</p>
                </div>
                <div className="flex-center gap-sm">
                  <a 
                    href="http://localhost:3000/api/v1/auth/export-csv" 
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none' }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📥 Export Users (Google Sheets)
                  </a>
                  <a 
                    href="http://localhost:3000/api/v1/auth/database-download" 
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none' }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    💾 Download database.sqlite
                  </a>
                  {autopilotStatus === 'active' ? (
                    <button className="btn btn-secondary" onClick={() => setAutopilotStatus('paused')}>
                      ⏸️ Pause Autopilot
                    </button>
                  ) : (
                    <button className="btn btn-accent" onClick={() => setAutopilotStatus('active')}>
                      ▶️ Resume Autopilot
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid-4 mb-lg">
                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--brand-accent-glow)', color: 'var(--brand-accent)' }}>
                    <Play size={24} />
                  </div>
                  <div>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Autopilot Status</span>
                    <div className="stat-value" style={{ textTransform: 'uppercase' }}>{autopilotStatus}</div>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' }}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Approval Mode</span>
                    <div className="stat-value" style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                      {approvalMode === 'full_approval' ? 'Full Approval' : approvalMode === 'weekly_approval' ? 'Weekly Approval' : 'Trusted AI'}
                    </div>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Frequency</span>
                    <div className="stat-value" style={{ textTransform: 'capitalize' }}>{postingFrequency.replace('_', ' ')}</div>
                  </div>
                </div>

                <div className="card stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Followers Growth</span>
                    <div className="stat-value">+842 Users</div>
                  </div>
                </div>
              </div>

              <div className="grid-2 mb-lg">
                {/* 1. Smart Approval Modes Configurator */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Smart Approval Settings</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label 
                      onClick={() => setApprovalMode('full_approval')}
                      className="card-interactive" 
                      style={{ 
                        display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        borderColor: approvalMode === 'full_approval' ? 'var(--brand-accent)' : 'var(--border-color)',
                        backgroundColor: approvalMode === 'full_approval' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                      }}
                    >
                      <input type="radio" checked={approvalMode === 'full_approval'} readOnly />
                      <div>
                        <strong>Mode 1: Full Approval (Recommended)</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Every generated LinkedIn post is held in queue. Dispatched via WhatsApp for one-click approval before publishing.
                        </span>
                      </div>
                    </label>

                    <label 
                      onClick={() => setApprovalMode('weekly_approval')}
                      className="card-interactive" 
                      style={{ 
                        display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        borderColor: approvalMode === 'weekly_approval' ? 'var(--brand-accent)' : 'var(--border-color)',
                        backgroundColor: approvalMode === 'weekly_approval' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                      }}
                    >
                      <input type="radio" checked={approvalMode === 'weekly_approval'} readOnly />
                      <div>
                        <strong>Mode 2: Weekly Approval Batch</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Generate 7 posts in a batch every Saturday. Approve the complete week's content schedule with a single WhatsApp text response.
                        </span>
                      </div>
                    </label>

                    <label 
                      onClick={() => setApprovalMode('trusted_ai')}
                      className="card-interactive" 
                      style={{ 
                        display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        borderColor: approvalMode === 'trusted_ai' ? 'var(--brand-accent)' : 'var(--border-color)',
                        backgroundColor: approvalMode === 'trusted_ai' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                      }}
                    >
                      <input type="radio" checked={approvalMode === 'trusted_ai'} readOnly />
                      <div>
                        <strong>Mode 3: Trusted AI Mode (Hands-off Autopilot)</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Bypasses all approval queues. AI automatically conducts research, drafts and proofreads copy, attaches assets, and publishes directly to LinkedIn.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 2. Weekly Content Strategy Matrix */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Weekly Content Strategy Matrix</h3>
                    <span className="badge badge-success">Active Plan</span>
                  </div>
                  
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                          <th style={{ padding: '0.5rem 0.25rem' }}>Day</th>
                          <th style={{ padding: '0.5rem 0.25rem' }}>Content Type</th>
                          <th style={{ padding: '0.5rem 0.25rem' }}>Daily Mission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyStrategyMatrix.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.625rem 0.25rem', fontWeight: 600 }}>{item.day}</td>
                            <td style={{ padding: '0.625rem 0.25rem' }}><span className="badge badge-info">{item.type}</span></td>
                            <td style={{ padding: '0.625rem 0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                {/* Pending queue item review */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Awaiting Approval Review</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('queue')}>Open Queue</button>
                  </div>
                  
                  {posts.filter(p => p.status === 'pending_approval').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>
                      <CheckCircle size={36} style={{ color: 'var(--status-success)', marginBottom: '0.5rem' }} />
                      <p>Autopilot queue is clear! Next post generates tomorrow morning.</p>
                    </div>
                  ) : (
                    posts.filter(p => p.status === 'pending_approval').map(post => (
                      <div key={post.id} className="card-interactive" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex-between">
                          <span className="badge badge-info">{post.category}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}><strong>Est. Reach:</strong> {post.estimatedReach}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', margin: '0.5rem 0' }}>{post.title}</h4>
                        <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>{post.linkedinCopy.slice(0, 150)}...</p>
                        <div className="flex-between">
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(post.id)}>Edit Copy</button>
                          <div className="flex-center gap-sm">
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectFromDashboard(post.id, 'Rejected via Dashboard')}>Reject</button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveFromDashboard(post.id)}>Approve Publish</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Account details */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="card-header">
                      <h3 className="card-title">Autopilot LinkedIn Profiles</h3>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('linkedin')}>Manage</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {linkedinAccounts.map(acc => (
                        <div key={acc.id} className="flex-between" style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block' }}>
                               {acc.id === 'acc-1' && currentUser ? `${currentUser.fullName} (Personal Profile)` : acc.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Type: {acc.type}</span>
                          </div>
                          <span className={`badge ${acc.connected ? 'badge-success' : 'badge-error'}`}>{acc.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-md" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bot size={20} color="var(--brand-accent)" />
                    <span style={{ fontSize: '0.825rem' }}>
                      <strong>Autopilot Recommendation:</strong> Industry insights on B2B SaaS received +38% engagement last week. Continuing focus.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              5. CATEGORIES ONBOARDING & MANAGEMENT
             ========================================== */}
          {currentView === 'categories' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Content Category Manager</h1>
                  <p>Select target categories, adjust frequency, and prioritize queues.</p>
                </div>
              </div>

              <div className="grid-3">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <h3 className="mb-md">Active Categories</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>Category Name</th>
                        <th style={{ padding: '0.75rem' }}>Priority</th>
                        <th style={{ padding: '0.75rem' }}>Posts per Week</th>
                        <th style={{ padding: '0.75rem' }}>Type</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{cat.name}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className={`badge ${cat.priority === 'High' ? 'badge-error' : cat.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                              {cat.priority}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>{cat.frequency} posts</td>
                          <td style={{ padding: '0.75rem' }}>{cat.isCustom ? 'Custom' : 'Predefined'}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                              setCategories(categories.filter(c => c.id !== cat.id));
                            }} style={{ padding: '0.25rem 0.5rem', color: 'var(--status-error)' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3 className="mb-md">Add Custom Category</h3>
                  <div className="form-group">
                    <label className="form-label">Category Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Developer Advocacy" 
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Set Priority</label>
                    <select className="form-input" id="priority-select">
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Posting Frequency (Weekly)</label>
                    <input type="number" className="form-input" defaultValue="4" min="1" max="14" id="frequency-input" />
                  </div>

                  <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleAddCategory}>
                    <Plus size={16} /> Register Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              6. CONTENT QUEUE
             ========================================== */}
          {currentView === 'queue' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Publishing & Content Queue</h1>
                  <p>Monitor pending articles, review feedback cycles, and see what is scheduled.</p>
                </div>
                <button className="btn btn-accent" onClick={() => navigateTo('generator')}>
                  <Bot size={16} /> Write With AI
                </button>
              </div>

              {/* Tabs */}
              <div className="tabs">
                <span className={`tab ${activeQueueTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveQueueTab('pending')}>
                  Pending Approval ({posts.filter(p => p.status === 'pending_approval').length})
                </span>
                <span className={`tab ${activeQueueTab === 'scheduled' ? 'active' : ''}`} onClick={() => setActiveQueueTab('scheduled')}>
                  Scheduled ({posts.filter(p => p.status === 'scheduled').length})
                </span>
                <span className={`tab ${activeQueueTab === 'published' ? 'active' : ''}`} onClick={() => setActiveQueueTab('published')}>
                  Published ({posts.filter(p => p.status === 'published').length})
                </span>
                <span className={`tab ${activeQueueTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveQueueTab('rejected')}>
                  Rejected ({posts.filter(p => p.status === 'rejected').length})
                </span>
              </div>

              {/* Queue Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {posts.filter(p => p.status === activeQueueTab || (activeQueueTab === 'pending' && p.status === 'pending_approval')).length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <p>No content records found matching this status.</p>
                  </div>
                ) : (
                  posts.filter(p => p.status === activeQueueTab || (activeQueueTab === 'pending' && p.status === 'pending_approval')).map(post => (
                    <div key={post.id} className="card">
                      <div className="flex-between">
                        <div className="flex-center gap-md">
                          <span className="badge badge-info">{post.category}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Source: {post.sourceType}</span>
                        </div>
                        <div>
                          {post.status === 'pending_approval' && <span className="badge badge-warning">Awaiting Approval (Est. Reach: {post.estimatedReach})</span>}
                          {post.status === 'scheduled' && <span className="badge badge-success">Scheduled for {post.scheduledTime}</span>}
                          {post.status === 'published' && <span className="badge badge-success">Published on {post.publishedAt}</span>}
                          {post.status === 'rejected' && <span className="badge badge-error">Rejected</span>}
                        </div>
                      </div>

                      <div className="grid-2 mt-md" style={{ gridTemplateColumns: '3fr 1fr' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{post.title}</h3>
                          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            {post.body.slice(0, 250)}...
                          </p>

                          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
                            <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--brand-primary)', display: 'block', marginBottom: '0.5rem' }}>LinkedIn Preview Layout</strong>
                            <p style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>{post.linkedinCopy}</p>
                            <div className="mt-md">
                              {post.hashtags.map((h, idx) => (
                                <span key={idx} style={{ color: 'var(--brand-primary)', marginRight: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>#{h}</span>
                              ))}
                            </div>
                          </div>

                          {post.rejectionFeedback && (
                            <div style={{ borderLeft: '4px solid var(--status-error)', paddingLeft: '1rem', margin: '1rem 0', fontStyle: 'italic', fontSize: '0.875rem' }}>
                              <strong>Feedback:</strong> {post.rejectionFeedback}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
                          <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                          
                          {post.status === 'pending_approval' && (
                            <>
                              <button className="btn btn-accent btn-sm" onClick={() => handleApproveFromDashboard(post.id)}>
                                <Check size={14} /> Approve Post
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(post.id)}>
                                <Edit3 size={14} /> Edit Content
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => {
                                const feed = prompt('Provide rejection reason:');
                                if (feed) handleRejectFromDashboard(post.id, feed);
                              }}>
                                <X size={14} /> Reject
                              </button>
                            </>
                          )}

                          {post.status === 'scheduled' && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => {
                                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published', publishedAt: 'Just Now', impressions: 0, engagement: 0 } : p));
                                alert('Published to LinkedIn URN sandbox successfully!');
                              }}>
                                <Play size={14} /> Post Instantly
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => {
                                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'pending_approval' } : p));
                              }}>
                                Move to Drafts
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              7. AI CONTENT GENERATOR
             ========================================== */}
          {currentView === 'generator' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>AI Blog & Post Generator</h1>
                  <p>Configure prompt directives, specify target news/RSS feeds, and watch AI build rich copy.</p>
                </div>
              </div>

              <div className="grid-3">
                <div className="card">
                  <h3 className="mb-md">Generation Parameters</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={aiGenCategory} onChange={(e) => setAiGenCategory(e.target.value)}>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Content Source Type</label>
                    <select className="form-input" value={aiGenSource} onChange={(e) => setAiGenSource(e.target.value)}>
                      <option value="trending_news">Trending Industry News (Google News API)</option>
                      <option value="rss_feed">RSS Feed Import</option>
                      <option value="url_scrape">Scrape Content from Website URL</option>
                      <option value="user_topic">User-defined Raw Topic</option>
                    </select>
                  </div>

                  {aiGenSource === 'url_scrape' && (
                    <div className="form-group animate-fade-in">
                      <label className="form-label">Website URL to Scrape</label>
                      <input type="text" className="form-input" placeholder="https://company.com/blog/article-source" />
                    </div>
                  )}

                  {aiGenSource === 'user_topic' && (
                    <div className="form-group animate-fade-in">
                      <label className="form-label">Topic Description / Keywords</label>
                      <textarea className="form-input" placeholder="e.g. Explain how database indexes accelerate SaaS metrics" rows={3}></textarea>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Brand Tone</label>
                    <select className="form-input" value={aiGenTone} onChange={(e) => setAiGenTone(e.target.value)}>
                      <option value="Professional">Professional / Corporate</option>
                      <option value="Thoughtful">Thoughtful Leadership</option>
                      <option value="Analytical">Analytical / Case Study</option>
                      <option value="Conversational">Conversational / Relatable</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Length Format</label>
                    <select className="form-input" value={aiGenLength} onChange={(e) => setAiGenLength(e.target.value)}>
                      <option value="Short Post">Short Post (~150 words)</option>
                      <option value="Medium Post">Medium Post (~300 words)</option>
                      <option value="Long-form Article">Long-form Blog Article (~1000 words)</option>
                      <option value="Carousel Content">Carousel Content slide-by-slide</option>
                    </select>
                  </div>

                  <button className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }} onClick={handleGenerateAI} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Generating Content Draft...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Run Autopilot Generation
                      </>
                    )}
                  </button>
                </div>

                <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
                  {isGenerating ? (
                    <div style={{ textAlign: 'center' }}>
                      <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--brand-accent)', marginBottom: '1.5rem' }} />
                      <h3>AI is scanning sources and drafting articles...</h3>
                      <p className="mt-sm">Applying LinkedIn-specific hook mechanics and SEO tags.</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                      <Bot size={64} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
                      <h3>Ready to Generate</h3>
                      <p className="mt-sm">Configure details on the left, then click Generate to populate drafts here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              8. CONTENT EDITOR
             ========================================== */}
          {currentView === 'editor' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Rich Content Editor</h1>
                  <p>Refine your AI output, run inline corrections, and view live LinkedIn layouts.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigateTo('queue')}>Back to Queue</button>
              </div>

              {(() => {
                const targetPost = posts.find(p => p.id === (editingPostId || 'post-101')) || posts[0];
                if (!targetPost) return <p>No post selected for editing.</p>;

                return (
                  <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div className="card">
                      <div className="form-group">
                        <label className="form-label">Blog Title</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={targetPost.title} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setPosts(posts.map(p => p.id === targetPost.id ? { ...p, title: val } : p));
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">LinkedIn Copy Editor</label>
                        <textarea 
                          className="form-input" 
                          rows={8} 
                          value={targetPost.linkedinCopy}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPosts(posts.map(p => p.id === targetPost.id ? { ...p, linkedinCopy: val } : p));
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Full Blog Article Body (HTML / Markdown Supported)</label>
                        <textarea 
                          className="form-input" 
                          rows={12} 
                          value={targetPost.body}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPosts(posts.map(p => p.id === targetPost.id ? { ...p, body: val } : p));
                          }}
                        />
                      </div>

                      {/* AI Toolbar Commands */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          const rewrite = `AI Refined Hook: Looking to scale? Here is our deep-dive analysis on building resilient pipelines.\n\n${targetPost.linkedinCopy}`;
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, linkedinCopy: rewrite } : p));
                        }}>
                          ✨ Rewrite Hook
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          const shortened = `${targetPost.linkedinCopy.slice(0, 100)}... #SaaS #AI`;
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, linkedinCopy: shortened } : p));
                        }}>
                          ✂️ Shorten Copy
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          const expanded = `${targetPost.linkedinCopy}\n\nOur telemetry metrics demonstrate that early detection patterns reduce infrastructure bloat.`;
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, linkedinCopy: expanded } : p));
                        }}>
                          ➕ Expand Copy
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          const withEmoji = `💡 ${targetPost.linkedinCopy} 🚀🚀`;
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, linkedinCopy: withEmoji } : p));
                        }}>
                          ⚡ Add Emojis
                        </button>
                        <button className="btn btn-accent btn-sm" onClick={() => {
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, status: 'scheduled', scheduledTime: 'Tomorrow at 09:00 AM' } : p));
                          alert('Post updated & scheduled!');
                          navigateTo('queue');
                        }}>
                          Save & Schedule
                        </button>
                      </div>
                    </div>

                    {/* Live Mobile LinkedIn Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            JD
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.875rem', display: 'block' }}>Jane Developer</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Software Architect @ Acme | 1st</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Just Now • 🌐</span>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>
                          {targetPost.linkedinCopy}
                        </p>

                        <div className="mt-sm">
                          {targetPost.hashtags.map((h, i) => (
                            <span key={i} style={{ color: 'var(--brand-primary)', fontSize: '0.85rem', marginRight: '0.25rem', fontWeight: 600 }}>#{h}</span>
                          ))}
                        </div>

                        {targetPost.imageUrl && (
                          <img src={targetPost.imageUrl} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem' }} />
                        )}

                        <div style={{ borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.25rem 0', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>👍 Like</span>
                          <span>💬 Comment</span>
                          <span>🔄 Repost</span>
                          <span>✉️ Send</span>
                        </div>
                      </div>
                      
                      <div className="card">
                        <h3>AI Image Generator</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0.5rem 0' }}>Generate professional illustrations or infographics for this post.</p>
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => {
                          alert('Generating Banner Asset with DALL-E 3 simulation...');
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800' } : p));
                        }}>
                          🎨 Draw Illustration Banner
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => {
                          alert('Generating Quote Card...');
                          setPosts(posts.map(p => p.id === targetPost.id ? { ...p, imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800' } : p));
                        }}>
                          📝 Draw Quote card banner
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ==========================================
              9. APPROVAL CENTER
             ========================================== */}
          {currentView === 'approval' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Approval Center</h1>
                  <p>Select a pending post below and execute quick approvals.</p>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 className="mb-md">Pending Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {posts.filter(p => p.status === 'pending_approval').map(post => (
                      <div 
                        key={post.id} 
                        className={`card-interactive ${selectedPostForApprovalId === post.id ? 'active' : ''}`}
                        onClick={() => setSelectedPostForApprovalId(post.id)}
                        style={{ 
                          padding: '1rem', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: 'var(--radius-md)', 
                          cursor: 'pointer',
                          borderColor: selectedPostForApprovalId === post.id ? 'var(--brand-accent)' : 'var(--border-color)',
                          backgroundColor: selectedPostForApprovalId === post.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                        }}
                      >
                        <div className="flex-between">
                          <span className="badge badge-info">{post.category}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{post.sourceType}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>{post.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Focus Preview Panel */}
                <div>
                  {(() => {
                    const post = posts.find(p => p.id === selectedPostForApprovalId);
                    if (!post) return <p>No post selected for preview.</p>;

                    return (
                      <div className="card">
                        <div className="flex-between mb-md">
                          <h3>Focus Preview</h3>
                          <span className="badge badge-warning">Awaiting Approval (Est. Reach: {post.estimatedReach})</span>
                        </div>

                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{post.title}</h2>
                        
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
                          <p style={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>{post.linkedinCopy}</p>
                          <div className="mt-sm">
                            {post.hashtags.map((h, idx) => (
                              <span key={idx} style={{ color: 'var(--brand-primary)', marginRight: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>#{h}</span>
                            ))}
                          </div>
                        </div>

                        <img src={post.imageUrl} alt="banner" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }} />

                        <div className="flex-center gap-md">
                          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => {
                            const comments = prompt('Enter rejection feedback:');
                            if (comments) handleRejectFromDashboard(post.id, comments);
                          }}>
                            Reject Post
                          </button>
                          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleEditClick(post.id)}>
                            Edit Draft
                          </button>
                          <button className="btn btn-accent" style={{ flex: 2 }} onClick={() => handleApproveFromDashboard(post.id)}>
                            Approve & Schedule
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              10. WHATSAPP SETTINGS SCREEN
             ========================================== */}
          {currentView === 'whatsapp' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>WhatsApp Integration Settings</h1>
                  <p>Register phone numbers, sync contacts from your account, and manage bulk broadcasts.</p>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="tabs">
                <span className={`tab ${whatsappTab === 'settings' ? 'active' : ''}`} onClick={() => setWhatsappTab('settings')}>
                  Autopilot Configuration
                </span>
                <span className={`tab ${whatsappTab === 'broadcast' ? 'active' : ''}`} onClick={() => setWhatsappTab('broadcast')}>
                  Contacts & One-Shot Broadcast ({syncedContacts.length} Synced)
                </span>
              </div>

              {whatsappTab === 'settings' ? (
                <div className="grid-2">
                  <div className="card">
                    <h3 className="mb-md">Configuration Details</h3>
                    <div className="form-group">
                      <label className="form-label">Twilio Sandbox Phone Number</label>
                      <input type="text" className="form-input" readOnly value="+91 9893854811" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>This is the sender server profile number.</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">User Target Number</label>
                      <input type="text" className="form-input" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Format strictly with country code (e.g. +15550192834).</span>
                    </div>

                    <div className="form-group">
                      <label className="flex-center gap-sm justify-start cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifChannels.whatsapp} 
                          onChange={(e) => setNotifChannels({ ...notifChannels, whatsapp: e.target.checked })} 
                        />
                        <strong>Enable Outbound SMS/WhatsApp Notifications</strong>
                      </label>
                    </div>

                    <div className="flex-center gap-sm">
                      <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => {
                        alert('Simulating WhatsApp notification test trigger...');
                        setWhatsappChat(prev => [
                          ...prev,
                          {
                            sender: 'bot',
                            text: `🔔 Test notification from LinkedIn Autopilot AI.\n\nConnection verified to terminal number: ${phoneInput}`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                      }}>
                        Send Verification SMS Text
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="mb-md">WhatsApp Autopilot Instruction Manual</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                      The platform functions primarily through text commands directly from WhatsApp:
                    </p>
                    
                    <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><code>PAUSE</code> / <code>RESUME</code>: Control active generation strategy status.</li>
                        <li><code>1</code> or <code>APPROVE</code>: Instantly schedule/approve latest draft.</li>
                        <li><code>3</code> or <code>REJECT</code>: Reject active draft from calendar queue.</li>
                        <li><code>4</code> or <code>REGENERATE</code>: Trigger immediate AI redrafting.</li>
                        <li><code>GENERATE NEW</code>: Force research and generate a new post now.</li>
                        <li><code>POST NOW</code>: Immediately publish the latest queued item.</li>
                        <li><code>SHOW ANALYTICS</code>: Receive weekly metrics dashboard summary via text.</li>
                      </ul>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Type any of these commands inside the phone widget on the right to interact with the platform!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid-2">
                  {/* Sync Contacts from user number +91 9893854811 */}
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex-between">
                      <h3>Sync Contacts Center</h3>
                      <span className="badge badge-info">Linked Number: +91 9893854811</span>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem' }}>
                      Simulate scanning and fetching all active contacts associated with your connected WhatsApp account.
                    </p>

                    <button className="btn btn-secondary" onClick={handleSyncContacts} disabled={isSyncingContacts}>
                      {isSyncingContacts ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} /> Fetching Contacts...
                        </>
                      ) : (
                        'Fetch Contacts from +91 9893854811'
                      )}
                    </button>

                    {syncedContacts.length > 0 && (
                      <div className="mt-md" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                              <th style={{ padding: '0.5rem' }}>Contact Name</th>
                              <th style={{ padding: '0.5rem' }}>Phone Number</th>
                            </tr>
                          </thead>
                          <tbody>
                            {syncedContacts.map((c, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem', fontWeight: 500 }}>{c.name}</td>
                                <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{c.phoneNumber}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Broadcast Composer */}
                  <div className="card">
                    <h3>One-Shot Bulk Broadcast</h3>
                    <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>
                      Compose a marketing alert or published article link, and broadcast it to all {syncedContacts.length} synced contacts in one shot.
                    </p>

                    <div className="form-group">
                      <label className="form-label">Broadcast Message Content</label>
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        placeholder="e.g. Check out our latest post about autonomous workflows on LinkedIn: http://autopilot.ai/post-101"
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                      />
                    </div>

                    <button 
                      className="btn btn-accent" 
                      style={{ width: '100%' }} 
                      onClick={handleBroadcastOneShot}
                      disabled={isBroadcasting || syncedContacts.length === 0}
                    >
                      {isBroadcasting ? 'Broadcasting...' : 'Broadcast One-Shot Message'}
                    </button>

                    {isBroadcasting && (
                      <div className="mt-md animate-fade-in">
                        <div className="flex-between mb-sm" style={{ fontSize: '0.85rem' }}>
                          <span>Sending Progress</span>
                          <strong>{broadcastProgress}%</strong>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem' }}>
                          <div style={{ width: `${broadcastProgress}%`, height: '100%', background: 'var(--brand-accent)' }} />
                        </div>
                      </div>
                    )}

                    {broadcastLogs.length > 0 && (
                      <div style={{ marginTop: '1rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: '120px', overflowY: 'auto' }}>
                        {broadcastLogs.map((log, i) => (
                          <div key={i} style={{ color: 'var(--status-success)' }}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              11. CALENDAR VIEW
             ========================================== */}
          {currentView === 'calendar' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Publishing Calendar</h1>
                  <p>Drag and reschedule marketing timelines across daily, weekly, or monthly calendars.</p>
                </div>
              </div>

              <div className="card">
                <div className="flex-between mb-md">
                  <div className="flex-center gap-sm">
                    <button className="btn btn-secondary btn-sm"><ChevronLeft size={16} /></button>
                    <strong>July 2026</strong>
                    <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
                  </div>
                  <div className="flex-center gap-sm">
                    <button className="btn btn-outline btn-sm">Day</button>
                    <button className="btn btn-outline btn-sm">Week</button>
                    <button className="btn btn-accent btn-sm">Month</button>
                  </div>
                </div>

                {/* Calendar Grid Mockup */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ textAlign: 'center', fontWeight: 600, padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{day}</div>
                  ))}
                  
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const date = idx + 1;
                    const dayPosts = posts.filter(p => p.status === 'scheduled');
                    
                    return (
                      <div key={idx} style={{ border: '1px solid var(--border-color)', minHeight: '100px', borderRadius: 'var(--radius-sm)', padding: '0.25rem', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', position: 'absolute', top: '4px', left: '4px' }}>{date}</span>
                        
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {date === 9 && dayPosts.map(post => (
                            <div 
                              key={post.id} 
                              onClick={() => navigateTo('queue')}
                              style={{ 
                                backgroundColor: 'var(--brand-accent-glow)', 
                                borderLeft: '3px solid var(--brand-accent)', 
                                padding: '2px 4px', 
                                fontSize: '0.75rem', 
                                borderRadius: '2px', 
                                cursor: 'pointer',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                              title={post.title}
                            >
                              {post.title}
                            </div>
                          ))}

                          {date === 7 && posts.filter(p => p.status === 'published').map(post => (
                            <div 
                              key={post.id} 
                              onClick={() => navigateTo('history')}
                              style={{ 
                                backgroundColor: 'var(--status-success-bg)', 
                                borderLeft: '3px solid var(--status-success)', 
                                padding: '2px 4px', 
                                fontSize: '0.75rem', 
                                borderRadius: '2px', 
                                cursor: 'pointer',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                              title={post.title}
                            >
                              Published Post
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              12. LINKEDIN INTEGRATION
             ========================================== */}
          {currentView === 'linkedin' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>LinkedIn Integration Panel</h1>
                  <p>Register OAuth connections, query company pages, and check validation states.</p>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 className="mb-md">Connected Accounts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {linkedinAccounts.map(acc => (
                      <div key={acc.id} className="flex-between" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <strong>
                            {acc.id === 'acc-1' && currentUser ? `${currentUser.fullName} (Personal Profile)` : acc.name}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Type: {acc.type}</div>
                        </div>
                        <div className="flex-center gap-sm">
                          <span className={`badge ${acc.connected ? 'badge-success' : 'badge-error'}`}>{acc.status}</span>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setLinkedinAccounts(linkedinAccounts.map(a => a.id === acc.id ? { ...a, connected: !a.connected, status: !a.connected ? 'Active' : 'Not Connected' } : a));
                            }}
                          >
                            {acc.connected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-accent mt-lg" style={{ width: '100%' }} onClick={() => {
                    alert('Redirecting to LinkedIn OAuth sandbox callback...');
                  }}>
                    Connect New Profile / Company Page
                  </button>
                </div>

                <div className="card">
                  <h3 className="mb-md">OAuth API Debug logs</h3>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.8rem', height: '200px', overflowY: 'auto' }}>
                    <p style={{ color: 'var(--status-success)' }}>[2026-07-08 14:00] OAuth token verified: Refresh token expiration: 2026-09-08</p>
                    <p>[2026-07-08 14:01] GET request to https://api.linkedin.com/v2/me -- Status 200 OK</p>
                    <p>[2026-07-08 14:02] Query user organization URN memberships returned 1 profile scope</p>
                    <p style={{ color: 'var(--status-warning)' }}>[2026-07-08 14:03] Token warning: URN token authorization scopes check passed.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              13. ANALYTICS
             ========================================== */}
          {currentView === 'analytics' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Analytics & Engagement Metrics</h1>
                  <p>Aggregate reports of impressions, click conversions, and subscriber development.</p>
                </div>
              </div>

              <div className="grid-3 mb-lg">
                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Total Impressions</span>
                  <div className="stat-value">12,840</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-success)' }}>▲ +24% week-on-week</span>
                </div>

                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Click Conversions</span>
                  <div className="stat-value">1,492</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-success)' }}>▲ +18% week-on-week</span>
                </div>

                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Follower Growth</span>
                  <div className="stat-value">+840</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-success)' }}>▲ +12% week-on-week</span>
                </div>
              </div>

              <div className="card mb-lg">
                <h3>Post Engagement Index</h3>
                <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1rem 2rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  {[40, 60, 45, 80, 55, 90, 70].map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%' }}>
                      <div style={{ height: `${val * 2}px`, width: '100%', background: 'linear-gradient(180deg, var(--brand-accent), var(--brand-primary))', borderRadius: '4px 4px 0 0' }} />
                      <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-tertiary)' }}>Day {idx+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="mb-md">Top Performing Articles</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      <th style={{ padding: '0.75rem' }}>Title</th>
                      <th style={{ padding: '0.75rem' }}>Impressions</th>
                      <th style={{ padding: '0.75rem' }}>Engagement</th>
                      <th style={{ padding: '0.75rem' }}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.filter(p => p.status === 'published').map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{p.title}</td>
                        <td style={{ padding: '0.75rem' }}>{p.impressions}</td>
                        <td style={{ padding: '0.75rem' }}>{p.engagement} interactions</td>
                        <td style={{ padding: '0.75rem' }}>{p.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              14. SUBSCRIPTION PLANS
             ========================================== */}
          {currentView === 'pricing' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg" style={{ flexDirection: 'column', textAlign: 'center' }}>
                <h1>Scale Your Content Autopilot</h1>
                <p>Choose the optimal resource allocation for your social media footprints.</p>
              </div>

              <div className="grid-4">
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <h3>Starter</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>$29<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/mo</span></div>
                    <p style={{ fontSize: '0.85rem' }}>Perfect for individuals starting with LinkedIn marketing.</p>
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li>30 generated posts / mo</li>
                      <li>1 LinkedIn Profile</li>
                      <li>Basic AI prompt tools</li>
                      <li>Single user seat</li>
                    </ul>
                  </div>
                  <button className="btn btn-secondary mt-lg" style={{ width: '100%' }}>Downgrade</button>
                </div>

                <div className="card" style={{ border: '2px solid var(--brand-accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
                  <span className="badge badge-error" style={{ position: 'absolute', top: '-12px', right: '12px' }}>RECOMMENDED</span>
                  <div>
                    <h3>Professional</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>$79<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/mo</span></div>
                    <p style={{ fontSize: '0.85rem' }}>Best choice for active personal brands and developers.</p>
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li>100 generated posts / mo</li>
                      <li>3 LinkedIn profiles/pages</li>
                      <li>WhatsApp notifications & approvals</li>
                      <li>SEO & keyword generator</li>
                    </ul>
                  </div>
                  <button className="btn btn-accent mt-lg" style={{ width: '100%' }}>Active Plan</button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <h3>Agency</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>$199<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/mo</span></div>
                    <p style={{ fontSize: '0.85rem' }}>For agencies managing multiple personal client brands.</p>
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li>300 generated posts / mo</li>
                      <li>10 LinkedIn connections</li>
                      <li>Full team management module</li>
                      <li>Advanced analytic audits</li>
                    </ul>
                  </div>
                  <button className="btn btn-secondary mt-lg" style={{ width: '100%' }}>Upgrade Plan</button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <h3>Enterprise</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>Custom</div>
                    <p style={{ fontSize: '0.85rem' }}>Dedicated resources, multi-tenant databases, and SLAs.</p>
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li>Unlimited AI drafts</li>
                      <li>Unlimited LinkedIn accounts</li>
                      <li>Custom compliance checks</li>
                      <li>Dedicated account manager</li>
                    </ul>
                  </div>
                  <button className="btn btn-secondary mt-lg" style={{ width: '100%' }}>Contact Sales</button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              15. USER PROFILE SCREEN
             ========================================== */}
          {currentView === 'profile' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>User Profile Settings</h1>
                  <p>Manage personal logins, secure accounts with MFA verification tools, and configure location timezones.</p>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 className="mb-md">Profile Details</h3>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" defaultValue="Jane Developer" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" defaultValue="jane@company.com" readOnly />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Timezone</label>
                    <select className="form-input" defaultValue="America/New_York">
                      <option value="America/New_York">EST (GMT-5)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Asia/Kolkata">IST (GMT+5:30)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <button className="btn btn-accent" onClick={() => alert('Profile updated successfully!')}>Update Settings</button>
                </div>

                <div className="card">
                  <h3 className="mb-md">Security & Multi-Factor Auth</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Add an extra layer of security by configuring an Authenticator app (MFA).</p>

                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {isMfaEnabled ? <Lock size={20} color="var(--status-success)" /> : <Unlock size={20} color="var(--status-warning)" />}
                    <span style={{ fontSize: '0.85rem' }}>MFA Status: <strong>{isMfaEnabled ? 'ENABLED' : 'DISABLED'}</strong></span>
                  </div>

                  <button 
                    className={`btn ${isMfaEnabled ? 'btn-danger' : 'btn-accent'}`}
                    onClick={() => {
                      setIsMfaEnabled(!isMfaEnabled);
                      alert(isMfaEnabled ? 'MFA disabled!' : 'MFA enabled! You will be prompted on next login.');
                    }}
                  >
                    {isMfaEnabled ? 'Deactivate MFA' : 'Activate 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              16. ADMIN DASHBOARD
             ========================================== */}
          {currentView === 'admin' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Super Admin Dashboard</h1>
                  <p>Global monitoring of AI API tokens, tenant logs, subscription levels, and publishing operations.</p>
                </div>
              </div>

              <div className="grid-3 mb-lg">
                <div className="card">
                  <h3>Total Tenants Registered</h3>
                  <div className="stat-value">1,482 Org Profiles</div>
                </div>

                <div className="card">
                  <h3>Monthly Recurring Revenue (MRR)</h3>
                  <div className="stat-value">$114,840.00</div>
                </div>

                <div className="card">
                  <h3>Total System Posts Published</h3>
                  <div className="stat-value">48,920 Shares</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3>Global Tenant Logs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                      <span className="text-secondary">[14:01:22]</span> <strong>Org-381 (SaaS Founders)</strong>: Generated LinkedIn hook (Model: gemini-1.5-pro)
                    </div>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                      <span className="text-secondary">[14:02:11]</span> <strong>Org-120 (Renewable Corp)</strong>: Dispatched WhatsApp SMS invite URN: 9812-X
                    </div>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                      <span className="text-secondary">[14:03:05]</span> <strong>Org-084 (Health Inc)</strong>: Token Refresh success on LinkedIn callback endpoint
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>System Status Indicators</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <li className="flex-between"><span>LinkedIn OAuth gateway:</span> <span className="badge badge-success">OPERATIONAL</span></li>
                    <li className="flex-between"><span>WhatsApp Business Webhook:</span> <span className="badge badge-success">OPERATIONAL</span></li>
                    <li className="flex-between"><span>Gemini API Node:</span> <span className="badge badge-success">OPERATIONAL</span></li>
                    <li className="flex-between"><span>Bull Queue Processor:</span> <span className="badge badge-success">OPERATIONAL</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              17. NOTIFICATION CENTER
             ========================================== */}
          {currentView === 'notifications' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Notifications Hub</h1>
                  <p>Control where alert signals route for content status changes or failures.</p>
                </div>
              </div>

              <div className="card" style={{ maxWidth: '600px' }}>
                <h3 className="mb-md">Routing Options</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <label className="flex-between cursor-pointer">
                    <div>
                      <strong>WhatsApp Notification Alerts</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Receive hooks for posts ready for approval.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifChannels.whatsapp} 
                      onChange={(e) => setNotifChannels({ ...notifChannels, whatsapp: e.target.checked })} 
                    />
                  </label>

                  <label className="flex-between cursor-pointer">
                    <div>
                      <strong>Standard Email Digests</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Weekly engagement summaries and statistics.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifChannels.email} 
                      onChange={(e) => setNotifChannels({ ...notifChannels, email: e.target.checked })} 
                    />
                  </label>

                  <label className="flex-between cursor-pointer">
                    <div>
                      <strong>Direct Push Messages</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>In-app notification banners on dashboard updates.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifChannels.push} 
                      onChange={(e) => setNotifChannels({ ...notifChannels, push: e.target.checked })} 
                    />
                  </label>
                </div>

                <button className="btn btn-accent mt-lg" onClick={() => alert('Preferences saved!')}>Save Configuration</button>
              </div>
            </div>
          )}

          {/* ==========================================
              18. PUBLISHING HISTORY
             ========================================== */}
          {currentView === 'history' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Publishing Log History</h1>
                  <p>Archived repository of all dispatched updates containing URN mappings and retry metrics.</p>
                </div>
              </div>

              <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      <th style={{ padding: '0.75rem' }}>Timestamp</th>
                      <th style={{ padding: '0.75rem' }}>Post Title</th>
                      <th style={{ padding: '0.75rem' }}>Target Account</th>
                      <th style={{ padding: '0.75rem' }}>Retries</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>LinkedIn Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.75rem' }}>2026-07-07 14:30</td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>Designing Ultra-Fast Frontend Frameworks...</td>
                      <td style={{ padding: '0.75rem' }}>Jane Dev (Profile)</td>
                      <td style={{ padding: '0.75rem' }}>0 retries</td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-success">Success</span></td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><a href="#" onClick={(e) => { e.preventDefault(); alert('Redirecting to sandbox share: urn:li:share:182hsa'); }} style={{ color: 'var(--brand-accent)' }}>View post</a></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.75rem' }}>2026-07-05 09:00</td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>SaaS Unit Economics: Master LTV/CAC ratios</td>
                      <td style={{ padding: '0.75rem' }}>Jane Dev (Profile)</td>
                      <td style={{ padding: '0.75rem' }}>1 retry</td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-success">Success</span></td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}><a href="#" onClick={(e) => { e.preventDefault(); alert('Redirecting to sandbox share: urn:li:share:8812hs'); }} style={{ color: 'var(--brand-accent)' }}>View post</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              19. AI SETTINGS
             ========================================== */}
          {currentView === 'aisettings' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>AI Configuration & Models</h1>
                  <p>Choose underlying core Large Language Models (LLM) or control image parameter sets.</p>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 className="mb-md">Model Selection</h3>

                  <div className="form-group">
                    <label className="form-label">Primary LLM Provider</label>
                    <select className="form-input" id="llm-select">
                      <option value="gemini-1.5-pro">(Recommended) Gemini 1.5 Pro</option>
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Banner Image Model</label>
                    <select className="form-input" id="image-model-select">
                      <option value="dall-e-3">OpenAI DALL-E 3</option>
                      <option value="imagen-2">Google Imagen 2</option>
                      <option value="sd-xl">Stable Diffusion XL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand Persona Directives</label>
                    <textarea 
                      className="form-input" 
                      rows={4} 
                      defaultValue="Acme focuses on developer-first software analytics. Ensure posts keep a high signal-to-noise ratio, avoid generic jargon, and focus on telemetry."
                    />
                  </div>

                  <button className="btn btn-accent" onClick={() => alert('AI model parameters successfully saved!')}>Save Settings</button>
                </div>

                <div className="card">
                  <h3>Credit Cost Breakdown</h3>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <li><strong>Blog Generation:</strong> 1 Credit per run</li>
                    <li><strong>Banner Image:</strong> 2 Credits per run</li>
                    <li><strong>AI Rewrite Toolbar:</strong> 0.2 Credits per call</li>
                    <li><strong>SEO Keyword analysis:</strong> Free</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              20. TEAM MANAGEMENT
             ========================================== */}
          {currentView === 'team' && (
            <div className="animate-fade-in">
              <div className="flex-between mb-lg">
                <div>
                  <h1>Team Settings & Seats</h1>
                  <p>Invite content collaborators, edit user levels, and manage tenant organizations.</p>
                </div>
              </div>

              <div className="grid-3">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <h3 className="mb-md">Active Collaborators</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem' }}>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Email</th>
                        <th style={{ padding: '0.75rem' }}>Role Permission</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{member.name}</td>
                          <td style={{ padding: '0.75rem' }}>{member.email}</td>
                          <td style={{ padding: '0.75rem' }}>{member.role}</td>
                          <td style={{ padding: '0.75rem' }}><span className="badge badge-success">{member.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3 className="mb-md">Invite Member</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="editor@company.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Workspace Role</label>
                    <select className="form-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                      <option value="Content Manager">Content Manager (Edit drafts & prioritize queue)</option>
                      <option value="End User">End User (View only + personal connect)</option>
                      <option value="Super Admin">Super Admin (Full controls)</option>
                    </select>
                  </div>

                  <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => {
                    if (!inviteEmail) return;
                    setTeamMembers([...teamMembers, { name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole, status: 'Active' }]);
                    setInviteEmail('');
                    alert('Invitation email sent!');
                  }}>
                    Send Invite
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          WHATSAPP CHAT SIMULATOR WIDGET (With presets)
         ========================================== */}
      {currentView !== 'landing' && currentView !== 'login' && currentView !== 'register' && (
        <div style={{ width: '320px', borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', height: '100vh', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0 }}>
          <div style={{ padding: '1rem', backgroundColor: '#075e54', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#25d366' }}></div>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block' }}>WhatsApp Sandbox</strong>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Autopilot AI Chatbot</span>
            </div>
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-primary)' }}>
            {whatsappChat.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  maxWidth: '85%', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#dcf8c6' : 'var(--bg-secondary)',
                  color: '#000',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
                <span style={{ display: 'block', textAlign: 'right', fontSize: '0.65rem', color: '#666', marginTop: '0.25rem' }}>{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick command presets for sandbox testing */}
          <div style={{ padding: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('PAUSE')} style={{ padding: '4px' }}>⏸️ PAUSE</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('RESUME')} style={{ padding: '4px' }}>▶️ RESUME</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('GENERATE NEW')} style={{ padding: '4px' }}>✨ GENERATE NEW</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('SHOW ANALYTICS')} style={{ padding: '4px' }}>📈 ANALYTICS</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('POST NOW')} style={{ padding: '4px', gridColumn: 'span 2' }}>🚀 POST NOW</button>
            <button className="btn btn-primary btn-sm" onClick={() => handleSendWhatsappMessage('AUTOPILOT RUN')} style={{ padding: '4px', gridColumn: 'span 2', backgroundColor: 'var(--brand-accent)', borderColor: 'var(--brand-accent)' }}>🤖 RUN AUTOPILOT</button>
          </div>

          {/* Traditional reply options */}
          <div style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('1')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', flex: 1 }}>1 (Approve)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('3')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', flex: 1 }}>3 (Reject)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSendWhatsappMessage('4')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', flex: 1 }}>4 (Regen)</button>
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Type command..." 
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsappMessage()}
              style={{ fontSize: '0.8rem', padding: '0.5rem' }}
            />
            <button className="btn btn-primary" onClick={() => handleSendWhatsappMessage()} style={{ padding: '0.5rem' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
