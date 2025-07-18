import React, { useState } from 'react';
import LoadingScreen from '../../ui/loading/loading';

function GeoAllowForm({ formData = {}, handleChange, handleLocationChange, isSubmitting, errors = {} }) {
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const coordinates = formData.GeoAllow?.coordinates || [null, null];

    const handleGeoAllowChange = (e) => {
        const { value } = e.target;
        
        // Update both location fields simultaneously
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
        const numValue = value === '' ? null : parseFloat(value);
        const updatedCoordinates = [...coordinates];
        updatedCoordinates[index] = numValue;

        handleLocationChange({
            target: {
                name: 'coordinates',
                value: updatedCoordinates,
            },
        });
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setIsGettingLocation(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                handleLocationChange({
                    target: {
                        name: 'coordinates',
                        value: [latitude, longitude],
                    },
                });
                
                setIsGettingLocation(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                let errorMessage = 'Unable to get your location. ';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access was denied.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                
                alert(errorMessage);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    const validateCoordinate = (value, type) => {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        
        if (type === 'latitude') {
            return num >= -90 && num <= 90;
        } else if (type === 'longitude') {
            return num >= -180 && num <= 180;
        }
        return false;
    };

    const getCoordinateError = (value, type) => {
        if (!value) return null;
        const num = parseFloat(value);
        if (isNaN(num)) return `Invalid ${type}`;
        
        if (type === 'latitude') {
            if (num < -90 || num > 90) return 'Latitude must be between -90 and 90';
        } else if (type === 'longitude') {
            if (num < -180 || num > 180) return 'Longitude must be between -180 and 180';
        }
        return null;
    };

    if (isSubmitting) {
        return <LoadingScreen />;
    }

    return (
        <section className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-text-color">Event Location</h2>
                <p className="text-gray-600">
                    Specify where your event will take place. Both location name and coordinates are required for proper event mapping.
                </p>
            </div>

            <div className="space-y-6">
                {/* Location Field */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Location Details</h3>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-color">
                            Location Name*
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData?.location || ''}
                            onChange={handleGeoAllowChange}
                            placeholder="Enter the full address or location name"
                            className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                errors.location ? 'border-red-500' : 'border-border'
                            }`}
                            required
                        />
                        {errors.location && (
                            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            e.g., "123 Main Street, New York, NY 10001" or "Central Park, New York"
                        </p>
                    </div>
                </div>

                {/* Coordinates Field */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-medium text-text-color">Geographic Coordinates</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Precise location coordinates for mapping and geolocation features
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            className="bg-secondary-button-color hover:bg-secondary-hover text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isGettingLocation ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Getting Location...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Use My Location</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Latitude */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Latitude*
                            </label>
                            <input
                                type="number"
                                name="latitude"
                                value={coordinates[0] || ''}
                                onChange={(e) => handleCoordinateChange(0, e.target.value)}
                                placeholder="e.g., 40.7128"
                                step="any"
                                min="-90"
                                max="90"
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    getCoordinateError(coordinates[0], 'latitude') || errors.coordinates ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            />
                            {getCoordinateError(coordinates[0], 'latitude') && (
                                <p className="text-red-500 text-sm mt-1">{getCoordinateError(coordinates[0], 'latitude')}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Latitude ranges from -90 to 90 (North-South position)
                            </p>
                        </div>

                        {/* Longitude */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Longitude*
                            </label>
                            <input
                                type="number"
                                name="longitude"
                                value={coordinates[1] || ''}
                                onChange={(e) => handleCoordinateChange(1, e.target.value)}
                                placeholder="e.g., -74.0060"
                                step="any"
                                min="-180"
                                max="180"
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    getCoordinateError(coordinates[1], 'longitude') || errors.coordinates ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            />
                            {getCoordinateError(coordinates[1], 'longitude') && (
                                <p className="text-red-500 text-sm mt-1">{getCoordinateError(coordinates[1], 'longitude')}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Longitude ranges from -180 to 180 (East-West position)
                            </p>
                        </div>
                    </div>

                    {errors.coordinates && (
                        <p className="text-red-500 text-sm mt-2">{errors.coordinates}</p>
                    )}

                    {/* Coordinate Preview */}
                    {coordinates[0] && coordinates[1] && 
                     validateCoordinate(coordinates[0], 'latitude') && 
                     validateCoordinate(coordinates[1], 'longitude') && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-green-800 font-medium mb-1">Valid Coordinates</h4>
                                    <p className="text-green-700 text-sm">
                                        Location: {coordinates[0]}, {coordinates[1]}
                                    </p>
                                    <a
                                        href={`https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800 text-sm underline mt-1 inline-block"
                                    >
                                        View on Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Information */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-blue-800 font-medium mb-1">How to find coordinates</h4>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>• Use the "Use My Location" button to get your current coordinates</li>
                                    <li>• Search for your location on Google Maps and right-click to get coordinates</li>
                                    <li>• Use online coordinate finder tools</li>
                                    <li>• GPS devices and smartphone apps can provide precise coordinates</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Summary */}
                {formData?.location && coordinates[0] && coordinates[1] && (
                    <div className="bg-primary p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-text-color mb-2">Location Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Address:</span>
                                <p className="text-text-color font-medium">{formData.location}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Coordinates:</span>
                                <p className="text-text-color font-medium">
                                    {coordinates[0]}, {coordinates[1]}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default GeoAllowForm;