import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function CustomerContacts() {
    const { contact } = useOutletContext();
    const [openContactId, setOpenContactId] = useState(null);

    const toggleAccordion = (id) => {
        setOpenContactId(openContactId === id ? null : id);
    };

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Contacts</h2>
            {contact.contacts.map((contactItem) => (
                <div key={contactItem._id} className="mb-4">
                    <div 
                        className="p-4 bg-sidebar-card-top rounded shadow cursor-pointer"
                        onClick={() => toggleAccordion(contactItem._id)}
                    >
                        <div className="flex justify-between items-center">
                            <strong>{contactItem.name}</strong>
                            <span>{openContactId === contactItem._id ? '-' : '+'}</span>
                        </div>
                    </div>
                    {openContactId === contactItem._id && (
                        <div className="p-4 bg-card rounded shadow mt-2 space-y-2 text-left">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">{contactItem.email || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Primary Phone</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">
                                        {contactItem.primaryPhoneNumber || 'N/A'} {contactItem.primaryPhoneWhatsApp && "(WhatsApp)"}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Secondary Phone</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">
                                        {contactItem.secondaryPhoneNumber || 'N/A'} {contactItem.secondaryPhoneWhatsApp && "(WhatsApp)"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">{contactItem.address || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">{contactItem.country || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">{contactItem.state || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Designation</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">{contactItem.designation || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Notes</label>
                                    <div className="p-2 bg-sidebar-card-top rounded">
                                        {contactItem.note && contactItem.note.length > 0 ? (
                                            contactItem.note.join(', ')
                                        ) : (
                                            'N/A'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Add other fields as needed */}
                        </div>
                    )}
                </div>
            ))}
        </section>
    );
}

export default CustomerContacts;