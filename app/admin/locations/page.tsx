import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

async function createLocation(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const aliases = String(formData.get("aliases") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name) return;
  await prisma.location.create({ data: { name, aliases } });
  revalidatePath("/admin/locations");
}

export default async function AdminLocationsPage() {
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" }, take: 500 });
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Локации</h1>
      <form action={createLocation} className="flex gap-2 mb-6">
        <input name="name" placeholder="Город" className="border rounded px-3 py-2" />
        <input name="aliases" placeholder="Синонимы (через запятую)" className="border rounded px-3 py-2 w-96" />
        <button className="bg-black text-white rounded px-4 py-2">Добавить</button>
      </form>
      <ul className="space-y-2">
        {locations.map((l) => (
          <li key={l.id} className="border rounded p-3">
            <div className="font-medium">{l.name}</div>
            {l.aliases?.length ? <div className="text-xs opacity-70">{l.aliases.join(", ")}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}


