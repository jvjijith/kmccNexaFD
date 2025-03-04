import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventDetails({ formData, handleChange, handleMetadataChange, handlePriceConfigChange, isSubmitting }) {
       
    if (isSubmitting){
        return <LoadingScreen />;
      }
    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Advanced Event Details</h2>
            <div className="space-y-6">

                {/* Event Metadata */}
                <div>
                    <h3 className="text-lg font-medium mb-3">Event Metadata</h3>
                    <div className="space-y-4">
                        {/* Metadata Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Event Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.metadata.name}
                                onChange={(e) => handleMetadataChange(e, 'metadata')}
                                className="p-2 bg-secondary-card border border-border rounded w-full"
                                placeholder="Enter the event name"
                                required
                            />
                        </div>

                        {/* Metadata Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Event Description*</label>
                            <textarea
                                name="description"
                                value={formData.metadata.description}
                                onChange={(e) => handleMetadataChange(e, 'metadata')}
                                className="p-2 bg-secondary-card border border-border rounded w-full"
                                placeholder="Provide a brief description of the event"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Type */}
                <div>
                    <h3 className="text-lg font-medium mb-3">Payment Options</h3>
                    <div className="space-y-4">
                        {/* Payment Type */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Type*</label>
                            <select
                                name="paymentType"
                                value={formData.paymentType}
                                onChange={handleChange}
                                className="p-2 bg-secondary-card border border-border rounded w-full"
                                required
                            >
                                <option value="Free">Free</option>
                                <option value="Fixed Price">Fixed Price</option>
                                <option value="registration Payment">Registration Payment</option>
                            </select>
                        </div>

                        {/* Price Config (Conditional) */}
                        {(formData.paymentType === 'Fixed Price' || formData.paymentType === 'registration Payment') && (
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price Type*</label>
                                    <select
                                        name="priceConfig.type"
                                        value={formData?.priceConfig?.type}
                                        onChange={handlePriceConfigChange}
                                        className="p-2 bg-secondary-card border border-border rounded w-full"
                                        required
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="dynamic">Dynamic</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Amount*</label>
                                    <input
                                        type="number"
                                        name="priceConfig.amount"
                                        value={formData?.priceConfig?.amount}
                                        onChange={handlePriceConfigChange}
                                        className="p-2 bg-secondary-card border border-border rounded w-full"
                                        placeholder="Enter the amount"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Dependent Field</label>
                                    <input
                                        type="text"
                                        name="priceConfig.dependantField"
                                        value={formData?.priceConfig?.dependantField}
                                        onChange={handlePriceConfigChange}
                                        className="p-2 bg-secondary-card border border-border rounded w-full"
                                        placeholder="Enter a dependent field if applicable"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EventDetails;
