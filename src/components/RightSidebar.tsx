// src/components/RightSidebar.tsx
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface RightSidebarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ searchTerm, onSearchChange, onSearchSubmit }) => {
  return (
    <div className="hidden lg:flex flex-col flex-shrink-0 lg:w-80 max-w-full p-4 sticky top-0 h-screen overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search SocialShop..."
          value={searchTerm}
          onChange={onSearchChange}
          onKeyDown={(e) => { // <-- ADD THIS HANDLER
            if (e.key === 'Enter') {
              e.preventDefault(); // Prevent default form submission behavior (if it was a form)
              onSearchSubmit(); // Call the function passed from App.tsx
            }
          }}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* "Trends for you" section */}
      {/* <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Trends for you</h3>
        <ul className="text-gray-300 text-sm">
          <li className="mb-2">#TechInnovations <span className="text-gray-500 text-xs">2.5K Posts</span></li>
          <li className="mb-2">#FashionFinds <span className="text-gray-500 text-xs">1.8K Posts</span></li>
          <li className="mb-2">#GamingCommunity <span className="text-gray-500 text-xs">1.2K Posts</span></li>
          <li className="mb-2">#SustainableLiving <span className="text-gray-500 text-xs">900 Posts</span></li>
          <li className="mb-2">#DIYProjects <span className="text-gray-500 text-xs">750 Posts</span></li>
        </ul>
      </div> */}

      {/* "Who to follow" section */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold text-white mb-4">Who to follow</h3>
        <ul>
          <li className="flex items-center justify-between mb-3"> {/* Added justify-between */}
            <img src="https://i.pravatar.cc/50?img=5" alt="User 1" className="w-10 h-10 rounded-full mr-3 flex-shrink-0" /> {/* Added flex-shrink-0 */}
            <div className="flex-grow min-w-0 mr-3"> {/* Added flex-grow and min-w-0 */}
              <p className="text-white font-semibold truncate">@CreativeGuru</p> {/* Added truncate */}
              <p className="text-gray-400 text-sm truncate">Design & Innovation</p> {/* Added truncate */}
            </div>
            <button className="flex-shrink-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full hover:bg-indigo-700">Follow</button> {/* Added flex-shrink-0 */}
          </li>
          <li className="flex items-center justify-between mb-3"> {/* Added justify-between */}
            <img src="https://i.pravatar.cc/50?img=6" alt="User 2" className="w-10 h-10 rounded-full mr-3 flex-shrink-0" /> {/* Added flex-shrink-0 */}
            <div className="flex-grow min-w-0 mr-3"> {/* Added flex-grow and min-w-0 */}
              <p className="text-white font-semibold truncate">@EcoWarrior</p> {/* Added truncate */}
              <p className="text-gray-400 text-sm truncate">Green Living Tips</p> {/* Added truncate */}
            </div>
            <button className="flex-shrink-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full hover:bg-indigo-700">Follow</button> {/* Added flex-shrink-0 */}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;