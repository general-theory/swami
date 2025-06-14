'use client';

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" 
      style={{ 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/images/bryant-denny-stadium.jpg")'
      }}
    >
      <div className="text-center space-y-8 p-8 bg-black/30 backdrop-blur-sm rounded-xl">
        <h1 className="text-6xl font-bold text-white">Swami</h1>
        <p className="text-xl text-white/80">Your Fantasy Football Oracle</p>
        {!isSignedIn && (
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-lg">
              Start Your Journey
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}