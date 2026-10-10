import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";
import { Spinner } from "@/components/ui/States";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <Spinner label="Loading" />
        </main>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
