import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6",
        glow && "shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-shadow duration-300",
        className
      )}
      {...props}
    />
  );
}
