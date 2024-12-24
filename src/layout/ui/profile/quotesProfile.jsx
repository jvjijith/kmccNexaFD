import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingScreen from '../loading/loading';
import { useGetData } from '../../../common/api';

function ProfilePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const { data: quoteData, isPending, error } = useGetData('Quote', `/quotes/${id}`);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
 
  if (isPending || loading) {
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
    validUntil,
    termsAndConditions,
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
              <h1 className="text-3xl font-bold">Quote Details</h1>
            </div>
            <div className="flex-grow overflow-y-auto">
              <section className="w-full">
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Quote Number</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{quoteNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quote Status</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{quoteStatus}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Salesman</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{salesman?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{customer?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Amount</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{totalAmount}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Discount</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{totalDiscount}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Final Amount</label>
                      <div className="p-2 bg-sidebar-card-top rounded">{finalAmount}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Valid Until</label>
                      <div className="p-2 bg-sidebar-card-top rounded">
                        {new Date(validUntil).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Created At</label>
                      <div className="p-2 bg-sidebar-card-top rounded">
                        {new Date(createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Updated At</label>
                      <div className="p-2 bg-sidebar-card-top rounded">
                        {new Date(updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Products</label>
                    <ul className="list-disc pl-5 bg-sidebar-card-top rounded p-3">
                      {products?.length ? (
                        products.map((product, index) => (
                          <li key={index}>
                            {product.variantId?.name} - Quantity: {product.quantity} - Unit Price: {product.unitPrice}
                          </li>
                        ))
                      ) : (
                        <li>No Products Available</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Edited Notes</label>
                    <ul className="list-disc pl-5 bg-sidebar-card-top rounded p-3">
                      {editedNotes?.length
                        ? editedNotes.map((note, index) => <li key={index}>{note}</li>)
                        : 'No Notes Available'}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Terms and Conditions</label>
                    <ul className="list-disc pl-5 bg-sidebar-card-top rounded p-3">
                      {termsAndConditions?.length
                        ? termsAndConditions.map((term, index) => <li key={index}>{term.name}</li>)
                        : 'No Terms Available'}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Edited By</label>
                    <div className="p-2 bg-sidebar-card-top rounded">{editedBy?.name || 'N/A'}</div>
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
