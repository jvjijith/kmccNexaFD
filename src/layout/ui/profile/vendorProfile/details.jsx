import React from 'react';
import { useOutletContext } from 'react-router-dom';

function VendorDetails() {
    const { customer } = useOutletContext();

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Details</h2>
            <div className="space-y-2 text-left">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.email}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.phone}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Website</label>
                        <div className="p-2 bg-secondary-card rounded">
                            <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-primary-button-color">
                                {customer.website}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.location}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.country}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.state}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Active</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.active ? 'Yes' : 'No'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Shipping Address</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.shippingAddress}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Billing Address</label>
                        <div className="p-2 bg-secondary-card rounded">{customer.billingAddress}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default VendorDetails;
