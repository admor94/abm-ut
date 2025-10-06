import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COURSES } from '../courses';
import type { Course } from '../courses';

interface CourseSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const CourseSearchInput: React.FC<CourseSearchInputProps> = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredCourses = useMemo(() => {
    // 1. Don't show dropdown if input is empty
    if (!query) {
      return [];
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = COURSES.filter(course =>
      course.combined.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 10); // Limit results for performance

    // 2. Check for exact match in the full list to avoid showing "Gunakan teks" for a valid course
    const isExactMatch = COURSES.some(c => c.combined.toLowerCase() === lowerCaseQuery);

    // 3. If no exact match, add the custom option
    if (!isExactMatch) {
      const customOption: Course = { 
        code: 'custom', 
        name: query, 
        combined: `Gunakan teks: "${query}"` 
      };
      return [customOption, ...results];
    }
    
    return results;
  }, [query]);

  const handleSelect = (course: Course) => {
    if (course.code === 'custom') {
      // The text is already in the `query` state and has been propagated up
      // via onChange in the handleChange function. We just need to close the dropdown.
      setIsOpen(false);
    } else {
      setQuery(course.combined);
      onChange(course.combined);
      setIsOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Allow free text input
    if (!isOpen) {
        setIsOpen(true);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  // Sync internal state if external value changes (e.g., from parent)
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"
        autoComplete="off" // prevent browser autocomplete from interfering
      />
      {isOpen && filteredCourses.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCourses.map(course => (
            <li
              key={course.code === 'custom' ? 'custom-option' : course.code}
              onClick={() => handleSelect(course)}
              className="px-4 py-2 text-white hover:bg-ut-blue cursor-pointer"
            >
              {course.combined}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};