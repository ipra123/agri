import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore";
import api from "../lib/api";
import { FiMessageSquare, FiX, FiSend, FiMessageCircle, FiMinus, FiInfo, FiPaperclip, FiLoader, FiFile, FiMusic, FiPlay } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { storeFile, getFile } from "../lib/indexedDb";

// Sub-component to render attachments (User disk uploads and Admin IndexedDB cache)
const ChatFileMessage = ({ msg, socketUrl }) => {
  const [localFileUrl, setLocalFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") {
      setLoading(true);
      getFile(msg.id)
        .then((data) => {
          if (data) setLocalFileUrl(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error retrieving file from IndexedDB:", err);
          setLoading(false);
        });
    }
  }, [msg.id, msg.fileUrl]);

  const resolvedUrl = (msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage")
    ? localFileUrl
    : (msg.fileUrl ? (msg.fileUrl.startsWith("http") ? msg.fileUrl : `${socketUrl}${msg.fileUrl}`) : "");

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 italic text-[10px] py-1">
        <FiLoader className="animate-spin text-[#16a34a]" /> Loading attachment...
      </div>
    );
  }

  if (!resolvedUrl) {
    if (msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") {
      return (
        <div className="text-slate-500 italic text-[9px] py-1 border border-dashed border-white/5 rounded px-2 bg-black/10 mt-1">
          [Attachment unavailable in browser storage]
        </div>
      );
    }
    return null;
  }

  const isImage = msg.fileType?.startsWith("image/");
  const isVideo = msg.fileType?.startsWith("video/");
  const isAudio = msg.fileType?.startsWith("audio/");

  if (isImage) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 shadow-lg group max-w-full">
        <img
          src={resolvedUrl}
          alt={msg.fileName || "Image"}
          className="max-w-full max-h-[160px] object-cover hover:scale-102 transition-transform duration-300 cursor-pointer w-full"
          onClick={() => window.open(resolvedUrl, "_blank")}
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-full bg-black shadow-lg">
        <video src={resolvedUrl} controls className="max-w-full max-h-[160px] w-full" />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="mt-2 w-full min-w-[200px] max-w-full bg-slate-900/60 p-2 rounded-xl border border-white/5 flex flex-col gap-1 shadow-md">
        <span className="text-[9px] text-slate-400 truncate flex items-center gap-1 font-mono">
          <FiMusic className="text-[#16a34a]" /> {msg.fileName || "Audio snippet"}
        </span>
        <audio src={resolvedUrl} controls className="w-full h-8 mt-1 scale-95 origin-left" />
      </div>
    );
  }

  return (
    <a
      href={resolvedUrl}
      download={msg.fileName || "download"}
      className="mt-2 flex items-center gap-2.5 p-2 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/40 transition-colors text-white font-medium group"
    >
      <FiFile className="text-base text-[#16a34a] group-hover:scale-110 transition-transform flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold truncate text-white">{msg.fileName || "Download Attachment"}</p>
        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">
          {(msg.fileType?.split("/")[1] || "File")}
        </p>
      </div>
    </a>
  );
};

const socketUrl = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:5000";

const ChatWidget = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Connect to socket and register user
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!user || ["ADMIN", "SUPPLIER"].includes(user.role)) return;

    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", { userId: user.id, role: "FARMER" });
    });

    socket.on("receive-message", async (msg) => {
      // Store in IndexedDB if the admin sent a file payload over the socket
      if ((msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") && msg.fileData) {
        await storeFile(msg.id, msg.fileData);
      }

      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });

    // Fetch initial chat history
    const loadHistory = async () => {
      try {
        const { data } = await api.get("/chats/history");
        // Check history for admin messages to see if there is any fileData to sync locally
        for (const msg of data) {
          if ((msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") && msg.fileData) {
            await storeFile(msg.id, msg.fileData);
          }
        }
        setMessages(data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    loadHistory();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // If user is Admin, do not show the client chat widget
  if (["ADMIN", "SUPPLIER"].includes(user?.role)) return null;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !socketRef.current) return;

    setUploading(true);
    try {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const { data } = await api.post("/chats/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        fileUrl = data.fileUrl;
        fileName = data.fileName;
        fileType = data.fileType;
      }

      socketRef.current.emit("send-message", {
        receiverId: "ADMIN",
        content: inputText.trim() || `Sent an attachment: ${fileName}`,
        fileUrl,
        fileType,
        fileName
      });

      setInputText("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to send message/file:", err);
      toast.error("Failed to send file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] font-body">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="w-14 h-14 bg-gradient-to-tr from-[#16a34a] to-[#166534] text-bg-dark rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative border border-[#16a34a]/30"
      >
        {isOpen ? <FiX className="text-2xl" /> : <FiMessageSquare className="text-2xl" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg-dark animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[500px] glass-card border border-white/10 rounded-[30px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <div>
                <h4 className="text-sm font-bold text-white font-ui uppercase tracking-wider">Farm Support</h4>
                <p className="text-[10px] text-slate-400">Response time: ~5 mins</p>
              </div>
            </div>
            <button onClick={handleToggle} className="text-slate-400 hover:text-white transition-colors">
              <FiMinus className="text-lg" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-950/20">
            {!user ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <FiInfo className="text-3xl text-[#16a34a]" />
                <p className="text-sm text-slate-300 px-6">Please log in to chat with our farm support team.</p>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="btn-premium btn-premium-primary !py-2.5 !px-6 !text-[10px] uppercase tracking-widest font-bold"
                >
                  Sign In
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs italic px-6">
                Hello! How can we help with products, delivery, or payments today? Type a message to begin chatting.
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.senderRole === "ADMIN";
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-lg ${
                      isAdmin 
                        ? "bg-white/5 border border-white/10 text-white rounded-tl-none" 
                        : "bg-[#16a34a] text-black font-semibold rounded-tr-none"
                    }`}>
                      {isAdmin && (
                        <p className="text-[9px] text-[#16a34a] font-bold uppercase tracking-wider mb-1">
                          {msg.senderName} (Support)
                        </p>
                      )}
                      {msg.content?.startsWith("[EMAIL SENT]") ? (
                        (() => {
                          const emailParts = msg.content.replace("[EMAIL SENT] ", "").split("\n\n");
                          const subjectLine = emailParts[0] || "No Subject";
                          const bodyContent = emailParts.slice(1).join("\n\n") || "";
                          return (
                            <div className="space-y-1.5 border-l-2 border-[#16a34a]/40 pl-2.5 py-0.5">
                              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#16a34a]">
                                <FiMail size={10} /> Sent via Email
                              </div>
                              <p className="text-[10px] font-bold font-mono truncate text-white">{subjectLine}</p>
                              <p className="text-[11px] whitespace-pre-wrap leading-relaxed text-slate-300">{bodyContent}</p>
                            </div>
                          );
                        })()
                      ) : (
                        <p className="leading-relaxed break-words">{msg.content}</p>
                      )}
                      {msg.fileUrl && (
                        <ChatFileMessage msg={msg} socketUrl={socketUrl} />
                      )}
                      <span className={`text-[8px] block mt-1 text-right ${
                        isAdmin ? "text-slate-500" : "text-black/60"
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          {user && (
            <div className="border-t border-white/5 bg-slate-900/40">
              {/* File selection preview */}
              {selectedFile && (
                <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-[10px] text-white">
                  <div className="flex items-center gap-2 truncate">
                    <FiPaperclip className="text-[#16a34a] flex-shrink-0 animate-bounce" />
                    <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                    <span className="text-[8px] text-slate-500 font-mono">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="p-4 flex gap-2 items-center">
                <input
                  type="file"
                  id="chat-file-input"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("chat-file-input").click()}
                  className="p-3 rounded-xl border border-white/10 hover:border-[#16a34a]/40 hover:bg-white/[0.02] text-slate-400 hover:text-white transition-all flex items-center justify-center flex-shrink-0"
                  disabled={uploading}
                >
                  <FiPaperclip className="text-sm" />
                </button>

                <input
                  type="text"
                  placeholder={uploading ? "Uploading file..." : "Type your message..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#16a34a] transition-all text-white disabled:opacity-50"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={uploading}
                  required={!selectedFile}
                />
                <button
                  type="submit"
                  disabled={uploading || (!inputText.trim() && !selectedFile)}
                  className="bg-[#16a34a] hover:opacity-90 disabled:opacity-40 transition-all text-black font-bold p-3 rounded-xl flex items-center justify-center shadow-md shadow-[#16a34a]/10 w-11 h-11 flex-shrink-0"
                >
                  {uploading ? (
                    <FiLoader className="text-sm animate-spin" />
                  ) : (
                    <FiSend className="text-sm" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

