import React from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useGetData } from '../../../common/api';
import Image from '../image/image';

function ProfilePage() {
    const { userId } = useParams();
    const { data: employee, isPending, error } = useGetData('Employee', `/employee/user/${userId}`);

    if (isPending) {
        return <div className="text-center text-gray-500 py-5">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-5">Error loading data</div>;
    }

    return (
        <div className="flex w-full h-screen ">
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
                                <Image path="mock_faces_8" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{employee.name}</h1>
                            </div>
                        </div>

                        <nav className="mb-5">
                            <ul className="flex justify-center list-none p-0 m-0 bg-sidebar-card-top border-b border-gray-700">
                                <li className="mr-5">
                                    <NavLink to={`/profile/${userId}/details`} activeClassName="border-b-2 border-nexa-orange text-nexa-orange" className="no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange">Details</NavLink>
                                </li>
                                <li className="mr-5">
                                    <NavLink to={`/profile/${userId}/permissions`} activeClassName="border-b-2 border-nexa-orange text-nexa-orange" className="no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange">Permissions</NavLink>
                                </li>
                                <li className="mr-5">
                                    <NavLink to={`/profile/${userId}/activities`} activeClassName="border-b-2 border-nexa-orange text-nexa-orange" className="no-underline text-white py-2 px-4 block hover:border-b-2 hover:border-nexa-orange hover:text-nexa-orange">Activities</NavLink>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow overflow-y-auto">
                            <section className="w-full">
                                <h2 className="text-2xl mb-5">Details</h2>
                                <div className="space-y-2 text-left">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.email}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.phoneNumber}</div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.dateOfBirth}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Address</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.address}</div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Designation</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.designation}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Superior</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.superior}</div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Date of Joining</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.dateOfJoining}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Active User</label>
                                            <div className="p-2 bg-sidebar-card-top rounded">{employee.activeUser ? 'Yes' : 'No'}</div>
                                        </div>
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
