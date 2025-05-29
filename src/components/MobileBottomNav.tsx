// src/components/MobileBottomNav.tsx
import React from 'react';
import { HomeIcon, UserGroupIcon, ShoppingBagIcon, PlusCircleIcon, ShoppingCartIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'; // Import ShoppingCartIcon and Cog6ToothIcon

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemCount: number; // Add cartItemCount prop
  onCartIconClick: () => void; // Add onCartIconClick prop
}

interface MobileNavItemProps {
  icon: React.ElementType;
  text: string;
  active?: boolean;
  onClick: () => void;
  badgeContent?: number; // Optional prop for badge content (e.g., cart count)
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon: Icon, text, active, onClick, badgeContent }) => (
  <div
    className={`relative flex flex-col items-center p-2 cursor-pointer transition-colors duration-200
      ${active ? 'text-indigo-400' : 'text-white hover:text-indigo-200'}`} // Non-active text is white
    onClick={onClick}
  >
    <Icon className="h-6 w-6" />
    <span className="text-xs mt-1">{text}</span>
    {badgeContent && badgeContent > 0 && (
      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
        {badgeContent}
      </span>
    )}
  </div>
);

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, cartItemCount, onCartIconClick }) => {
  return (
    // This navigation bar is fixed at the bottom and only visible on screens smaller than `md`
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 flex justify-around py-2 z-50 md:hidden">
      <MobileNavItem
        icon={HomeIcon}
        text="Home"
        active={activeTab === 'Home'}
        onClick={() => setActiveTab('Home')}
      />
      <MobileNavItem
        icon={UserGroupIcon}
        text="Following"
        active={activeTab === 'Following'}
        onClick={() => setActiveTab('Following')}
      />
      <MobileNavItem
        icon={PlusCircleIcon}
        text="Create"
        active={activeTab === 'Create'}
        onClick={() => setActiveTab('Create')}
      />
      <MobileNavItem
        icon={ShoppingBagIcon}
        text="Products"
        active={activeTab === 'Products'}
        onClick={() => setActiveTab('Products')}
      />
      {/* NEW: Cart Nav Item */}
      <MobileNavItem
        icon={ShoppingCartIcon}
        text="Cart"
        active={activeTab === 'Cart'} // Make it active if cart page is open
        onClick={onCartIconClick} // Trigger sidebar open
        badgeContent={cartItemCount} // Pass cart count to badge
      />
      {/* Settings for Mobile is often here instead of a separate menu */}
      <MobileNavItem
        icon={Cog6ToothIcon} // Changed to Cog6ToothIcon for consistency
        text="Settings"
        active={activeTab === 'Settings'}
        onClick={() => setActiveTab('Settings')}
      />
    </div>
  );
};

export default MobileBottomNav;