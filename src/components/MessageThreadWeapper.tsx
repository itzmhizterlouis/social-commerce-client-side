import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConversationById } from './api'; // You need to implement this API call
import MessageThread from './MessageThread';

const MessageThreadWrapper: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    getConversationById(roomId).then(conv => {
      setConversation(conv);
      setLoading(false);
    });
  }, [roomId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!conversation) return <div className="p-4">Conversation not found.</div>;

  return <MessageThread conversation={conversation} currentUserId={currentUserId} />;
};

export default MessageThreadWrapper;
