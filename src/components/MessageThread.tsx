import React, { useEffect, useRef, useState } from 'react';
import { sendMessage, type Message } from './api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Props {
  conversation: any;
  currentUserId: string;
}

const WEBSOCKET_URL = 'https://social-commerce-be-production.up.railway.app/ws'; // Use ws:// for local dev, wss:// for production

const MessageThread: React.FC<Props> = ({ conversation, currentUserId }) => {
const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  // Load initial messages when conversation changes
  useEffect(() => {
    console.log('Loading messages for conversation:', conversation.roomId);
    setMessages(conversation.messages || []);
  }, [conversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // STOMP over SockJS WebSocket connection
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      reconnectDelay: 5000,
      debug: () => {},
    });

    stompClient.onConnect = () => {
      stompClient.subscribe(
        `/topic/conversation/${conversation.roomId}`,
        (message) => {
          try {
            const msgObj = JSON.parse(message.body)["content"];
            setMessages(prev => [...prev, msgObj]);
          } catch (e) {
            // Ignore non-JSON messages
          }
        }
      );
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [conversation.roomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    console.log('Sending message:', conversation.roomId);
    await sendMessage(conversation.roomId, input);
    // setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        {messages.map(msg => (
          <div
            key={msg.messageId}
            className={`mb-2 flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div>
              <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${
                msg.senderId === currentUserId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}>
                {msg.content}
              </div>
              <div className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-right text-gray-300' : 'text-left text-gray-400'}`}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex p-4 border-t border-gray-700 bg-gray-800">
        <input
          type="text"
          className="flex-1 bg-gray-700 text-white rounded-l px-4 py-2 focus:outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageThread;
