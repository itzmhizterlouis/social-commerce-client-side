// src/components/Post.tsx
import React from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon, BookmarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import type { PostItem, Product } from '../App';
import ProductDisplay from './ProductDisplay';

interface PostProps {
  post: PostItem;
  addToCart: (product: Product) => void;
}

const Post: React.FC<PostProps> = ({ post, addToCart }) => {
    return (
      // OPTIMIZED: Using vw for max-width of the post card itself.
      // On small screens, it remains `w-full`. On larger screens, its max-width
      // will be 50% of the viewport width, ensuring it scales fluidly.
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-[50vw] mx-auto my-4 w-full">
        {/* Post Header */}
        <div className="flex items-center p-4">
          <img
            src={post.avatarUrl}
            alt={`${post.username}'s avatar`}
            // Avatar size (w-10 h-10) is typically small and fixed for consistency,
            // so converting to vw might make it too small or large on extremes.
            // Leaving as rem-based for better control.
            className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer border-2 border-indigo-400"
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
            // OPTIMIZED: Using vw for max-height of the video.
            // This makes the video's max height scale proportionally with the viewport width,
            // maintaining a visual relationship with the post's overall width.
            className="w-full h-auto max-h-[30vw] object-contain">
            <source src={post.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Post Actions */}
        <div className="flex justify-between items-center p-4">
          <div className="flex space-x-4">
            {/* Icon sizes (h-6 w-6) are typically fixed for readability/usability,
                converting to vw might make them too small/large. */}
            <HeartIcon className="h-6 w-6 text-gray-400 cursor-pointer hover:text-red-400" />
            <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-400 cursor-pointer hover:text-white" />
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
            {/* ProductDisplay itself will handle its internal responsiveness */}
            <ProductDisplay products={post.products} addToCart={addToCart} />
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