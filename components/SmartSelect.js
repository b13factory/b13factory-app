'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Check } from 'lucide-react';

/**
 * SmartSelect - Component hybrid antara dropdown dan input manual
 * Menampilkan options dari data existing tapi tetap bisa input manual
 */
export function SmartSelect({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = '',
  required = false,
  className = '',
  id = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Filter options based on input
    if (newValue) {
      const filtered = options.filter(opt => 
        opt.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
    setIsOpen(true);
  };

  const handleSelectOption = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const uniqueOptions = [...new Set(filteredOptions)].filter(opt => opt);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <Label htmlFor={id} className="mb-2 block font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="pr-10 bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
        />
        {uniqueOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown 
              size={20} 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      
      {/* Dropdown Options */}
      {isOpen && uniqueOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {uniqueOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectOption(option)}
              className={`w-full px-4 py-2.5 text-left hover:bg-sky-50 transition-colors flex items-center justify-between group ${
                inputValue === option ? 'bg-sky-50 text-sky-700' : 'text-gray-700'
              }`}
            >
              <span className="font-medium">{option}</span>
              {inputValue === option && (
                <Check size={18} className="text-sky-600" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Helper text */}
      {uniqueOptions.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Pilih dari daftar atau ketik manual
        </p>
      )}
    </div>
  );
}