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
        <div className="flex gap-3 text-sm">
          <Link className="underline" href="/admin/upload">Загрузка фото</Link>
          <Link className="underline" href="/admin/people">Люди</Link>
          <Link className="underline" href="/admin/locations">Локации</Link>
          <Link className="underline" href="/admin/zones">Зоны</Link>
        </div>
      </div>
    </div>
  );
}


