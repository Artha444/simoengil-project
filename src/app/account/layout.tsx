"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MinimalHeader from "@/components/MinimalHeader";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace("/");
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF8FB1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF9] font-sans pb-20">
      <MinimalHeader />
      <main className="pt-6 sm:pt-10 px-4 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}
