import React, { useState } from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventDetails({ 
    formData, 
    handleChange, 
    handleMetadataChange, 
    handlePriceConfigChange, 
    isSubmitting,
    errors = {},
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
    const [customMetadataName, setCustomMetadataName] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(
        formData.metadata.name && formData.metadata.name !== 'donation'
    );

    const handleMetadataNameChange = (e) => {
        const value = e.target.value;
        
        if (value === 'custom') {
            setShowCustomInput(true);
            // Don't update formData yet, wait for custom input
        } else {
            setShowCustomInput(false);
            setCustomMetadataName('');
            // Update formData with selected value
            const syntheticEvent = {
                target: {
                    name: 'name',
                    value: value
                }
            };
            handleMetadataChange(syntheticEvent, 'metadata');
        }
    };

    const handleCustomNameChange = (e) => {
        const value = e.target.value;
        setCustomMetadataName(value);
        
        // Update formData with custom value
        const syntheticEvent = {
            target: {
                name: 'name',
                value: value
            }
        };
        handleMetadataChange(syntheticEvent, 'metadata');
    };
       
    if (isSubmitting){
        return <LoadingScreen />;
    }
    
    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5 text-text-color font-semibold">Advanced Event Details</h2>
            <div className="space-y-6">

                {/* Event Metadata */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Event Metadata</h3>
                    <div className="space-y-4">
                        {/* Metadata Name with Dropdown */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Event Category*
                            </label>
                            <select
                                value={showCustomInput ? 'custom' : (formData.metadata.name || '')}
                                onChange={handleMetadataNameChange}
                                className={`p-3 bg-primary border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors['metadata.name'] ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            >
                                <option value="" disabled>
                                    Select event category
                                </option>
                                <option value="donation">Donation</option>
                                <option value="conference">Conference</option>
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="meetup">Meetup</option>
                                <option value="webinar">Webinar</option>
                                <option value="fundraiser">Fundraiser</option>
                                <option value="networking">Networking</option>
                                <option value="training">Training</option>
                                <option value="custom">Custom (Enter your own)</option>
                            </select>
                            {errors['metadata.name'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['metadata.name']}</p>
                            )}
                        </div>

                        {/* Custom Input Field */}
                        {showCustomInput && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-color">
                                    Custom Event Category*
                                </label>
                                <input
                                    type="text"
                                    value={customMetadataName}
                                    onChange={handleCustomNameChange}
                                    className={`p-3 bg-primary border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                        errors['metadata.name'] ? 'border-red-500' : 'border-border'
                                    }`}
                                    placeholder="Enter custom event category"
                                    required
                                />
                                {errors['metadata.name'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['metadata.name']}</p>
                                )}
                            </div>
                        )}

                        {/* Metadata Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Event Description*
                            </label>
                            <textarea
                                name="description"
                                value={formData.metadata.description || ''}
                                onChange={(e) => handleMetadataChange(e, 'metadata')}
                                className={`p-3 bg-primary border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors min-h-[120px] resize-vertical ${
                                    errors['metadata.description'] ? 'border-red-500' : 'border-border'
                                }`}
                                placeholder="Provide a detailed description of the event. Include key information that attendees should know."
                                required
                            />
                            {errors['metadata.description'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['metadata.description']}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                This description will be shown to potential attendees during registration.
                            </p>
                        </div>
                        
                        {/* Event Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Event Image
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                Upload an attractive image that represents your event. Recommended size: 1200x630 pixels.
                            </p>
                            
                            {/* Display existing image if available */}
                            {uploadedImages && (
                                <div className="mb-4">
                                    <div className="relative inline-block">
                                        <img 
                                            src={uploadedImages} 
                                            alt="Event" 
                                            className="w-full max-w-md h-auto rounded-lg border border-border shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveExistingImage}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                                            title="Remove image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                                        className="border-2 border-dashed border-border p-8 rounded-lg text-center cursor-pointer hover:bg-secondary-card hover:border-secondary transition-all duration-200"
                                    >
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-text-color font-medium">Drag & drop an image here</p>
                                            <p className="text-sm text-gray-500 mt-1">or click to select from your computer</p>
                                            <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </div>
                                    
                                    {/* Display selected images */}
                                    {images.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-3 text-text-color">Selected Images:</h4>
                                            <div className="space-y-3">
                                                {images.map((image, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-secondary-card p-3 rounded-lg border border-border">
                                                        <div className="flex items-center flex-1">
                                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-sm font-medium text-text-color truncate block max-w-xs">{image.name}</span>
                                                                <span className="text-xs text-gray-500">{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                                                                {uploadProgress[image.name] && (
                                                                    <div className="mt-2">
                                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                                            <div 
                                                                                className="bg-secondary h-2 rounded-full transition-all duration-300" 
                                                                                style={{ width: `${uploadProgress[image.name]}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 mt-1">{uploadProgress[image.name]}% uploaded</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2 ml-4">
                                                            {!uploadProgress[image.name] && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUploadImages(index)}
                                                                    className="text-secondary hover:text-secondary-hover p-2 rounded-lg hover:bg-primary transition-colors"
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
                                                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
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

                {/* Payment Configuration */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Payment Configuration</h3>
                    <div className="space-y-4">
                        {/* Payment Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Payment Type*
                            </label>
                            <select
                                name="paymentType"
                                value={formData.paymentType || 'Free'}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.paymentType ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            >
                                <option value="Free">Free</option>
                                <option value="Fixed Price">Fixed Price</option>
                                <option value="registration Payment">Registration Payment</option>
                            </select>
                            {errors.paymentType && (
                                <p className="text-red-500 text-sm mt-1">{errors.paymentType}</p>
                            )}
                        </div>

                        {/* Price Configuration - Show only for paid events */}
                        {formData.paymentType !== 'Free' && (
                            <div className="space-y-4 p-4 bg-primary rounded-lg border border-border">
                                <h4 className="text-md font-medium text-text-color">Price Details</h4>
                                
                                {/* Price Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-color">
                                        Price Type*
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.priceConfig?.type || 'fixed'}
                                        onChange={(e) => handlePriceConfigChange(e, 'priceConfig')}
                                        className="p-3 bg-secondary-card border border-border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                        required
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="dynamic">Dynamic</option>
                                    </select>
                                </div>

                                {/* Amount - Show for fixed price */}
                                {formData.priceConfig?.type === 'fixed' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-text-color">
                                            Amount ($)*
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.priceConfig?.amount || 0}
                                            onChange={(e) => handlePriceConfigChange(e, 'priceConfig')}
                                            className={`p-3 bg-secondary-card border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                                errors['priceConfig.amount'] ? 'border-red-500' : 'border-border'
                                            }`}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors['priceConfig.amount'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['priceConfig.amount']}</p>
                                        )}
                                    </div>
                                )}

                                {/* Dependent Field - Show for dynamic price */}
                                {formData.priceConfig?.type === 'dynamic' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-text-color">
                                            Dependent Field
                                        </label>
                                        <input
                                            type="text"
                                            name="dependantField"
                                            value={formData.priceConfig?.dependantField || ''}
                                            onChange={(e) => handlePriceConfigChange(e, 'priceConfig')}
                                            className="p-3 bg-secondary-card border border-border rounded w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                            placeholder="Enter field name that determines the price"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Specify the registration field that will determine the dynamic pricing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Special Event Type Information */}
                {formData.metadata.name === 'donation' && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-blue-800 font-medium mb-1">Donation Event</h4>
                                <p className="text-blue-700 text-sm">
                                    This event is configured as a donation campaign. The registration form will be optimized for donation collection with appropriate fields and messaging.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default EventDetails;