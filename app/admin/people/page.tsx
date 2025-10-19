import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

async function createPerson(formData: FormData) {
  "use server";
  try {
    await requireAdmin();
  } catch {
    redirect("/api/auth/signin");
  }
  
  const name = String(formData.get("name") || "").trim();
  const aliases = String(formData.get("aliases") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name) return;
  await prisma.person.create({ data: { displayName: name, aliases } });
  revalidatePath("/admin/people");
}

export default async function AdminPeoplePage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/api/auth/signin");
  }

  const people = await prisma.person.findMany({ orderBy: { displayName: "asc" }, take: 500 });
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Люди</h1>
      <form action={createPerson} className="flex gap-2 mb-6">
        <input name="name" placeholder="Имя" className="border rounded px-3 py-2" />
        <input name="aliases" placeholder="Псевдонимы (через запятую)" className="border rounded px-3 py-2 w-96" />
        <button className="bg-black text-white rounded px-4 py-2">Добавить</button>
      </form>
      <ul className="space-y-2">
        {people.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <div className="font-medium">{p.displayName}</div>
            {p.aliases?.length ? <div className="text-xs opacity-70">{p.aliases.join(", ")}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}


