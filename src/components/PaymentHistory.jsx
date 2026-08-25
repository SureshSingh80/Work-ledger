'use client';

import React, { useState } from 'react';
import ExportButton from './ExportButton';
import { Eye, Loader2, Pencil, Trash2 } from 'lucide-react';
import { deletePayment } from '@/utils/admin/deletePayment';
import ShowResponseData from './ShowResponseData';
import EditPaymentForm from './EditPaymentForm';
import PaymentReciept from './PaymentReciept';


const PaymentHistory = ({
  worker,
  summary,
  paymentHistory,
  month,
  setMonth,
  handleExport,
  refetch
}) => {

  const [confirmDelete,setConfirmDelete] = useState();
  const [editableData,setEditableData] = useState();
  const [printableData,setPrintableData] = useState();
  const [deleteError,setDeleteError] = useState('');
  
  const [loading,setLoading] = useState('');
  
  const handleDelete = async(id)=>{
     setLoading('Deleting...');
     const res = await deletePayment(id);

     if(res.success){
        refetch();
        setConfirmDelete('');
     }
     else{
      setDeleteError(res.error);
     }
     setLoading('');
  }

  // const handleView = ()=>{

  // }

  return (
    <div className="space-y-6">

      {/* ================= Worker Details ================= */}

      <div className={`rounded-xl border bg-white p-6 shadow-sm ${confirmDelete && 'blur-sm'}` } >

        <div className="flex flex-col justify-between md:items-center gap-4 md:flex-row w-full ">

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {worker?.name || 'Unknown'}
            </h2>

            <p className="mt-1 text-gray-600">
              {worker?.workerType || 'Unknown'}
            </p>

            <div className="mt-4 flex flex-wrap gap-6 text-sm">

              <div>
                <span className="font-semibold">
                  Daily Wage:
                </span>{' '}
                ₹{worker?.dailyWage || '0'}
              </div>

              <div>
                <span className="font-semibold">
                  Joining Date:
                </span>{' '}
                {new Date(worker?.joiningDate).toLocaleDateString('en-IN')}
              </div>

            </div>

          </div>

          
          {/* export button */}
          <ExportButton onExcel = {()=>{
            handleExport("excel");
          }} onPdf = {()=>{
            handleExport("pdf");
          }} />
            

          <div>

            <label className="block text-sm font-medium text-gray-700">
              Filter Month
            </label>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-2 rounded-lg border px-4 py-2 outline-none focus:border-blue-600 w-full"
            >
              <option value="">All</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

          </div>

        </div>

      </div>

      {/* ================= Summary ================= */}

      <div className={`grid grid-cols-1 gap-4 md:grid-cols-4 ${confirmDelete && 'blur-sm'}` }>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Earned
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-600">
            ₹{summary?.totalEarned}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Paid
          </p>

          <h3 className="mt-2 text-3xl font-bold text-blue-600">
            ₹{summary?.totalPaid}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending Amount
          </p>

          <h3
            className={`mt-2 text-3xl font-bold ${
              summary?.pending < 0
                ? 'text-blue-600'
                : summary?.pending === 0
                ? 'text-green-600'
                : 'text-orange-600'
            }`}
          >
            ₹{summary?.pending}
          </h3>

          <p
            className={`mt-1 text-sm font-medium ${
              summary?.pending < 0
                ? 'text-blue-600'
                : summary?.pending === 0
                ? 'text-green-600'
                : 'text-orange-600'
            }`}
          >
            {summary?.pending < 0
              ? 'Advance'
              : summary?.pending === 0
              ? 'Settled'
              : 'Pending'}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Transactions
          </p>

          <h3 className="mt-2 text-3xl font-bold text-purple-600">
            {summary?.transactions}
          </h3>
        </div>

      </div>

      {/* ================= Payment History ================= */}

      <div className={` overflow-hidden rounded-xl border bg-white shadow-sm ${confirmDelete && 'blur-sm'}`} >

        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            Payment History
          </h3>
        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-8 py-3 text-left">
                Date
              </th>

              <th className="px-8 py-3 text-left">
                Amount
              </th>

              <th className="px-8 py-3 text-left">
                Method
              </th>

              <th className="px-8 py-3 text-left">
                Remark
              </th>

              <th className="px-8 py-3 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {paymentHistory?.length > 0 ? (

              paymentHistory.map((payment) => (

                <tr
                  key={payment._id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-8 py-4">
                    {new Date(payment?.paymentDate).toLocaleDateString(
                      'en-IN'
                    )}
                  </td>

                  <td className="px-8 py-4 font-medium text-green-600">
                    ₹{payment?.amount}
                  </td>

                  <td className="px-8 py-4">
                    {payment?.paymentMethod}
                  </td>

                  <td className="px-8 py-4">
                    {payment?.note || '-'}
                  </td>

                  <td className='px-8 py-4'>
                    <button
                      type="button"
                      title="View Payment"
                      className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setPrintableData({
                        payment,
                        worker
                      })}
                  >
                      <Eye size={16} />
                  </button>

                    <button
                      type="button"
                      title="Edit Payment"
                      className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 cursor-pointer"
                      onClick={() => setEditableData({
                        paymentId: payment._id,
                        amount: payment.amount,
                        paymentDate: payment.paymentDate,
                        paymentMethod: payment.paymentMethod,
                        note: payment.note
                      })}
                  >
                      <Pencil size={16} />
                  </button>
                   <button
                      type="button"
                      title="Delete Payment"
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
                      onClick={() => setConfirmDelete({
                        deleteId: payment._id,
                        deleteAmount: payment.amount,
                         paymentDate: payment.paymentDate
                      })}
                  >
                      <Trash2 size={16} />
                  </button>
                  </td>

                </tr>

              

              ))

            ) : (

              <tr>

                <td
                  colSpan={4}
                  className="py-10 text-center text-gray-500"
                >
                  No payment history found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

     
        

      </div>

     {/* Delete PopUp */}
      <div>
              {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <p className="text-lg font-medium text-gray-800">
                      Are you sure you want to delete this transaction: <b>{confirmDelete.deleteAmount} of date {new Date(confirmDelete.paymentDate).toLocaleDateString('en-IN')}</b>?
                    </p>
                    {deleteError && <p className="text-red-600 mt-2"><ShowResponseData success="" error={deleteError}/></p>}

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={()=>handleDelete(confirmDelete.deleteId)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                      >
                        {loading == 'Deleting...' ? <Loader2 className="h-4 w-4 animate-spin text-white" />:"Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

          </div>

      {/* edit PopUp */}
      <div>
              {editableData && (
                 <EditPaymentForm editableData={editableData} setEditableData={setEditableData} refetch={refetch} />
              )}

        </div>

        {/* print PopUp */}

        <div>
           {
             printableData && <PaymentReciept printableData={printableData}  setPrintableData={setPrintableData} />
           }
        </div>

    </div>
  );
};

export default PaymentHistory;