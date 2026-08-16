import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { io } from "socket.io-client";
import useAuthStore from "../../store/useAuthStore";
import { FiSend, FiUser, FiCheck, FiMail, FiMessageSquare, FiClock, FiX, FiPaperclip, FiLoader, FiFile, FiMusic, FiPlay } from "react-icons/fi";
import toast from "react-hot-toast";
import { storeFile, getFile } from "../../lib/indexedDb";

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
      <div className="flex items-center gap-2 text-slate-400 italic text-xs py-2 px-1">
        <FiLoader className="animate-spin text-[#16a34a]" size={13} /> Loading attachment...
      </div>
    );
  }

  if (!resolvedUrl) {
    if (msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") {
      return (
        <div className="text-slate-500 italic text-[11px] py-1.5 border border-dashed border-white/10 rounded-xl px-3.5 bg-black/20 mt-2">
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
      <div className="mt-3 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group max-w-[300px] ring-1 ring-black/20">
        <img
          src={resolvedUrl}
          alt={msg.fileName || "Image"}
          className="max-w-full max-h-[260px] object-cover hover:scale-[1.03] transition-transform duration-500 cursor-pointer w-full"
          onClick={() => window.open(resolvedUrl, "_blank")}
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="mt-3 rounded-3xl overflow-hidden border border-white/10 max-w-[340px] bg-black shadow-2xl">
        <video src={resolvedUrl} controls className="max-w-full max-h-[240px] w-full" />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="mt-3 w-full min-w-[260px] max-w-[340px] bg-slate-900/70 p-4 rounded-3xl border border-white/10 flex flex-col gap-1.5 shadow-lg">
        <span className="text-[11px] text-slate-400 truncate flex items-center gap-2 font-mono">
          <FiMusic className="text-[#16a34a]" size={13} /> {msg.fileName || "Audio snippet"}
        </span>
        <audio src={resolvedUrl} controls className="w-full h-9 mt-1" />
      </div>
    );
  }

  return (
    <a
      href={resolvedUrl}
      download={msg.fileName || "download"}
      className="mt-3 flex items-center gap-3 p-3.5 rounded-3xl border border-white/10 bg-slate-900/50 hover:bg-slate-800/60 transition-colors text-white font-medium group"
    >
      <div className="w-9 h-9 rounded-2xl bg-[#16a34a]/10 flex items-center justify-center flex-shrink-0">
        <FiFile className="text-base text-[#16a34a] group-hover:scale-110 transition-transform" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate text-white">{msg.fileName || "Download Attachment"}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {(msg.fileType?.split("/")[1] || "File")}
        </p>
      </div>
    </a>
  );
};

const socketUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const AdminChat = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeUserName, setActiveUserName] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Email Mode State
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");

  // Fetch all chat users
  const { data: chatUsers, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-chat-users"],
    queryFn: async () => {
      const { data } = await api.get("/chats/admin/users");
      return data;
    },
    refetchInterval: 10000, // Fallback poll every 10s
  });

  // Fetch active user's chat history
  const fetchChatHistory = async (userId) => {
    try {
      const { data } = await api.get(`/chats/admin/history/${userId}`);
      // Save user/admin history files in local database
      for (const msg of data) {
        if ((msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") && msg.fileData) {
          await storeFile(msg.id, msg.fileData);
        }
      }
      setMessages(data);
    } catch (err) {
      toast.error("Failed to load chat history");
    }
  };

  useEffect(() => {
    if (activeUserId) {
      fetchChatHistory(activeUserId);
    }
  }, [activeUserId]);

  // Connect to socket.io
  const activeUserIdRef = useRef(activeUserId);
  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

  useEffect(() => {
    if (!user) return;

    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Admin connected to socket");
      socket.emit("register", { userId: user.id, role: "ADMIN" });
    });

    socket.on("receive-message", async (msg) => {
      const currentActiveUserId = activeUserIdRef.current;

      // Store in IndexedDB if it contains fileData
      if ((msg.fileUrl === "indexeddb" || msg.fileUrl === "localstorage") && msg.fileData) {
        await storeFile(msg.id, msg.fileData);
      }

      // If message is from or to the active user, add it to current messages
      if (currentActiveUserId && (msg.senderId === currentActiveUserId || msg.receiverId === currentActiveUserId)) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      // Instantly refresh the users list
      refetchUsers();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, refetchUsers]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const getPageInitials = (name) => {
    return name ? name.slice(0, 2).toUpperCase() : "US";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedFile) || !activeUserId || !socketRef.current) return;

    setSending(true);
    try {
      if (isEmailMode) {
        if (!emailSubject.trim()) {
          toast.error("Subject is required in Email Mode");
          setSending(false);
          return;
        }

        await api.post("/chats/admin/send-email", {
          userId: activeUserId,
          subject: emailSubject.trim(),
          content: inputMessage.trim()
        });

        setInputMessage("");
        setEmailSubject("");
        toast.success("Email sent and logged to history!");
      } else {
        let fileData = null;
        let fileName = null;
        let fileType = null;
        let fileUrl = null;

        if (selectedFile) {
          fileData = await convertToBase64(selectedFile);
          fileName = selectedFile.name;
          fileType = selectedFile.type;
          fileUrl = "indexeddb";
        }

        // Send via socket
        socketRef.current.emit("send-message", {
          receiverId: activeUserId,
          content: inputMessage.trim() || `Sent an attachment: ${fileName}`,
          fileUrl,
          fileType,
          fileName,
          fileData
        });

        setInputMessage("");
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Failed to send admin message/email:", err);
      toast.error(err?.response?.data?.message || "Failed to send message/email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-3 p-3 bg-slate-950/20">

      {/* --- User List Sidebar --- */}
      <div className="w-[340px] flex flex-col bg-slate-900/40 rounded-[28px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-7 pb-5">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <span className="w-9 h-9 rounded-2xl bg-[#16a34a]/15 flex items-center justify-center">
              <FiMessageSquare className="text-[#16a34a]" size={18} />
            </span>
            Inbox
          </h2>
          <p className="text-[11px] text-slate-500 mt-2 ml-[46px] uppercase tracking-widest font-semibold">Real-time customer inquiries</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 scrollbar-hide">
          {loadingUsers ? (
            <div className="p-10 text-center text-slate-400 text-xs">Loading conversations...</div>
          ) : chatUsers?.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs italic">No messages received yet.</div>
          ) : (
            chatUsers?.map((chat) => {
              const isActive = chat.userId === activeUserId;
              const isLastMessageFromAdmin = chat.lastMessageSenderRole === "ADMIN";

              return (
                <button
                  key={chat.userId}
                  onClick={() => {
                    setActiveUserId(chat.userId);
                    setActiveUserName(chat.userName);
                  }}
                  className={`w-full p-4 text-left transition-all duration-200 flex gap-3.5 items-start rounded-3xl ${
                    isActive
                      ? "bg-[#16a34a]/10 ring-1 ring-[#16a34a]/40 shadow-lg shadow-[#16a34a]/5"
                      : "hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#16a34a]/25 to-[#166534]/25 border border-white/10 flex items-center justify-center text-[#16a34a] font-extrabold flex-shrink-0 uppercase text-sm">
                    {chat.userName?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <h4 className="text-[13px] font-bold text-white truncate">{chat.userName}</h4>
                      <span className="text-[10px] text-slate-500 font-medium flex-shrink-0 ml-2">
                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mb-2.5 leading-relaxed">{chat.lastMessage}</p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {isLastMessageFromAdmin ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 bg-emerald-400/5 px-2.5 py-1 rounded-full">
                          <FiCheck size={9} /> Replied by {chat.lastMessageSenderName?.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#16a34a] bg-[#16a34a]/10 px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                          <FiClock size={9} /> Pending Reply
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* --- Chat Workspace Area --- */}
      <div className="flex-1 flex flex-col bg-slate-900/25 rounded-[28px] border border-white/5 overflow-hidden shadow-2xl">
        {activeUserId ? (
          <>
            {/* Workspace Header */}
            <div className="px-8 py-5 border-b border-white/5 bg-slate-900/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#166534] text-black font-extrabold flex items-center justify-center uppercase text-sm shadow-lg shadow-[#16a34a]/20">
                  {getPageInitials(activeUserName)}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">{activeUserName}</h3>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Active Chat Session
                  </span>
                </div>
              </div>

              {/* Mode Selector Toggle */}
              <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 flex-shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setIsEmailMode(false)}
                  className={`px-5 py-2.5 text-[11px] font-bold rounded-xl transition-all duration-200 ${
                    !isEmailMode
                      ? "bg-[#16a34a] text-black shadow-md shadow-[#16a34a]/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmailMode(true)}
                  className={`px-5 py-2.5 text-[11px] font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isEmailMode
                      ? "bg-[#16a34a] text-black shadow-md shadow-[#16a34a]/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FiMail size={12} /> Email
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 scrollbar-hide">
              {messages.map((msg) => {
                const isAdmin = msg.senderRole === "ADMIN";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[65%] rounded-[26px] px-6 py-4 text-[13px] shadow-xl ${
                      isAdmin
                        ? "bg-[#16a34a] text-black font-medium rounded-tr-lg"
                        : "bg-white/[0.04] border border-white/10 text-white rounded-tl-lg backdrop-blur-md"
                    }`}>
                      {!isAdmin && (
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
                          {msg.senderName}
                        </p>
                      )}
                      {isAdmin && msg.senderId !== user.id && (
                        <p className="text-[9px] text-black/50 font-bold uppercase tracking-widest mb-1.5">
                          {msg.senderName} (Admin)
                        </p>
                      )}
                      {msg.content?.startsWith("[EMAIL SENT]") ? (
                        (() => {
                          const emailParts = msg.content.replace("[EMAIL SENT] ", "").split("\n\n");
                          const subjectLine = emailParts[0] || "No Subject";
                          const bodyContent = emailParts.slice(1).join("\n\n") || "";
                          return (
                            <div className={`space-y-2 border-l-2 pl-4 py-1 ${isAdmin ? "border-slate-950/20" : "border-[#16a34a]/40"}`}>
                              <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${isAdmin ? "text-black/80" : "text-[#16a34a]"}`}>
                                <FiMail size={11} /> Sent via Email
                              </div>
                              <p className={`text-[13px] font-bold font-mono truncate ${isAdmin ? "text-black/80" : "text-white"}`}>{subjectLine}</p>
                              <p className={`text-[13px] whitespace-pre-wrap leading-relaxed ${isAdmin ? "text-black/70" : "text-slate-300"}`}>{bodyContent}</p>
                            </div>
                          );
                        })()
                      ) : (
                        <p className="leading-relaxed break-words">{msg.content}</p>
                      )}
                      {msg.fileUrl && (
                        <ChatFileMessage msg={msg} socketUrl={socketUrl} />
                      )}
                      <span className={`text-[9px] block mt-2 text-right ${
                        isAdmin ? "text-black/60" : "text-slate-500"
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <div className="border-t border-white/5 bg-slate-900/30 flex-shrink-0">

              {/* Subject box for Email Mode */}
              {isEmailMode && (
                <div className="px-8 pt-5 pb-1">
                  <input
                    type="text"
                    placeholder="Email Subject..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-3.5 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]/40 focus:border-[#16a34a] transition-all text-white placeholder-slate-500"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={sending}
                    required={isEmailMode}
                  />
                </div>
              )}

              {/* Selected file preview */}
              {!isEmailMode && selectedFile && (
                <div className="mx-8 mt-4 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-7 h-7 rounded-xl bg-[#16a34a]/10 flex items-center justify-center flex-shrink-0">
                      <FiPaperclip className="text-[#16a34a]" size={13} />
                    </span>
                    <span className="truncate max-w-[300px] font-medium">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-8 flex gap-3 items-center">
                {!isEmailMode && (
                  <>
                    <input
                      type="file"
                      id="admin-chat-file-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                      disabled={sending}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("admin-chat-file-input").click()}
                      className="p-4 rounded-2xl border border-white/10 hover:border-[#16a34a]/40 hover:bg-white/[0.03] text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center flex-shrink-0 w-12 h-12"
                      disabled={sending}
                    >
                      <FiPaperclip size={16} />
                    </button>
                  </>
                )}

                <input
                  type="text"
                  placeholder={sending ? "Processing..." : (isEmailMode ? `Write email content to send...` : `Type a response to ${activeUserName}...`)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/40 focus:border-[#16a34a] transition-all text-white disabled:opacity-50"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                  required={!selectedFile}
                />
                <button
                  type="submit"
                  disabled={sending || (!inputMessage.trim() && !selectedFile)}
                  className="bg-[#16a34a] hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all duration-200 text-black font-bold rounded-2xl flex items-center justify-center shadow-lg shadow-[#16a34a]/25 w-[52px] h-[52px] flex-shrink-0"
                >
                  {sending ? (
                    <FiLoader className="animate-spin" size={17} />
                  ) : (
                    <FiSend size={17} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-[#16a34a]/10 rounded-[26px] flex items-center justify-center text-[#16a34a] text-3xl mb-5 border border-[#16a34a]/20 shadow-inner">
              <FiMail />
            </div>
            <h3 className="text-xl font-bold text-white">Select a Conversation</h3>
            <p className="text-slate-400 text-[13px] max-w-sm mt-2 leading-relaxed">
              Select a customer on the left sidebar to view their message history and reply in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;