import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import {
  Bot,
  Send,
  User,
  Terminal,
  RotateCcw,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: number | string;
  sender: 'user' | 'ai';
  message: string;
  formula?: string | null;
  code_snippet?: string | null;
  created_at?: string;
  suggestedFollowUps?: string[];
}

marked.setOptions({
  gfm: true,
  breaks: true,
});

const SAFE_MARKDOWN_TAGS = new Set([
  'A', 'BLOCKQUOTE', 'BR', 'CODE', 'EM', 'H1', 'H2', 'H3', 'H4', 'HR',
  'LI', 'OL', 'P', 'PRE', 'STRONG', 'UL',
]);
const DROP_MARKDOWN_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'FORM']);

function renderSafeMarkdown(markdown: string): string {
  const parsed = new DOMParser().parseFromString(marked.parse(markdown) as string, 'text/html');
  const safeRoot = document.createElement('div');

  const copySafeNode = (source: Node, destination: Node) => {
    if (source.nodeType === Node.TEXT_NODE) {
      destination.appendChild(document.createTextNode(source.textContent || ''));
      return;
    }
    if (!(source instanceof Element)) return;
    const tag = source.tagName.toUpperCase();
    if (DROP_MARKDOWN_TAGS.has(tag)) return;
    if (!SAFE_MARKDOWN_TAGS.has(tag)) {
      source.childNodes.forEach((child) => copySafeNode(child, destination));
      return;
    }

    const safeElement = document.createElement(tag.toLowerCase());
    if (tag === 'A') {
      const href = source.getAttribute('href') || '';
      try {
        const parsedUrl = new URL(href, window.location.origin);
        if (['https:', 'http:', 'mailto:'].includes(parsedUrl.protocol)) {
          safeElement.setAttribute('href', parsedUrl.href);
          safeElement.setAttribute('rel', 'noopener noreferrer');
          safeElement.setAttribute('target', '_blank');
        }
      } catch {
        // Invalid or unsafe URLs are rendered as plain text.
      }
    }
    source.childNodes.forEach((child) => copySafeNode(child, safeElement));
    destination.appendChild(safeElement);
  };

  parsed.body.childNodes.forEach((node) => copySafeNode(node, safeRoot));
  return safeRoot.innerHTML;
}

export const AiTutorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchTutorStatus = async () => {
    try {
      const res = await api.get('/tutor/status');
      setAiConfigured(res.data.ai_configured);
      setStatusNotice(res.data.notice);
    } catch {
      setAiConfigured(false);
      setStatusNotice('Tutor status is unavailable. Check that the backend is running.');
    }
  };

  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get('/tutor/history');
      setMessages(res.data);
    } catch (err) {
      console.warn('Could not fetch chat history:', err);
      setStatusNotice('Chat history could not be loaded. Check your connection and try again.');
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchTutorStatus();
    fetchChatHistory();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      message: text.trim(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post('/tutor/chat', {
        message: text.trim(),
        topic_context: 'Artificial Intelligence & Computer Science',
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (err: any) {
      console.error('AI Tutor request failed:', err);
      const detailMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'The AI Tutor request timed out. Google Gemini servers took longer than expected to respond. Please try asking again.'
          : 'Unable to connect to the AI Tutor backend. Please make sure the backend server is running and try again.');

      const errorReply: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        message: `⚠️ **AI Tutor Error**: ${detailMsg}`,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = async () => {
    if (!confirm('Are you sure you want to clear this conversation history?')) return;
    try {
      await api.delete('/tutor/history');
      await fetchChatHistory();
    } catch {
      setStatusNotice('Chat history could not be cleared. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* AI Tutor Session Header */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-indigo-600 to-brand-violet flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">LearnPath Socratic AI Tutor</h1>
              <span className={`flex h-2 w-2 rounded-full ${aiConfigured ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${aiConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {aiConfigured ? 'Google Gemini Live' : 'Gemini Unavailable'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>Socratic Explanations • Math Formulas • Code Walkthroughs</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>
      </div>

      {/* API Key Status Notice */}
      {!aiConfigured && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-300">Live AI Configuration Status:</p>
            <p className="text-[11px] text-amber-200/90">
              {statusNotice || "GEMINI_API_KEY is not set. The platform is using structured Socratic responses. To connect real Google Gemini AI, set GEMINI_API_KEY in backend/.env or your environment."}
            </p>
          </div>
        </div>
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 bg-navy-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAi
                      ? 'bg-gradient-to-tr from-brand-blue to-brand-violet text-white shadow-md'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isAi
                      ? 'bg-navy-950/80 border border-slate-800 text-slate-200'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="font-semibold text-indigo-300">
                      {isAi ? 'LearnPath AI Tutor' : 'You'}
                    </span>
                    {msg.created_at && (
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {isAi ? (
                    <div
                      className="tutor-markdown"
                      dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(msg.message) }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  )}

                  {/* Math Formula if present */}
                  {msg.formula && (
                    <div className="mt-3 p-2.5 rounded-lg bg-navy-900 border border-indigo-500/30 font-mono text-xs text-indigo-300 overflow-x-auto">
                      {msg.formula}
                    </div>
                  )}

                  {/* Code Snippet if present */}
                  {msg.code_snippet && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                      <div className="bg-slate-900 px-3 py-1 text-[11px] text-slate-400 flex items-center gap-1.5 border-b border-slate-800 font-mono">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>code / derivation</span>
                      </div>
                      <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                        <code>{msg.code_snippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {isAi && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Suggested Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            className="text-left text-xs bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-200 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1"
                          >
                            <span>{prompt}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-navy-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-indigo-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AI Tutor is reasoning through explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-navy-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a conceptual question, request an analogy, or paste a code error..."
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
