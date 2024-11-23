import React from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useGetData } from '../../../common/api';
import LoadingScreen from '../loading/loading';

function ProfilePage() {
  const { id } = useParams();
  const { data: quoteData, isPending, error } = useGetData('Quote', `/quotes/${id}`);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-5">Error loading data</div>;
  }

  if (!quoteData) {
    return <div className="text-center text-gray-500 py-5">No data available</div>;
  }

  const {
    quoteNumber,
    quoteStatus,
    enquiryId,
    salesman,
    customer,
    products,
    totalAmount,
    totalDiscount,
    finalAmount,
    createdAt,
    updatedAt,
    editedBy,
    editedNotes,
  } = quoteData;

  return (
    <div className="flex w-full h-screen">
      <div className="hidden sm:block sm:w-20 xl:w-60 flex-shrink-0">
        {/* Sidebar placeholder */}
      </div>
      <div className="h-screen flex-grow overflow-x-hidden overflow-auto flex justify-center items-center">
        <div className="w-full max-w-7xl h-full flex flex-col justify-center p-4">
          <div className="flex flex-col w-full h-full bg-card text-white rounded-lg shadow-lg p-5">
            <div className="mb-5">
              <h1 className="text-3xl font-bold">Quote Profile</h1>
            </div>

            <nav className="mb-5">
              <ul className="flex justify-center list-none p-0 m-0 bg-sidebar-card-top border-b border-gray-700">
                <li className="mr-5">
                  <NavLink
                    exact
                    to={`/quote/${id}/details`}
                    className={({ isActive }) =>
                      isActive
                        ? 'no-underline text-nexa-orange border-b-2 border-nexa-orange py-2 px-4 block'
                        : 'no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange'
                    }
                  >
                    Details
                  </NavLink>
                </li>
                <li className="mr-5">
                  <NavLink
                    exact
                    to={`/quote/${id}/products`}
                    className={({ isActive }) =>
                      isActive
                        ? 'no-underline text-nexa-orange border-b-2 border-nexa-orange py-2 px-4 block'
                        : 'no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange'
                    }
                  >
                    Products
                  </NavLink>
                </li>
              </ul>
            </nav>

            <div className="flex-grow overflow-y-auto">
              <section className="w-full">
                <h2 className="text-2xl mb-5">Details</h2>
                <div className="space-y-2 text-left">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Quote Number</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{quoteNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quote Status</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{quoteStatus}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Salesman</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{salesman?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{customer?.name || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Enquiry ID</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{enquiryId?._id || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Amount</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{totalAmount}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Discount</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{totalDiscount}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Final Amount</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{finalAmount}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Created At</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{new Date(createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Updated At</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{new Date(updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Edited Notes</label>
                    <ul className="list-disc pl-5 bg-sidebar-card-top rounded p-3">
                      {editedNotes?.length
                        ? editedNotes.map((note, index) => <li key={index}>{note}</li>)
                        : 'No Notes Available'}
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
