"use client";

import { Brain, Sparkles, MessageSquare, Users, Settings2 } from "lucide-react";
import { CoreKeyButton } from "@/components/ui/CoreKeyButton";
import { usePathname } from "next/navigation";

export default function SidebarKeys() {
  const pathname = usePathname();

  const keys = [
    { title: "Primary Processing", href: "/primary-processing", icon: Brain },
    { title: "Visualization Lab", href: "/intelligence/visualization", icon: Sparkles },
    { title: "Interaction Expansion", href: "/interaction-expansion", icon: MessageSquare },
    {
      title: "Personas Lab",
      href: "/personas-lab",
      icon: Users,
    },
    {
      title: "Control Center",
      href: "/control-center",
      icon: Settings2,
    },
  ];

  return (
    <div className="flex flex-col space-y-4 mt-8 relative">
      {/* subtle glowing spine */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 rounded-full" />
      {keys.map((key) => (
        <CoreKeyButton
          key={key.href}
          title={key.title}
          href={key.href}
          icon={key.icon}
          isActive={pathname.startsWith(key.href)}
        />
      ))}
    </div>
  );
}
