import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function CreateEvent({ formData, handleChange, isSubmitting, errors = {} }) {
    
    if (isSubmitting){
        return <LoadingScreen />;
    }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5 text-text-color font-semibold">Event Basic Details</h2>
            <p className="text-gray-600 mb-6">
                Provide the essential information about your event. All fields marked with * are required.
            </p>
            
            <div className="space-y-6">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-text-color">
                        Event Name*
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                            errors.name ? 'border-red-500' : 'border-border'
                        }`}
                        placeholder="Enter a descriptive name for your event"
                        required
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Choose a clear, descriptive name that will attract attendees
                    </p>
                </div>

                {/* Description Field */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-text-color">
                        Event Description*
                    </label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors min-h-[120px] resize-vertical ${
                            errors.description ? 'border-red-500' : 'border-border'
                        }`}
                        placeholder="Provide a detailed description of your event, including what attendees can expect"
                        required
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Include key details like agenda, speakers, activities, and what attendees will gain
                    </p>
                </div>

                {/* Type Field */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-text-color">
                        Event Type*
                    </label>
                    <select
                        name="type"
                        value={formData.type || ''}
                        onChange={handleChange}
                        className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                            errors.type ? 'border-red-500' : 'border-border'
                        }`}
                        required
                    >
                        <option value="" disabled>
                            Select event type
                        </option>
                        <option value="public">Public - Open to everyone</option>
                        <option value="members">Members Only - Restricted to members</option>
                    </select>
                    {errors.type && (
                        <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Public events are visible to all users, while member-only events require membership
                    </p>
                </div>



                {/* Event Status Field */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-text-color">
                        Event Status
                    </label>
                    <select
                        name="eventStatus"
                        value={formData.eventStatus || 'Draft'}
                        onChange={handleChange}
                        className="p-3 bg-secondary-card border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                    >
                        <option value="Draft">Draft - Not visible to public</option>
                        <option value="Live">Live - Active and accepting registrations</option>
                        <option value="Staging">Staging - Testing phase</option>
                        <option value="Prestaging">Prestaging - Pre-launch preparation</option>
                        <option value="Closed">Closed - No longer accepting registrations</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                        Control the visibility and registration status of your event
                    </p>
                </div>

                {/* Status Information */}
                {formData.eventStatus && (
                    <div className={`p-4 rounded-lg border ${
                        formData.eventStatus === 'Live' 
                            ? 'bg-green-50 border-green-200' 
                            : formData.eventStatus === 'Draft'
                            ? 'bg-yellow-50 border-yellow-200'
                            : formData.eventStatus === 'Closed'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                        <div className="flex items-start">
                            <svg className={`w-5 h-5 mt-0.5 mr-3 ${
                                formData.eventStatus === 'Live' 
                                    ? 'text-green-500' 
                                    : formData.eventStatus === 'Draft'
                                    ? 'text-yellow-500'
                                    : formData.eventStatus === 'Closed'
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className={`font-medium mb-1 ${
                                    formData.eventStatus === 'Live' 
                                        ? 'text-green-800' 
                                        : formData.eventStatus === 'Draft'
                                        ? 'text-yellow-800'
                                        : formData.eventStatus === 'Closed'
                                        ? 'text-red-800'
                                        : 'text-blue-800'
                                }`}>
                                    {formData.eventStatus} Status
                                </h4>
                                <p className={`text-sm ${
                                    formData.eventStatus === 'Live' 
                                        ? 'text-green-700' 
                                        : formData.eventStatus === 'Draft'
                                        ? 'text-yellow-700'
                                        : formData.eventStatus === 'Closed'
                                        ? 'text-red-700'
                                        : 'text-blue-700'
                                }`}>
                                    {formData.eventStatus === 'Live' && 'Your event is live and accepting registrations.'}
                                    {formData.eventStatus === 'Draft' && 'Your event is in draft mode and not visible to the public.'}
                                    {formData.eventStatus === 'Closed' && 'Your event is closed and no longer accepting registrations.'}
                                    {formData.eventStatus === 'Staging' && 'Your event is in staging mode for testing purposes.'}
                                    {formData.eventStatus === 'Prestaging' && 'Your event is in pre-staging mode for preparation.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default CreateEvent;