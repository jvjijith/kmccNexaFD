import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function LocationDetails({ isSubmitting }) {
    if (isSubmitting) {
        return <LoadingScreen />;
    }

    return (
        <section className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-text-color">Event Location</h2>
                <p className="text-gray-600">
                    Location details are not required for donation events.
                </p>
            </div>

            <div className="bg-secondary-card p-6 rounded-lg border border-border">
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-text-color mb-2">No Location Required</h3>
                    <p className="text-gray-600">
                        Donation events don't require specific location details.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default LocationDetails;