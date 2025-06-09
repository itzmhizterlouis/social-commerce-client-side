import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Post from './Post';
import type { PostItem, Product } from '../App';
import { getUserByIdApi, getPostsByUserApi, followUserApi } from './api';

interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  activated: boolean;
  phoneNumber: string;
  address: {
    streetAddress: string;
    state: string;
    country: string;
  };
  followerIds: string[];
  followingIds: string[];
  profileImageUrl: string;
}

const UserSkeleton = () => (
  <div className="flex items-center gap-6 mb-8 animate-pulse">
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="flex-1 space-y-3">
      <div className="h-6 w-[40vw] max-w-[320px] bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-[30vw] max-w-[240px] bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-[20vw] max-w-[160px] bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-[50vw] max-w-[400px] bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

const PostSkeleton = () => (
  <div className="flex items-center gap-6 mb-8 animate-pulse">
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="flex-1 space-y-3">
      <div className="h-6 w-[40vw] max-w-[320px] bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-[30vw] max-w-[240px] bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-[20vw] max-w-[160px] bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-[50vw] max-w-[400px] bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

const UserProfilePage: React.FC<{ addToCart: (product: Product) => void }> = ({ addToCart }) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // TODO: Replace with actual logged-in user ID from your auth state
  const currentUserId = localStorage.getItem('currentUserId');

  useEffect(() => {
    setLoadingUser(true);
    setLoadingPosts(true);
    setUser(null);
    setPosts([]);
    // Fetch user info first
    getUserByIdApi(userId!)
      .then(userData => {
        setUser(userData);
        setLoadingUser(false);
        // Check if current user is following
        if (currentUserId && userData.followerIds.includes(currentUserId)) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
        // Then fetch posts
        getPostsByUserApi(userId!, 10, 0)
          .then(userPosts => {
            setPosts(userPosts.map((apiPost: any, index: number) => ({
              id: apiPost.postId?.toString() || `temp-${Date.now()}-${index}`,
              username: apiPost.fullName || 'Unknown User',
              profileImageUrl: apiPost.profileImageUrl,
              videoUrl: apiPost.contentUrl,
              caption: apiPost.caption || '',
              timeAgo: new Date(apiPost.createdAt).toLocaleString() || 'Just now',
              products: Array.isArray(apiPost.products) ? apiPost.products.map((p: any) => ({
                productId: Number(p.productId || p.id),
                userId: p.userId,
                name: p.name,
                amount: p.amount,
                imageUrl: p.imageUrl,
              })) : [],
              likes: apiPost.likes || 0,
              liked: apiPost.liked,
              comments: apiPost.comments || [],
              userId: apiPost.userId
            })));
            setLoadingPosts(false);
          })
          .catch(() => setLoadingPosts(false));
      })
      .catch(() => setLoadingUser(false));
  }, [userId, currentUserId]);

  // Dummy follow/unfollow handlers (replace with real API calls)
const handleFollow = async () => {
  setFollowLoading(true);
  try {
    await followUserApi(userId!);
    setIsFollowing(true);
    setUser(prev => prev ? { ...prev, followerIds: [...prev.followerIds, currentUserId!] } : prev);
  } catch (err) {
    alert('Failed to follow user.');
  } finally {
    setFollowLoading(false);
  }
};

const handleUnfollow = async () => {
  setFollowLoading(true);
  try {
    await followUserApi(userId!);
    setIsFollowing(false);
    // Optionally update follower count in UI:
    setUser(prev => prev ? { ...prev, followerIds: prev.followerIds.filter(id => id !== currentUserId) } : prev);
  } catch (err) {
    alert('Failed to unfollow user.');
  } finally {
    setFollowLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        ← Back
      </button>

      {/* User Info */}
      {loadingUser ? (
        <UserSkeleton />
      ) : user ? (
        <div className="flex items-center gap-6 mb-8">
          <img
            src={user.profileImageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-indigo-400"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500 dark:text-gray-300">{user.email}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span><b>{user.followerIds.length}</b> Followers</span>
              <span><b>{user.followingIds.length}</b> Following</span>
            </div>
            {/* <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {user.address.streetAddress}, {user.address.state}, {user.address.country}
            </div> */}
            {/* Follow/Unfollow Button */}
            {currentUserId && currentUserId !== user.userId && (
              <div className="mt-4">
                {isFollowing ? (
                  <button
                    onClick={handleUnfollow}
                    disabled={followLoading}
                    className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  >
                    {followLoading ? 'Unfollowing...' : 'Unfollow'}
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition"
                  >
                    {followLoading ? 'Following...' : 'Follow'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-10">User not found.</div>
      )}

      {/* Posts */}
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Posts</h3>
      {loadingPosts ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="text-gray-400">No posts yet.</div>
      ) : (
        posts.map(post => (
          <Post key={post.id} post={post} addToCart={addToCart} />
        ))
      )}
    </div>
  );
};

export default UserProfilePage;
