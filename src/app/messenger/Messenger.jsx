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

export default function Messenger() {
  const { user: clerkUser, isLoaded } = useUser();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();

  // Pobieranie wiadomości dla aktywnej konwersacji
  useEffect(() => {
    let interval;
    
    const fetchMessages = async () => {
      if (!currentChat?.id) return;
      
      try {
        const res = await axios.get(`/api/messages/${currentChat.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Błąd pobierania wiadomości:", err);
      }
    };

    fetchMessages(); // Pierwsze pobranie
    interval = setInterval(fetchMessages, 3000); // Sprawdzaj co 3 sekundy

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentChat?.id]);

  // Przewijanie do najnowszej wiadomości
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pobieranie listy konwersacji
  const fetchConversations = useCallback(async () => {
    if (!clerkUser?.id) return;
    
    try {
      const res = await axios.get("/api/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Błąd pobierania konwersacji:", err);
    }
  }, [clerkUser?.id]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Odświeżaj co 5 sekund
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Wysyłanie nowej wiadomości
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?.id || !clerkUser?.id) return;
  
    const messageData = {
      content: newMessage,
      conversationId: currentChat.id
    };
  
    try {
      const res = await axios.post("/api/messages", messageData);
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
    }
  };

  // Obsługa stanu ładowania
  if (typeof window === 'undefined' || !isLoaded) {
    return <div className="loading-state">Ładowanie...</div>;
  }

  if (!clerkUser) {
    return <div className="auth-error">Nie jesteś zalogowany</div>;
  }

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input 
              placeholder={t.messages?.search || 'Szukaj'} 
              className="chatMenuInput" 
            />
            {conversations.map((c) => (
              <div 
                key={c.id || c._id} 
                onClick={() => setCurrentChat(c)}
                className={`conversation-item ${currentChat?.id === c.id ? 'active' : ''}`}
              >
                <Conversation 
                  conversation={c} 
                  currentUser={clerkUser} 
                />
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
                    <div key={m.id || m._id} ref={scrollRef}>
                      <Message 
                        message={m} 
                        own={m.sender === clerkUser.id} 
                      />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder={t.messages?.placeholder || 'Napisz wiadomość...'}
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                  />
                  <button 
                    className="chatSubmitButton" 
                    onClick={handleSubmit}
                  >
                    {t.messages?.send || 'Wyślij'}
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                {t.messages?.searchToChat || 'Wybierz rozmowę, aby rozpocząć czat'}
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              currentId={clerkUser.id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}