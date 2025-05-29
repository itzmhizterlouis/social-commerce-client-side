// src/components/HomePage.tsx
import React from 'react';
import type { PostItem, Product } from '../App';
import Post from './Post';

interface HomePageProps {
  posts: PostItem[];
  addToCart: (product: Product) => void;
  loading: boolean; // ADDED: Indicates if posts are being loaded
  error: string | null; // ADDED: Stores any error message
}

const HomePage: React.FC<HomePageProps> = ({ posts, addToCart, loading, error }) => {
  return (
    <div className="flex flex-col items-center py-4 px-2 sm:px-4 md:px-0">
      {/* ADDED: Loading and Error States */}
      {loading && (
        <div className="text-center text-gray-400 py-10">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3">Fetching posts...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 py-10">
          <p className="mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {/* RENDER POSTS ONLY IF NOT LOADING AND NO ERROR AND POSTS EXIST */}
      {!loading && !error && posts.length > 0 && (
        posts.map((post) => (
          <Post key={post.id} post={post} addToCart={addToCart} />
        ))
      )}

      {/* "No posts" message only if not loading, no error, and no posts */}
      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-400 text-center mt-8">No posts to display.</p>
      )}
    </div>
  );
};

export default HomePage;