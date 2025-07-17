import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventPermissions({ formData, handleChange, isSubmitting, errors = {} }) {   

    if (isSubmitting){
        return <LoadingScreen />;
    }

    const handleBooleanChange = (name, value) => {
        handleChange({
            target: {
                name,
                value: value === 'true'
            }
        });
    };

    return (
        <section className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-text-color">Access and Login Options</h2>
                <p className="text-gray-600">
                    Configure who can access and register for your event. These settings control authentication and membership requirements.
                </p>
            </div>

            <div className="space-y-6">
                {/* Login Settings */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Authentication Settings</h3>
                    
                    {/* Allow Login */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-text-color">
                            User Authentication
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="allowLogin"
                                    value="true"
                                    checked={formData.allowLogin === true}
                                    onChange={(e) => handleBooleanChange('allowLogin', e.target.value)}
                                    className="mr-3 text-secondary focus:ring-secondary"
                                />
                                <div>
                                    <span className="text-text-color font-medium">Allow user login</span>
                                    <p className="text-sm text-gray-600">Users can log in to register for the event</p>
                                </div>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="allowLogin"
                                    value="false"
                                    checked={formData.allowLogin === false}
                                    onChange={(e) => handleBooleanChange('allowLogin', e.target.value)}
                                    className="mr-3 text-secondary focus:ring-secondary"
                                />
                                <div>
                                    <span className="text-text-color font-medium">Disable user login</span>
                                    <p className="text-sm text-gray-600">Users cannot log in (guest-only registration)</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Guest Access - Show only when login is allowed */}
                    {formData.allowLogin && (
                        <div className="mb-6 p-4 bg-primary rounded-lg border border-border">
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Guest Access
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="allowGuest"
                                        value="true"
                                        checked={formData.allowGuest === true}
                                        onChange={(e) => handleBooleanChange('allowGuest', e.target.value)}
                                        className="mr-3 text-secondary focus:ring-secondary"
                                    />
                                    <div>
                                        <span className="text-text-color font-medium">Allow guest registration</span>
                                        <p className="text-sm text-gray-600">Users can register without creating an account</p>
                                    </div>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="allowGuest"
                                        value="false"
                                        checked={formData.allowGuest === false}
                                        onChange={(e) => handleBooleanChange('allowGuest', e.target.value)}
                                        className="mr-3 text-secondary focus:ring-secondary"
                                    />
                                    <div>
                                        <span className="text-text-color font-medium">Require account registration</span>
                                        <p className="text-sm text-gray-600">Users must create an account to register</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Member-Only Access - Show only when login is allowed */}
                    {formData.allowLogin && (
                        <div className="p-4 bg-primary rounded-lg border border-border">
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Membership Requirements
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="allowMemberLogin"
                                        value="true"
                                        checked={formData.allowMemberLogin === true}
                                        onChange={(e) => handleBooleanChange('allowMemberLogin', e.target.value)}
                                        className="mr-3 text-secondary focus:ring-secondary"
                                    />
                                    <div>
                                        <span className="text-text-color font-medium">Members only</span>
                                        <p className="text-sm text-gray-600">Only active members can register for this event</p>
                                    </div>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="allowMemberLogin"
                                        value="false"
                                        checked={formData.allowMemberLogin === false}
                                        onChange={(e) => handleBooleanChange('allowMemberLogin', e.target.value)}
                                        className="mr-3 text-secondary focus:ring-secondary"
                                    />
                                    <div>
                                        <span className="text-text-color font-medium">Open to all users</span>
                                        <p className="text-sm text-gray-600">Any registered user can join this event</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Access Summary */}
                <div className="bg-primary p-4 rounded-lg border border-border">
                    <h4 className="font-medium text-text-color mb-3">Access Configuration Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <span className="text-gray-600 w-32">Authentication:</span>
                            <span className={`font-medium ${formData.allowLogin ? 'text-green-600' : 'text-red-600'}`}>
                                {formData.allowLogin ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        
                        {formData.allowLogin && (
                            <>
                                <div className="flex items-center">
                                    <span className="text-gray-600 w-32">Guest Access:</span>
                                    <span className={`font-medium ${formData.allowGuest ? 'text-green-600' : 'text-red-600'}`}>
                                        {formData.allowGuest ? 'Allowed' : 'Restricted'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center">
                                    <span className="text-gray-600 w-32">Membership:</span>
                                    <span className={`font-medium ${formData.allowMemberLogin ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {formData.allowMemberLogin ? 'Members Only' : 'Open to All'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Configuration Warnings */}
                {!formData.allowLogin && !formData.allowGuest && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                                <h4 className="text-yellow-800 font-medium mb-1">Configuration Warning</h4>
                                <p className="text-yellow-700 text-sm">
                                    With both login and guest access disabled, users may not be able to register for your event.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {formData.allowLogin && formData.allowMemberLogin && !formData.allowGuest && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-blue-800 font-medium mb-1">Members-Only Event</h4>
                                <p className="text-blue-700 text-sm">
                                    This event is restricted to active members only. Non-members will not be able to register.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {formData.allowLogin && formData.allowGuest && !formData.allowMemberLogin && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-green-800 font-medium mb-1">Open Access Event</h4>
                                <p className="text-green-700 text-sm">
                                    This event is open to everyone. Both registered users and guests can participate.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default EventPermissions;