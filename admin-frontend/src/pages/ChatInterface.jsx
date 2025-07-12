import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  User,
  MessageSquare,
  CheckCircle,
  Upload,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ChatInterface = ({ chatId, onBack, socket, currentUser }) => {
  const { API_BASE, user } = useAuth();
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load initial chat data regardless of socket status
    loadChat();

    if (chatId && socket) {
      console.log("📨 Joining chat room:", chatId);
      // Join the chat room
      socket.emit("joinChat", {
        chatId,
        userType: "agent",
        userId: "admin", // Replace with actual agent ID from auth context
      });

      // Socket.IO event listeners
      socket.on("newMessage", ({ chatId: incomingChatId, message }) => {
        if (incomingChatId === chatId) {
          setChat((prevChat) => ({
            ...prevChat,
            messages: [...(prevChat.messages || []), message],
          }));
        }
      });

      socket.on("userTyping", ({ userType, userId }) => {
        setTypingUsers((prev) => {
          if (!prev.some((user) => user.userId === userId)) {
            return [...prev, { userType, userId }];
          }
          return prev;
        });
      });

      socket.on("userStoppedTyping", ({ userType, userId }) => {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
      });

      socket.on("chatResolved", ({ chatId: resolvedChatId }) => {
        if (resolvedChatId === chatId) {
          setChat((prevChat) => ({ ...prevChat, status: "resolved" }));
          onBack && onBack();
        }
      });

      socket.on("error", ({ message }) => {
        console.error("Socket.IO error:", message);
        alert(`Error: ${message}`);
      });

      // Cleanup on unmount
      return () => {
        socket.emit("stopTyping", {
          chatId,
          userType: "agent",
          userId: "admin",
        });
        socket.off("newMessage");
        socket.off("userTyping");
        socket.off("userStoppedTyping");
        socket.off("chatResolved");
        socket.off("error");
      };
    }
  }, [chatId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChat = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/chat/${chatId}`);
      setChat(response.data.data);
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSendMessage = async (e) => {
  //   e.preventDefault();
  //   if (!newMessage.trim() && !selectedFile) return;

  //   try {
  //     setSending(true);
  //     const formData = new FormData();
  //     formData.append("text", newMessage);
  //     formData.append("agentId", "admin"); // Replace with actual agent ID
  //     if (selectedFile) {
  //       formData.append("media", selectedFile);
  //     }

  //     await axios.post(`${API_BASE}/chat/${chatId}/reply`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setNewMessage("");
  //     setSelectedFile(null);
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //     // No need to call loadChat since Socket.IO will update the messages
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     alert("Error sending message. Please try again.");
  //   } finally {
  //     setSending(false);
  //   }
  // };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      setSending(true);

      // Temporarily disable file uploads to fix FormData issues
      if (selectedFile) {
        alert(
          "File upload temporarily disabled. Please send text messages only.",
        );
        setSending(false);
        return;
      }

      // Check if we have text content to send
      if (!newMessage.trim()) {
        alert("Please enter a message to send.");
        setSending(false);
        return;
      }

      console.log("=== SENDING TEXT MESSAGE ===");
      console.log("Chat ID:", chatId);
      console.log("Message:", newMessage.trim());
      console.log("Agent ID:", (currentUser || user)?._id || "admin");
      console.log("===============================");

      // Use fetch API instead of axios for better FormData handling
      console.log("Sending FormData with fetch API...");

      const fetchResponse = await fetch(`${API_BASE}/chat/${chatId}/reply`, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type - let browser handle it for FormData
          Authorization: `Bearer ${(currentUser || user)?.token || ""}`,
        },
      });

      console.log("Fetch response received:", {
        status: fetchResponse.status,
        ok: fetchResponse.ok,
        bodyUsed: fetchResponse.bodyUsed,
      });

      let responseData;
      try {
        // Safely read response body
        if (!fetchResponse.bodyUsed) {
          responseData = await fetchResponse.json();
        } else {
          console.warn("Response body already used");
          responseData = { message: "Response body already read" };
        }
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        // Try to read as text if JSON fails
        try {
          if (!fetchResponse.bodyUsed) {
            const textData = await fetchResponse.text();
            responseData = { message: textData || fetchResponse.statusText };
          } else {
            responseData = {
              message: fetchResponse.statusText || "Unknown error",
            };
          }
        } catch (textError) {
          console.error("Text reading error:", textError);
          responseData = {
            message: fetchResponse.statusText || "Unknown error",
          };
        }
      }

      if (!fetchResponse.ok) {
        throw {
          response: {
            data: responseData,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
          },
        };
      }

      // Success case
      const response = {
        data: responseData,
        status: fetchResponse.status,
      };

      console.log("Message sent successfully:", response.data);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Reload chat to see the new message
      loadChat();
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", JSON.stringify(error.response, null, 2));
      console.error(
        "Error response data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error("Error response status:", error.response?.status);
      console.error("Error response statusText:", error.response?.statusText);
      console.error("Error message:", error.message);

      let errorMessage = "Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.statusText) {
        errorMessage = `${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Error sending message: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };
  const handleMarkResolved = async () => {
    if (window.confirm("Mark this chat as resolved?")) {
      try {
        await axios.put(`${API_BASE}/chat/${chatId}/resolve`);
        // No need to call loadChat since Socket.IO will handle the update
      } catch (error) {
        console.error("Error marking chat as resolved:", error);
        alert("Error updating chat status. Please try again.");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Only JPEG, PNG, WebP, MP4, MPEG, QuickTime, or PDF files are allowed.",
        );
        return;
      }
      if (file.type.startsWith("image") && file.size > 5 * 1024 * 1024) {
        alert("Image file size must be less than 5MB.");
        return;
      }
      if (
        (file.type.startsWith("video") || file.type === "application/pdf") &&
        file.size > 100 * 1024 * 1024
      ) {
        alert("Video or PDF file size must be less than 100MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit("typing", { chatId, userType: "agent", userId: "admin" });
    }
  };

  const handleStopTyping = () => {
    if (socket) {
      socket.emit("stopTyping", { chatId, userType: "agent", userId: "admin" });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  if (!chat) {
    return (
      <div
        className="chart-card"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <MessageSquare
          size={48}
          color="var(--text-gray)"
          style={{ marginBottom: "15px" }}
        />
        <h3 style={{ color: "var(--text-gray)" }}>Chat not found</h3>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Chat Header */}
      <div className="chart-card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button onClick={onBack} className="btn btn-secondary">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 style={{ color: "var(--primary-gold)", margin: 0 }}>
                {chat.customerName}
              </h2>
              <p
                style={{
                  color: "var(--text-gray)",
                  margin: 0,
                  fontSize: "0.9rem",
                }}
              >
                {chat.customerEmail} •{" "}
                {chat.chatType.replace("_", " ").toUpperCase()}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              className={`flag-badge flag-${
                chat.status === "open" ? "yellow" : "green"
              }`}
            >
              {chat.status.toUpperCase()}
            </span>
            {chat.status === "open" && (
              <button
                onClick={handleMarkResolved}
                className="btn btn-primary"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              >
                <CheckCircle size={14} />
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="chart-card"
        style={{ height: "500px", display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {chat.messages && chat.messages.length > 0 ? (
            chat.messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection:
                    message.sender === "customer" ? "row" : "row-reverse",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      message.sender === "customer"
                        ? "var(--accent-blue)"
                        : "var(--primary-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {message.sender === "customer" ? (
                    <User size={20} color="white" />
                  ) : (
                    <MessageSquare size={20} color="var(--background-dark)" />
                  )}
                </div>

                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 15px",
                    borderRadius: "18px",
                    background:
                      message.sender === "customer"
                        ? "var(--background-light)"
                        : "var(--primary-gold)",
                    color:
                      message.sender === "customer"
                        ? "var(--text-white)"
                        : "var(--background-dark)",
                    border:
                      message.sender === "customer"
                        ? "1px solid var(--border-color)"
                        : "none",
                  }}
                >
                  {message.text && (
                    <p style={{ margin: 0, lineHeight: "1.4" }}>
                      {message.text}
                    </p>
                  )}
                  {message.media && (
                    <div style={{ marginTop: message.text ? "10px" : "0" }}>
                      {message.media.type === "image" && (
                        <img
                          src={message.media.url}
                          alt={message.media.fileName}
                          style={{
                            maxWidth: "200px",
                            borderRadius: "8px",
                            marginTop: "5px",
                          }}
                        />
                      )}
                      {message.media.type === "video" && (
                        <video
                          src={message.media.url}
                          controls
                          style={{
                            maxWidth: "200px",
                            borderRadius: "8px",
                            marginTop: "5px",
                          }}
                        />
                      )}
                      {message.media.type === "pdf" && (
                        <a
                          href={message.media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "var(--text-white)",
                            textDecoration: "underline",
                          }}
                        >
                          {message.media.fileName} (
                          {(message.media.fileSize / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </a>
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.7,
                      marginTop: "5px",
                      textAlign:
                        message.sender === "customer" ? "left" : "right",
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-gray)",
                fontStyle: "italic",
                marginTop: "50px",
              }}
            >
              No messages yet
            </div>
          )}
          {typingUsers.length > 0 && (
            <div
              style={{
                color: "var(--text-gray)",
                fontStyle: "italic",
                fontSize: "0.9rem",
              }}
            >
              {typingUsers.map((user) => user.userType).join(", ")} typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {chat.status === "open" && (
          <div
            style={{
              padding: "20px",
              borderTop: "1px solid var(--border-color)",
              background: "var(--background-dark)",
            }}
          >
            <form
              onSubmit={handleSendMessage}
              style={{ display: "flex", gap: "10px", alignItems: "center" }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
                placeholder="Type your reply..."
                disabled={sending}
                style={{
                  flex: 1,
                  padding: "12px 15px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "25px",
                  color: "var(--text-white)",
                  fontSize: "14px",
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,video/mp4,video/mpeg,video/quicktime,application/pdf"
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                className="btn btn-secondary"
                style={{
                  borderRadius: "50%",
                  width: "45px",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <Upload size={18} />
              </button>
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || sending}
                className="btn btn-primary"
                style={{
                  borderRadius: "50%",
                  width: "45px",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <Send size={18} />
              </button>
            </form>
            {selectedFile && (
              <div
                style={{
                  marginTop: "10px",
                  color: "var(--text-gray)",
                  fontSize: "0.8rem",
                }}
              >
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        )}

        {chat.status === "resolved" && (
          <div
            style={{
              padding: "15px",
              background: "var(--accent-green)",
              color: "white",
              textAlign: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            This chat has been resolved
          </div>
        )}
      </div>

      {/* Chat Info */}
      <div className="chart-card" style={{ marginTop: "20px" }}>
        <h3 style={{ color: "var(--primary-gold)", marginBottom: "15px" }}>
          Chat Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <strong style={{ color: "var(--text-white)" }}>Customer:</strong>
            <p style={{ color: "var(--text-gray)", margin: 0 }}>
              {chat.customerName}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-white)" }}>Email:</strong>
            <p style={{ color: "var(--text-gray)", margin: 0 }}>
              {chat.customerEmail}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-white)" }}>Type:</strong>
            <p style={{ color: "var(--text-gray)", margin: 0 }}>
              {chat.chatType.replace("_", " ").toUpperCase()}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-white)" }}>Started:</strong>
            <p style={{ color: "var(--text-gray)", margin: 0 }}>
              {formatDate(chat.createdAt)} at {formatTime(chat.createdAt)}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-white)" }}>Assigned to:</strong>
            <p style={{ color: "var(--text-gray)", margin: 0 }}>
              {chat.assignedTo?.fullName || "Unassigned"}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-white)" }}>Messages:</strong>
            <p style={{ color: "var(--text-gray)", margin: 0 }}>
              {chat.messages?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Send,
//   ArrowLeft,
//   User,
//   MessageSquare,
//   Clock,
//   CheckCircle,
// } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const ChatInterface = ({ chatId, onBack }) => {
//   const { API_BASE } = useAuth();
//   const [chat, setChat] = useState(null);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (chatId) {
//       loadChat();
//     }
//   }, [chatId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [chat?.messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const loadChat = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/chat/${chatId}`);
//       setChat(response.data.data);
//     } catch (error) {
//       console.error("Error loading chat:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     try {
//       setSending(true);
//       await axios.post(`${API_BASE}/chat/${chatId}/reply`, {
//         text: newMessage,
//         agentId: "admin", // In real implementation, use actual admin ID
//       });

//       setNewMessage("");
//       loadChat(); // Reload chat to get updated messages
//     } catch (error) {
//       console.error("Error sending message:", error);
//       alert("Error sending message. Please try again.");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleMarkResolved = async () => {
//     if (window.confirm("Mark this chat as resolved?")) {
//       try {
//         await axios.put(`${API_BASE}/chat/${chatId}/resolve`);
//         loadChat();
//         onBack && onBack();
//       } catch (error) {
//         console.error("Error marking chat as resolved:", error);
//         alert("Error updating chat status. Please try again.");
//       }
//     }
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString();
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   if (loading) {
//     return <div className="loading">Loading chat...</div>;
//   }

//   if (!chat) {
//     return (
//       <div
//         className="chart-card"
//         style={{ textAlign: "center", padding: "40px" }}
//       >
//         <MessageSquare
//           size={48}
//           color="var(--text-gray)"
//           style={{ marginBottom: "15px" }}
//         />
//         <h3 style={{ color: "var(--text-gray)" }}>Chat not found</h3>
//         <button onClick={onBack} className="btn btn-secondary">
//           <ArrowLeft size={16} />
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="page-container">
//       {/* Chat Header */}
//       <div className="chart-card" style={{ marginBottom: "20px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//             <button onClick={onBack} className="btn btn-secondary">
//               <ArrowLeft size={16} />
//             </button>
//             <div>
//               <h2 style={{ color: "var(--primary-gold)", margin: 0 }}>
//                 {chat.customerName}
//               </h2>
//               <p
//                 style={{
//                   color: "var(--text-gray)",
//                   margin: 0,
//                   fontSize: "0.9rem",
//                 }}
//               >
//                 {chat.customerEmail} •{" "}
//                 {chat.chatType.replace("_", " ").toUpperCase()}
//               </p>
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//             <span
//               className={`flag-badge flag-${
//                 chat.status === "open" ? "yellow" : "green"
//               }`}
//             >
//               {chat.status.toUpperCase()}
//             </span>
//             {chat.status === "open" && (
//               <button
//                 onClick={handleMarkResolved}
//                 className="btn btn-primary"
//                 style={{ fontSize: "0.8rem", padding: "6px 12px" }}
//               >
//                 <CheckCircle size={14} />
//                 Mark Resolved
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div
//         className="chart-card"
//         style={{ height: "500px", display: "flex", flexDirection: "column" }}
//       >
//         <div
//           style={{
//             flex: 1,
//             overflowY: "auto",
//             padding: "20px",
//             display: "flex",
//             flexDirection: "column",
//             gap: "15px",
//           }}
//         >
//           {chat.messages && chat.messages.length > 0 ? (
//             chat.messages.map((message, index) => (
//               <div
//                 key={index}
//                 style={{
//                   display: "flex",
//                   flexDirection:
//                     message.sender === "customer" ? "row" : "row-reverse",
//                   gap: "10px",
//                   alignItems: "flex-end",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     borderRadius: "50%",
//                     background:
//                       message.sender === "customer"
//                         ? "var(--accent-blue)"
//                         : "var(--primary-gold)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     flexShrink: 0,
//                   }}
//                 >
//                   {message.sender === "customer" ? (
//                     <User size={20} color="white" />
//                   ) : (
//                     <MessageSquare size={20} color="var(--background-dark)" />
//                   )}
//                 </div>

//                 <div
//                   style={{
//                     maxWidth: "70%",
//                     padding: "12px 15px",
//                     borderRadius: "18px",
//                     background:
//                       message.sender === "customer"
//                         ? "var(--background-light)"
//                         : "var(--primary-gold)",
//                     color:
//                       message.sender === "customer"
//                         ? "var(--text-white)"
//                         : "var(--background-dark)",
//                     border:
//                       message.sender === "customer"
//                         ? "1px solid var(--border-color)"
//                         : "none",
//                   }}
//                 >
//                   <p style={{ margin: 0, lineHeight: "1.4" }}>{message.text}</p>
//                   <div
//                     style={{
//                       fontSize: "0.7rem",
//                       opacity: 0.7,
//                       marginTop: "5px",
//                       textAlign:
//                         message.sender === "customer" ? "left" : "right",
//                     }}
//                   >
//                     {formatTime(message.timestamp)}
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div
//               style={{
//                 textAlign: "center",
//                 color: "var(--text-gray)",
//                 fontStyle: "italic",
//                 marginTop: "50px",
//               }}
//             >
//               No messages yet
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Message Input */}
//         {chat.status === "open" && (
//           <div
//             style={{
//               padding: "20px",
//               borderTop: "1px solid var(--border-color)",
//               background: "var(--background-dark)",
//             }}
//           >
//             <form
//               onSubmit={handleSendMessage}
//               style={{ display: "flex", gap: "10px" }}
//             >
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type your reply..."
//                 disabled={sending}
//                 style={{
//                   flex: 1,
//                   padding: "12px 15px",
//                   background: "var(--input-bg)",
//                   border: "1px solid var(--border-color)",
//                   borderRadius: "25px",
//                   color: "var(--text-white)",
//                   fontSize: "14px",
//                 }}
//               />
//               <button
//                 type="submit"
//                 disabled={!newMessage.trim() || sending}
//                 className="btn btn-primary"
//                 style={{
//                   borderRadius: "50%",
//                   width: "45px",
//                   height: "45px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: 0,
//                 }}
//               >
//                 <Send size={18} />
//               </button>
//             </form>
//           </div>
//         )}

//         {chat.status === "resolved" && (
//           <div
//             style={{
//               padding: "15px",
//               background: "var(--accent-green)",
//               color: "white",
//               textAlign: "center",
//               fontSize: "0.9rem",
//               fontWeight: "bold",
//             }}
//           >
//             This chat has been resolved
//           </div>
//         )}
//       </div>

//       {/* Chat Info */}
//       <div className="chart-card" style={{ marginTop: "20px" }}>
//         <h3 style={{ color: "var(--primary-gold)", marginBottom: "15px" }}>
//           Chat Information
//         </h3>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//             gap: "15px",
//           }}
//         >
//           <div>
//             <strong style={{ color: "var(--text-white)" }}>Customer:</strong>
//             <p style={{ color: "var(--text-gray)", margin: 0 }}>
//               {chat.customerName}
//             </p>
//           </div>
//           <div>
//             <strong style={{ color: "var(--text-white)" }}>Email:</strong>
//             <p style={{ color: "var(--text-gray)", margin: 0 }}>
//               {chat.customerEmail}
//             </p>
//           </div>
//           <div>
//             <strong style={{ color: "var(--text-white)" }}>Type:</strong>
//             <p style={{ color: "var(--text-gray)", margin: 0 }}>
//               {chat.chatType.replace("_", " ").toUpperCase()}
//             </p>
//           </div>
//           <div>
//             <strong style={{ color: "var(--text-white)" }}>Started:</strong>
//             <p style={{ color: "var(--text-gray)", margin: 0 }}>
//               {formatDate(chat.createdAt)} at {formatTime(chat.createdAt)}
//             </p>
//           </div>
//           <div>
//             <strong style={{ color: "var(--text-white)" }}>Assigned to:</strong>
//             <p style={{ color: "var(--text-gray)", margin: 0 }}>
//               {chat.assignedTo?.fullName || "Unassigned"}
//             </p>
//           </div>
//           <div>
//             <strong style={{ color: "var(--text-white)" }}>Messages:</strong>
//             <p style={{ color: "var(--text-gray)", margin: 0 }}>
//               {chat.messages?.length || 0}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;
