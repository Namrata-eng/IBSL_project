import React, { useState } from 'react';
import { MessageCircleIcon, XIcon, SendIcon, TilakMark } from './icons';
import './Chatbot.css';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hare Krishna! How may I help you with temple darshan timings, aartis, festivals, or spiritual services today?',
    },
  ]);

  const send = async () => {
    if (!text.trim()) return;
    const q = text.trim();
    setText('');
    setMessages(m => [...m, { role: 'user', content: q }]);

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const d = await r.json();
      setMessages(m => [
        ...m,
        { role: 'bot', content: d.reply || 'Hare Krishna. I do not have that specific information yet.' },
      ]);
    } catch {
      setMessages(m => [
        ...m,
        { role: 'bot', content: 'Hare Krishna. Please try again when the connection is available.' },
      ]);
    }
  };

  return (
    <aside className="chat">
      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close temple assistant' : 'Open temple assistant'}
      >
        {open ? <XIcon size={20} /> : <MessageCircleIcon size={22} />}
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-header-info">
              <TilakMark size={18} />
              <b>Temple Assistant</b>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <XIcon size={16} />
            </button>
          </div>

          <section className="chat-messages">
            {messages.map((m, i) => (
              <p key={i} className={m.role}>
                {m.content}
              </p>
            ))}
          </section>

          <form
            className="chat-form"
            onSubmit={e => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ask about timings, events, prasadam…"
            />
            <button aria-label="Send message">
              <SendIcon size={16} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}

export default Chatbot;
