"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

export default function ChatWidgetGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <ChatWidget />;
}
