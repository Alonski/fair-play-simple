import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { app, db } from '@services/firebase';
import { useAuthStore } from '@stores/authStore';
import { Button } from '@components/catalyst/button';
import { Textarea } from '@components/catalyst/textarea';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
  isSummary?: boolean;
}

type ChatMode = 'private' | 'shared';

const functions = app ? getFunctions(app) : null;

export default function ChatScreen() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const profile = useAuthStore((s) => s.profile);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('shared');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = 'Chat — Fair Play';
  }, []);

  // Subscribe to chat messages from Firestore
  useEffect(() => {
    if (!db || !userId) return;

    const colRef = chatMode === 'shared'
      ? collection(db, 'households', 'shared', 'chats', 'shared', 'messages')
      : collection(db, 'users', userId, 'chats', 'private', 'messages');

    const q = query(
      colRef,
      orderBy('createdAt', 'asc'),
      limit(100),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          content: data.content?.[0]?.text || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
          isSummary: data.isSummary,
        };
      });
      setMessages(msgs);
    }, (err) => {
      console.error('Chat listener error:', err);
    });

    return unsubscribe;
  }, [userId, chatMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !functions) return;

    setInput('');
    setLoading(true);

    // Optimistic UI — add user message immediately
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const callable = httpsCallable<
        { message: string; chatMode: ChatMode; userId: string; householdId: string },
        { response: string }
      >(functions, 'chat');

      await callable({
        message: text,
        chatMode,
        userId,
        householdId: profile?.householdId || 'shared',
      });
      // Response will come via the Firestore onSnapshot listener
    } catch (err) {
      console.error('Chat error:', err);
      // Remove the optimistic message before adding error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          content: t('chat.error', 'Sorry, something went wrong. Please try again.'),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-3 bg-paper/80 dark:bg-paper/90">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-concrete mb-1">
          {t('chat.title', 'Fair Play Expert')}
        </p>
        <h1 className="text-3xl font-display font-bold text-ink leading-tight mb-3">
          {t('chat.heading', 'Chat')}
        </h1>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1" role="tablist">
          {(['shared', 'private'] as const).map((mode) => (
            <button
              key={mode}
              role="tab"
              aria-selected={chatMode === mode}
              onClick={() => setChatMode(mode)}
              className={`flex-1 py-2 rounded-[10px] text-sm font-display font-bold transition-all ${
                chatMode === mode
                  ? 'bg-white dark:bg-white/15 shadow-soft-sm text-ink'
                  : 'text-concrete hover:bg-white/50 active:scale-[0.98]'
              }`}
            >
              {mode === 'shared' ? t('chat.shared', 'Shared') : t('chat.private', 'Private')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="text-4xl mb-3">💬</span>
            <p className="font-display font-bold text-ink text-lg mb-1">
              {t('chat.empty', 'Ask your Fair Play Expert')}
            </p>
            <p className="text-sm text-concrete font-body leading-relaxed max-w-xs">
              {t('chat.emptyHint', 'Ask about cards, get rebalancing advice, or learn about the Fair Play method.')}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-body leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-partner-a text-white rounded-br-md'
                  : msg.isSummary
                    ? 'bg-accent/10 text-concrete italic rounded-bl-md'
                    : 'bg-white dark:bg-white/10 text-ink border border-gray-100 dark:border-white/10 rounded-bl-md'
              }`}
            >
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-concrete/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-concrete/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-concrete/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 bg-paper/80 dark:bg-paper/90">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder', 'Ask about your cards...')}
              rows={1}
              resizable={false}
              disabled={loading}
            />
          </div>
          <Button
            color="partner-a"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="shrink-0 !px-3"
          >
            ↑
          </Button>
        </div>
      </div>
    </div>
  );
}
