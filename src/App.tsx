import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Zap, 
  Trophy, 
  MessageSquare, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  LogOut,
  TrendingUp,
  Award,
  Send,
  BookOpen,
  Users,
  LayoutDashboard,
  ExternalLink,
  Lock,
  Smartphone,
  Globe,
  Star,
  Clock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface User {
  username: string;
  xp: number;
  level: string;
  total_score: number;
  games_played: number;
  badges: string[];
  difficulty_level: string;
  completed_guides: string[];
}

interface Question {
  type: 'scenario' | 'email' | 'link';
  title: string;
  description: string;
  data: any;
  scenario?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

interface LeaderboardEntry {
  username: string;
  xp: number;
  level: string;
}

interface Guide {
  title: string;
  content: string;
  tips: string[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

const GUIDES: Record<string, Guide> = {
  "Password Security": {
    title: "Password Security Masterclass",
    category: "Fundamentals",
    difficulty: "Beginner",
    estimatedTime: "5 min",
    content: "Passwords are the first line of defense in your digital life. A weak password is like leaving your front door unlocked. Modern hackers use 'brute force' attacks that can guess simple passwords in seconds.",
    tips: [
      "Use at least 12 characters with a mix of letters, numbers, and symbols.",
      "Avoid using personal information like birthdays or names.",
      "Use a unique password for every single account.",
      "Consider using a reputable Password Manager to store your credentials safely."
    ],
    quiz: {
      question: "Which of the following is the strongest password?",
      options: [
        "Password123!",
        "JohnDoe1985",
        "BlueSky2024",
        "Tr0ub4dur&3"
      ],
      correctAnswer: "Tr0ub4dur&3"
    }
  },
  "Mobile Safety": {
    title: "Securing Your Smartphone",
    category: "Device Safety",
    difficulty: "Intermediate",
    estimatedTime: "7 min",
    content: "Your phone contains your entire life—banking, messages, and photos. Mobile threats are rising, ranging from malicious apps to 'SIM swap' fraud where attackers steal your phone number.",
    tips: [
      "Only download apps from the official Google Play Store or Apple App Store.",
      "Keep your phone's operating system and apps updated to fix security holes.",
      "Be wary of 'Permissions'—does a calculator app really need access to your contacts?",
      "Enable 'Find My Device' so you can wipe your data if the phone is stolen."
    ],
    quiz: {
      question: "What is the safest way to download a new app on your phone?",
      options: [
        "Click a link in a helpful SMS",
        "Download from a third-party website",
        "Use the official App Store or Play Store",
        "Scan a QR code from a public poster"
      ],
      correctAnswer: "Use the official App Store or Play Store"
    }
  },
  "Safe Browsing": {
    title: "Navigating the Web Safely",
    category: "Web Security",
    difficulty: "Beginner",
    estimatedTime: "4 min",
    content: "The internet is full of traps. Phishing websites look exactly like your bank or social media login page, but they are designed to steal your credentials the moment you type them in.",
    tips: [
      "Always check the URL. 'bank.com' is safe, but 'bank-secure-login.net' is likely a scam.",
      "Look for the padlock icon and 'https://' in the address bar.",
      "Never click on suspicious links in emails or SMS messages.",
      "Use a browser that warns you about malicious websites."
    ],
    quiz: {
      question: "You see a link 'secure-login-hdfc.net' in an email. Is it safe?",
      options: [
        "Yes, it has 'secure' in the name",
        "Yes, it uses a .net domain",
        "No, official bank URLs are usually simpler like hdfcbank.com",
        "Yes, if the page looks exactly like the bank"
      ],
      correctAnswer: "No, official bank URLs are usually simpler like hdfcbank.com"
    }
  },
  "Two-Factor Auth": {
    title: "The Power of 2FA",
    category: "Advanced Defense",
    difficulty: "Advanced",
    estimatedTime: "6 min",
    content: "Two-Factor Authentication (2FA) adds a second layer of security. Even if a hacker steals your password, they still can't get into your account without the second code from your phone.",
    tips: [
      "Enable 2FA on all important accounts (Email, Banking, Social Media).",
      "Prefer Authenticator Apps (like Google Authenticator) over SMS codes.",
      "Save your 'Backup Codes' in a safe, physical location.",
      "Never share your 2FA or OTP code with anyone, even if they claim to be from support."
    ],
    quiz: {
      question: "A 'bank official' calls and asks for your OTP to verify a transaction. What should you do?",
      options: [
        "Give it to them immediately",
        "Ask for their employee ID first",
        "Refuse and hang up; banks never ask for OTP",
        "Give it if they sound professional"
      ],
      correctAnswer: "Refuse and hang up; banks never ask for OTP"
    }
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learning' | 'leaderboard'>('dashboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [guideQuizAnswer, setGuideQuizAnswer] = useState<string | null>(null);
  const [guideQuizFeedback, setGuideQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [manualDifficulty, setManualDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Adaptive'>('Adaptive');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const startChallenge = async (overrideDifficulty?: string) => {
    setGameMode(true);
    setLoading(true);
    const diff = overrideDifficulty || (manualDifficulty === 'Adaptive' ? '' : manualDifficulty);
    const url = diff ? `/api/generate-question?difficulty=${diff}` : '/api/generate-question';
    const res = await fetch(url);
    const data = await res.json();
    setCurrentQuestion(data);
    setLoading(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswer = async (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);

    const isCorrect = answer === currentQuestion?.correctAnswer;
    const baseXp = currentQuestion?.difficulty === 'Hard' ? 30 : currentQuestion?.difficulty === 'Medium' ? 20 : 10;
    const xpDelta = isCorrect ? baseXp : -baseXp;

    const res = await fetch('/api/update-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correct: isCorrect,
        xp_gained: xpDelta,
        difficulty: currentQuestion?.difficulty
      })
    });
    const data = await res.json();
    setUser(prev => prev ? { ...prev, ...data.user, badges: [...prev.badges, ...(data.newBadges || [])] } : null);
    fetchLeaderboard();
  };

  const handleGuideQuiz = async (answer: string) => {
    if (!selectedGuide || guideQuizFeedback) return;
    setGuideQuizAnswer(answer);
    
    if (answer === selectedGuide.quiz.correctAnswer) {
      setGuideQuizFeedback('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });
      try {
        const res = await fetch('/api/complete-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guideTitle: selectedGuide.title })
        });
        const data = await res.json();
        if (data.success) {
          setUser(prev => prev ? { ...prev, ...data.user } : null);
        }
      } catch (error) {
        console.error('Error completing guide:', error);
      }
    } else {
      setGuideQuizFeedback('incorrect');
      setTimeout(() => {
        setGuideQuizFeedback(null);
        setGuideQuizAnswer(null);
      }, 2000);
    }
  };

  const handleChat = async (e?: React.FormEvent, overrideMsg?: string) => {
    if (e) e.preventDefault();
    const msgToUse = overrideMsg || chatMessage;
    if (!msgToUse.trim()) return;

    const userMsg = msgToUse;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });
    const data = await res.json();
    setChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
    setIsChatting(false);
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  if (loading && !gameMode) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">GuardIQ</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Play Smart. Click Safe.</p>
            </div>
          </div>
          
          <nav className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto z-50 md:z-auto bg-black/80 md:bg-white/5 backdrop-blur-xl md:backdrop-blur-none p-2 md:p-1 border-t md:border border-white/10 md:border-white/5 flex items-center justify-around md:justify-start md:gap-1 md:rounded-xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${activeTab === 'dashboard' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-5 h-5 md:w-4 md:h-4" />
              <span className="md:inline">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('learning')}
              className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${activeTab === 'learning' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <BookOpen className="w-5 h-5 md:w-4 md:h-4" />
              <span className="md:inline">Learning</span>
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${activeTab === 'leaderboard' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Users className="w-5 h-5 md:w-4 md:h-4" />
              <span className="md:inline">Leaderboard</span>
            </button>
          </nav>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.username}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{user?.level}</p>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {gameMode ? (
            <motion.div 
              key="challenge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-8 flex items-center justify-between">
                <button 
                  onClick={() => setGameMode(false)}
                  className="text-sm text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Dashboard
                </button>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    currentQuestion?.difficulty === 'Hard' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    currentQuestion?.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {currentQuestion?.difficulty}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
                  <h3 className="text-xl font-bold mb-2">Generating Scenario...</h3>
                  <p className="text-zinc-500 text-sm">Our AI is crafting a realistic security challenge for you.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/20">
                      {currentQuestion?.type === 'email' ? <Send className="w-6 h-6 text-amber-500" /> :
                       currentQuestion?.type === 'link' ? <Globe className="w-6 h-6 text-amber-500" /> :
                       <AlertTriangle className="w-6 h-6 text-amber-500" />}
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2 leading-tight">{String(currentQuestion?.title || 'Security Challenge')}</h2>
                      <p className="text-zinc-400 text-sm">{String(currentQuestion?.description || '')}</p>
                    </div>

                    {currentQuestion?.type === 'email' && currentQuestion.data && (
                      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-8">
                        <div className="bg-white/5 p-4 border-b border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">From:</span>
                            <span className="text-sm text-zinc-300">{String(currentQuestion.data.from || '')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Subject:</span>
                            <span className="text-sm font-bold text-white">{String(currentQuestion.data.subject || '')}</span>
                          </div>
                        </div>
                        <div className="p-6 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                          {String(currentQuestion.data.body || '')}
                        </div>
                      </div>
                    )}

                    {currentQuestion?.type === 'link' && (
                      <div className="bg-black/40 rounded-2xl border border-white/10 p-6 mb-8 flex items-center gap-4">
                        <Globe className="w-8 h-8 text-zinc-500" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Target URL:</p>
                          <p className="text-sm font-mono text-emerald-500 break-all">{String(currentQuestion.data || '')}</p>
                        </div>
                      </div>
                    )}

                    {currentQuestion?.type === 'scenario' && (
                      <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                        <p className="text-zinc-300 leading-relaxed">
                          {typeof currentQuestion.data === 'string' 
                            ? currentQuestion.data 
                            : (currentQuestion.data?.message || currentQuestion.scenario || JSON.stringify(currentQuestion.data))}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4">
                      {currentQuestion?.options.map((option, i) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const showCorrect = showExplanation && isCorrect;
                        const showWrong = showExplanation && isSelected && !isCorrect;

                        return (
                          <button
                            key={i}
                            onClick={() => handleAnswer(option)}
                            disabled={showExplanation}
                            className={`p-6 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                              showCorrect ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                              showWrong ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                              isSelected ? 'bg-white/10 border-white/30 text-white' :
                              'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10'
                            }`}
                          >
                            <span className="font-medium">{option}</span>
                            {showCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            {showWrong && <XCircle className="w-5 h-5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
                      >
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            selectedAnswer === currentQuestion?.correctAnswer ? 'bg-emerald-500/20' : 'bg-red-500/20'
                          }`}>
                            {selectedAnswer === currentQuestion?.correctAnswer ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">
                              {selectedAnswer === currentQuestion?.correctAnswer ? 'Perfectly Handled!' : 'Security Breach!'}
                            </h4>
                            <p className="text-zinc-400 text-sm leading-relaxed mt-2">
                              {currentQuestion?.explanation}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => startChallenge()}
                            className="flex-1 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                          >
                            Next Challenge
                          </button>
                          <button 
                            onClick={() => setGameMode(false)}
                            className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                          >
                            Finish Session
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Stats & Progress */}
              <div className="lg:col-span-12 space-y-8">
                {/* Level Progress */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TrendingUp className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">{user?.level}</h2>
                          <p className="text-zinc-400 text-sm">Current Rank</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-mono font-bold text-emerald-500">{user?.xp} <span className="text-sm text-zinc-500 font-sans">XP</span></p>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Progress</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((user?.xp || 0) % 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          <span>0 XP</span>
                          <span>Next Rank: {user?.xp! < 100 ? 'Defender' : user?.xp! < 300 ? 'Cyber Guard' : 'Cyber Guardian'}</span>
                          <span>100 XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Ready to Defend?</h3>
                      <p className="text-zinc-400 text-sm mb-6">Start a new security challenge and test your instincts.</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {['Adaptive', 'Easy', 'Medium', 'Hard'].map((d) => (
                          <button
                            key={d}
                            onClick={() => setManualDifficulty(d as any)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              manualDifficulty === d 
                                ? 'bg-emerald-500 border-emerald-500 text-black' 
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => startChallenge()}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      Play Now
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </section>

                {/* Daily Challenge & Stats */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-indigo-500/40 transition-all">
                    <div>
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                        <Zap className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Daily Challenge</h3>
                      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Recognize fake verification messages and OTP scams. Stay one step ahead.</p>
                    </div>
                    <button 
                      onClick={() => startChallenge()}
                      className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                      Play for +25 XP bonus
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-2xl font-mono font-bold">{user?.total_score}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Score</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-2xl font-mono font-bold">{user?.games_played}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Games Played</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-2xl font-mono font-bold">{user?.badges.length}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Badges Earned</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-lg font-bold text-emerald-500">{user?.difficulty_level}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Current Diff</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Badges */}
                <section className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    Unlocked Badges
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {['First Steps', 'Century', 'Cyber Scout', 'Perfect Round', 'Quick Thinker', 'Triple Threat'].map((badge) => {
                      const isUnlocked = user?.badges.includes(badge);
                      return (
                        <div 
                          key={badge}
                          className={`px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all ${
                            isUnlocked 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-white/5 border-white/5 text-zinc-600 grayscale'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                            <Trophy className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold">{badge}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : activeTab === 'learning' ? (
            <motion.div 
              key="learning"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-8">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Learning Hub</h2>
                      <p className="text-zinc-400 max-w-xl">Master the basics of digital safety with our curated guides and interactive knowledge checks.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Your Progress</p>
                        <p className="text-lg font-bold text-emerald-500">{user?.completed_guides.length || 0} / {Object.keys(GUIDES).length} Guides</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Trophy className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                    {[
                      { icon: Lock, title: "Password Security", desc: "Learn how to create unhackable passwords and use managers.", color: "text-blue-500", bg: "bg-blue-500/10" },
                      { icon: Smartphone, title: "Mobile Safety", desc: "Protect your device from malicious apps and fake SMS.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { icon: Globe, title: "Safe Browsing", desc: "Identify phishing websites and secure your connection.", color: "text-amber-500", bg: "bg-amber-500/10" },
                      { icon: Shield, title: "Two-Factor Auth", desc: "Add an extra layer of security to your important accounts.", color: "text-indigo-500", bg: "bg-indigo-500/10" }
                    ].map((item, i) => {
                      const guideData = GUIDES[item.title];
                      const isCompleted = user?.completed_guides.includes(item.title);
                      
                      return (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -4 }}
                          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all group flex flex-col justify-between relative overflow-hidden"
                        >
                          {isCompleted && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                              Completed
                            </div>
                          )}
                          
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                                <item.icon className={`w-7 h-7 ${item.color}`} />
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-1 ${
                                  guideData?.difficulty === 'Beginner' ? 'text-emerald-400 bg-emerald-400/10' :
                                  guideData?.difficulty === 'Intermediate' ? 'text-amber-400 bg-amber-400/10' :
                                  'text-red-400 bg-red-400/10'
                                }`}>
                                  {guideData?.difficulty}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {guideData?.estimatedTime}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-6">
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{guideData?.category}</p>
                              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                              <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <button 
                              onClick={() => {
                                setSelectedGuide(GUIDES[item.title]);
                                setGuideQuizAnswer(null);
                                setGuideQuizFeedback(null);
                              }}
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all"
                            >
                              <BookOpen className="w-4 h-4" />
                              Read Guide
                            </button>
                            
                            {isCompleted ? (
                              <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-xs font-bold">+15 XP</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-zinc-500">
                                <Star className="w-4 h-4" />
                                <span className="text-xs font-bold">Earn 15 XP</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <Target className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold">Learning Milestones</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Complete 1 Guide", progress: user?.completed_guides.length! >= 1 ? 100 : 0, xp: 10 },
                        { label: "Complete All Beginner Guides", progress: (user?.completed_guides.filter(g => GUIDES[g]?.difficulty === 'Beginner').length || 0) / 2 * 100, xp: 25 },
                        { label: "Master All Topics", progress: (user?.completed_guides.length || 0) / Object.keys(GUIDES).length * 100, xp: 50 }
                      ].map((milestone, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300 font-medium">{milestone.label}</span>
                            <span className="text-emerald-500 font-bold">+{milestone.xp} XP</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className="h-full bg-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${milestone.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8">
                    <h4 className="font-bold text-emerald-500 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Quick Tip
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                      Never share your OTP or UPI PIN with anyone, even if they claim to be from your bank. Banks will never ask for these details over a call.
                    </p>
                    <div className="pt-6 border-t border-emerald-500/20">
                      <h5 className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-4">External Resources</h5>
                      <ul className="space-y-3">
                        {[
                          { name: "Cyber Crime Portal", url: "https://cybercrime.gov.in" },
                          { name: "CERT-In Alerts", url: "https://www.cert-in.org.in" },
                          { name: "RBI Safety Guide", url: "https://rbi.org.in" }
                        ].map((link, i) => (
                          <li key={i}>
                            <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white flex items-center justify-between group">
                              {link.name}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Top Defenders</h2>
                <p className="text-zinc-400">The most vigilant guardians in our community.</p>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-12 p-6 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Guardian</div>
                  <div className="col-span-3">Rank</div>
                  <div className="col-span-2 text-right">XP</div>
                </div>
                <div className="divide-y divide-white/5">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className={`grid grid-cols-12 p-6 items-center transition-colors hover:bg-white/5 ${entry.username === user?.username ? 'bg-emerald-500/5' : ''}`}>
                      <div className="col-span-1 font-mono text-zinc-500">{i + 1}</div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-amber-500/20 text-amber-500' :
                          i === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                          i === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-white/5 text-zinc-500'
                        }`}>
                          {entry.username.charAt(0)}
                        </div>
                        <span className="font-bold">{entry.username}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs px-2 py-1 bg-white/5 rounded-full border border-white/5 text-zinc-400">
                          {entry.level}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-emerald-500">
                        {entry.xp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center">
                <p className="text-sm text-zinc-400 mb-4">You are currently at <span className="text-white font-bold">#{leaderboard.findIndex(e => e.username === user?.username) + 1 || '?'}</span> place.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"
                >
                  Climb the Ranks
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group ${
            isChatOpen ? 'bg-zinc-800 text-white' : 'bg-emerald-500 text-black shadow-emerald-500/20'
          }`}
        >
          {isChatOpen ? <XCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuide(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold">{selectedGuide.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedGuide(null)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Overview</h4>
                  <p className="text-zinc-300 leading-relaxed text-lg italic">
                    "{selectedGuide.content}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Actionable Tips</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedGuide.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-2">Vigilance Check:</p>
                  <p className="text-sm text-zinc-300">
                    Most security breaches happen due to human error. By following these guides, you're already safer than 90% of internet users.
                  </p>
                </div>

                {/* Quiz Section */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Knowledge Check</h4>
                    {user?.completed_guides.includes(selectedGuide.title) && (
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        +15 XP Earned
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <p className="text-white font-bold mb-6">{selectedGuide.quiz.question}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedGuide.quiz.options.map((option, i) => {
                        const isSelected = guideQuizAnswer === option;
                        const isCorrect = option === selectedGuide.quiz.correctAnswer;
                        const isCompleted = user?.completed_guides.includes(selectedGuide.title);
                        
                        let buttonClass = "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10";
                        if (isSelected || (isCompleted && isCorrect)) {
                          if (isCorrect) buttonClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                          else buttonClass = "bg-red-500/20 border-red-500/50 text-red-400";
                        }

                        return (
                          <button
                            key={i}
                            disabled={!!guideQuizFeedback || isCompleted}
                            onClick={() => handleGuideQuiz(option)}
                            className={`p-4 rounded-xl text-left border text-sm transition-all flex items-center justify-between group ${buttonClass}`}
                          >
                            <span>{option}</span>
                            {(isSelected || (isCompleted && isCorrect)) && (
                              isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/20 border-t border-white/5">
                <button 
                  onClick={() => setSelectedGuide(null)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all"
                >
                  {user?.completed_guides.includes(selectedGuide.title) ? "Guide Completed" : "I've Read and Understood"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chatbot Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 md:left-auto md:right-8 md:bottom-24 z-[110] h-[60vh] md:h-[600px] md:w-[400px] bg-zinc-900 border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
              {/* Mobile Handle */}
              <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              {/* Chat Header */}
              <div className="p-6 pt-2 md:pt-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">Cyber Assistant</h3>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Always Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setChatHistory([])}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
                    title="Clear Chat"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Shield className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="font-bold text-white mb-2">Welcome to Cyber Awareness!</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed px-4">
                      I'm your digital safety companion. This platform is designed to help you stay safe in the digital world through:
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                    <h5 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Core Features:</h5>
                    <ul className="text-xs space-y-2 text-zinc-400">
                      <li className="flex items-start gap-2">
                        <Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        <span><strong className="text-zinc-200">AI Challenges:</strong> Play realistic scam scenarios (UPI, OTP, Phishing) that adapt to your skill level.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BookOpen className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                        <span><strong className="text-zinc-200">Learning Hub:</strong> Access curated guides on password security, mobile safety, and more.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong className="text-zinc-200">Leaderboard:</strong> Compete with other defenders and climb the ranks from Rookie to Cyber Guardian.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
                        <span><strong className="text-zinc-200">XP & Badges:</strong> Earn experience points and unlock unique badges for your achievements.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Emergency Contacts:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-300">National Cyber Crime Helpline</p>
                      <a href="tel:1930" className="text-sm font-bold text-red-500 hover:underline">1930</a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Quick Questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "How to report a scam?",
                        "What is UPI fraud?",
                        "Explain Digital Arrest",
                        "How to earn XP?"
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleChat(undefined, q)}
                          className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-all text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-zinc-300 rounded-tl-none'
                  }`}>
                    {String(msg.text || '')}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChat} className="p-4 border-t border-white/5 bg-black/20">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about a scam..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatMessage.trim() || isChatting}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl flex items-center justify-center transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
