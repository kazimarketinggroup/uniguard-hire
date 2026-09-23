import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { MessageSquare, Search, Send, Pencil, Trash2, Check, X, CheckCheck, ShieldCheck } from 'lucide-react';
import { initialsOf } from '../common/recruitmentStages';

export const AdminChatView: React.FC = () => {
  const {
    applicants,
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    markConversationRead,
    messagesByApplication,
    showToast,
    isAuditor,
  } = useRecruitment();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(() => {
    const withMessages = applicants
      .map(a => ({
        applicant: a,
        msgs: messagesByApplication(a.id),
        last: messagesByApplication(a.id).slice(-1)[0],
        unread: messagesByApplication(a.id).filter(m => m.sender === 'user' && !m.readByAdmin).length,
      }))
      .filter(c => c.msgs.length > 0 || c.applicant.email);
    return withMessages
      .filter(c =>
        c.applicant.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.applicant.email.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (b.last?.createdAt || b.applicant.appliedDate || '').localeCompare(a.last?.createdAt || a.applicant.appliedDate || ''));
  }, [applicants, messages, search]);

  useEffect(() => {
    if (!selectedId) return;
    markConversationRead(selectedId, true);
  }, [selectedId, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, messages, editingId]);

  const active = conversations.find(c => c.applicant.id === selectedId) || null;

  const handleSend = () => {
    if (!selectedId || !draft.trim()) return;
    sendMessage(selectedId, draft, 'admin');
    setDraft('');
  };

  const handleEditSave = () => {
    if (editingId && editingText.trim()) {
      editMessage(editingId, editingText);
    }
    setEditingId(null);
    setEditingText('');
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
    showToast('Message Deleted', 'The message was removed.', 'info');
  };

  const timeLabel = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            <span>Candidate Messaging</span>
            {isAuditor && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0F172A] text-amber-400 border border-slate-700 ml-2 shadow-sm">
                READ-ONLY AUDIT
              </span>
            )}
          </h2>
          <p className="text-xs text-secondary">
            {isAuditor
              ? 'Auditor view: inspect complete candidate communication logs and audit trails.'
              : 'Chat directly with applicants. Edit or delete a message anytime.'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-[70vh] lg:min-h-0">
        {/* Conversation list */}
        <div className="w-full lg:w-72 lg:shrink-0 flex flex-col bg-panel border border-line rounded-2xl overflow-hidden max-h-56 lg:max-h-none">
          <div className="p-3 border-b border-line">
            <div className="relative">
              <Search className="w-4 h-4 text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full linear-input pl-9 pr-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-xs text-tertiary p-4">No conversations yet. Search for a candidate above — messages they send appear here.</p>
            )}
            {conversations.map(c => (
              <button
                key={c.applicant.id}
                onClick={() => setSelectedId(c.applicant.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-line text-left transition-colors ${
                  selectedId === c.applicant.id ? 'bg-panel-2' : 'hover:bg-panel-dim'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-panel-2 border border-line-strong flex items-center justify-center font-bold text-xs text-primary shrink-0">
                  {initialsOf(c.applicant.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary truncate">{c.applicant.fullName}</span>
                    {c.last && <span className="text-[10px] text-tertiary shrink-0">{timeLabel(c.last.createdAt)}</span>}
                  </div>
                  <div className="text-[11px] text-tertiary truncate">
                    {c.last ? (c.last.sender === 'admin' ? `You: ${c.last.body}` : c.last.body) : 'No messages yet'}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#AF7C28] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 min-w-0 flex flex-col bg-panel border border-line rounded-2xl overflow-hidden">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-tertiary">
              <MessageSquare className="w-10 h-10" />
              <p className="text-sm">Select a candidate to start messaging</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-line flex items-center gap-3 bg-panel-dim">
                <div className="w-9 h-9 rounded-full bg-panel-2 border border-line-strong flex items-center justify-center font-bold text-xs text-primary">
                  {initialsOf(active.applicant.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{active.applicant.fullName}</div>
                  <div className="text-[11px] text-tertiary truncate">{active.applicant.email}</div>
                </div>
                <span className="ml-auto text-[11px] text-tertiary">{active.applicant.appliedJobTitle}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {active.msgs.length === 0 && (
                  <p className="text-xs text-tertiary text-center pt-8">
                    No messages yet. Send the candidate a welcome message — it appears in their portal instantly.
                  </p>
                )}
                {active.msgs.map(m => {
                  const mine = m.sender === 'admin';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] group ${mine ? 'text-right' : 'text-left'}`}>
                        {editingId === m.id ? (
                          <div className={`flex items-start gap-2 rounded-2xl px-3.5 py-2.5 border ${
                            mine ? 'bg-[#AF7C28]/15 border-[#AF7C28]/40' : 'bg-panel-2 border-line-strong'
                          }`}>
                            <input
                              autoFocus
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditingId(null); }}
                              className="linear-input bg-transparent text-xs text-primary outline-none min-w-64"
                            />
                            <button onClick={handleEditSave} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="text-tertiary hover:text-primary"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className={`inline-block rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                            mine
                              ? 'bg-[#AF7C28] text-white rounded-br-md'
                              : 'bg-panel-2 text-primary border-line-strong rounded-bl-md'
                          }`}>
                            <span className="whitespace-pre-wrap break-words">{m.body}</span>
                            {m.editedAt && <span className={`ml-1.5 text-[10px] ${mine ? 'text-white/70' : 'text-tertiary'}`}>(edited)</span>}
                          </div>
                        )}
                        <div className={`flex items-center gap-2 mt-1 text-[10px] text-tertiary px-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                          <span>{timeLabel(m.createdAt)}</span>
                          {mine && (m.readByUser ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5 text-tertiary" />)}
                          {mine && !isAuditor && editingId !== m.id && (
                            <span className="hidden group-hover:inline-flex gap-1.5">
                              <button
                                onClick={() => { setEditingId(m.id); setEditingText(m.body); }}
                                className="text-tertiary hover:text-primary"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDelete(m.id)} className="text-tertiary hover:text-rose-400">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {isAuditor ? (
                <div className="p-4 border-t border-line bg-panel-dim flex items-center justify-center text-xs text-amber-700 dark:text-amber-400 font-semibold gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Candidate communication log is read-only for compliance auditors.
                </div>
              ) : (
                <div className="p-4 border-t border-line bg-panel-dim flex items-end gap-2">
                  <textarea
                    rows={1}
                    placeholder="Type a message... (Enter to send)"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 linear-input rounded-xl px-3.5 py-2.5 text-xs resize-none max-h-28"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
