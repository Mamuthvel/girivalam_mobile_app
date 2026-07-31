import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SpiritualCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const SpiritualCard = ({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}: SpiritualCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "spiritual-card",
        glow && "animate-sacred-glow",
        hover && "hover:scale-[1.02] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};