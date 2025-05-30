// src/api.ts

import type { PostItem, Product } from "../App";

const API_BASE_URL = 'https://social-commerce-be-production.up.railway.app'; // Your backend base URL

// Helper function to get the authentication token from local storage.
const getAuthToken = (): string | null => { // Changed to return null if not found
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('Authentication token not found.'); // Use warn instead of error for this helper
  }
  return token;
};

// Helper for authenticated requests, including 401 handling
const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Authentication failed. Redirecting to sign-in.');
      localStorage.removeItem('authToken');
      localStorage.setItem('isAuthenticated', 'false');
      window.location.href = '/'; // Redirect to home/signin page
    }
    const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(errorData.message || response.statusText || 'Network response was not ok');
  }
  return response.json();
};


// ====================== AUTHENTICATION API CALLS ======================

export const signInWithGoogle = () => {
  // This will redirect to the backend's Google OAuth initiation endpoint
  window.location.href = `${API_BASE_URL}/signin`;
};


// ====================== PRODUCT API CALLS ======================

interface ProductPayload {
  name: string;
  amount: number;
  imageUrl?: string; // Add imageUrl as it's typically returned for products
  productId?: number; // Add productId as it's typically returned for products
  userId?: string; // Add userId as it's typically returned for products
}

/**
 * Uploads a new product to the backend.
 */
// export async function uploadProductWithImage(productData: { name: string; amount: number; imageFile: File }) {
//   const formData = new FormData();
//   formData.append('name', productData.name);
//   formData.append('amount', productData.amount.toString());
//   formData.append('content', productData.imageFile); // Assuming 'content' is the field for product image file

//   const response = await authenticatedFetch(`${API_BASE_URL}/products`, { // Assuming this is the single product upload endpoint
//     method: 'POST',
//     body: formData,
//   });
//   return response;
// }


/**
 * Uploads new products to the backend (JSON array, no image file).
 */
export async function uploadProductsJson(products: ProductPayload[]) { // Renamed to avoid confusion
  const response = await authenticatedFetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(products),
  });
  return response;
}

/**
 * Fetches all products from the backend.
 */
export async function getAllProducts(): Promise<Product[]> { // Renamed to clarify it fetches ALL products
    console.log("Called get user products api")
  const response = await authenticatedFetch(`${API_BASE_URL}/products`, {
    method: 'GET',
  });
  return response;
}


// ====================== POST API CALLS ======================

interface CreatePostPayload {
  content: File; // Video file
  caption: string;
  productIds: number[]; // Array of product IDs (numbers)
}

/**
 * Uploads a new post to the backend.
 */
export async function uploadPost(payload: CreatePostPayload) {
  const formData = new FormData();
  formData.append('content', payload.content);
  formData.append('caption', payload.caption);
  // Key change based on your provided api.ts: JSON.stringify for productIds in multipart
  formData.append('productIds', JSON.stringify(payload.productIds));

  console.log('Sending post payload:', {
    caption: payload.caption,
    productIds: JSON.stringify(payload.productIds),
    contentFileName: payload.content.name,
  });

  const response = await authenticatedFetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    body: formData,
  });

  return response; // Returns the full PostItem response
}

interface GetPostsResponseProduct {
  name: string;
  amount: number;
  userId: string;
  productId: number;
  imageUrl?: string;
}

export interface GetPostsResponseItem {
  postId: number;
  contentUrl: string;
  caption: string;
  userId: string;
  products: GetPostsResponseProduct[];
  likes: number;
  liked: boolean;
  createdAt: string;
}

/**
 * Fetches all posts from the backend with pagination.
 */
export const fetchPosts = async (pageSize: number, pageNumber: number): Promise<GetPostsResponseItem[]> => {
  const url = new URL(`${API_BASE_URL}/posts`);
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('pageNumber', pageNumber.toString());

  console.log('Fetching posts from:', url.toString());

  const response = await authenticatedFetch(url.toString(), {
    method: 'GET',
  });

  return response; // The response is directly the array of posts
};

// ====================== CART API CALLS ======================

// NEW: Interface for the actual Cart object returned by GET /carts
export interface BackendCartResponse {
  cartId: number;
  totalAmount: number;
  products: { // Assuming products here have a quantity and other product details
    productId: number;
    name: string;
    amount: number;
    imageUrl: string;
    quantity: number; // This is the quantity of this specific product in the cart
    // Add other product properties if the backend returns them within this product object
  }[];
}

/**
 * Adds a product to the user's cart.
 * @param productId The ID of the product to add.
 * @returns A promise that resolves with the API response (e.g., success message or updated cart).
 */
export async function addToCartApi(productId: number) {
  const response = await authenticatedFetch(`${API_BASE_URL}/carts/${productId}`, {
    method: 'POST',
  });
  return response;
}

export async function removeFromCartApi(productId: number) {
  const response = await authenticatedFetch(`${API_BASE_URL}/carts/${productId}`, {
    method: 'PUT',
  });
  return response;
}

/**
 * Fetches the current user's cart contents.
 * @returns A promise that resolves with the Cart object.
 */
export async function getCartApi(): Promise<BackendCartResponse> { // Changed return type
  const response = await authenticatedFetch(`${API_BASE_URL}/carts`, {
    method: 'GET',
  });
  return response;
}

export async function likePost(postId: number) {
  const response = await authenticatedFetch(`${API_BASE_URL}/posts/like/${postId}`, {
    method: 'PUT',
  });
  return response;
}

export interface LoggedInUserResponse {
    userId: string; // Assuming the user ID is a string, adjust if it's a number
    username: string;
    email: string;
    // Add any other user properties returned by your API
}

export const getLoggedInUser = async (): Promise<LoggedInUserResponse> => {
    console.log('API: Calling /users/get-logged-in-user');
    return authFetch('https://social-commerce-be-production.up.railway.app/users/get-logged-in-user');
};

// Helper for authenticated fetch requests
async function authFetch(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
  
    const response = await fetch(url, { ...options, headers });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export interface OrderProductResponse {
  name: string;
  amount: number;
  userId: string;
  productId: number;
}

export interface OrderResponse {
  orderId: string;
  userId: string;
  totalAmount: number;
  paid: boolean;
  products: OrderProductResponse[];
}

export const getOrdersApi = async (): Promise<OrderResponse[]> => {

  const response = await authenticatedFetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export interface InitiateCheckoutResponse {
  status: string,
  checkout_url: string
  message?: string
}

export const initiateCheckout = async (): Promise<InitiateCheckoutResponse> => {

  const response = await authenticatedFetch(`${API_BASE_URL}/carts/initiate-checkout`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export async function searchApi(query: string, pageSize: Number, pageNumber: Number): Promise<PostItem[]> { // Change return type to any[] for now, will map to PostItem later
  const url = new URL(`${API_BASE_URL}/posts/search`);
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('pageNumber', pageNumber.toString());
  url.searchParams.append('tag', query)
  const response = await authenticatedFetch(url.toString(), {
    method: 'GET',
  });

  console.log("Search api response is ", response);
  
  return response;
}

// NOTE: No DELETE /carts/{productId} or PUT /carts/{productId} (for quantity update)
// were provided in the image. If these exist, we would implement them here.
// For now, quantity manipulation on the frontend will be local only for demonstration.