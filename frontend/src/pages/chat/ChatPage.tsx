import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLangNavigate } from "../../hooks/useLangPath";
import { useChat } from "../../hooks/useChat";

export default function ChatPage() {
  const { t } = useTranslation();
  const { chatId } = useParams<{ chatId: string }>();
  const { user, token } = useAuth();
  const navigate = useLangNavigate();

  const { messages, isConnected, sendMessage } = useChat(chatId ?? "", token);

  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 2000 || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(trimmed);
      setContent("");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const isOverLimit = content.length > 2000;
  const canSend = content.trim().length > 0 && !isOverLimit && !isSending;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
        minHeight: "500px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/chats")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Back to chats"
        >
          <ion-icon name="arrow-back-outline" style={{ fontSize: "18px" }} />
        </button>

        <h1
          style={{
            flex: 1,
            margin: 0,
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {t("chatPage.title")}
        </h1>

        {/* Connection status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isConnected ? "#22c55e" : "#94a3b8",
              flexShrink: 0,
            }}
          />
          {isConnected ? t("chatPage.connected") : t("chatPage.connecting")}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            {t("chatPage.empty")}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            const time = new Date(msg.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOwn ? "flex-end" : "flex-start",
                }}
              >
                {!isOwn && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: "4px",
                      paddingLeft: "4px",
                    }}
                  >
                    {msg.senderFullName}
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: isOwn
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    background: isOwn ? "var(--accent)" : "var(--bg-surface)",
                    color: isOwn ? "#ffffff" : "var(--text-primary)",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                    wordBreak: "break-word",
                    border: isOwn ? "none" : "1px solid var(--border)",
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.7rem",
                      opacity: 0.7,
                      textAlign: isOwn ? "right" : "left",
                    }}
                  >
                    {time}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-card)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatPage.placeholder")}
              rows={1}
              style={{
                width: "100%",
                minHeight: "40px",
                maxHeight: "96px",
                padding: "10px 12px",
                borderRadius: "12px",
                border: `1px solid ${isOverLimit ? "#ef4444" : "var(--border)"}`,
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                overflowY: "auto",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                color: isOverLimit ? "#ef4444" : "var(--text-secondary)",
                lineHeight: 1,
              }}
            >
              {content.length}/2000
            </span>
            <button
              onClick={() => void handleSend()}
              disabled={!canSend}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                border: "none",
                background: canSend ? "var(--accent)" : "var(--bg-surface)",
                color: canSend ? "#ffffff" : "var(--text-secondary)",
                cursor: canSend ? "pointer" : "not-allowed",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
              aria-label="Send message"
            >
              <ion-icon name="send-outline" style={{ fontSize: "18px" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
