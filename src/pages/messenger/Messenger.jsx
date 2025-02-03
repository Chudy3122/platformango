"use client";

import "./messenger.css";
import Conversation from "@/components/conversations/page";
import Message from "@/components/message/page";
import SearchCreateConversation from "@/components/searchCreateConversation/page";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef(null);
  const { user, isLoaded } = useUser();

  // Pobieranie konwersacji
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.get('/api/conversations');
        if (Array.isArray(res.data)) {
          setConversations(res.data.map(conv => ({
            ...conv,
            id: conv.id,
            _id: conv.id
          })));
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setConversations([]);
      }
    };

    const interval = setInterval(fetchConversations, 5000); // Odświeżaj co 5 sekund
    fetchConversations(); // Pierwsze pobranie

    return () => clearInterval(interval);
  }, [user]);

  // Pobieranie wiadomości dla aktualnej konwersacji
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?.id) return;

      try {
        const res = await axios.get(`/api/messages?conversationId=${currentChat.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    const interval = setInterval(getMessages, 3000); // Odświeżaj co 3 sekundy
    getMessages(); // Pierwsze pobranie

    return () => clearInterval(interval);
  }, [currentChat]);

  // Automatyczne przewijanie do najnowszej wiadomości
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Wysyłanie wiadomości
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?.id || !user?.id) return;

    const messageData = {
      content: newMessage,
      conversationId: currentChat.id
    };

    try {
      const res = await axios.post("/api/messages", messageData);
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Obsługa stanu ładowania
  if (!isLoaded) {
    return <div>Ładowanie...</div>;
  }

  // Obsługa braku zalogowania
  if (!user) {
    return <div>Zaloguj się, aby kontynuować</div>;
  }

  return (
    <div className="messenger">
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <SearchCreateConversation 
            onConversationCreated={(receiverId, receiverType) => {
              // Handle new conversation
            }}
            currentChat={currentChat}
          />
          <div className="conversations-wrapper">
            {conversations.map((c) => (
              <Conversation 
                key={c.id}
                conversation={c}
                currentUser={user}
                setCurrentChat={setCurrentChat}
                currentChat={currentChat}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="chatBox">
        <div className="chatBoxWrapper">
          {currentChat ? (
            <>
              <div className="chatBoxTop">
                <div className="chatBoxHeader">
                  <img
                    src="/noAvatar.png"
                    alt="avatar"
                    className="currentChatAvatar"
                  />
                  <span className="currentChatName">
                    {currentChat.userData?.username || "Chat"}
                  </span>
                </div>
                <div className="messagesContainer">
                  {messages.map((m) => (
                    <div key={m.id} ref={scrollRef}>
                      <Message 
                        message={m} 
                        own={m.senderId === user?.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="chatBoxBottom">
                <textarea
                  className="chatMessageInput"
                  placeholder="Write your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button className="chatSubmitButton" onClick={handleSubmit}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <span className="noConversationText">
              Select a conversation to start chatting.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}