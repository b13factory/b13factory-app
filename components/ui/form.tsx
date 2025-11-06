"use client";

import React from "react";

export const FormGroup = ({ label, children }: { label?: string; children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1 mb-3">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    {children}
  </div>
);
