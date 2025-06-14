'use client';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded) return;
      if (isSignedIn && userId) {
        try {
          const response = await fetch('/api/user');
          const userData = await response.json();
          setIsAdmin(userData?.admin || false);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/swamilogo.png"
              alt="Swami Logo"
              width={60}
              height={20}
              className="h-auto"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {isSignedIn && (
              <>
                <Link 
                  href="/standings" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Standings
                </Link>
                <Link 
                  href="/results" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Latest Results
                </Link>
                <Link 
                  href="/messages" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Messages
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
            <Link 
              href="/rules" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Rules
            </Link>
            {isSignedIn ? (
              <SignOutButton>
                <button className="text-red-400 hover:text-red-300 transition-colors duration-200">
                  Sign Out
                </button>
              </SignOutButton>
            ) : (
              <SignInButton mode="modal">
                <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 