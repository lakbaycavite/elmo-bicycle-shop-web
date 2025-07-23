import React from 'react';

function SearchBar({ className = '' }) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <input
        type="text"
        placeholder="Search"
        className="w-full pl-4 pr-10 py-1.5 rounded border border-gray-600 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:border-orange-600"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
      </span>
    </div>
  );
}

export default SearchBar; 