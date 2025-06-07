import React from 'react';
import type { PostItem, Product } from '../App';
import Post from './Post';
import { useInView } from 'react-intersection-observer';

interface HomePageProps {
  posts: PostItem[];
  addToCart: (product: Product) => void;
  loading: boolean;
  error: string | null;
  hasMorePosts: boolean;
  loadingPosts: boolean;
  currentPage: number;
  loadPosts: (page: number) => void;
}

const PostSkeleton = () => (
  <div className="w-full max-w-[50vw] bg-gray-700 rounded-lg shadow-lg mb-6 animate-pulse">
    <div className="flex items-center p-4">
      <div className="w-10 h-10 bg-gray-600 rounded-full mr-3" />
      <div className="flex-1">
        <div className="h-3 bg-gray-600 rounded w-1/4 mb-2"></div>
        <div className="h-2 bg-gray-600 rounded w-1/6"></div>
      </div>
    </div>
    <div className="bg-gray-600 h-64 w-full rounded"></div>
    <div className="p-4">
      <div className="h-3 bg-gray-600 rounded w-1/2 mb-2"></div>
      <div className="h-2 bg-gray-600 rounded w-1/3"></div>
    </div>
    <div className="px-4 pb-4">
      <div className="h-2 bg-gray-600 rounded w-1/4 mb-1"></div>
      <div className="h-2 bg-gray-600 rounded w-1/3"></div>
    </div>
  </div>
);

const BottomLoader = () => (
  <div className="flex justify-center py-6">
    <div className="h-8 w-8 rounded-full border-4 border-gray-400 border-t-indigo-400 animate-spin" />
  </div>
);

const HomePage: React.FC<HomePageProps> = ({
  posts,
  addToCart,
  loading,
  error,
  hasMorePosts,
  loadingPosts,
  currentPage,
  loadPosts,
}) => {
  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasMorePosts && !loadingPosts) {
      loadPosts(currentPage + 1);
    }
  }, [inView, hasMorePosts, loadingPosts, currentPage, loadPosts]);

  // Only show skeletons if loading and there are no posts yet
  const showInitialSkeletons = loading && posts.length === 0;

  return (
    <div className="flex flex-col items-center py-4 px-2 sm:px-4 md:px-0">
      {/* Initial loading skeletons */}
      {showInitialSkeletons && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* Error message */}
      {error && (
        <div className="text-center text-red-400 py-10">
          <p className="mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {/* Posts and infinite scroll loader */}
      {posts.length > 0 && (
        <>
          {posts.map((post) => (
            <Post key={post.id} post={post} addToCart={addToCart} />
          ))}
          {/* Sentinel for infinite scroll */}
          <div ref={ref} style={{ height: 1 }} />
          {/* Only show the bottom loader when paginating */}
          {loadingPosts && <BottomLoader />}
        </>
      )}

      {/* No posts */}
      {!showInitialSkeletons && !error && posts.length === 0 && (
        <p className="text-gray-400 text-center mt-8">No posts to display.</p>
      )}
    </div>
  );
};

export default HomePage;