import React from 'react';
import { useOutletContext } from 'react-router-dom';

function CustomerContacts() {
    const { contact } = useOutletContext();

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Contacts</h2>
            {contact.contacts.map((contactItem) => (
                <div key={contactItem._id} className="mb-4">
                    <div className="p-2 bg-sidebar-card-top rounded">
                        <div><strong>Name:</strong> {contactItem.name}</div>
                        <div><strong>Email:</strong> {contactItem.email}</div>
                        <div><strong>Primary Phone:</strong> {contactItem.primaryPhoneNumber} {contactItem.primaryPhoneWhatsApp && "(WhatsApp)"}</div>
                        <div><strong>Secondary Phone:</strong> {contactItem.secondaryPhoneNumber} {contactItem.secondaryPhoneWhatsApp && "(WhatsApp)"}</div>
                        <div><strong>Address:</strong> {contactItem.address}</div>
                        <div><strong>Country:</strong> {contactItem.country}</div>
                        <div><strong>State:</strong> {contactItem.state}</div>
                        <div><strong>Designation:</strong> {contactItem.designation}</div>
                        <div><strong>Notes:</strong> {contactItem.note.join(', ')}</div>
                        {/* Add other fields as needed */}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default CustomerContacts;
