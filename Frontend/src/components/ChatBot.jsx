import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "./Chatbot.css";

const API_URL = "https://mern-ai-chatbot-backend-yvvr.onrender.com/api/chat";

const BOT_AVATAR = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="13" rx="3" fill="#6EE7B7" />
    <rect x="8" y="2" width="8" height="5" rx="2" fill="#6EE7B7" />
    <circle cx="9" cy="13" r="1.5" fill="#064E3B" />
    <circle cx="15" cy="13" r="1.5" fill="#064E3B" />
    <rect x="9" y="16" width="6" height="1.5" rx="0.75" fill="#064E3B" />
  </svg>
);

/* ── Lightweight Markdown renderer ── */
const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <pre>
      <div className="cb-code-header">
        <span className="cb-code-lang">{lang || "code"}</span>
        <button className="cb-copy-btn" onClick={copy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <code>{code}</code>
    </pre>
  );
};

const MarkdownRenderer = ({ text }) => {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={i} code={codeLines.join("\n")} lang={lang} />
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(<h1 key={i}>{line.slice(2)}</h1>);
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>);
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ color: "#A8B4FF", fontSize: "13px", margin: "12px 0 6px", fontWeight: 600 }}>
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(<li key={i}>{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    }

    // Blank line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    elements.push(<p key={i}>{inlineFormat(line)}</p>);
    i++;
  }

  return <div className="md-body">{elements}</div>;
};

// Inline: **bold**, *italic*, `code`
function inlineFormat(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={match.index}>{match[4]}</code>);

    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

/* ── Typing indicator ── */
const TypingIndicator = () => (
  <div className="cb-typing-row">
    <div className="cb-bot-avatar">{BOT_AVATAR}</div>
    <div className="cb-bubble cb-bot-bubble" style={{ padding: "14px 18px" }}>
      <div className="cb-typing-dots">
        {[0, 1, 2].map((i) => (
          <div key={i} className="cb-dot" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  </div>
);

/* ── Main component ── */
const ChatBot = () => {
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm your **MERN Stack Assistant**. Ask me anything about `JavaScript`, `React`, `Node.js`, `Express`, or `MongoDB`.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setChat((prev) => [...prev, { sender: "user", text: trimmed }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(API_URL, { message: trimmed });
      setChat((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [message, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="cb-page">
      <div className="cb-card">

        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-header-avatar">{BOT_AVATAR}</div>
            <div>
              <div className="cb-header-name">MERN Stack Assistant</div>
              <div className="cb-header-badge">
                <span className="cb-badge cb-badge-js">JS</span>
                <span className="cb-badge cb-badge-react">React</span>
                <span className="cb-badge cb-badge-node">Node</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div className="cb-header-dots">
              {["#FF5F57", "#FEBC2E", "#28C840"].map((color, i) => (
                <div key={i} className="cb-traffic-dot" style={{ background: color }} />
              ))}
            </div>
            <div className="cb-header-status">
              <span className="cb-status-dot" />
              Online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="cb-messages">
          {chat.map((msg, i) => (
            <div key={i} className={msg.sender === "user" ? "cb-user-row" : "cb-bot-row"}>
              {msg.sender === "bot" && (
                <div className="cb-bot-avatar">{BOT_AVATAR}</div>
              )}
              <div className={`cb-bubble ${msg.sender === "user" ? "cb-user-bubble" : "cb-bot-bubble"}`}>
                {msg.sender === "bot"
                  ? <MarkdownRenderer text={msg.text} />
                  : msg.text
                }
              </div>
              {msg.sender === "user" && (
                <div className="cb-user-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#fff" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#fff" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cb-input-area">
          <input
            ref={inputRef}
            className="cb-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask something about MERN..."
            disabled={loading}
          />
          <button
            className="cb-send-btn"
            onClick={sendMessage}
            disabled={!message.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChatBot;