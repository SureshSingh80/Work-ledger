'use client'
import { forgotPassword } from '@/utils/admin/forgotPassword';
import React, { useState } from 'react'
import OTPInput from '@/components/auth/OTPInput';
import ForgotPasswordInput from '@/components/auth/ForgotPasswordInput';

const page = () => {

 
  const [email,setEmail] = useState('');  
  const [success,setSuccess] = useState('');


  

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      {
        success ? <OTPInput email={email} /> : (
          <ForgotPasswordInput  success={success} setSuccess={setSuccess} setEmail={setEmail} />
        )
      }
    </div>
  )
}

export default page
