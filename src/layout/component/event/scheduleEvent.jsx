import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventRegistrationDates({ formData, handleChange, isSubmitting }) {
    
        
    if (isSubmitting){
        return <LoadingScreen />;
      }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Event Dates</h2>
            <div className="space-y-4">
                {/* Event Start Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Start Date*</label>
                    <input
                        type="datetime-local"
                        name="startingDate"
                        value={formData.startingDate}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        required
                    />
                </div>

                {/* Event End Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event End Date*</label>
                    <input
                        type="datetime-local"
                        name="endingDate"
                        value={formData.endingDate}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        required
                    />
                </div>
            </div>
        </section>
    );
}

export default EventRegistrationDates;
