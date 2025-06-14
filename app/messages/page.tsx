'use client';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Messages() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Messages</h1>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <p className="text-xl">Your messages and notifications will appear here.</p>
        </div>
      </div>
    </div>
  );
} 