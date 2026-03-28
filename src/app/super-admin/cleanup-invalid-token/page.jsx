
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/superAdmin/logout";


export default function CleanupInvalidTokenPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await logout();              
      } catch (e) {
        console.error(e);
      } finally {
        router.push("/super-admin/login");
      }
    })();
  }, [router]);

  return <div>Logging out…</div>;
}
