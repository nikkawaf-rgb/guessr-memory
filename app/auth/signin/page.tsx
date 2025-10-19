"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting login with name:", name.trim());
      const result = await signIn("Player", {
        name: name.trim(),
        redirect: false,
      });
      
      console.log("SignIn result:", result);
      
      if (result?.ok) {
        console.log("Login successful, redirecting to profile");
        router.push("/profile");
      } else {
        console.error("Login failed:", result?.error);
        setError(`Ошибка входа: ${result?.error || "Неизвестная ошибка"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Вход в игру</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ваше имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите ваше имя"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Вход..." : "🎮 Начать играть"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Просто введите ваше имя и начинайте играть!
        </p>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Админ?{" "}
          <Link href="/auth/admin" className="text-blue-600 hover:underline">
            Войти как админ
          </Link>
        </p>
      </div>
    </div>
  );
}
