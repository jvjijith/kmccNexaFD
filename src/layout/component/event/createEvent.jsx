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

                {/* Event Category Field */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-text-color">
                        Event Category*
                    </label>
                    <select
                        name="eventType"
                        value={formData.eventType || ''}
                        onChange={handleChange}
                        className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                            errors.eventType ? 'border-red-500' : 'border-border'
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
                    </select>
                    {errors.eventType && (
                        <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Choose the category that best describes your event type
                    </p>
                </div>

                {/* Capacity Section */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Event Capacity</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seats Available Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Total Seats Available*
                            </label>
                            <input
                                type="number"
                                name="seatsAvailable"
                                value={formData.seatsAvailable || ''}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.seatsAvailable ? 'border-red-500' : 'border-border'
                                }`}
                                placeholder="0"
                                min="1"
                                max="10000"
                                required
                            />
                            {errors.seatsAvailable && (
                                <p className="text-red-500 text-sm mt-1">{errors.seatsAvailable}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Maximum number of attendees for this event
                            </p>
                        </div>

                        {/* Total Registered Seats Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Currently Registered Seats
                            </label>
                            <input
                                type="number"
                                name="totalregisteredSeats"
                                value={formData.totalregisteredSeats || 0}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.totalregisteredSeats ? 'border-red-500' : 'border-border'
                                }`}
                                placeholder="0"
                                min="0"
                            />
                            {errors.totalregisteredSeats && (
                                <p className="text-red-500 text-sm mt-1">{errors.totalregisteredSeats}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Number of seats already registered (for existing events)
                            </p>
                        </div>
                    </div>

                    {/* Capacity Summary */}
                    {formData.seatsAvailable > 0 && (
                        <div className="mt-4 p-3 bg-primary rounded-lg border border-border">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-color">Available Seats:</span>
                                <span className="font-medium text-text-color">
                                    {Math.max(0, (formData.seatsAvailable || 0) - (formData.totalregisteredSeats || 0))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-text-color">Occupancy:</span>
                                <span className="font-medium text-text-color">
                                    {formData.seatsAvailable > 0 
                                        ? Math.round(((formData.totalregisteredSeats || 0) / formData.seatsAvailable) * 100)
                                        : 0
                                    }%
                                </span>
                            </div>
                        </div>
                    )}
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

                {/* Custom Attendance Field */}
                <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="customAttendance"
                            checked={formData.customAttendance || false}
                            onChange={handleChange}
                            className="w-5 h-5 text-secondary bg-secondary-card border-border rounded focus:ring-secondary focus:ring-2"
                        />
                        <div>
                            <span className="text-sm font-medium text-text-color">
                                Enable Custom Attendance Tracking
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                                Allow registration fields to track custom attendance numbers
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </section>
    );
}

export default CreateEvent;