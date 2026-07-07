
import { filterWorkers } from '@/utils/admin/filterWorkers';
import React from 'react'

const FilterInput = ({ setFilterType }) => {
    const handleFilterChange = async(e) =>{
        
        setFilterType(e.target.value);
    }
  return (
    <div>
        {/* Filter according to worker type "Rajmistri"*/}
        <select onChange={handleFilterChange} id="workerType" name="workerType" className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-4 text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
            <option value="All">All</option>
            <option value="Rajmistri">Rajmistri</option>
            <option value="Helper">Helper</option>
            <option value="Painter">Painter</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Other">Other</option>
        </select>
    </div>
  )
}

export default FilterInput