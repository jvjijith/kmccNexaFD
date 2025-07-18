import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventRegistrationDates({ formData, handleChange, isSubmitting, errors = {} }) {
    
    if (isSubmitting){
        return <LoadingScreen />;
    }

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const calculateDuration = () => {
        if (!formData.startingDate || !formData.endingDate) return null;
        
        const start = new Date(formData.startingDate);
        const end = new Date(formData.endingDate);
        const diffMs = end - start;
        
        if (diffMs <= 0) return null;
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            const remainingHours = diffHours % 24;
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : ''}`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : ''}`;
        } else {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        }
    };

    const getRegistrationPeriod = () => {
        if (!formData.registrationStartDate || !formData.registrationEndDate) return null;
        
        const regStart = new Date(formData.registrationStartDate);
        const regEnd = new Date(formData.registrationEndDate);
        const diffMs = regEnd - regStart;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    return (
        <section className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-text-color">Event Schedule</h2>
                <p className="text-gray-600">
                    Set the dates and times for your event. Make sure to consider time zones and allow adequate time for registration.
                </p>
            </div>

            <div className="space-y-6">
                {/* Event Dates */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Event Duration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Start Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Event Start Date & Time*
                            </label>
                            <input
                                type="datetime-local"
                                name="startingDate"
                                value={formData.startingDate || ''}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.startingDate ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            />
                            {errors.startingDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.startingDate}</p>
                            )}
                            {formData.startingDate && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {formatDateForDisplay(formData.startingDate)}
                                </p>
                            )}
                        </div>

                        {/* Event End Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Event End Date & Time*
                            </label>
                            <input
                                type="datetime-local"
                                name="endingDate"
                                value={formData.endingDate || ''}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.endingDate ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            />
                            {errors.endingDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.endingDate}</p>
                            )}
                            {formData.endingDate && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {formatDateForDisplay(formData.endingDate)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Duration Display */}
                    {calculateDuration() && (
                        <div className="mt-4 p-3 bg-primary rounded-lg border border-border">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-text-color font-medium">Event Duration: </span>
                                <span className="text-text-color ml-1">{calculateDuration()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Registration Period Summary */}
                {formData.registrationStartDate && formData.registrationEndDate && (
                    <div className="bg-secondary-card p-6 rounded-lg border border-border">
                        <h3 className="text-lg font-medium mb-4 text-text-color">Registration Period Summary</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="text-text-color font-medium">Registration Opens</p>
                                    <p className="text-sm text-gray-600">{formatDateForDisplay(formData.registrationStartDate)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="text-text-color font-medium">Registration Closes</p>
                                    <p className="text-sm text-gray-600">{formatDateForDisplay(formData.registrationEndDate)}</p>
                                </div>
                            </div>
                            
                            {getRegistrationPeriod() !== null && (
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-text-color font-medium">Registration Period</p>
                                        <p className="text-sm text-gray-600">
                                            {getRegistrationPeriod()} day{getRegistrationPeriod() !== 1 ? 's' : ''} available for registration
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline Visualization */}
                {formData.registrationStartDate && formData.registrationEndDate && formData.startingDate && formData.endingDate && (
                    <div className="bg-secondary-card p-6 rounded-lg border border-border">
                        <h3 className="text-lg font-medium mb-4 text-text-color">Event Timeline</h3>
                        
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                            
                            <div className="space-y-6">
                                {/* Registration Opens */}
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold relative z-10">
                                        1
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-medium text-text-color">Registration Opens</h4>
                                        <p className="text-sm text-gray-600">{formatDateForDisplay(formData.registrationStartDate)}</p>
                                    </div>
                                </div>
                                
                                {/* Registration Closes */}
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold relative z-10">
                                        2
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-medium text-text-color">Registration Closes</h4>
                                        <p className="text-sm text-gray-600">{formatDateForDisplay(formData.registrationEndDate)}</p>
                                    </div>
                                </div>
                                
                                {/* Event Starts */}
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold relative z-10">
                                        3
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-medium text-text-color">Event Starts</h4>
                                        <p className="text-sm text-gray-600">{formatDateForDisplay(formData.startingDate)}</p>
                                    </div>
                                </div>
                                
                                {/* Event Ends */}
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold relative z-10">
                                        4
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-medium text-text-color">Event Ends</h4>
                                        <p className="text-sm text-gray-600">{formatDateForDisplay(formData.endingDate)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validation Warnings */}
                {formData.startingDate && formData.endingDate && new Date(formData.endingDate) <= new Date(formData.startingDate) && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                                <h4 className="text-red-800 font-medium mb-1">Invalid Event Duration</h4>
                                <p className="text-red-700 text-sm">
                                    The event end date must be after the start date.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {formData.registrationEndDate && formData.startingDate && new Date(formData.registrationEndDate) >= new Date(formData.startingDate) && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                                <h4 className="text-yellow-800 font-medium mb-1">Registration Period Warning</h4>
                                <p className="text-yellow-700 text-sm">
                                    Registration should close before the event starts to allow for preparation time.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Helpful Tips */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-blue-800 font-medium mb-1">Scheduling Tips</h4>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Consider your target audience's time zone when setting dates</li>
                                <li>• Allow adequate time between registration closing and event start</li>
                                <li>• For multi-day events, set the end time to the actual conclusion</li>
                                <li>• Consider buffer time for setup and cleanup</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EventRegistrationDates;