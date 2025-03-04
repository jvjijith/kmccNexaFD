import React from 'react';

function GeoAllowForm({ formData = {}, handleChange, handleLocationChange, isSubmitting }) {

    const coordinates = formData.GeoAllow?.coordinates || ['', ''];

    const handleGeoAllowChange = (e) => {
        const { name, value } = e.target;
        
        // Ensure both locations are updated simultaneously
        handleChange({
            target: {
                name: 'location',
                value: value,
            },
        });
        handleLocationChange({
            target: {
                name: 'location',
                value: value,
            },
        });
    };

    const handleCoordinateChange = (index, value) => {
        const updatedCoordinates = [...coordinates];
        updatedCoordinates[index] = value;

        handleChange({
            target: {
                name: 'GeoAllow.coordinates',
                value: updatedCoordinates,
            },
        });
    };

        
    if (isSubmitting){
        return <LoadingScreen />;
      }

    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Event Location</h2>
            <div className="space-y-4">
                {/* Location Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Location*</label>
                    <input
                        type="text"
                        name="location"
                        value={formData?.location || ''}
                        onChange={handleGeoAllowChange}
                        placeholder="Enter location name"
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        required
                    />
                    <small className="text-sm text-gray-500">e.g., City or Region</small>
                </div>

                {/* Coordinates Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Coordinates*</label>
                    <div className="space-y-2">
                        {/* Latitude */}
                        <div>
                        <input
                            type="number"
                            name="latitude"
                            value={formData.GeoAllow.coordinates[0] || ""}
                            onChange={(e) =>
                                handleLocationChange({
                                    target: {
                                        name: "coordinates",
                                        value: [Number(e.target.value), formData.GeoAllow.coordinates[1]],
                                    },
                                })
                            }
                            placeholder="Enter latitude (-90 to 90)"
                            className="p-2 bg-secondary-card border border-border rounded w-full"
                            required
                        />
                            <small className="text-sm text-gray-500">Latitude (e.g., 45.0)</small>
                        </div>

                        {/* Longitude */}
                        <div>
                        <input
                            type="number"
                            name="longitude"
                            value={formData.GeoAllow.coordinates[1] || ""}
                            onChange={(e) =>
                                handleLocationChange({
                                    target: {
                                        name: "coordinates",
                                        value: [formData.GeoAllow.coordinates[0], Number(e.target.value)],
                                    },
                                })
                            }
                            placeholder="Enter longitude (-180 to 180)"
                            className="p-2 bg-secondary-card border border-border rounded w-full"
                            required
                        />
                            <small className="text-sm text-gray-500">Longitude (e.g., -75.0)</small>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default GeoAllowForm;
