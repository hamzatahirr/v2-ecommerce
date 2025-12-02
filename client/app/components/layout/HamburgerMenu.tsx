"use client";

import React from 'react';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/app/contexts/SidebarContext';

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = "" }) => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <button
      id="hamburger-menu"
      onClick={toggleSidebar}
      className={`md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Toggle sidebar"
    >
      {isOpen ? (
        <X className="w-5 h-5 text-gray-700" />
      ) : (
        <Menu className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};

export default HamburgerMenu;