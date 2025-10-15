import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const name = formData.get("name") as string | null;
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}-${name || "upload"}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabaseServer.storage.from("photos").upload(
      key,
      Buffer.from(arrayBuffer),
      {
        contentType: (file as Blob & { type?: string }).type || "image/jpeg",
        upsert: false,
      }
    );
    if (error) throw error;
    return NextResponse.json({ key });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


