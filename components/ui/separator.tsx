"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-px bg-gray-200 w-full my-4", className)} />
);
