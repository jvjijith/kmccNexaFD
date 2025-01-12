import React from 'react';
import { useOutletContext } from 'react-router-dom';

function ProductDetails() {
    const { product } = useOutletContext();

    if (!product) {
        return <p className='text-text-color'>Loading product details...</p>;
    }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Product Details</h2>
            <div className="space-y-2 text-left">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <div className="p-2 bg-secondary-card rounded">{product.name || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Model</label>
                        <div className="p-2 bg-secondary-card rounded">{product.model || 'N/A'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Code</label>
                        <div className="p-2 bg-secondary-card rounded">{product.productCode || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">HSN</label>
                        <div className="p-2 bg-secondary-card rounded">{product.HSN || 'N/A'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <div className="p-2 bg-secondary-card rounded">{product.stock || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">RFQ</label>
                        <div className="p-2 bg-secondary-card rounded">{product.RFQ ? 'Yes' : 'No'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Brand</label>
                        <div className="p-2 bg-secondary-card rounded">{product.brand?.name || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Sub Brand</label>
                        <div className="p-2 bg-secondary-card rounded">{product.subBrand?.subBrandName || 'N/A'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <div className="p-2 bg-secondary-card rounded">{product.category?.categoryName || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category Type</label>
                        <div className="p-2 bg-secondary-card rounded">{product.category?.categoryType || 'N/A'}</div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <div className="p-2 bg-secondary-card rounded">{product.description || 'N/A'}</div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <ul className="p-2 bg-secondary-card rounded">
                        {product.notes && product.notes.length > 0 ? (
                            product.notes.map(note => (
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
        </section>
    );
}

export default ProductDetails;
