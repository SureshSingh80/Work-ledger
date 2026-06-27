import Workers from '@/components/Workers'
import CreateNewWorker from '@/components/CreateNewWorker'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col '>
      <Workers/>
      <CreateNewWorker/>
    </div>
  )
}

export default page