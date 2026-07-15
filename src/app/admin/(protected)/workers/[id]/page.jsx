'use client'

import { fetchWorkerById } from '@/utils/admin/fetchWorkerById';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import Loader from '@/components/Loader';
import ReactQueryErrorPopUp from '@/components/ReactQueryErrorPopUp';
import WorkerDetails from '@/components/WorkerDetails';

const Page = () => {


  const { id } = useParams();


  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['worker', id],
    queryFn: () => fetchWorkerById(id),
    enabled: !!id
  });

  const worker = data?.worker;
  const totalPresent = data?.totalPresent;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader/>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
         <ReactQueryErrorPopUp error={error} refetch={refetch}/>
      </div>
    );
  }

  return (
     <WorkerDetails worker={worker} totalPresent={totalPresent} refetch={refetch}/>
  );
};

export default Page;