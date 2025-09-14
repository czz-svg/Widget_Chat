import { createPortal } from "react-dom";
import "./chat-widget.css";
import { useEffect, useRef, useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  const [text, setText] = useState("");
  const listRef = useRef(null);

  // khởi tạo từ localStorage
  const STORAGE_KEY = "chat-history";
  const DEFAULT_MGS = [{ who: "bot", text: "Chào bạn 👋 mình là mini chat." }];
  const [mgs, setMgs] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : DEFAULT_MGS;
      return Array.isArray(parsed) ? parsed : DEFAULT_MGS;
    } catch {
      return DEFAULT_MGS;
    }
  });
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mgs));
    } catch {}
  }, [mgs]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight; //<----------
  }, [open, mgs.length]);

  function send() {
    const t = text.trim();
    setMgs((m) => [...m, { who: "user", text: t }]);
    setText("");

    // trả lời giả lập
    setTimeout(() => {
      setMgs((m) => [...m, { who: "bot", text: `Mình nhận: “${t}”` }]);
    }, 1000);
  }

  const ui = (
    <div className="cw-root">
      <button
        className="cw-fab"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        title={open ? "close chat" : "open chat"}
      >
        {open ? "x" : <img src="/img/chat-bot.png" alt="💬" />}
      </button>

      <div className={`cw-panel ${open ? "open" : ""}`}>
        <div className="cw-head">
          <div className="cw-title">Chat trợ lý</div>
          <button className="cw-close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <div className="cw-list" ref={listRef}>
          {mgs.map((m, i) => (
            <div
              key={i}
              className={`cw-msg ${m.who === "user" ? "cw-user" : "cw-bot"}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div
          className="cw-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn…"
          />
          <button onClick={send}>Gửi</button>
        </div>
      </div>
    </div>
  );
  return createPortal(ui, document.body);
}
