import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function VariantDetails() {
    const { variant } = useOutletContext();
    const [openVariantId, setOpenVariantId] = useState(null);

    if (!variant) {
        return <p>No variant</p>;
    }

    const toggleAccordion = (id) => {
        setOpenVariantId(openVariantId === id ? null : id);
    };

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Variants</h2>
            {variant.map((variant) => (
                <div key={variant._id} className="mb-4">
                    <div
                        className="p-4 bg-sidebar-card-top rounded shadow cursor-pointer"
                        onClick={() => toggleAccordion(variant._id)}
                    >
                        <div className="flex justify-between items-center">
                            <strong>{variant.name}</strong>
                            <span>{openVariantId === variant._id ? '-' : '+'}</span>
                        </div>
                    </div>
                    {openVariantId === variant._id && (
                        <div className="p-4 border-nexa-gray bg-card rounded shadow mt-2">
                            <div className="space-y-2 text-left">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.name || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Model</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.model || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Product Code</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.productCode || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">HSN</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.HSN || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.color || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Size</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.size || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">RFQ</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.RFQ ? 'Yes' : 'No'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Active</label>
                                        <div className="p-2 bg-sidebar-card-top rounded">{variant.active ? 'Yes' : 'No'}</div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Notes</label>
                                    <ul className="p-2 bg-sidebar-card-top rounded">
                                        {variant.notes && variant.notes.length > 0 ? (
                                            variant.notes.map(note => (
                                                <li key={note._id} className="mb-2">
                                                    <strong>{note.name}:</strong> {note.description}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No notes available</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </section>
    );
}

export default VariantDetails;
