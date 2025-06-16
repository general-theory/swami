'use client';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasActiveLeagues, setHasActiveLeagues] = useState(false);

  const checkUserStatus = async () => {
    if (!isLoaded) return;
    if (isSignedIn && userId) {
      try {
        const [userResponse, leaguesResponse] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/leagues/active')
        ]);
        const userData = await userResponse.json();
        const leaguesData = await leaguesResponse.json();
        setIsAdmin(userData?.admin || false);
        setHasActiveLeagues(leaguesData.length > 0);
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsAdmin(false);
        setHasActiveLeagues(false);
      }
    }
  };

  useEffect(() => {
    checkUserStatus();

    // Listen for league changes
    const handleLeagueChange = () => {
      checkUserStatus();
    };

    window.addEventListener('leagueChange', handleLeagueChange);

    return () => {
      window.removeEventListener('leagueChange', handleLeagueChange);
    };
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
                  href="/leagues" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Leagues
                </Link>
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
                {hasActiveLeagues && (
                  <Link 
                    href="/wager" 
                    className="text-green-400 hover:text-green-300 transition-colors duration-200"
                  >
                    Wager
                  </Link>
                )}
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