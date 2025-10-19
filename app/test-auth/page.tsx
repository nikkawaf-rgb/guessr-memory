"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Test Authentication</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        <p>Status: {status}</p>
        <p>Authenticated: {session ? "Yes" : "No"}</p>
        {session && (
          <div>
            <p>User ID: {session.user?.id}</p>
            <p>Name: {session.user?.name}</p>
            <p>Email: {session.user?.email}</p>
            <p>Role: {session.user?.role}</p>
          </div>
        )}
      </div>

      {!session ? (
        <div>
          <h3 className="font-semibold mb-2">Test Login:</h3>
          <button
            onClick={() => signIn("Player", { name: "тестер" })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login as "тестер"
          </button>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold mb-2">Actions:</h3>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
