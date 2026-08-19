
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const SearchInput = ({setDebouncedSearch}) => {

      const [search, setSearch] = useState('');
      

      useEffect(()=>{
          const timer = setTimeout(() =>{
              setDebouncedSearch(search);
          },2000);

          console.log("mounted");

          return ()=> clearTimeout(timer);
      },[search]);

      
      

  return (
    <div className="relative w-full max-w-md mb-5  mt-2 ml-4   ">

        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search by name, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-700  shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

      </div>

  )
}

export default SearchInput