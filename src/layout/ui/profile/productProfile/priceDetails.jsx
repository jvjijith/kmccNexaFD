import React, { useState } from 'react';
import { useOutletContext } from 'react-router';

function PriceDetails() {

    const { price } = useOutletContext();

    const [openPriceId, setOpenPriceId] = useState(null);

    const toggleAccordion = (id) => {
        setOpenPriceId(openPriceId === id ? null : id);
    };

    if (!price) {
        return <p className='text-text-color'>No prices</p>;
    }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Prices</h2>
            {price.map((priceItem) => (
                priceItem.pricing.map((priceItem) => (
                <div key={priceItem._id} className="mb-4">
                    <div 
                        className="p-4 bg-secondary-card rounded shadow cursor-pointer"
                        onClick={() => toggleAccordion(priceItem._id)}
                    >
                        <div className="flex justify-between items-center">
                            <strong>{priceItem.amount} {priceItem.currency}</strong>
                            <span>{openPriceId === priceItem._id ? '-' : '+'}</span>
                        </div>
                    </div>
                    {openPriceId === priceItem._id && (
                        <div className="p-4 bg-card rounded shadow mt-2 space-y-2 text-left">
                            <div className="flex flex-wrap">
                            <div className="w-full sm:w-1/2 p-4">
                                <label className="block text-sm font-medium mb-1">Amount</label>
                                <div className="p-2 bg-secondary-card rounded">{priceItem.amount  || 'N/A'}</div>
                            </div>
                            <div className="w-full sm:w-1/2 p-4">
                                <label className="block text-sm font-medium mb-1">Currency</label>
                                <div className="p-2 bg-secondary-card rounded">{priceItem.currency  || 'N/A'}</div>
                            </div>
                            </div>
                            <div className="flex flex-wrap">
                            <div className="w-full sm:w-1/2 p-4">
                                <label className="block text-sm font-medium mb-1">Discount</label>
                                <div className="p-2 bg-secondary-card rounded">{priceItem.discount || 'N/A'}</div>
                            </div>
                            </div>
                           { priceItem.rules.map((priceItem) => (
                                <div className="flex flex-wrap" key={priceItem._id}>
                            <div className="w-full sm:w-1/2 p-4">
                                <label className="block text-sm font-medium mb-1">Rule Country</label>
                                <div className="p-2 bg-secondary-card rounded">{priceItem.ruleCountry || 'N/A'}</div>
                            </div>
                            
                            {/* <div className="flex flex-wrap"> */}
                            <div className="w-full sm:w-1/2 p-4">
                                <label className="block text-sm font-medium mb-1">Rule Type</label>
                                <div className="p-2 bg-secondary-card rounded">{priceItem.ruleType || 'N/A'}</div>
                            </div>
                            </div>))}
                            {/* Add more fields if necessary */}
                        </div>
                    )}
                </div>
                 ))
            ))}
        </section>
    );
}

export default PriceDetails;
