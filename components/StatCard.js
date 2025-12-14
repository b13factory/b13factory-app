// components/StatCard.js
'use client';

import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-lg md:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      gradient || 'bg-white'
    }`}>
      {/* Mobile: compact layout */}
      <div className="p-3 md:p-6">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
          {/* Icon - tampil di atas untuk mobile, di kanan untuk desktop */}
          <div className={`p-2 md:p-4 rounded-full order-first md:order-last ${
            gradient ? 'bg-white/20' : colorClass
          }`}>
            {Icon && <Icon size={20} className={`md:w-7 md:h-7 ${gradient ? 'text-white' : ''}`} />}
          </div>
          
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <p className={`text-xs md:text-sm font-medium mb-1 md:mb-2 ${
              gradient ? 'text-white/90' : 'text-gray-600'
            }`}>
              {title}
            </p>
            <p className={`text-xl md:text-3xl font-bold ${
              gradient ? 'text-white' : 'text-gray-900'
            }`}>
              {value}
            </p>
          </div>
        </div>
      </div>
      {/* Decorative element - hidden on mobile */}
      <div className="hidden md:block absolute bottom-0 right-0 opacity-10">
        {Icon && <Icon size={120} />}
      </div>
    </div>
  );
}