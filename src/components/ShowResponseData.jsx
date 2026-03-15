import React from 'react'

const ShowResponseData = ({success,error}) => {
  return (
   <div className="flex justify-center items-center">
            {success && (
              <>
                <span className="text-green-500">{success}</span>
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs ml-2">
                  ✓
                </span>
              </>
            )}

            {
              error && (
                <>
                  <span className="text-red-500">{error}</span>
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs ml-2">
                    !
                  </span>
                </>
              )
            }
          </div>
  )
}

export default ShowResponseData