'use client';

import "./messenger.css";
import Topbar from "../../components/topbar/page.jsx";
import Conversation from "../../components/conversations/page.jsx";
import Message from "../../components/message/page.jsx";
import ChatOnline from "../../components/chatOnline/page.jsx";
import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";

export default function Messenger() {
  const { user: clerkUser, isLoaded } = useUser();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef(null);
  const scrollRef = useRef(null);
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();

  const getOnlineUsers = useCallback(() => {
    if (socket.current) {
      socket.current.on("getUsers", (users) => {
        setOnlineUsers(users);
      });
    }
  }, []);

  const initializeSocket = useCallback(() => {
    if (typeof window === 'undefined' || !isLoaded || !clerkUser) return;

    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });

    socket.current.emit("addUser", clerkUser.id);
    getOnlineUsers();

    return () => {
      socket.current?.disconnect();
    };
  }, [clerkUser, isLoaded, getOnlineUsers]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!clerkUser?.id) return;
    try {
      const res = await axios.get("/api/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Błąd pobierania konwersacji:", err);
    }
  }, [clerkUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?.id || !clerkUser?.id) {
      return;
    }
  
    const messageData = {
      content: newMessage,
      conversationId: currentChat.id
    };
  
    try {
      const res = axios.post("/api/messages", messageData);
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
  
      if (socket.current) {
        const receiverMember = currentChat.members.find(m => m.memberId !== clerkUser.id);
        if (receiverMember) {
          socket.current.emit("sendMessage", {
            senderId: clerkUser.id,
            receiverId: receiverMember.memberId,
            text: newMessage,
          });
        }
      }
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
    }
  };

  // Renderowanie warunkowe
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isLoaded) {
    return <div>Ładowanie...</div>;
  }

  if (!clerkUser) {
    return <div>Nie jesteś zalogowany</div>;
  }

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder={t.messages.search} className="chatMenuInput" />
            {conversations.map((c) => (
              <div key={c._id} onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={clerkUser} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div key={m._id} ref={scrollRef}>
                      <Message message={m} own={m.sender === clerkUser.id} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder={t.messages.placeholder}
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    {t.messages.send}
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                {t.messages.searchToChat}
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={clerkUser.id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}