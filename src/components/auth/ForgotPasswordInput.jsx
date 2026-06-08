import { forgotPassword } from '@/utils/admin/forgotPassword';
import React, { useState } from 'react'


const ForgotPasswordInput = ({  success,setSuccess,setEmail }) => {

     const [idOrEmail, setIdOrEmail] = useState('');
     const[loading,setLoading] = useState(false);
     const [error,setError] = useState('');

    const handleForgotPassword = async (idOrEmail) => {
    
        if(!idOrEmail){
          setError("Please enter Admin ID or Email");
          setSuccess('');
          return;
        }
    
        setLoading(true);
        setError('');
        setSuccess('');
        setIdOrEmail(idOrEmail.trim());
        
        const res = await forgotPassword(idOrEmail);
        if(res.success){
          setSuccess(res.message);
          ;
          setEmail(res.email);
          setError('');
        }else{
          console.log("Error in forgot password", res.error);      
          setError(res.error);
          setSuccess('');
          
        }
        setLoading(false);
        setIdOrEmail(''); 
      };
  return (
    <div className='bg-white p-8 rounded shadow-md w-full max-w-md'>
          <h2 className='text-2xl font-bold mb-4'>Forgot Password</h2>
          <input 
            type='text' 
            placeholder='Enter Admin ID or Email' 
            className='w-full p-2 mb-0 border rounded' 
            value={idOrEmail}
            onChange={(e) => setIdOrEmail(e.target.value)}
          />
          {error && <p className='text-red-500 mb-2'>{error}</p>}
          {success && <p className='text-green-500 mb-2'>{success}</p>}
          <button className='w-full bg-blue-500 text-white p-2 rounded cursor-pointer mt-3' onClick={()=> handleForgotPassword(idOrEmail)}>
            {loading ? 'Processing...' : 'Send OTP For Password Reset'}
          </button>
    </div>
  )
}

export default ForgotPasswordInput