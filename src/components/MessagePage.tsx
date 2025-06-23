import React, { useEffect, useState } from 'react';
import { getConversations, getUserByIdApi } from './api';
import { useNavigate } from 'react-router-dom';
import MessageThread from './MessageThread';

const MessagesPage: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [userInfos, setUserInfos] = useState<{ [userId: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    (async () => {
      const rooms = await getConversations();
      const infos: { [userId: string]: any } = {};
      for (const room of rooms) {
        const otherUserId = room.firstUser === currentUserId ? room.secondUser : room.firstUser;
        if (!infos[otherUserId]) {
          infos[otherUserId] = await getUserByIdApi(otherUserId);
        }
      }
      setUserInfos(infos);
      setConversations(rooms);
      setLoading(false);
    })();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <svg className="animate-spin h-8 w-8 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-400">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full relative">
      {/* Conversation List */}
      <div className="w-full md:w-1/3 border-r border-gray-700 bg-gray-900 pb-16 md:pb-0">
        <h2 className="text-lg font-bold p-4">Messages</h2>
        <ul>
          {conversations.map(room => {
            const otherUserId = room.firstUser === currentUserId ? room.secondUser : room.firstUser;
            const userInfo = userInfos[otherUserId] || {};
            const lastMsg = room.messages && room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;
            return (
              <li
                key={room.roomId}
                className={`p-4 cursor-pointer hover:bg-gray-800 ${selectedConversation?.roomId === room.roomId ? 'bg-gray-800' : ''}`}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    // On mobile, navigate to thread page
                    navigate(`/messages/${room.roomId}`);
                  } else {
                    // On desktop, show thread in split view
                    setSelectedConversation(room);
                  }
                }}
              >
                <div className="flex items-center">
                  <img
                    src={userInfo.profileImageUrl || '/default-avatar.png'}
                    alt={userInfo.username || 'User'}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : userInfo.username || otherUserId}</div>
                    <div className="text-xs text-gray-400 truncate">{lastMsg?.content || ''}</div>
                    <div className="text-xs text-gray-500">{lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleString() : ''}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* Mobile-only input at bottom */}
        <form
          className="fixed bottom-0 left-0 w-full md:hidden bg-gray-800 border-t border-gray-700 flex p-2"
          onSubmit={e => e.preventDefault()}
        >
          <input
            type="text"
            className="flex-1 bg-gray-700 text-white rounded-l px-4 py-2 focus:outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Select a conversation to start chatting"
            disabled
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-r opacity-50 cursor-not-allowed"
            disabled
          >
            Send
          </button>
        </form>
      </div>
      {/* Message Thread (hidden on mobile) */}
      <div className="flex-1 hidden md:block">
        {selectedConversation ? (
          <MessageThread conversation={selectedConversation} currentUserId={currentUserId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a conversation</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
