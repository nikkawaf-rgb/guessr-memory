"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    sessions: number;
    achievements: number;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Удалить пользователя "${userName}" и все его данные?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        alert("Ошибка при удалении пользователя");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Ошибка при удалении пользователя");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 Управление пользователями</h1>
          <Link
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            ← Назад в админку
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Имя</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Роль</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Игр</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Достижений</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Создан</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Админ' : 'Игрок'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {user._count.sessions}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {user._count.achievements}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition"
                        >
                          🗑️ Удалить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center text-gray-600 font-medium">
              Нет пользователей
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

