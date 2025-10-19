"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");
    
    try {
      const result = await signIn("Admin", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.ok) {
        router.push("/admin");
      } else {
        setError("Неверный email или пароль для админа");
      }
    } catch {
      setError("Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Вход для админа</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email админа
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль админа
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Вход..." : "Войти как админ"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Обычный пользователь?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Войти как игрок
          </Link>
        </p>
      </div>
    </div>
  );
}
