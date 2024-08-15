import React from 'react';
import { useOutletContext } from 'react-router-dom';

function VariantDetails() {
    const { variant } = useOutletContext();

    if (!variant) {
        return <p>No variant</p>;
    }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Variants</h2>
            {variant.map((variant) => (
                <div key={variant._id} className="mb-4">
                    <div className="p-4 bg-sidebar-card-top rounded shadow">
                        <div><strong>Name:</strong> {variant.name}</div>
                        <div><strong>Model:</strong> {variant.model}</div>
                        <div><strong>Color:</strong> {variant.color}</div>
                        <div><strong>Size:</strong> {variant.size}</div>
                        <div><strong>Product Code:</strong> {variant.productCode}</div>
                        <div><strong>HSN:</strong> {variant.HSN}</div>
                        <div><strong>RFQ:</strong> {variant.RFQ ? 'Yes' : 'No'}</div>
                        <div><strong>Active:</strong> {variant.active ? 'Yes' : 'No'}</div>
                        {/* <div className="mt-4">
                            <strong>Images:</strong>
                            <div className="grid grid-cols-1 gap-4 mt-2">
                                {variant.images.length > 0 ? (
                                    variant.images.map((image) => (
                                        <div key={image._id} className="flex items-center">
                                            <img
                                                src={image.url}
                                                alt={image.altText}
                                                className="w-20 h-20 object-cover rounded mr-4"
                                            />
                                            <span>{image.altText}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No images available</p>
                                )}
                            </div>
                        </div> */}
                        <div className="mt-4">
                            <strong>Notes:</strong>
                            <ul className="list-disc list-inside">
                                {variant.notes.length > 0 ? (
                                    variant.notes.map((note) => (
                                        <li key={note._id}>
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
            ))}
        </section>
    );
}

export default VariantDetails;