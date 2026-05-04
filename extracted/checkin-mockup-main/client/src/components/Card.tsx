import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function Card({
  children,
  className = "",
  onClick,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-lg p-6
        ${interactive ? "cursor-pointer hover:shadow-md hover:border-accent/50" : ""}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
