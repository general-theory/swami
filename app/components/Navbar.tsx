'use client';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasActiveLeagues, setHasActiveLeagues] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checkUserStatus = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      // Check for active leagues
      const leaguesResponse = await fetch('/api/leagues/active');
      if (leaguesResponse.ok) {
        const leagues = await leaguesResponse.json();
        setHasActiveLeagues(leagues.length > 0);
      }

      // Check admin status
      const userResponse = await fetch('/api/user');
      if (userResponse.ok) {
        const user = await userResponse.json();
        setIsAdmin(user.admin || false);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  }, [isSignedIn]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  useEffect(() => {
    const handleLeagueChange = () => {
      checkUserStatus();
    };

    window.addEventListener('leagueChange', handleLeagueChange);
    return () => window.removeEventListener('leagueChange', handleLeagueChange);
  }, [checkUserStatus]);

  if (!isLoaded) {
    return (
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center min-w-0 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="relative">
              <Image
                src="/images/swamilogo.png"
                alt="Swami Logo"
                width={120}
                height={45}
                className="h-10 w-auto object-contain drop-shadow-sm filter brightness-110 contrast-110"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isSignedIn && (
              <>
                <Link 
                  href="/leagues" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  Leagues
                </Link>
                <Link 
                  href="/standings" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  Standings
                </Link>
                <Link 
                  href="/results" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  Latest Results
                </Link>
                {hasActiveLeagues && (
                  <Link 
                    href="/wager" 
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200 font-medium"
                  >
                    Wager
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                >
                  Profile
                </Link>
              </>
            )}
            
            <Link 
              href="/rules" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Rules
            </Link>
            
            <ThemeToggle />
            
            {isSignedIn ? (
              <SignOutButton>
                <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                  Sign Out
                </Button>
              </SignOutButton>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isSignedIn && (
                <>
                  <Link 
                    href="/leagues" 
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Leagues
                  </Link>
                  <Link 
                    href="/standings" 
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Standings
                  </Link>
                  <Link 
                    href="/results" 
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Latest Results
                  </Link>
                  {hasActiveLeagues && (
                    <Link 
                      href="/wager" 
                      className="block px-3 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Wager
                    </Link>
                  )}
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="block px-3 py-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
              
              <Link 
                href="/rules" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rules
              </Link>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                {isSignedIn ? (
                  <SignOutButton>
                    <Button variant="outline" size="sm" className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                      Sign Out
                    </Button>
                  </SignOutButton>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 