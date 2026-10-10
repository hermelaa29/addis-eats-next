import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { Spinner } from "@/components/ui/States";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <Spinner label="Loading" />
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
