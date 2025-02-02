import React from 'react';
import LoadingScreen from '../../ui/loading/loading';

function EventPermissions({ formData, handleChange, isSubmitting }) {   

    if (isSubmitting){
        return <LoadingScreen />;
      }
    return (
        <section className="w-full">
            <h2 className="text-2xl mb-5">Event Permissions</h2>
            <div className="space-y-4">
                {/* Allow Login */}
                <div>
                    <label className="block text-sm font-medium mb-1">Allow Login</label>
                    <select
                        name="allowLogin"
                        value={formData.allowLogin}
                        onChange={handleChange}
                        className="p-2 bg-secondary-card border border-border rounded w-full"
                        required
                    >
                        <option value="true">Users can log in</option>
                        <option value="false">Users cannot log in</option>
                    </select>
                </div>

                {/* Allow Guest Login */}
                {formData.allowLogin === 'true' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Allow Guest Login</label>
                        <select
                            name="allowGuest"
                            value={formData.allowGuest}
                            onChange={handleChange}
                            className="p-2 bg-secondary-card border border-border rounded w-full"
                        >
                            <option value="true">Guests are allowed to join without logging in</option>
                            <option value="false">Guests must log in to join</option>
                        </select>
                    </div>
                )}

                {/* Allow Member Login */}
                {formData.allowLogin === 'true' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Allow Member Login</label>
                        <select
                            name="allowMemberLogin"
                            value={formData.allowMemberLogin}
                            onChange={handleChange}
                            className="p-2 bg-secondary-card border border-border rounded w-full"
                        >
                            <option value="true">Only members are allowed to log in</option>
                            <option value="false">Anyone can log in</option>
                        </select>
                    </div>
                )}
            </div>
        </section>
    );
}

export default EventPermissions;
