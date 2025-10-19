import { requireAdmin } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/api/auth/signin");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Админ‑панель</h1>
      <div className="space-y-2">
        <p>Доступ получен.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Управление контентом</h2>
            <div className="space-y-3">
              <Link
                href="/admin/upload"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
              >
                Загрузить фото
              </Link>
              <Link
                href="/admin/bulk-import"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded hover:bg-green-700"
              >
                Массовый импорт
              </Link>
              <Link
                href="/admin/people"
                className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded hover:bg-purple-700"
              >
                Управление людьми
              </Link>
              <Link
                href="/admin/photos"
                className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded hover:bg-indigo-700"
              >
                Управление фото
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Модерация</h2>
            <div className="space-y-3">
              <Link
                href="/admin/moderation"
                className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded hover:bg-red-700"
              >
                Модерация комментариев
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


