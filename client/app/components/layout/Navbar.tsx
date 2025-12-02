"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "../molecules/UserMenu";
import {
  ShoppingCart,
  Menu,
  X,
  CircleUserRound,
  Search,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "../molecules/SearchBar";
import { useGetCartCountQuery } from "@/app/store/apis/CartApi";
import useClickOutside from "@/app/hooks/dom/useClickOutside";
import useEventListener from "@/app/hooks/dom/useEventListener";
import { useAuth } from "@/app/hooks/useAuth";
import { useAppDispatch } from "@/app/store/hooks";
import { useSignOutMutation } from "@/app/store/apis/AuthApi";
import { logout } from "@/app/store/slices/AuthSlice";
import { generateUserAvatar } from "@/app/utils/placeholderImage";
import { Store, Shield, ShoppingBag, TrendingUp, MessageCircle } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [signout] = useSignOutMutation();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isSeller, isAdmin } = useAuth();
  const { data: cartData } = useGetCartCountQuery(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEventListener("scroll", () => {
    setScrolled(window.scrollY > 20);
  });
  
  useClickOutside(menuRef, () => setMenuOpen(false));
  useClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));

  const handleSignOut = async () => {
    try {
      await signout();
      dispatch(logout());
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md py-2"
            : "bg-white/95 backdrop-blur-sm py-3 sm:py-4"
        } ${
          isSeller
            ? "border-b-2 border-green-500"
            : isAdmin
            ? "border-b-2 border-purple-500"
            : ""
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            {/* Logo with Role Badge */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="font-medium text-lg sm:text-xl lg:text-xl text-gray-900 flex-shrink-0"
              >
              <Image
                  src="/logo.png"
                  alt="BuyBuddy"
                  width={80}
                  height={50}
                  className="rounded-full object-cover w-full h-full"
                />
              </Link>
              {isAuthenticated && (
                <div className="flex items-center gap-1">
                  {isSeller && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <Store size={12} />
                      Seller
                    </span>
                  )}
                  {isAdmin && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                      <Shield size={12} />
                      Admin
                    </span>
                  )}
                  {
                  // activeRole === "USER" && 
                  (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                      <ShoppingBag size={12} />
                      Shopping
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchBar />
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Become a Seller Link - Show for logged-in non-sellers */}
              {isAuthenticated && !isSeller &&(
                <Link
                  href="/become-seller"
                  className="hidden sm:flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <TrendingUp size={16} />
                  <span>Become a Seller</span>
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="text-[20px] sm:text-[22px]" />
                {cartData?.cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {cartData?.cartCount > 99 ? "99+" : cartData?.cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {!isLoading && isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                  >
                    {user?.avatar ? (
                      <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                        <Image
                          src={user.avatar}
                          alt="User Profile"
                          width={28}
                          height={28}
                          className="rounded-full object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = generateUserAvatar(user.name);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-[35px] h-[35px] rounded-full overflow-hidden border border-gray-300">
                        <Image
                          src={generateUserAvatar(user?.name || "User")}
                          alt="User Profile"
                          width={35}
                          height={35}
                          className="rounded-full object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </button>

                  {menuOpen && (
                    <UserMenu
                      user={user}
                      menuOpen={menuOpen}
                      closeMenu={() => setMenuOpen(false)}
                    />
                  )}
                </div>
              ) : (
                pathname !== "/sign-up" &&
                pathname !== "/sign-in" && (
                  <Link
                    href="/sign-in"
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors"
                  >
                    Sign in
                  </Link>
                )
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="md:hidden py-3 border-t border-gray-200">
              <SearchBar />
            </div>
          )}

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200"
            >
              <div className="px-4 py-2 space-y-2">
                {!isAuthenticated && (
                  <>
                    <Link
                      href="/sign-in"
                      className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
                <Link
                  href="/"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/shop"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/chat"
                    className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                )}
                {isAuthenticated && !isSeller && (
                  <Link
                    href="/become-seller"
                    className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TrendingUp size={16} />
                    Become a Seller
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 gap-3 text-red-600 hover:bg-red-50/80 transition-colors duration-150 text-sm"
                  >
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Navbar;
