// src/components/Sidebar.tsx
import React from 'react';
import { HomeIcon, UserGroupIcon, ShoppingBagIcon, PlusCircleIcon, ShoppingCartIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemCount: number;
  onCartIconClick: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  text: string;
  active?: boolean;
  onClick: () => void;
  badgeContent?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, text, active, onClick, badgeContent }) => (
  <div
    className={`relative flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors duration-200
      ${active ? 'bg-gray-800 text-white font-semibold' : 'text-white hover:bg-gray-800'}`}
    onClick={onClick}
  >
    <Icon className="h-6 w-6 flex-shrink-0" /> {/* Added flex-shrink-0 */}
    {/* MODIFIED: Reduced text size from text-lg to text-base */}
    <span className="hidden lg:inline-block text-base flex-grow min-w-0">{text}</span> {/* Show text on large screens */}
    {badgeContent && badgeContent > 0 && (
      <span className="absolute top-0 right-0 lg:right-3 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center lg:static lg:ml-auto lg:transform-none flex-shrink-0">
        {badgeContent}
      </span>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, cartItemCount, onCartIconClick }) => {
  return (
    <div className="hidden md:flex flex-col w-16 lg:w-64 border-r border-gray-700 p-4 sticky top-0 h-screen overflow-y-auto">
      {/* Logo/App Name */}
      <div className="mb-8 mt-2 text-2xl font-bold text-indigo-400 hidden lg:block">
        SocialShop
      </div>
      <div className="mb-8 mt-2 text-2xl font-bold text-indigo-400 block lg:hidden">
        SS
      </div>

      <nav className="flex-grow">
        <NavItem
          icon={HomeIcon}
          text="Home"
          active={activeTab === 'Home'}
          onClick={() => setActiveTab('Home')}
        />
        <NavItem
          icon={UserGroupIcon}
          text="Following"
          active={activeTab === 'Following'}
          onClick={() => setActiveTab('Following')}
        />
        <NavItem
          icon={ShoppingBagIcon}
          text="Products"
          active={activeTab === 'Products'}
          onClick={() => setActiveTab('Products')}
        />
        <NavItem
          icon={PlusCircleIcon}
          text="Create"
          active={activeTab === 'Create'}
          onClick={() => setActiveTab('Create')}
        />
        <NavItem
          icon={ShoppingCartIcon}
          text="Cart"
          active={activeTab === 'Cart'}
          onClick={onCartIconClick}
          badgeContent={cartItemCount}
        />
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <NavItem
          icon={Cog6ToothIcon}
          text="Settings"
          active={activeTab === 'Settings'}
          onClick={() => setActiveTab('Settings')}
        />
      </div>
    </div>
  );
};

export default Sidebar;