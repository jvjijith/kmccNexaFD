import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetData } from '../../../common/api';
import Image from '../image/image';
import LoadingScreen from '../loading/loading';

function ProfilePage() {
    const { userId } = useParams();
    const { data: employee, isPending: isEmployeePending, error: employeeError } = useGetData('Employee', `/employee/user/${userId}`);
  
    const superiorId = employee ? employee.superior : null;
    const { data: memployee, isPending: isMemployeePending, error: memployeeError } = useGetData('Employee', `/employee/metadata/${superiorId}`, { enabled: !!superiorId });
    const { data: permission, isPending: isPermissionPending, error: permissionError } = useGetData('Permission', `/user-team-permissions/employee/${userId}/permission`);

    // State for active tab and accordion management
    const [activeTab, setActiveTab] = useState('details');
    const [expandedModule, setExpandedModule] = useState(null);

    if (isEmployeePending || isMemployeePending) {
        return <LoadingScreen />;
    }

    if (employeeError || memployeeError) {
        return <div className="text-center text-red-500 py-5">Error loading data</div>;
    }

    // Toggle accordion section
    const toggleAccordion = (moduleId) => {
        setExpandedModule(moduleId === expandedModule ? null : moduleId);
    };

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
                                <Image className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{employee?.name}</h1>
                            </div>
                        </div>

                        <nav className="mb-5">
                            <ul className="flex justify-center list-none p-0 m-0 bg-secondary-card border-b border-gray-700">
                                <li className="mr-5">
                                    <button 
                                        onClick={() => setActiveTab('details')}
                                        className={
                                            activeTab === 'details'
                                                ? "no-underline text-primary-button-color border-b-2 border-primary-button-color py-2 px-4 block"
                                                : "no-underline text-text-color py-2 px-4 block hover:border-b-2 hover:border-primary-button-color hover:text-primary-button-color"
                                        }
                                    >
                                        Details
                                    </button>
                                </li>
                                <li className="mr-5">
                                    <button 
                                        onClick={() => setActiveTab('permissions')}
                                        className={
                                            activeTab === 'permissions'
                                                ? "no-underline text-primary-button-color border-b-2 border-primary-button-color py-2 px-4 block"
                                                : "no-underline text-text-color py-2 px-4 block hover:border-b-2 hover:border-primary-button-color hover:text-primary-button-color"
                                        }
                                    >
                                        Permissions
                                    </button>
                                </li>
                                <li className="mr-5">
                                    <button 
                                        onClick={() => setActiveTab('activities')}
                                        className={
                                            activeTab === 'activities'
                                                ? "no-underline text-primary-button-color border-b-2 border-primary-button-color py-2 px-4 block"
                                                : "no-underline text-text-color py-2 px-4 block hover:border-b-2 hover:border-primary-button-color hover:text-primary-button-color"
                                        }
                                    >
                                        Activities
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow overflow-y-auto">
                            <div className="w-full">
                                {activeTab === 'permissions' ? (
                                    <PermissionsSection 
                                        permission={permission} 
                                        expandedModule={expandedModule} 
                                        toggleAccordion={toggleAccordion}
                                        isLoading={isPermissionPending}
                                        error={permissionError}
                                    />
                                ) : activeTab === 'activities' ? (
                                    <ActivitiesSection />
                                ) : (
                                    <DetailsSection employee={employee} memployee={memployee} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Details Section Component
function DetailsSection({ employee, memployee }) {
    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Details</h2>
            <div className="space-y-2 text-left">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.email}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.phoneNumber}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.dateOfBirth}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.address}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Designation</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.designation}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Superior</label>
                        <div className="p-2 bg-secondary-card rounded">{memployee ? memployee.name : 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Joining</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.dateOfJoining}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Active User</label>
                        <div className="p-2 bg-secondary-card rounded">{employee?.activeUser ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Placeholder for Activities Section
function ActivitiesSection() {
    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Activities</h2>
            <div className="text-center text-gray-500 py-5">No recent activities</div>
        </section>
    );
}

// Permissions Section Component with Accordion
function PermissionsSection({ permission, expandedModule, toggleAccordion, isLoading, error }) {
    if (isLoading) {
        return (
            <section className="w-full">
                <h2 className="text-2xl mb-5">Permissions</h2>
                <div className="text-center text-gray-500 py-5">Loading permissions...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full">
                <h2 className="text-2xl mb-5">Permissions</h2>
                <div className="text-center text-red-500 py-5">Error loading permissions</div>
            </section>
        );
    }

    if (!permission || permission.length === 0) {
        return (
            <section className="w-full">
                <h2 className="text-2xl mb-5">Permissions</h2>
                <div className="text-center text-gray-500 py-5">No permissions found</div>
            </section>
        );
    }

    // Using the first permission item since it contains the allowedModules array
    const permissionItem = permission[0];

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Permissions</h2>
            
            <div className="bg-secondary-card p-4 rounded mb-4">
                <h3 className="text-lg font-semibold mb-2">Reference Name</h3>
                <p>{permissionItem.referenceName}</p>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">Module Permissions</h3>
                
                {permissionItem.allowedModules.map((module) => (
                    <div 
                        key={module._id} 
                        className="border border-gray-700 rounded-lg overflow-hidden mb-2"
                    >
                        <div 
                            className="flex justify-between items-center p-3 bg-secondary-card cursor-pointer"
                            onClick={() => toggleAccordion(module._id)}
                        >
                            <span className="font-medium">{module.moduleId.moduleName}</span>
                            <span className="text-primary-button-color">
                                {expandedModule === module._id ? '▲' : '▼'}
                            </span>
                        </div>
                        
                        {expandedModule === module._id && (
                            <div className="p-3 border-t border-gray-700">
                                <div className="mb-2">
                                    <span className="font-medium">Module Code:</span> {module.moduleId.moduleCode}
                                </div>
                                <div>
                                    <span className="font-medium">Allowed Operations:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {module.allowedOperations.map((operation) => (
                                            <span 
                                                key={operation} 
                                                className="px-2 py-1 bg-primary-button-color bg-opacity-20 text-primary-button-color rounded-md text-sm"
                                            >
                                                {operation.charAt(0).toUpperCase() + operation.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ProfilePage;