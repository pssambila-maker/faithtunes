import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search by title, artist, tag, or scripture..."}
        className="w-full pl-12 pr-10 py-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-500"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
