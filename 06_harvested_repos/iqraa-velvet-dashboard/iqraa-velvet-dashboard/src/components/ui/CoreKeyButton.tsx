"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface CoreKeyButtonProps {
  title: string;
  href: string;
  icon: React.ElementType;
  isActive?: boolean;
}

export function CoreKeyButton({
  title,
  href,
  icon: Icon,
  isActive = false,
}: CoreKeyButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 select-none",

        // القاعدة الأساسية للمكون المخملي
        "bg-white/10 backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",

        // نص وأيقونة
        "text-slate-200 hover:text-white",

        // مخملي نشط = إضاءة + ضغط + عمق
        isActive &&
          "bg-white/20 border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.25)] scale-[1.02]",

        // Hover Velvet
        !isActive &&
          "hover:bg-white/15 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:scale-[1.01]"
      )}
    >
      {/* خلفية الإضاءة المخملية الجانبية */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500",
          isActive && "opacity-60",
          "bg-gradient-to-r from-white/20 to-transparent pointer-events-none"
        )}
      />

      {/* أيقونة */}
      <Icon
        className={cn(
          "w-5 h-5 transition-all duration-300",
          isActive ? "text-white" : "text-slate-300 group-hover:text-white"
        )}
      />

      {/* النص */}
      <span
        className={cn(
          "font-medium transition-all duration-300",
          isActive ? "text-white" : "text-slate-300 group-hover:text-white"
        )}
      >
        {title}
      </span>
    </Link>
  );
}