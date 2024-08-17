import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useGetData } from '../../../../common/api';
import Image from '../../image/image';
import LoadingScreen from '../../loading/loading';

function ProfilePage() {
    const { id } = useParams();
    const { data: customer, isPending: isCustomerPending, error: customerError } = useGetData('Customer', `/customer/customer/${id}`);
    const { data: contact, isPending: isContactPending, error: contactError } = useGetData('Contact', `/contact/customer/${id}`, { enabled: !!id });

    if (isCustomerPending || isContactPending) {
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
                    <div className="flex flex-col w-full h-full bg-card text-white rounded-lg shadow-lg p-5">
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
                            <ul className="flex justify-center list-none p-0 m-0 bg-sidebar-card-top border-b border-gray-700">
                                <li className="mr-5">
                                    <NavLink 
                                        to={`/profile/${id}/customerdetails`}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "no-underline text-nexa-orange border-b-2 border-nexa-orange py-2 px-4 block"
                                                : "no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange"
                                        }
                                    >
                                        Details
                                    </NavLink>
                                </li>
                                <li className="mr-5">
                                    <NavLink 
                                        to={`/profile/${id}/contacts`}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "no-underline text-nexa-orange border-b-2 border-nexa-orange py-2 px-4 block"
                                                : "no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange"
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
