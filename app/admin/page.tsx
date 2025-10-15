"use client";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Вход в админ‑панель</h1>
        <div className="flex flex-col gap-3">
          <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-black text-white rounded px-4 py-2" onClick={() => signIn("credentials", { email, password })}>Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Админ‑панель</h1>
      <div className="space-y-2">
        <p>Доступ получен.</p>
        <div className="flex gap-3 text-sm">
          <a className="underline" href="/admin/upload">Загрузка фото</a>
          <a className="underline" href="/admin/people">Люди</a>
          <a className="underline" href="/admin/locations">Локации</a>
        </div>
      </div>
    </div>
  );
}


