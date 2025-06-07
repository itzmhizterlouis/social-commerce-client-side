// src/components/Post.tsx
import React, { useState } from 'react'; // Import useState
import { HeartIcon, PaperAirplaneIcon, BookmarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconFilled } from '@heroicons/react/24/solid'; // Import solid heart icon for liked state
import type { CommentItem, PostItem, Product } from '../App';
import ProductDisplay from './ProductDisplay';
import { likePost } from './api'

interface PostProps {
  post: PostItem;
  addToCart: (product: Product) => void;
  // You might want to pass an onLike function from a parent component
  // if you're managing likes globally or need to update a parent's state.
  // onLike?: (postId: string) => Promise<void>;
}

const Post: React.FC<PostProps> = ({ post, addToCart /*, onLike */ }) => {
    // State to manage if the post is liked by the current user
    // You'd typically get the initial `isLiked` status from your `post` data
    // For demonstration, let's assume it's initially false or comes from `post.isLiked`
    const [isLiked, setIsLiked] = useState(post.liked || false);
    // State to manage the like count (optional, but common)
    const [likeCount, setLikeCount] = useState(post.likes || 0);

    const [showAllComments, setShowAllComments] = useState(false);

    const visibleComments = showAllComments
      ? post.comments || []
      : (post.comments || []).slice(0, 2);

    const handleLikeClick = async () => {
      // Optimistically update the UI
      setIsLiked(prev => !prev);
      setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));

      try {
        // Replace with your actual API endpoint and method
        const response = await likePost(Number(post.id));

        if (response.status != 'OK') {
          // If the API call fails, revert the UI state
          setIsLiked(prev => !prev);
          setLikeCount(prev => (isLiked ? prev + 1 : prev - 1));
          console.error("Error is ", response.status)
          // You might want to show a user-friendly error message here
        } else {
          // Optionally, parse the response if your API returns updated data
          // const data = await response.json();
          // setLikeCount(data.newLikeCount); // Update with server's count
          console.log(`Post ${post.id} ${isLiked ? 'unliked' : 'liked'} successfully.`);
        }
      } catch (error) {
        // Handle network errors
        setIsLiked(prev => !prev);
        setLikeCount(prev => (isLiked ? prev + 1 : prev - 1));
        console.error('Error making API call:', error);
        // Show an error message
      }

      // If you passed an onLike prop from the parent, you could call it here:
      // if (onLike) {
      //   await onLike(post.id);
      // }
    };

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-[50vw] mx-auto my-4 w-full">
        {/* Post Header */}
        <div className="flex items-center p-4">
          <img
            src={post.profileImageUrl}
            alt={`${post.username}'s avatar`}
            className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
          />
          <p className="font-semibold text-sm text-white flex items-center">
            {post.username}
          </p>
          <span className="text-gray-400 text-xs ml-2">· {post.timeAgo}</span>
          <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400 ml-auto cursor-pointer hover:text-white" />
        </div>

        {/* Video Media */}
        <div className="bg-black">
          <video controls muted loop
            className="w-full h-auto max-h-[30vw] object-contain">
            <source src={post.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Post Actions */}
        <div className="flex justify-between items-center p-4">
          <div className="flex space-x-4">
            {/* Like Button */}
            {isLiked ? (
              <HeartIconFilled
                className="h-6 w-6 text-red-500 cursor-pointer"
                onClick={handleLikeClick}
              />
            ) : (
              <HeartIcon
                className="h-6 w-6 text-gray-400 cursor-pointer hover:text-red-400"
                onClick={handleLikeClick}
              />
            )}
            {/* Display like count */}
            <span className="text-gray-400 text-sm flex items-center">{likeCount}</span>

            <PaperAirplaneIcon className="h-6 w-6 rotate-45 -mt-1 -mr-2 text-gray-400 cursor-pointer hover:text-white" />
          </div>
          <BookmarkIcon className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white" />
        </div>

        {/* Caption */}
        <p className="text-sm px-4 pb-2 text-white">
          <span className="font-semibold mr-1">{post.username}</span>
          {post.caption}
        </p>

        {/* Products associated with the post */}
        {post.products && post.products.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-700 mt-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Products in this Post:</h4>
            <ProductDisplay products={post.products} addToCart={addToCart} />
          </div>
        )}

        {/* Comments Section */}
        {post.comments && post.comments.length > 0 && (
          <div className="px-4 pb-2">
            <h4 className="text-xs text-gray-400 mb-1">Comments</h4>
            <ul>
              {visibleComments.map((comment: CommentItem) => (
                <li key={comment.commentId} className="mb-1 flex items-start">
                  <img
                    src={comment.profileImageUrl}
                    alt={`${comment.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-xs text-white-300 mr-2">
                      {comment.username}
                    </span>
                    <span className="text-gray-300 text-xs">{comment.comment}</span>
                    <span className="text-gray-500 text-[10px] ml-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {post.comments.length > 2 && !showAllComments && (
              <span
                className="text-xs mt-1 cursor-pointer underline text-gray-400 hover:underline hover:text-white"
                onClick={() => setShowAllComments(true)}
              >
                View all comments
              </span>
            )}
            {showAllComments && post.comments.length > 2 && (
              <span
                className="text-xs mt-1 cursor-pointer underline text-gray-400 hover:underline hover:text-white"
                onClick={() => setShowAllComments(false)}
              >
                Hide comments
              </span>
            )}
          </div>
        )}

        {/* Add a comment section */}
        <div className="text-gray-400 text-xs px-4 pb-4 border-t border-gray-700 pt-3 mt-4">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
            />
        </div>
      </div>
    );
  };

export default Post;