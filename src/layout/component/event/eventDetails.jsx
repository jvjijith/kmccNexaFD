import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventDetails({ 
    formData, 
    handleChange, 
    handleMetadataChange, 
    handlePriceConfigChange, 
    isSubmitting,
    // Image upload props
    images,
    uploadedImages,
    uploadProgress,
    getRootProps,
    getInputProps,
    handleRemoveImage,
    handleRemoveExistingImage,
    handleUploadImages
}) {
       
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
                        
                        {/* Event Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Event Image</label>
                            
                            {/* Display existing image if available */}
                            {uploadedImages && (
                                <div className="mb-4">
                                    <div className="relative inline-block">
                                        <img 
                                            src={uploadedImages} 
                                            alt="Event" 
                                            className="w-full max-w-md h-auto rounded-lg border border-border"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveExistingImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                            title="Remove image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Upload new image if no image is uploaded */}
                            {!uploadedImages && (
                                <div className="space-y-4">
                                    {/* Dropzone */}
                                    <div 
                                        {...getRootProps()} 
                                        className="border-2 border-dashed border-border p-6 rounded-lg text-center cursor-pointer hover:bg-secondary-card transition-colors"
                                    >
                                        <input {...getInputProps()} />
                                        <p className="text-sm">Drag & drop an image here, or click to select</p>
                                        <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630 pixels</p>
                                    </div>
                                    
                                    {/* Display selected images */}
                                    {images.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                                            <div className="space-y-3">
                                                {images.map((image, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-secondary-card p-2 rounded">
                                                        <div className="flex items-center">
                                                            <span className="text-sm truncate max-w-xs">{image.name}</span>
                                                            {uploadProgress[image.name] && (
                                                                <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                                                                    <div 
                                                                        className="bg-primary-button-color h-2.5 rounded-full" 
                                                                        style={{ width: `${uploadProgress[image.name]}%` }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            {!uploadProgress[image.name] && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUploadImages(index)}
                                                                    className="text-primary-button-color hover:text-primary-button-hover p-1"
                                                                    title="Upload"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(index)}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                                title="Remove"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
    {formData.priceConfig.type === 'dynamic' ? (
        <select
            name="priceConfig.dependantField"
            value={formData?.priceConfig?.dependantField || ''}
            onChange={handlePriceConfigChange}
            className="p-2 bg-secondary-card border border-border rounded w-full"
        >
            <option value="">Select a field</option>
            {formData.registrationFields.map((field, index) => (
                <option key={index} value={field.name}>
                    {field.displayName || field.name}
                </option>
            ))}
        </select>
    ) : (
        <input
            type="text"
            name="priceConfig.dependantField"
            value={formData?.priceConfig?.dependantField || ''}
            onChange={handlePriceConfigChange}
            className="p-2 bg-secondary-card border border-border rounded w-full"
            placeholder="Enter a dependent field if applicable"
            disabled={formData.priceConfig.type !== 'dynamic'}
        />
    )}
    <small className="text-gray-500 mt-1 block">
        {formData.priceConfig.type === 'dynamic' 
            ? "Select a registration field that will determine the price" 
            : "Not applicable for fixed price type"}
    </small>
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