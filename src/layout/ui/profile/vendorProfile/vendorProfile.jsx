import React, { useEffect, useState } from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useGetData } from '../../../../common/api';
import Image from '../../image/image';
import LoadingScreen from '../../loading/loading';

function ProfilePage() {
    
    const [loading, setLoading] = useState(true); // Loading state

    const { id } = useParams();
    const { data: customer, isPending: isCustomerPending, error: customerError } = useGetData('Customer', `/customer/customer/${id}`);
    const { data: contact, isPending: isContactPending, error: contactError } = useGetData('Contact', `/contact/customer/${id}`, { enabled: !!id });

      // Simulate loading for 10 seconds before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 10 seconds delay

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, []);

    if ( isCustomerPending || isContactPending || loading ) {
        return <LoadingScreen />;
    }

    if (customerError || contactError) {
        return <div className="text-center text-red-500 py-5">Error loading data</div>;
    }

    return (
        <div className="flex w-full h-screen">
            <div className="hidden sm:block sm:w-20 xl:w-60 flex-shrink-0">
                {/* Sidebar placeholder */}
            </div>
            <div className="h-screen flex-grow overflow-x-hidden overflow-auto flex justify-center items-center">
                <div className="w-full max-w-7xl h-full flex flex-col justify-center p-4">
                    <div className="flex flex-col w-full h-full bg-card text-text-color rounded-lg shadow-lg p-5">
                        <div className="mb-5">
                            <h1 className="text-3xl font-bold">Profile</h1>
                        </div>
                        <div className="flex items-center mb-5">
                            <div className="w-24 h-24 rounded-full overflow-hidden mr-5">
                                <Image path="/placeholder.png" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{customer.name}</h1>
                            </div>
                        </div>

                        <nav className="mb-5">
                            <ul className="flex justify-center list-none p-0 m-0 bg-secondary-card border-b border-gray-700">
                                <li className="mr-5">
                                    <NavLink 
                                        to={`/vendor/profile/${id}/vendordetails`}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "no-underline text-primary-button-color border-b-2 border-primary-button-color py-2 px-4 block"
                                                : "no-underline text-text-color py-2 px-4 block hover:border-b-2 hover:border-primary-button-color hover:text-primary-button-color"
                                        }
                                    >
                                        Details
                                    </NavLink>
                                </li>
                                <li className="mr-5">
                                    <NavLink 
                                        to={`/vendor/profile/${id}/contacts`}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "no-underline text-primary-button-color border-b-2 border-primary-button-color py-2 px-4 block"
                                                : "no-underline text-text-color py-2 px-4 block hover:border-b-2 hover:border-primary-button-color hover:text-primary-button-color"
                                        }
                                    >
                                        Contacts
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow overflow-y-auto">
                            <Outlet context={{ customer, contact }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
