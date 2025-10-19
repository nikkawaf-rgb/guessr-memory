import { requireAdmin } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import BulkImportClient from "./_components/BulkImportClient";

export default async function BulkImportPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/auth/admin");
  }

  return <BulkImportClient />;
}