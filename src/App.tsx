import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import HomePage from './components/HomePage';
import CreatePostPage from './components/CreatePostPage';
import ProductsPage from './components/ProductsPage';
import CartPage from './components/CartPage';
import RightSidebar from './components/RightSidebar';
import CartSidebar from './components/CartSideBar';
import SignInPage from './components/SignInPage';
// Import the new getLoggedInUser and its type
import { 
  getAllProducts, fetchPosts, addToCartApi, getCartApi, getLoggedInUser, type BackendCartResponse, type LoggedInUserResponse, removeFromCartApi,
  getOrdersApi, type OrderResponse, initiateCheckout, searchApi,
  updateUserApi,
  type UpdateUserPayload
 } from './components/api';
import OrdersSidebar from './components/OrderSidebar';
import ActivateUserPage from './components/ActivateUserPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import UserProfilePage from './components/UserProfilePage';

export interface SearchResultItem {
  type: 'post' | 'product'; // Assuming the backend returns a 'type' field
  id: string; // The ID of the post or product
  title: string; // Name of product or caption of post
  imageUrl?: string; // Image for product or video thumbnail for post
  // Add other relevant fields if the backend provides them
  // e.g., for products: amount, userId
  // e.g., for posts: username, avatarUrl, likes, etc.
}

export interface CommentItem {
  commentId: number;
  comment: string;
  userId: string;
  createdAt: string;
  profileImageUrl: string;
  username: string;
  updatedAt: string;
}

export interface Product {
  productId?: number;
  userId: string; // Now this will be the actual user ID
  name: string;
  amount: number;
  imageFile?: File;
  imageUrl?: string;
  quantity?: number;
}

export interface PostItem {
  id: string;
  username: string;
  profileImageUrl: string;
  videoUrl: string;
  caption: string;
  timeAgo: string;
  products: Product[];
  likes?: number;
  liked?: boolean;
  comments?: CommentItem[];
  userId: string;
}

// src/App.tsx

// NEW: Interfaces for Order and OrderProduct based on your API response
export interface OrderProduct {
  name: string;
  amount: number;
  userId: string;
  productId: number;
}

export interface Order {
  orderId: string;
  userId: string;
  totalAmount: number;
  paid: boolean;
  products: OrderProduct[];
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuthStatus = localStorage.getItem('isAuthenticated');
    return savedAuthStatus === 'true';
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('authToken');
    return savedToken;
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);


  // NEW STATE: For orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const [searchResults, setSearchResults] = useState<PostItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState(false);

  const [showProfileUpdatePage, setShowProfileUpdatePage] = useState(false);
  

// NEW: State for the actual logged-in user's ID
  // Initialize currentUserId directly from localStorage on component mount
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('currentUserId');
  });

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  // userProducts will now be filtered based on `currentUserId`
  const [userProducts, setUserProducts] = useState<Product[]>([]);

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);
  const [cartTotalAmount, setCartTotalAmount] = useState<number>(0);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab ? savedTab : 'Home';
  });

  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  // ==================== NEW: Fetch Logged-In User ID ====================
  const fetchAndSetUserId = useCallback(async () => {
    if (!isAuthenticated || !authToken) {
      console.log("App.tsx: Not authenticated or no token, cannot fetch user ID.");
      setCurrentUserId(null); // Ensure ID is null if not authenticated
      return;
    }
    try {
      console.log("App.tsx: Attempting to fetch logged-in user ID.");
      const user: LoggedInUserResponse = await getLoggedInUser();
      console.log("App.tsx: Logged-in user data:", user);
      if (user && user.userId) {
        setCurrentUserId(user.userId);
        localStorage.setItem('currentUserId', user.userId); // You could optionally store this in localStorage
        if (user.activated === false) { // If user is not activated
          console.log("App.tsx: User account is NOT activated. Displaying profile update page.");
          setShowProfileUpdatePage(true);
          return;
        }

        setShowProfileUpdatePage(false);
      } else {
        console.error("App.tsx: Logged-in user response is missing ID:", user);
        setCurrentUserId(null);
        // Consider setting isAuthenticated to false if user ID cannot be retrieved
        setIsAuthenticated(false);
        setAuthToken(null);
      }
    } catch (error: any) {
      console.error('App.tsx: Failed to fetch logged-in user ID:', error);
      setCurrentUserId(null);
      localStorage.removeItem('currentUserId'); // Clear from localStorage on API error
      // If fetching user ID fails, it might mean the token is invalid, so log out
      setIsAuthenticated(false);
      setAuthToken(null);
    }
  }, [isAuthenticated, authToken]);

  const handleUserActivation = useCallback(async (payload: UpdateUserPayload) => {
    if (!currentUserId) {
      alert('User ID not available for update.');
      return;
    }
    try {
      console.log("App.tsx: Calling updateUserApi for profile update with payload:", payload);
      await updateUserApi(payload);
      console.log("App.tsx: User profile updated successfully. Re-fetching user status...");
      alert('Profile updated successfully! Redirecting to Home page.');
      setShowProfileUpdatePage(false); // <--- HIDE THE STANDALONE PAGE
      // After successful update, re-fetch user status.
      // fetchAndSetUserId will check 'activated' (which should now be true) and load main data.
      await fetchAndSetUserId();
    } catch (error: any) {
      console.error('App.tsx: Error updating user profile:', error);
      alert(`Failed to update profile: ${error.message || 'An unexpected error occurred. Please try again.'}`);
    }
  }, [currentUserId, fetchAndSetUserId, setShowProfileUpdatePage]); // <--- ADDED: setShowProfileUpdatePage to dependencies

  // ==================== API Loading Callbacks (updated to use currentUserId) ====================

  const loadOrders = useCallback(async () => {
    console.log("App.tsx: loadOrders called.");
    if (!isAuthenticated || !currentUserId) {
      console.warn("App.tsx: Not authenticated or user ID not available, skipping order load.");
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      const fetchedOrders: OrderResponse[] = await getOrdersApi();
      console.log('App.tsx: Fetched orders from API:', fetchedOrders);

      if (!Array.isArray(fetchedOrders)) {
          console.error("App.tsx: getOrdersApi response is not an array:", fetchedOrders);
          setErrorOrders("Unexpected API response format for orders.");
          setOrders([]);
          return;
      }

      const formattedOrders: Order[] = fetchedOrders.map((apiOrder: any) => ({
        orderId: apiOrder.orderId,
        userId: apiOrder.userId,
        totalAmount: apiOrder.totalAmount,
        paid: apiOrder.paid,
        products: Array.isArray(apiOrder.products) ? apiOrder.products.map((p: any) => ({
          name: p.name,
          amount: p.amount,
          userId: p.userId,
          productId: p.productId,
        })) : [],
      }));
      setOrders(formattedOrders);
      console.log('App.tsx: Formatted orders before setting state:', formattedOrders);
    } catch (error: any) {
      console.error('App.tsx: Error fetching orders:', error);
      setErrorOrders(error.message || 'Failed to fetch orders.');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
      console.log("App.tsx: loadOrders finished. loadingOrders set to false.");
    }
  }, [isAuthenticated, currentUserId]);

  const loadAvailableProducts = useCallback(async () => {
    console.log("App.tsx: loadAvailableProducts called.");
    if (!isAuthenticated || !currentUserId) { // Dependency on currentUserId
      console.warn("App.tsx: Not authenticated or user ID not available, skipping product load.");
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const products = await getAllProducts();
      console.log("App.tsx: Raw products from API (getAllProducts):", products);

      if (!Array.isArray(products)) {
          console.error("App.tsx: getAllProducts API response is not an array:", products);
          setErrorProducts("Unexpected API response format for all products.");
          setAvailableProducts([]);
          setUserProducts([]);
          return;
      }

      const formattedProducts: Product[] = products.map((p: any, index: number) => {
        if (p === null || typeof p !== 'object') {
            console.warn(`App.tsx: Product at index ${index} is null or not an object during mapping:`, p);
            return null;
        }
        if ((p.productId === undefined || p.productId === null) && (p.id === undefined || p.id === null)) {
            console.warn(`App.tsx: Product at index ${index} is missing both productId and id. Object:`, p);
        }
        if (p.name === undefined || p.name === null) {
            console.warn(`App.tsx: Product at index ${index} is missing name. Object:`, p);
        }
        if (p.amount === undefined || p.amount === null) {
            console.warn(`App.tsx: Product at index ${index} is missing amount. Object:`, p);
        }
        if (p.imageUrl === undefined || p.imageUrl === null || p.imageUrl === '') {
            console.warn(`App.tsx: Product at index ${index} is missing or empty imageUrl. Object:`, p);
        }

        const numericProductId = Number(p.productId || p.id);
        if (isNaN(numericProductId)) {
            console.error(`App.tsx: Invalid productId derived for product at index ${index}. Original:`, p.productId, p.id, "Mapped:", numericProductId);
            return null;
        }

        return {
          productId: numericProductId,
          userId: p.userId || currentUserId, // Use actual currentUserId as fallback for userId
          name: p.name,
          amount: p.amount,
          imageUrl: p.imageUrl,
        };
      }).filter(Boolean) as Product[];

      console.log("App.tsx: Formatted products (all) after mapping:", formattedProducts);
      setAvailableProducts(formattedProducts);

      // Filter for user-specific products using the actual currentUserId
      const filteredUserProducts = formattedProducts.filter(p => p.userId === currentUserId);
      console.log(`App.tsx: Filtered user products (userId === '${currentUserId}'):`, filteredUserProducts);
      if (filteredUserProducts.length === 0 && formattedProducts.length > 0) {
          console.warn(`App.tsx: No products found for currentUserId ('${currentUserId}') even though total products exist. Check backend userId values.`);
      }
      setUserProducts(filteredUserProducts);

    } catch (error: any) {
      console.error('App.tsx: Failed to fetch all products:', error);
      setErrorProducts(error.message || 'Failed to load products.');
      setAvailableProducts([]);
      setUserProducts([]);
    } finally {
      setLoadingProducts(false);
      console.log("App.tsx: loadAvailableProducts finished. loadingProducts set to false.");
    }
  }, [isAuthenticated, currentUserId]); // Dependency on currentUserId

  const loadPosts = useCallback(async (page = 0) => {
    if (!isAuthenticated || !currentUserId) {
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const fetchedApiPosts = await fetchPosts(10, page);
      if (!Array.isArray(fetchedApiPosts)) {
        setErrorPosts("Unexpected API response format for posts.");
        setHasMorePosts(false);
        setLoadingPosts(false);
        return;
      }

      const formattedPosts: PostItem[] = fetchedApiPosts.map((apiPost: any, index: number) => {
        if (apiPost === null || typeof apiPost !== 'object') {
            console.warn(`App.tsx: Post at index ${index} is null or not an object during mapping:`, apiPost);
            return null;
        }
        if (!apiPost.postId) {
            console.warn(`App.tsx: Post at index ${index} is missing postId. Object:`, apiPost);
        }
        if (!apiPost.contentUrl) {
            console.warn(`App.tsx: Post at index ${index} is missing contentUrl. Object:`, apiPost);
        }

        return {
          id: apiPost.postId?.toString() || `temp-${Date.now()}-${index}`,
          comments: Array.isArray(apiPost.comments)
              ? apiPost.comments.map((c: any) => ({
                  commentId: c.commentId,
                  comment: c.comment,
                  userId: c.userId,
                  createdAt: c.createdAt,
                  updatedAt: c.updatedAt,
                  profileImageUrl: c.profileImageUrl || 'https://i.pravatar.cc/150?img=' + (Number(c.userId || index) % 20),
                  username: c.username,
                }))
              : [],
          username: apiPost.fullName || 'Unknown User',
          profileImageUrl: apiPost.profileImageUrl || 'https://i.pravatar.cc/150?img=' + (Number(apiPost.postId || index) % 20),
          videoUrl: apiPost.contentUrl,
          caption: apiPost.caption || '',
          timeAgo: new Date(apiPost.createdAt).toLocaleString() || 'Just now',
          products: Array.isArray(apiPost.products) ? apiPost.products.map((p: any) => ({
            productId: Number(p.productId || p.id),
            userId: p.userId || currentUserId, // Use actual currentUserId as fallback for product userId
            name: p.name || 'Unknown Product',
            amount: p.amount || 0,
            imageUrl: p.imageUrl || 'https://via.placeholder.com/48x48?text=No+Image',
          })) : [],
          likes: apiPost.likes || 0,
          liked: apiPost.liked,
          userId: apiPost.userId
        };
      }).filter(Boolean) as PostItem[];
      if (page === 0) {
        setPosts(formattedPosts);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
      }

      setHasMorePosts(formattedPosts.length === 10); // If less than 20, no more pages
      setCurrentPage(page);
    } catch (error: any) {
      setErrorPosts(error.message || 'Failed to fetch posts.');
      setHasMorePosts(false);
    } finally {
      setLoadingPosts(false);
    }
  }, [isAuthenticated, currentUserId]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) { // If query is empty or just whitespace
      setSearchResults([]); // Clear previous results
      setErrorSearch(null);
      setLoadingSearch(false);
      return; // Do nothing if search term is empty
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    try {
      console.log(`App.tsx: Calling searchApi with query: "${query}"`);
      const results = await searchApi(query, 10, 0);
      console.log('App.tsx: Search results from API:', results);

      if (!Array.isArray(results)) {
        console.error("App.tsx: searchApi response is not an array:", results);
        setErrorSearch("Unexpected API response format for search results.");
        setSearchResults([]);
        return;
      }

      const formattedResults: PostItem[] = results.map((apiPost: any, index: number) => {
        if (apiPost === null || typeof apiPost !== 'object') {
            console.warn(`App.tsx: Search result at index ${index} is null or not an object during mapping:`, apiPost);
            return null;
        }
        // ... (other checks) ...

        return {
          id: apiPost.postId?.toString() || `search-temp-${Date.now()}-${index}`,
          username: apiPost.fullName || 'Unknown User',
          profileImageUrl: apiPost.profileImageUrl || 'https://i.pravatar.cc/150?img=' + (Number(apiPost.postId || index) % 20),
          videoUrl: apiPost.contentUrl,
          caption: apiPost.caption || '', // <--- ENSURE THIS LINE IS CORRECT
          timeAgo: new Date(apiPost.createdAt).toLocaleString() || 'Just now',
          products: Array.isArray(apiPost.products) ? apiPost.products.map((p: any) => ({
            productId: Number(p.productId || p.id),
            userId: p.userId || currentUserId,
            name: p.name || 'Unknown Product',
            amount: p.amount || 0,
            imageUrl: p.imageUrl || 'https://via.placeholder.com/48x48?text=No+Image',
          })) : [],
          likes: apiPost.likes || 0,
          liked: apiPost.liked,
          userId: apiPost.userId
        };
      }).filter(Boolean) as PostItem[];

      setSearchResults(formattedResults);
      console.log('App.tsx: Formatted search results:', formattedResults); // Add this log
    } catch (error: any) {
      console.error('App.tsx: Error during search:', error);
      setErrorSearch(error.message || 'Failed to perform search.');
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
      console.log("App.tsx: performSearch finished. loadingSearch set to false.");
    }
  }, [currentUserId]);

  const loadCartItems = useCallback(async () => {
    console.log("App.tsx: loadCartItems called.");
    if (!isAuthenticated || !currentUserId) {
      console.warn("App.tsx: Not authenticated or user ID not available, skipping cart load.");
      setCartItems([]);
      setCartTotalAmount(0);
      setLoadingCart(false);
      return;
    }

    setLoadingCart(true);
    setErrorCart(null);
    try {
      const backendCart: BackendCartResponse = await getCartApi();
      console.log('App.tsx: Fetched cart from API:', backendCart);

      if (!backendCart || !Array.isArray(backendCart.products)) {
          console.error("App.tsx: getCartApi response is malformed or products is not an array:", backendCart);
          setErrorCart("Unexpected API response format for cart.");
          setCartItems([]);
          setCartTotalAmount(0);
          return;
      }

      // --- NEW AGGREGATION LOGIC START ---
      const aggregatedCartItems: { [productId: string]: Product } = {};
      let calculatedTotalAmount = 0; // Recalculate total amount on the frontend for consistency

      backendCart.products.forEach(item => {
        const productId = Number(item.productId); // Ensure productId is a number
        if (isNaN(productId)) {
            console.warn(`App.tsx: Skipping cart item with invalid productId:`, item);
            return; // Skip this item if productId is invalid
        }

        if (aggregatedCartItems[productId]) {
          // If product already exists in our aggregated list, just increment quantity
          aggregatedCartItems[productId].quantity = (aggregatedCartItems[productId].quantity || 0) + 1;
        } else {
          // If not, add it with quantity 1
          aggregatedCartItems[productId] = {
            productId: productId,
            userId: currentUserId, // Use actual currentUserId for cart items
            name: item.name,
            amount: item.amount,
            imageUrl: item.imageUrl,
            quantity: 1, // Start with quantity 1 for this new aggregated entry
          };
        }
        calculatedTotalAmount += item.amount; // Add the amount of each individual item from backend
      });

      const finalCartItems: Product[] = Object.values(aggregatedCartItems);
      // --- NEW AGGREGATION LOGIC END ---

      setCartItems(finalCartItems);
      setCartTotalAmount(calculatedTotalAmount); // Use the recalculated total amount
      console.log('App.tsx: Formatted and aggregated cart items:', finalCartItems);
      console.log('App.tsx: Cart total amount (recalculated):', calculatedTotalAmount);
    } catch (error: any) {
      console.error('App.tsx: Error fetching cart items:', error);
      setErrorCart(error.message || 'Failed to load cart items.');
      setCartItems([]);
      setCartTotalAmount(0);
    } finally {
      setLoadingCart(false);
      console.log("App.tsx: loadCartItems finished. loadingCart set to false.");
    }
  }, [isAuthenticated, currentUserId]);


  // ==================== useEffects for Initial Data Loading ====================

  useEffect(() => {
    console.log("App.tsx: Initial useEffect for user ID determination triggered.");
    // If authenticated and currentUserId is NOT already set (meaning it wasn't in localStorage),
    // THEN we need to fetch it.
    if (isAuthenticated && !currentUserId && authToken) {
        console.log("App.tsx: Authenticated but no user ID found initially. Fetching user ID from API.");
        fetchAndSetUserId();
    } else if (!isAuthenticated) {
        // If no longer authenticated, ensure currentUserId is cleared.
        console.log("App.tsx: Not authenticated, clearing user ID state and localStorage.");
        setCurrentUserId(null);
        localStorage.removeItem('currentUserId');
    } else if (isAuthenticated && currentUserId) {
        console.log("App.tsx: User ID already loaded (from localStorage or previous fetch) and authenticated.");
        // No action needed if already authenticated and user ID is available
    }
  }, [isAuthenticated, authToken, currentUserId, fetchAndSetUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    if (activeTab === 'Home') {
      loadPosts();
    }
    if (activeTab === 'Products' || activeTab === 'Create') {
      loadAvailableProducts();
    }
    if (activeTab === 'Cart') {
      loadCartItems();
    }
  }, [activeTab, isAuthenticated, currentUserId, loadPosts, loadAvailableProducts, loadCartItems]);

  useEffect(() => {
    // This useEffect will no longer automatically trigger search on debounce.
    // It will only clear search results if the search term becomes empty.
    // if (!searchTerm.trim() && searchResults.length > 0) {
    //   console.log("App.tsx: Search term cleared, clearing search results.");
    //   setSearchResults([]);
    //   setErrorSearch(null);
    //   setLoadingSearch(false);
    // }
    // No `return () => clearTimeout(delaySearch);` needed anymore as there's no `setTimeout` to clear.
    // No `performSearch(searchTerm);` call here anymore.
  }, [searchTerm, searchResults.length]); // Dependencies: only searchTerm and searchResults.length

  useEffect(() => {
    if (activeTab === 'Home') setLoadingPosts(true);
    if (activeTab === 'Products') setLoadingProducts(true);
    if (activeTab === 'Cart') setLoadingCart(true);
  }, [activeTab]);


  // ==================== Handlers for User Actions (updated to use currentUserId) ====================

const addToCart = async (product: Product) => {
    console.log("App.tsx: addToCart called for product:", product);
    if (!isAuthenticated || product.productId === undefined || product.productId === null || isNaN(Number(product.productId)) || !currentUserId) {
      alert("Please sign in, or product ID is missing/invalid, or user not identified.");
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find((item) => item.productId === product.productId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.productId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1, userId: currentUserId }]; // Ensure userId is added
      }
    });
    setIsCartSidebarOpen(true);

    try {
      console.log(`App.tsx: Attempting to add product ID ${product.productId} to cart via API.`);
      await addToCartApi(product.productId);
      loadCartItems();
    } catch (error: any) {
      console.error('App.tsx: Error adding to cart via API:', error);
      alert(`Failed to add product to cart: ${error.message}`);
      loadCartItems();
    }
  };

// This function will now purely handle the API call and then re-fetch the cart.
  // It will NOT perform an optimistic UI update.
  const updateCartItemQuantity = async (productId: number, newQuantity: number) => {
    console.log(`App.tsx: Request to update quantity for productId ${productId} to ${newQuantity}`);

    const currentItem = cartItems.find(item => item.productId === productId);
    const oldQuantity = currentItem ? (currentItem.quantity || 0) : 0;

    try {
        if (newQuantity > oldQuantity) {
            // User clicked plus button (or quantity increased)
            console.log(`App.tsx: Calling addToCartApi for productId: ${productId}`);
            await addToCartApi(productId); // Add one more product to cart via API
        } else if (newQuantity < oldQuantity) {
            // User clicked minus button (or quantity decreased)
            console.log(`App.tsx: Decrementing quantity for productId: ${productId}`);
            await removeFromCartApi(productId);
        }
        // else if (newQuantity === oldQuantity), do nothing.

        // After the API call (or no-op for decrement), always re-fetch the cart
        // to reflect the backend's current aggregated state.
        loadCartItems();
        console.log("App.tsx: loadCartItems called after quantity update attempt.");

    } catch (error: any) {
        console.error('App.tsx: Error during cart quantity update API call:', error);
        alert(`Failed to update cart: ${error.message}`);
        // Even on error, still call loadCartItems to revert UI to actual backend state
        loadCartItems();
    }
  };

  const handleSearchSubmit = useCallback(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setErrorSearch(null);
      setLoadingSearch(false);
      setSearchActive(false); // Not searching
      return;
    }
    setSearchActive(true); // Searching
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  const removeCartItem = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
    // Call backend API here if available, then loadCartItems()
  };

  const handleCreatePost = (newPost: Omit<PostItem, 'id' | 'timeAgo' | 'username' | 'avatarUrl' | 'likes'>) => {
    console.log('App.tsx: Local onCreatePost called with:', newPost);
    loadPosts();
  };

  const handleProductSuccess = (newProduct: Product) => {
    console.log("App.tsx: handleProductSuccess called with new product:", newProduct);
    setAvailableProducts(prev => [...prev, newProduct]);
    // Ensure new product added to userProducts if it belongs to the current user
    if (newProduct.userId === currentUserId) {
      setUserProducts(prev => [...prev, newProduct]);
    }
  };

  const handlePostSuccess = () => {
    console.log("App.tsx: handlePostSuccess called. Navigating to Home.");
    setActiveTab('Home');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setSearchActive(false); // Reset search state when typing
  };

  useEffect(() => {
  //   // if (!searchTerm.trim() && searchResults.length > 0) {
  //   //   setSearchResults([]);
  //   //   setErrorSearch(null);
  //   //   setLoadingSearch(false);
  //   // }
  }, [searchTerm, searchResults.length]);

  const handleAuthenticationSuccess = useCallback(async (token: string) => {
    setIsAuthenticated(true);
    setAuthToken(token);
    // After token is set, immediately try to fetch user ID
    await fetchAndSetUserId(); // Wait for user ID to be set before loading other data
    setActiveTab('Home');
    console.log('App.tsx: Authentication successful! Token stored and tab set to Home. User ID fetch initiated.');
  }, [fetchAndSetUserId]); // Dependency on fetchAndSetUserId

  useEffect(() => {
    const url = new URL(window.location.href);
    const currentPath = url.pathname;
    const queryParams = new URLSearchParams(url.search);

    if (currentPath === '/auth/callback' || currentPath === '/auth/callback/') {
      const token = queryParams.get('continue');

      if (token && !isAuthenticated) {
        handleAuthenticationSuccess(token);
      } else if (isAuthenticated) {
        console.log('App.tsx: Already authenticated, ignoring callback token.');
      } else {
        console.error('App.tsx: Authentication callback: Token not found in URL or missing "continue" parameter.');
        setIsAuthenticated(false);
        setAuthToken(null);
      }
      if (currentPath === '/auth/callback' || currentPath === '/auth/callback/') {
          window.history.replaceState({}, document.title, '/');
      }
    }
  }, [isAuthenticated, handleAuthenticationSuccess]); // Dependencies for this effect

  const renderContent = () => {
    if (!isAuthenticated) {
      if (window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/callback/') {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h1 className="text-3xl font-bold mb-4">Authenticating...</h1>
            <p className="text-gray-400">Please wait while we log you in.</p>
          </div>
        );
      }
      return <SignInPage backendGoogleAuthUrl="https://social-commerce-be-production.up.railway.app/signin" />;
    }

    if (showProfileUpdatePage && currentUserId) { // currentUserId must be available for the form
      return (
        <ActivateUserPage
          onActivateSuccess={() => { /* handleUserActivation handles the re-fetch */ }}
          updateUser={handleUserActivation}
          // Assuming loading/error states are managed within ActivateUserPage or by alerts
          loading={false}
          error={null}
        />
      );
    }

    // Only render main content if user is authenticated AND currentUserId is available
    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
                <h1 className="text-3xl font-bold mb-4">Loading User Profile...</h1>
                <p className="text-gray-400">Fetching your user data.</p>
                <svg className="animate-spin h-10 w-10 text-indigo-500 mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
      <>
        {/* <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          onCartIconClick={() => setIsCartSidebarOpen(true)}
          onOrdersIconClick={() => setIsOrdersSidebarOpen(true)}
        /> */}

        <main
          className="flex-grow border-x border-gray-700 mx-auto w-full pt-4 pb-16 md:pb-4 max-w-[80vw] lg:max-w-[80vw] xl:max-w-[80vw]"
        >
          {activeTab === 'Home' && (
            searchActive ? (
              <HomePage
                posts={searchResults}
                loading={loadingSearch}
                error={errorSearch}
                addToCart={addToCart}
                hasMorePosts={hasMorePosts}
                loadingPosts={loadingPosts}
                currentPage={currentPage}
                loadPosts={loadPosts}
              />
            ) : (
              <HomePage
                posts={posts}
                loading={loadingPosts}
                error={errorPosts}
                addToCart={addToCart}
                hasMorePosts={hasMorePosts}
                loadingPosts={loadingPosts}
                currentPage={currentPage}
                loadPosts={loadPosts}
              />
            )
          )}
          {activeTab === 'Following' && (
            <div className="p-4 text-center text-gray-400">Following Feed Coming Soon!</div>
          )}
          {activeTab === 'Products' && (
            <ProductsPage
              products={availableProducts}
              loading={loadingProducts}
              error={errorProducts}
              addToCart={addToCart}
            />
          )}
          {activeTab === 'Create' && (
            <CreatePostPage
              availableProducts={userProducts}
              loadingProducts={loadingProducts}
              errorProducts={errorProducts}
              onCreatePost={handleCreatePost}
              onProductSuccess={handleProductSuccess}
              onPostSuccess={handlePostSuccess}
              currentUserId={currentUserId} // Pass the actual current user ID
            />
          )}
          {activeTab === 'Cart' && (
            <CartPage
              cartItems={cartItems}
              cartTotalAmount={cartTotalAmount}
              loading={loadingCart}
              error={errorCart}
              updateCartItemQuantity={updateCartItemQuantity}
              removeCartItem={removeCartItem}
              onCheckout={async () => {
                setIsCheckoutLoading(true); // Start loading
                try {
                  const response = await initiateCheckout();
                  if (response.status === "INTERNAL_SERVER_ERROR") {
                    alert(`Unable to initiate checkout due to ${response.message}`);
                  } else {
                    window.location.href = response.checkout_url;
                  }
                } catch (error: any) {
                  console.error("Checkout initiation failed:", error);
                  alert(`Failed to initiate checkout: ${error.message || 'An unexpected error occurred.'}`);
                } finally {
                  setIsCheckoutLoading(false); // End loading regardless of success or failure
                }
              }}
              isCheckoutLoading={isCheckoutLoading} // NEW: Pass the loading state to CartPage
            />
          )}
          {activeTab === 'Settings' && (
            <div className="p-4 text-center text-gray-400">Settings Page Coming Soon!</div>
          )}
        </main>

        {/* <RightSidebar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit} // <-- ADD THIS PROP
        /> */}

        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          onCartIconClick={() => setIsCartSidebarOpen(true)}
          onOrdersIconClick={() => setIsOrdersSidebarOpen(true)}
        />

        <CartSidebar
          isOpen={isCartSidebarOpen}
          onClose={() => setIsCartSidebarOpen(false)}
          cartItems={cartItems}
          removeCartItem={removeCartItem}
          onViewCart={() => {
            setActiveTab('Cart');
            setIsCartSidebarOpen(false);
          }}
        />

        {/* NEW: Orders Sidebar */}
        <OrdersSidebar
          isOpen={isOrdersSidebarOpen}
          onClose={() => setIsOrdersSidebarOpen(false)}
          orders={orders}
          loading={loadingOrders}
          error={errorOrders}
        />
      </>
    );
  };

  return (
    <BrowserRouter>
      <div className="flex bg-black min-h-screen min-w-screen text-white font-inter">
        {/* Sidebar (left) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          onCartIconClick={() => setIsCartSidebarOpen(true)}
          onOrdersIconClick={() => setIsOrdersSidebarOpen(true)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Routes>
            <Route path="/user/:userId" element={<UserProfilePage addToCart={addToCart} />} />
            <Route path="/" element={renderContent()} />
            <Route path="/auth/callback" element={renderContent()} />
            <Route path="/payments/order/confirm/" element={<OrderConfirmationPage />} />
          </Routes>
        </div>

        {/* RightSidebar (right) */}
        <RightSidebar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
