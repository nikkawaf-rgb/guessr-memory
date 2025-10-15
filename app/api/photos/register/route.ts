import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { key, exifISO } = await req.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }
    const exifTakenAt = exifISO ? new Date(exifISO) : null;
    const photo = await prisma.photo.create({
      data: {
        storagePath: key,
        exifTakenAt,
      },
    });
    return NextResponse.json({ id: photo.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}


