'use client';

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    const createUserInDb = async () => {
      if (isSignedIn && userId) {
        try {
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          await response.json();
        } catch (error) {
          console.error('Error creating user:', error);
        }
      }
      setIsInitialized(true);
    };

    createUserInDb();
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-white/70 text-lg">Loading Swami...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/images/bryant-denny-stadium.jpg")'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/swamilogo.png"
              alt="Swami Logo"
              width={300}
              height={100}
              className="mx-auto h-24 w-auto drop-shadow-2xl filter brightness-110 contrast-110"
              priority
            />
          </div>
          
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
              Swami
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-lg mx-auto leading-relaxed">
              Your Fantasy Football Oracle
            </p>
          </div>
          
          {/* Description */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/30">
            <p className="text-white text-lg leading-relaxed">
              Join the ultimate college football prediction game. Start with $1000 and compete to become the Swami champion.
            </p>
          </div>
          
          {/* CTA Button */}
          {!isSignedIn && (
            <div className="pt-4">
              <SignInButton mode="modal">
                <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm">
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-200"></div>
                </button>
              </SignInButton>
            </div>
          )}
          
          {/* Features for signed in users */}
          {isSignedIn && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="text-3xl mb-3">🏈</div>
                <h3 className="text-white font-semibold mb-2">Place Wagers</h3>
                <p className="text-white text-sm">Bet on your favorite teams with strategic spreads</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-white font-semibold mb-2">Track Results</h3>
                <p className="text-white text-sm">Monitor your performance and see weekly results</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-white font-semibold mb-2">Compete</h3>
                <p className="text-white text-sm">Join leagues and compete for the Swami title</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}