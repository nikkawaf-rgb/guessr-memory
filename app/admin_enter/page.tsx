"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminEnterPage() {
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const isAdminFlag = localStorage.getItem("isAdmin");

    // Если уже есть админ – пустим сразу
    if (isAdminFlag === "true" && savedUser) {
      router.replace("/admin");
      return;
    }

    // Иначе отправим на страницу входа
    router.replace("/auth/simple-signin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border-t-4 border-red-600 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🔐 Вход в админку</h1>
        <p className="text-gray-700 mb-4">Перенаправляем на страницу входа...</p>
        <Link href="/auth/simple-signin" className="text-red-600 font-bold hover:underline">
          Если не перенаправило — нажмите сюда
        </Link>
      </div>
    </div>
  );
}

