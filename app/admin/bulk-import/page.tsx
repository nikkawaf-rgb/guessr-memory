"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BulkImportClient from "./_components/BulkImportClient";

export default function BulkImportPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin");
    if (adminFlag !== "true") {
      router.push("/admin_enter");
      return;
    }
    setIsAdmin(true);
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <BulkImportClient />;
}
