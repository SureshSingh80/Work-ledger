import React from 'react'

const ReactQueryErrorPopUp = ({error, refetch}) => {
  return (
    <div className="max-w-md w-full bg-white shadow-md rounded-xl p-4 border text-center">
  <div className="mb-4 text-6xl">⚠️</div>

  <h2 className="text-xl font-bold text-red-600">
    Something Went Wrong
  </h2>

  <p className="mt-2 text-sm text-red-500">
    {error?.message || "An unexpected error occurred."}
  </p>

  <button
    onClick={() => refetch()}
    className="mt-5 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-95 cursor-pointer"
  >
    Retry
  </button>
</div>
  )
}

export default ReactQueryErrorPopUp