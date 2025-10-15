import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";
import Image from "next/image";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

async function createZone(formData: FormData) {
  "use server";
  const photoId = String(formData.get("photoId"));
  const personId = String(formData.get("personId"));
  const shapeType = String(formData.get("shapeType"));
  const shapeDataJson = String(formData.get("shapeData"));
  const tolerancePx = Number(formData.get("tolerancePx") || 10);
  if (!photoId || !personId || !shapeType || !shapeDataJson) return;
  try {
    const shapeData = JSON.parse(shapeDataJson);
    await prisma.photoPeopleZone.create({
      data: { photoId, personId, shapeType: shapeType as any, shapeData, tolerancePx },
    });
  } catch {}
  revalidatePath(`/admin/zones/${photoId}`);
}

async function deleteZone(formData: FormData) {
  "use server";
  const zoneId = String(formData.get("zoneId"));
  const photoId = String(formData.get("photoId"));
  if (!zoneId) return;
  await prisma.photoPeopleZone.delete({ where: { id: zoneId } });
  revalidatePath(`/admin/zones/${photoId}`);
}

export default async function AdminZonesEditorPage({ params }: { params: { photoId: string } }) {
  const photo = await prisma.photo.findUnique({
    where: { id: params.photoId },
    include: { zones: { include: { person: true } } },
  });
  const people = await prisma.person.findMany({ orderBy: { displayName: "asc" }, take: 500 });
  if (!photo) return <div className="p-6">Photo not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <a href="/admin/zones" className="text-sm underline">← Back</a>
      <h1 className="text-2xl font-semibold mb-3">Zones for photo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative w-full aspect-[4/3] border rounded overflow-hidden">
            <Image
              src={photoPublicUrl(photo.storagePath)}
              alt="photo"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain bg-black"
            />
          </div>
          <div className="mt-2 text-xs opacity-70">Existing zones: {photo.zones.length}</div>
          <ul className="mt-2 space-y-2">
            {photo.zones.map((z) => (
              <li key={z.id} className="border rounded p-2 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{z.person.displayName}</span> · <span className="uppercase">{z.shapeType}</span>
                </div>
                <form action={deleteZone}>
                  <input type="hidden" name="zoneId" value={z.id} />
                  <input type="hidden" name="photoId" value={photo.id} />
                  <button className="text-red-600 text-sm">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-medium mb-2">Add zone</h2>
          <p className="text-xs opacity-70 mb-2">For now, paste JSON for rect/circle/polygon produced by the canvas tool below.</p>
          <ZoneCanvasHelper />
          <form action={createZone} className="mt-3 space-y-2">
            <input type="hidden" name="photoId" value={photo.id} />
            <div>
              <label className="text-sm">Person</label>
              <select name="personId" className="border rounded px-3 py-2 w-full">
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Shape type</label>
              <select name="shapeType" className="border rounded px-3 py-2 w-full">
                <option value="rect">rect</option>
                <option value="circle">circle</option>
                <option value="polygon">polygon</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Shape data (JSON)</label>
              <textarea name="shapeData" className="border rounded px-3 py-2 w-full h-28" placeholder='{"x":10,"y":20,"width":100,"height":80}' />
            </div>
            <div>
              <label className="text-sm">Tolerance (px)</label>
              <input name="tolerancePx" type="number" defaultValue={10} className="border rounded px-3 py-2 w-32" />
            </div>
            <button className="bg-black text-white rounded px-4 py-2">Create zone</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ZoneCanvasHelper() {
  "use client";
  // Minimal helper: draws a rectangle and prints JSON payload for shapeData
  // For full UX later, replace with react-konva interactive editor
  const [start, setStart] = require("react").useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = require("react").useState<{ x: number; y: number; width: number; height: number } | null>(null);
  return (
    <div>
      <div
        className="select-none border rounded bg-white text-black text-xs p-2"
        style={{ height: 220, position: "relative", cursor: "crosshair" }}
        onMouseDown={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          const r = el.getBoundingClientRect();
          setStart({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseMove={(e) => {
          if (!start) return;
          const el = e.currentTarget as HTMLDivElement;
          const r = el.getBoundingClientRect();
          const x = Math.min(start.x, e.clientX - r.left);
          const y = Math.min(start.y, e.clientY - r.top);
          const w = Math.abs((e.clientX - r.left) - start.x);
          const h = Math.abs((e.clientY - r.top) - start.y);
          setRect({ x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) });
        }}
        onMouseUp={() => setStart(null)}
      >
        {rect ? (
          <div
            style={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              border: "2px solid red",
              background: "rgba(255,0,0,0.1)",
            }}
          />
        ) : null}
      </div>
      <div className="mt-2 text-xs">
        JSON: <code className="break-all">{rect ? JSON.stringify(rect) : "{ }"}</code>
      </div>
    </div>
  );
}


