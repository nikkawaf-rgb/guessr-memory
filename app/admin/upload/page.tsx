import { requireAdmin } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import UploadPhotosClient from "./UploadPhotosClient";

export default async function UploadPhotosPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/api/auth/signin");
  }

  return <UploadPhotosClient />;
}


