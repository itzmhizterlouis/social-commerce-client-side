import React, { useState, useEffect } from 'react';
import type { PostItem, Product } from '../App';
import { uploadPost, uploadProductsJson } from './api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreatePostPageProps {
  availableProducts: Product[];
  loadingProducts: boolean;
  errorProducts: string | null;
  onCreatePost: (newPost: Omit<PostItem, 'id' | 'timeAgo' | 'username' | 'avatarUrl' | 'likes'>) => void;
  onPostSuccess: () => void;
  onProductSuccess: (newProduct: Product) => void;
  currentUserId: string | null; // Changed to string | null as it might be null initially
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({
  availableProducts,
  loadingProducts,
  errorProducts,
  onCreatePost,
  onPostSuccess,
  onProductSuccess,
  currentUserId, // Destructure here
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const [caption, setCaption] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductAmount, setNewProductAmount] = useState('');
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
  const [newProductImagePreviewUrl, setNewProductImagePreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false); // For form submission and product creation

  const handleCancelVideo = () => {
    setVideoFile(null);       // Clear the actual video file
    setVideoPreviewUrl(null); // Clear the URL for the preview
    console.log("Video selection cleared.");
  };

  useEffect(() => {
    console.log("CreatePostPage: Props received for product selection:");
    console.log("  availableProducts (user-specific):", availableProducts);
    console.log("  loadingProducts:", loadingProducts);
    console.log("  errorProducts:", errorProducts);
    console.log("  currentUserId:", currentUserId); // Log currentUserId

    if (!loadingProducts && !errorProducts && availableProducts && availableProducts.length > 0) {
        console.log("CreatePostPage: Products received and ready for display in selection.");
        availableProducts.forEach((product, index) => {
            if (product.productId === undefined || product.productId === null || isNaN(Number(product.productId))) {
                console.warn(`CreatePostPage: Product at index ${index} has missing/invalid productId. Check App.tsx filtering/mapping!`, product);
            }
            if (product.imageUrl === undefined || product.imageUrl === null || product.imageUrl === '') {
                console.warn(`CreatePostPage: Product at index ${index} has missing or empty imageUrl. Check App.tsx mapping!`, product);
            }
        });
    } else if (!loadingProducts && !errorProducts && availableProducts && availableProducts.length === 0) {
        console.log("CreatePostPage: No user-specific products available after loading and no errors.");
    }

  }, [availableProducts, loadingProducts, errorProducts, currentUserId]); // Add currentUserId dependency

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  useEffect(() => {
    if (newProductImageFile) {
      const url = URL.createObjectURL(newProductImageFile);
      setNewProductImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setNewProductImagePreviewUrl(null);
    }
  }, [newProductImageFile]);

  const handleProductSelection = (product: Product) => {
    if (!product.productId) {
      console.error("Product ID is missing for selection.", product);
      alert("Cannot select a product without an ID.");
      return;
    }
    if (!selectedProducts.find((p) => p.productId === product.productId)) {
      setSelectedProducts((prev) => [...prev, product]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== product.productId));
    }
  };

  const handleCreateNewProduct = async () => {
    if (!newProductName || !newProductAmount || !newProductImageFile) {
      alert('Please fill in all fields and select an image for the new product.');
      return;
    }

    if (!currentUserId) { // Ensure currentUserId is available before creating a product
        alert('User ID is not available. Please ensure you are logged in correctly.');
        return;
    }

    const amount = parseFloat(newProductAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount for the new product.');
      return;
    }

    setIsLoading(true);
    try {
      console.log("CreatePostPage: Calling uploadProductWithImage API...");
      var apiResponse = await uploadProductsJson([
        {
            name: newProductName,
            amount: amount
        }
      ]
      );

      console.log('CreatePostPage: New product API response:', apiResponse);
      apiResponse = apiResponse[0];

      const receivedProductId = Number(apiResponse.productId);
      if (isNaN(receivedProductId)) {
          console.error("CreatePostPage: New product API response returned invalid productId:", apiResponse.productId);
          throw new Error("Invalid Product ID received for new product.");
      }

      const createdProductFromServer: Product = {
        productId: receivedProductId,
        userId: apiResponse.userId || currentUserId, // Use backend userId or fallback to actual currentUserId
        name: apiResponse.name,
        amount: apiResponse.amount,
        imageUrl: apiResponse.imageUrl,
      };

      setSelectedProducts((prev) => [...prev, createdProductFromServer]);
      onProductSuccess(createdProductFromServer);

      setNewProductName('');
      setNewProductAmount('');
      setNewProductImageFile(null);
      setNewProductImagePreviewUrl(null);
      setShowNewProductForm(false);
      alert('New product added successfully!');
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(`Error creating product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !caption) {
      alert('Please select a video file and provide a caption for your post.');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Please select at least one product for your post.');
      return;
    }

    if (!currentUserId) { // Ensure currentUserId is available before posting
        alert('User ID is not available. Please ensure you are logged in correctly.');
        return;
    }

    const productIds = selectedProducts.map(p => Number(p.productId)).filter(id => !isNaN(id));

    if (productIds.length === 0) {
        alert("No valid products selected to link. Please select products with valid IDs.");
        console.error("CreatePostPage: Attempted to submit with no valid product IDs after filtering:", selectedProducts);
        return;
    }
    if (productIds.length !== selectedProducts.length) {
        console.warn("CreatePostPage: Some selected products had invalid IDs and were filtered out:", selectedProducts.filter(p => isNaN(Number(p.productId))));
    }

    setIsLoading(true);
    try {
      console.log("CreatePostPage: Calling uploadPost API...");
      const apiResponse = await uploadPost({
        content: videoFile,
        caption: caption,
        productIds: productIds
      });

      console.log('CreatePostPage: Post API response:', apiResponse);

      const responseProducts = Array.isArray(apiResponse.products) ? apiResponse.products.map((p: any, index: number) => {
          const prodId = Number(p.productId || p.id);
          if (isNaN(prodId)) {
              console.warn(`CreatePostPage: Post API response product at index ${index} has invalid productId. Original:`, p);
              return null;
          }
          return {
            productId: prodId,
            userId: p.userId || currentUserId,
            name: p.name,
            amount: p.amount,
            imageUrl: p.imageUrl,
          };
      }).filter(Boolean) : [];

      const localPostItem: Omit<PostItem, 'id' | 'timeAgo' | 'username' | 'avatarUrl'> = {
        videoUrl: apiResponse.contentUrl || URL.createObjectURL(videoFile),
        caption: apiResponse.caption,
        products: responseProducts,
        likes: apiResponse.likes || 0,
        profileImageUrl: apiResponse.profileImageUrl || 'https://via.placeholder.com/48x48?text=Avatar'
      };

      onCreatePost(localPostItem);
      alert('Post created successfully!');
      setVideoFile(null);
      setCaption('');
      setSelectedProducts([]);
      onPostSuccess();
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(`Error creating post: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="videoFile" className="block text-gray-300 text-sm font-bold mb-2">
            Upload Video File
          </label>
          <input
            type="file"
            id="videoFile"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
            className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            required
          />
          {videoPreviewUrl && (
            <div className="mt-4 relative"> {/* ADDED: relative positioning */}
              <video controls src={videoPreviewUrl} className="w-full h-auto max-h-64 rounded-md object-contain border border-gray-700"></video>
              {/* NEW: Cancel Button for Video */}
              <button
                onClick={handleCancelVideo}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition-colors duration-200"
                aria-label="Remove video"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="caption" className="block text-gray-300 text-sm font-bold mb-2">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="What's on your mind? Tell us about your products!"
            required
          ></textarea>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Link Products to Post</h3>

          {/* Conditional rendering based on loading and error states */}
          {loadingProducts && (
            <div className="text-center text-gray-400 py-4">
              <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">Loading products...</p>
            </div>
          )}

          {errorProducts && (
            <div className="text-center text-red-400 py-4">
              <p className="mb-2">Error loading products:</p>
              <p>{errorProducts}</p>
            </div>
          )}

          {/* Display products only if not loading, no error, and products exist */}
          {!loadingProducts && !errorProducts && availableProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {availableProducts.map((product) => (
                  product.productId !== undefined && product.productId !== null && !isNaN(Number(product.productId)) ? (
                    <div
                      key={product.productId}
                      className={`p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-200
                          ${selectedProducts.some(p => p.productId === product.productId)
                          ? 'bg-indigo-600 border border-indigo-500'
                          : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                          }`}
                      onClick={() => handleProductSelection(product)}
                    >
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/48x48?text=No+Image'}
                        alt={product.name || 'Product Image'}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col overflow-hidden w-full">
                          <p className="text-white text-sm font-semibold break-words line-clamp-2">{product.name}</p>
                          <p className="text-gray-300 text-xs mt-1">${product.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      {selectedProducts.some(p => p.productId === product.productId) && (
                          <span className="text-white text-lg font-bold ml-2">✓</span>
                      )}
                    </div>
                  ) : (
                    <div key={`invalid-product-${Math.random()}`} className="text-red-400 p-3">
                        Invalid product data for display.
                    </div>
                  )
              ))}
            </div>
          ) : (
            !loadingProducts && !errorProducts && (
              <p className="text-gray-400 col-span-full text-center">No products available. Create one below!</p>
            )
          )}

          <button
            type="button"
            onClick={() => setShowNewProductForm(!showNewProductForm)}
            className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          >
            {showNewProductForm ? 'Hide New Product Form' : 'Create New Product'}
          </button>

          {showNewProductForm && (
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
              <h4 className="text-lg font-bold text-white">New Product Details</h4>
              <div>
                <label htmlFor="newProductName" className="block text-gray-300 text-sm font-bold mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  id="newProductName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Ultimate Gaming Chair"
                  required
                />
              </div>
              <div>
                <label htmlFor="newProductAmount" className="block text-gray-300 text-sm font-bold mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  id="newProductAmount"
                  value={newProductAmount}
                  onChange={(e) => setNewProductAmount(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., 299.99"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="newProductImageFile" className="block text-gray-300 text-sm font-bold mb-2">
                  Upload Product Image
                </label>
                <input
                  type="file"
                  id="newProductImageFile"
                  accept="image/*"
                  onChange={(e) => setNewProductImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  required
                />
                {newProductImagePreviewUrl && (
                  <div className="mt-2">
                    <img src={newProductImagePreviewUrl} alt="Product Preview" className="w-24 h-24 rounded object-cover border border-gray-600" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreateNewProduct}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Adding Product...' : 'Add New Product'}
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;