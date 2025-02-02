import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function CreateEvent({ formData, handleChange, isSubmitting }) {

    
    if (isSubmitting){
        return <LoadingScreen />;
      }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Event Basic Details</h2>
            <div className="space-y-4">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Name*</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        placeholder="Enter the event name"
                        required
                    />
                </div>

                {/* Description Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Description*</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        placeholder="Enter a brief description of the event"
                        required
                    />
                </div>

                {/* Type Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Type*</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        required
                    >
                        <option value="" disabled>
                            Select event type
                        </option>
                        <option value="public">Public</option>
                        <option value="members">Members Only</option>
                    </select>
                </div>

                {/* Seats Available Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Seats Available*</label>
                    <input
                        type="number"
                        name="seatsAvailable"
                        value={formData.seatsAvailable}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        placeholder="Enter the number of seats available"
                        min="0"
                        required
                    />
                </div>

                {/* Total Registered Seats Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Total Registered Seats</label>
                    <input
                        type="number"
                        name="totalRegisteredSeats"
                        value={formData.totalregisteredSeats}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        placeholder="Enter the number of registered seats"
                        min="0"
                    />
                </div>

                {/* Event Status Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Status</label>
                    <select
                        name="eventStatus"
                        value={formData.eventStatus}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Live">Live</option>
                        <option value="Staging">Staging</option>
                        <option value="Prestaging">Prestaging</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>
        </section>
    );
}

export default CreateEvent;
