"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = ({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 border-b border-gray-100", className)}>{children}</div>
);

export const CardTitle = ({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold text-gray-900", className)}>{children}</h3>
);

export const CardDescription = ({
  className,
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-gray-500 mt-1", className)}>{children}</p>
);

export const CardContent = ({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)}>{children}</div>
);

export const CardFooter = ({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 border-t border-gray-100", className)}>{children}</div>
);
