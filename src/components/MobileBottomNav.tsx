import React from 'react';
import { HomeIcon, UserGroupIcon, ShoppingBagIcon, PlusCircleIcon, ShoppingCartIcon, Cog6ToothIcon, ClipboardDocumentListIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemCount: number;
  onCartIconClick: () => void;
  onOrdersIconClick: () => void;
}

interface MobileNavItemProps {
  icon: React.ElementType;
  text: string;
  active?: boolean;
  onClick: () => void;
  badgeContent?: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon: Icon, text, active, onClick, badgeContent }) => (
  <div
    className={`relative flex flex-col items-center p-2 cursor-pointer transition-colors duration-200
      ${active ? 'text-indigo-400' : 'text-white hover:text-indigo-200'}`}
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

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartItemCount,
  onCartIconClick,
  onOrdersIconClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 flex justify-around py-2 z-50">
      <MobileNavItem
        icon={HomeIcon}
        text="Home"
        active={activeTab === 'Home'}
        onClick={() => {
          setActiveTab('Home');
          navigate('/');
        }}
      />
      <MobileNavItem
        icon={UserGroupIcon}
        text="Following"
        active={activeTab === 'Following'}
        onClick={() => {
          setActiveTab('Following');
          navigate('/following');
        }}
      />
      <MobileNavItem
        icon={PlusCircleIcon}
        text="Create"
        active={activeTab === 'Create'}
        onClick={() => {
          setActiveTab('Create');
          navigate('/create');
        }}
      />
      <MobileNavItem
        icon={ShoppingBagIcon}
        text="Products"
        active={activeTab === 'Products'}
        onClick={() => {
          setActiveTab('Products');
          navigate('/products');
        }}
      />
      <MobileNavItem
        icon={ShoppingCartIcon}
        text="Cart"
        active={activeTab === 'Cart'}
        onClick={() => {
          setActiveTab('Cart');
          onCartIconClick();
          navigate('/cart');
        }}
        badgeContent={cartItemCount}
      />
      <MobileNavItem
        icon={ClipboardDocumentListIcon}
        text="Orders"
        active={activeTab === 'Orders'}
        onClick={() => {
          setActiveTab('Orders');
          onOrdersIconClick();
          // Optionally navigate to an orders page if you have one
        }}
      />
      <MobileNavItem
        icon={Cog6ToothIcon}
        text="Settings"
        active={activeTab === 'Settings'}
        onClick={() => {
          setActiveTab('Settings');
          navigate('/settings');
        }}
      />
      <MobileNavItem
        icon={ChatBubbleLeftIcon}
        text="Messages"
        active={activeTab === 'Messages'}
        onClick={() => {
          setActiveTab('Messages');
          navigate('/messages');
        }}
      />
    </div>
  );
};

export default MobileBottomNav;
