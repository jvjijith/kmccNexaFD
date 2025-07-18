import React, { useState, useEffect } from "react";
import LoadingScreen from "../../ui/loading/loading";

function RegistrationDetails({ 
    formData, 
    handleChange, 
    handleRegistrationChange, 
    handleOptionChange, 
    handleFormulaChange, 
    addField, 
    deleteField, 
    addOption, 
    deleteOption, 
    addFormulaField, 
    deleteFormula, 
    isSubmitting,
    errors = {}
}) {
    const [activeDrawer, setActiveDrawer] = useState(null);
    const [drawerData, setDrawerData] = useState({});
    const [expandedAccordion, setExpandedAccordion] = useState(null);
    const [customFieldInputs, setCustomFieldInputs] = useState({}); // Track custom field inputs

    // Permanent fields that should always be present
    const permanentFields = [
        {
            name: "fullName",
            displayName: "Full Name",
            type: "text",
            valueType: "userInput",
            options: [],
            formula: [],
            isPermanent: true,
            description: "Participant's full name"
        },
        {
            name: "email",
            displayName: "Email Address",
            type: "text",
            valueType: "userInput",
            options: [],
            formula: [],
            isPermanent: true,
            description: "Participant's email address"
        },
        {
            name: "phone",
            displayName: "Phone Number",
            type: "text",
            valueType: "userInput",
            options: [],
            formula: [],
            isPermanent: true,
            description: "Participant's contact number"
        }
    ];

    // Predefined constant field names for formulas and calculations
    const constantFieldNames = [
        { value: "total", label: "Total Amount" },
        { value: "subtotal", label: "Subtotal" },
        { value: "totalPrice", label: "Total Price" },
        { value: "basePrice", label: "Base Price" },
        { value: "discount", label: "Discount" },
        { value: "discount_amount", label: "Discount Amount" },
        { value: "tax", label: "Tax" },
        { value: "tax_amount", label: "Tax Amount" },
        { value: "service_fee", label: "Service Fee" },
        { value: "processing_fee", label: "Processing Fee" },
        { value: "donation_amount", label: "Donation Amount" },
        { value: "registration_fee", label: "Registration Fee" },
        { value: "early_bird_discount", label: "Early Bird Discount" },
        { value: "member_discount", label: "Member Discount" },
        { value: "group_discount", label: "Group Discount" },
        { value: "quantity", label: "Quantity" },
        { value: "unit_price", label: "Unit Price" }
    ];

    // Add permanent fields if they don't exist
    useEffect(() => {
        const existingFieldNames = formData.registrationFields.map(field => field.name);
        const missingPermanentFields = permanentFields.filter(
            permField => !existingFieldNames.includes(permField.name)
        );

        if (missingPermanentFields.length > 0) {
            // Add missing permanent fields to the beginning
            const updatedFields = [...missingPermanentFields, ...formData.registrationFields];
            // This would need to be handled by the parent component
            // For now, we'll just show a message
        }
    }, []);

    const openDrawer = (type, index) => {
        setActiveDrawer(type);
        setDrawerData({ index });
    };

    const closeDrawer = () => {
        setActiveDrawer(null);
        setDrawerData({});
    };

    const toggleAccordion = (index) => {
        setExpandedAccordion(expandedAccordion === index ? null : index);
    };

    if (isSubmitting) {
        return <LoadingScreen />;
    }

    // Combine permanent fields with custom fields for display
    const allFields = [
        ...permanentFields,
        ...formData.registrationFields.filter(field => 
            !permanentFields.some(permField => permField.name === field.name)
        )
    ];

    return (
        <section className="w-full p-6 bg-white shadow-md rounded-lg relative">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-text-color">Event Registration Form</h2>
                <p className="text-gray-600">
                    Configure the registration form that attendees will fill out. Basic fields are permanent and cannot be removed.
                </p>
            </div>

            <div className="space-y-6">
                {/* Registration Dates */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-text-color">Registration Period</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Registration Start Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Registration Start Date*
                            </label>
                            <input
                                type="datetime-local"
                                name="registrationStartDate"
                                value={formData.registrationStartDate || ''}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.registrationStartDate ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            />
                            {errors.registrationStartDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.registrationStartDate}</p>
                            )}
                        </div>

                        {/* Registration End Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-color">
                                Registration End Date*
                            </label>
                            <input
                                type="datetime-local"
                                name="registrationEndDate"
                                value={formData.registrationEndDate || ''}
                                onChange={handleChange}
                                className={`p-3 bg-primary border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                    errors.registrationEndDate ? 'border-red-500' : 'border-border'
                                }`}
                                required
                            />
                            {errors.registrationEndDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.registrationEndDate}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Registration Fields */}
                <div className="bg-secondary-card p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-text-color">Registration Fields</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Configure the fields that attendees will fill during registration
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => addField()}
                            className="bg-secondary-button-color hover:bg-secondary-hover text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            Add Custom Field
                        </button>
                    </div>

                    <div className="space-y-4">
                        {allFields.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No registration fields configured</p>
                        )}

                        {allFields.map((field, index) => {
                            const isPermanent = field.isPermanent || permanentFields.some(pf => pf.name === field.name);
                            const actualIndex = formData.registrationFields.findIndex(f => f.name === field.name);
                            
                            return (
                                <div
                                    key={field.name || index}
                                    className={`border rounded-lg overflow-hidden ${
                                        isPermanent ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    {/* Accordion Header */}
                                    <div 
                                        className={`p-4 flex justify-between items-center cursor-pointer border-b transition-colors ${
                                            isPermanent ? 'bg-blue-100 hover:bg-blue-150' : 'bg-gray-100 hover:bg-gray-150'
                                        }`}
                                        onClick={() => toggleAccordion(index)}
                                    >
                                        <div className="flex items-center">
                                            <h4 className="font-medium text-lg text-text-color">
                                                {field.displayName || `Field ${index + 1}`}
                                            </h4>
                                            {isPermanent && (
                                                <span className="ml-3 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                                {field.type || "No type selected"}
                                            </span>
                                            <svg 
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedAccordion === index ? 'rotate-180' : ''
                                                }`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Accordion Content */}
                                    {expandedAccordion === index && (
                                        <div className="p-6 bg-white">
                                            {isPermanent ? (
                                                // Permanent field display
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                                        <div className="flex items-start">
                                                            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <div>
                                                                <h5 className="text-blue-800 font-medium mb-1">Required Field</h5>
                                                                <p className="text-blue-700 text-sm">
                                                                    This is a permanent field required for all event registrations. 
                                                                    {field.description && ` ${field.description}.`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">Field Name</label>
                                                            <input
                                                                type="text"
                                                                value={field.name}
                                                                className="p-3 bg-gray-100 border border-gray-300 rounded-lg w-full text-gray-600"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">Display Name</label>
                                                            <input
                                                                type="text"
                                                                value={field.displayName}
                                                                className="p-3 bg-gray-100 border border-gray-300 rounded-lg w-full text-gray-600"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">Field Type</label>
                                                            <input
                                                                type="text"
                                                                value={field.type}
                                                                className="p-3 bg-gray-100 border border-gray-300 rounded-lg w-full text-gray-600"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">Value Type</label>
                                                            <input
                                                                type="text"
                                                                value={field.valueType}
                                                                className="p-3 bg-gray-100 border border-gray-300 rounded-lg w-full text-gray-600"
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Custom field configuration
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Name - Now a dropdown */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">
                                                                Field Name*
                                                            </label>
                                                            <select
                                                                value={field.name || ''}
                                                                onChange={(e) => {
                                                                    const selectedValue = e.target.value;
                                                                    if (selectedValue === 'custom') {
                                                                        // Set custom field input state
                                                                        setCustomFieldInputs(prev => ({
                                                                            ...prev,
                                                                            [actualIndex]: true
                                                                        }));
                                                                        // Don't set the field name to "custom" yet
                                                                    } else {
                                                                        // Clear custom input state
                                                                        setCustomFieldInputs(prev => ({
                                                                            ...prev,
                                                                            [actualIndex]: false
                                                                        }));
                                                                        // Set the selected field name
                                                                        handleRegistrationChange(actualIndex, selectedValue, "name");
                                                                    }
                                                                }}
                                                                className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                                                    errors[`registrationField.${actualIndex}.name`] ? 'border-red-500' : 'border-border'
                                                                }`}
                                                                required
                                                            >
                                                                <option value="">Select field name</option>
                                                                <optgroup label="Common Fields">
                                                                    <option value="age">age</option>
                                                                    <option value="gender">gender</option>
                                                                    <option value="organization">organization</option>
                                                                    <option value="job_title">job_title</option>
                                                                    <option value="dietary_preferences">dietary_preferences</option>
                                                                    <option value="emergency_contact">emergency_contact</option>
                                                                    <option value="t_shirt_size">t_shirt_size</option>
                                                                    <option value="special_requirements">special_requirements</option>
                                                                </optgroup>
                                                                <optgroup label="Pricing Fields">
                                                                    <option value="ticket_type">ticket_type</option>
                                                                    <option value="quantity">quantity</option>
                                                                    <option value="unit_price">unit_price</option>
                                                                    <option value="subtotal">subtotal</option>
                                                                    <option value="discount">discount</option>
                                                                    <option value="tax">tax</option>
                                                                    <option value="total">total</option>
                                                                    <option value="totalPrice">totalPrice</option>
                                                                </optgroup>
                                                                <optgroup label="Donation Fields">
                                                                    <option value="donation_amount">donation_amount</option>
                                                                    <option value="donation_type">donation_type</option>
                                                                    <option value="anonymous_donation">anonymous_donation</option>
                                                                </optgroup>
                                                                <optgroup label="Custom">
                                                                    <option value="custom">Custom (Enter below)</option>
                                                                </optgroup>
                                                            </select>
                                                            {errors[`registrationField.${actualIndex}.name`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`registrationField.${actualIndex}.name`]}</p>
                                                            )}
                                                            
                                                            {/* Custom input field */}
                                                            {customFieldInputs[actualIndex] && (
                                                                <div className="mt-2">
                                                                    <input
                                                                    value={field.name}
                                                                        type="text"
                                                                        placeholder="Enter custom field name (e.g., workshop_preference)"
                                                                        onChange={(e) => {
                                                                            const customName = e.target.value.trim();
                                                                            if (customName) {
                                                                                // Update the field name directly
                                                                                handleRegistrationChange(actualIndex, customName, "name");
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const customName = e.target.value.trim();
                                                                            if (!customName) {
                                                                                // If empty, reset custom input state
                                                                                setCustomFieldInputs(prev => ({
                                                                                    ...prev,
                                                                                    [actualIndex]: false
                                                                                }));
                                                                                handleRegistrationChange(actualIndex, "", "name");
                                                                            }
                                                                        }}
                                                                        className="p-3 bg-secondary-card border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                                                        autoFocus
                                                                    />
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        Use lowercase with underscores (e.g., my_custom_field)
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Internal field name used for data processing
                                                            </p>
                                                        </div>

                                                        {/* Display Name */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">
                                                                Display Name*
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={field.displayName || ''}
                                                                onChange={(e) =>
                                                                    handleRegistrationChange(actualIndex, e.target.value, "displayName")
                                                                }
                                                                className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                                                    errors[`registrationField.${actualIndex}.displayName`] ? 'border-red-500' : 'border-border'
                                                                }`}
                                                                placeholder="e.g., Dietary Preferences"
                                                                required
                                                            />
                                                            {errors[`registrationField.${actualIndex}.displayName`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`registrationField.${actualIndex}.displayName`]}</p>
                                                            )}
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Label shown to users in the form
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Field Type */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">
                                                                Field Type*
                                                            </label>
                                                            <select
                                                                value={field.type || ''}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value;
                                                                    handleRegistrationChange(actualIndex, newValue, "type");
                                                                    
                                                                    if (["radioButtonGroup", "checkBoxGroup", "option", "boolean"].includes(newValue)) {
                                                                        openDrawer("fieldTypeDrawer", actualIndex);
                                                                    }
                                                                }}
                                                                className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                                                    errors[`registrationField.${actualIndex}.type`] ? 'border-red-500' : 'border-border'
                                                                }`}
                                                                required
                                                            >
                                                                <option value="">Select Type</option>
                                                                <option value="text">Text Input</option>
                                                                <option value="number">Number Input</option>
                                                                <option value="boolean">Yes/No (Checkbox)</option>
                                                                <option value="option">Single Choice (Dropdown)</option>
                                                                <option value="radioButtonGroup">Single Choice (Radio)</option>
                                                                <option value="checkBoxGroup">Multiple Choice (Checkboxes)</option>
                                                            </select>
                                                            {errors[`registrationField.${actualIndex}.type`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`registrationField.${actualIndex}.type`]}</p>
                                                            )}
                                                        </div>

                                                        {/* Value Type */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2 text-text-color">
                                                                Value Type*
                                                            </label>
                                                            <select
                                                                value={field.valueType || ''}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value;
                                                                    handleRegistrationChange(actualIndex, newValue, "valueType");
                                                                    
                                                                    if (["dynamic", "fixed", "userInput"].includes(newValue)) {
                                                                        openDrawer("valueTypeDrawer", actualIndex);
                                                                    }
                                                                }}
                                                                className={`p-3 bg-secondary-card border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                                                                    errors[`registrationField.${actualIndex}.valueType`] ? 'border-red-500' : 'border-border'
                                                                }`}
                                                                required
                                                            >
                                                                <option value="">Select Value Type</option>
                                                                <option value="userInput">User Input - User fills this field</option>
                                                                <option value="fixed">Fixed - Predefined constant value</option>
                                                                <option value="dynamic">Dynamic - Calculated from other fields</option>
                                                            </select>
                                                            {errors[`registrationField.${actualIndex}.valueType`] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[`registrationField.${actualIndex}.valueType`]}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Configuration Buttons */}
                                                    <div className="flex space-x-4">
                                                        {["radioButtonGroup", "checkBoxGroup", "option", "boolean"].includes(field.type) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openDrawer("fieldTypeDrawer", actualIndex)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                            >
                                                                Configure Options
                                                            </button>
                                                        )}
                                                        
                                                        {["dynamic", "fixed"].includes(field.valueType) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openDrawer("valueTypeDrawer", actualIndex)}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                            >
                                                                Configure Value
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Delete Field */}
                                                    <div className="pt-4 border-t border-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteField(actualIndex)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            Delete Field
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Drawer */}
            {activeDrawer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-lg shadow-lg max-h-3/4 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-text-color">
                                    {activeDrawer === "fieldTypeDrawer" ? "Configure Field Options" : "Configure Field Value"}
                                </h3>
                                <button
                                    onClick={closeDrawer}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Field Type Drawer */}
                            {activeDrawer === "fieldTypeDrawer" && drawerData.index !== undefined && (
                                <div>
                                    {["option", "checkBoxGroup", "radioButtonGroup"].includes(formData.registrationFields[drawerData.index]?.type) && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="block text-lg font-medium text-text-color">
                                                    Field Options
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => addOption(drawerData.index)}
                                                    className="bg-secondary-button-color hover:bg-secondary-hover text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    Add Option
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.registrationFields[drawerData.index]?.options?.length === 0 && (
                                                    <p className="text-gray-500 text-center py-8">No options added yet</p>
                                                )}
                                                
                                                {formData.registrationFields[drawerData.index]?.options?.map((option, optIndex) => (
                                                    <div key={optIndex} className="bg-secondary-card p-4 rounded-lg border border-border">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-2 text-text-color">Field Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={option.fieldName || ''}
                                                                    onChange={(e) =>
                                                                        handleOptionChange(drawerData.index, optIndex, e.target.value, "fieldName")
                                                                    }
                                                                    className="p-3 bg-primary border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                                                    placeholder="e.g., vegetarian"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-2 text-text-color">Label Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={option.labelName || ''}
                                                                    onChange={(e) =>
                                                                        handleOptionChange(drawerData.index, optIndex, e.target.value, "labelName")
                                                                    }
                                                                    className="p-3 bg-primary border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                                                    placeholder="e.g., Vegetarian"
                                                                />
                                                            </div>
                                                            <div className="flex items-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteOption(drawerData.index, optIndex)}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.registrationFields[drawerData.index]?.type === "boolean" && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-medium text-text-color">Boolean Field Configuration</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-text-color">True Value</label>
                                                    <input
                                                        type="text"
                                                        value={formData.registrationFields[drawerData.index]?.truthValue || ''}
                                                        onChange={(e) =>
                                                            handleRegistrationChange(drawerData.index, e.target.value || 0, "truthValue")
                                                        }
                                                        className="p-3 bg-secondary-card border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                                        placeholder="Value when checked (e.g., 1)"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-text-color">False Value</label>
                                                    <input
                                                        type="text"
                                                        value={formData.registrationFields[drawerData.index]?.falseValue || ''}
                                                        onChange={(e) =>
                                                            handleRegistrationChange(drawerData.index, e.target.value || 0, "falseValue")
                                                        }
                                                        className="p-3 bg-secondary-card border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                                        placeholder="Value when unchecked (e.g., 0)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Value Type Drawer */}
                            {activeDrawer === "valueTypeDrawer" && drawerData.index !== undefined && (
                                <div>
                                    {formData.registrationFields[drawerData.index]?.valueType === "fixed" && (
                                        <div>
                                            <h4 className="text-lg font-medium mb-4 text-text-color">Fixed Value Configuration</h4>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-text-color">Fixed Value</label>
                                                <input
                                                    type="text"
                                                    value={formData.registrationFields[drawerData.index]?.fixedValue || ''}
                                                    onChange={(e) =>
                                                        handleRegistrationChange(drawerData.index, e.target.value, "fixedValue")
                                                    }
                                                    className="p-3 bg-secondary-card border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                                    placeholder="Enter the constant value for this field"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    This value will be automatically assigned to this field for all registrations.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    
{formData.registrationFields[drawerData.index]?.valueType === "dynamic" && (
  <div>
    <h4 className="text-lg font-medium mb-4 text-text-color">Dynamic Value Configuration</h4>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-medium text-text-color">Formula</label>
        <button
          type="button"
          onClick={() => addFormulaField(drawerData.index)}
          className="bg-secondary-button-color hover:bg-secondary-hover text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Formula Item
        </button>
      </div>

      {formData.registrationFields[drawerData.index]?.formula?.length === 0 && (
        <p className="text-gray-500 text-center py-8">No formula items added yet</p>
      )}

      {/* Make this section scrollable */}
      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
        {formData.registrationFields[drawerData.index]?.formula?.map((formulaItem, formulaIndex) => (
          <div key={formulaIndex} className="bg-secondary-card p-4 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-color">Type</label>
                <select
                  value={formulaItem.type || ''}
                  onChange={(e) =>
                    handleFormulaChange(drawerData.index, formulaIndex, e.target.value, "type")
                  }
                  className="p-3 bg-primary border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                >
                  <option value="">Select Type</option>
                  <option value="symbol">Symbol</option>
                  <option value="operation">Operation</option>
                  <option value="customField">Custom Field</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text-color">
                  {formulaItem.type === 'customField' ? 'Field Name' : 'Field Name/Value'}
                </label>
                {formulaItem.type === 'customField' ? (
                  <select
                    value={formulaItem.fieldName || ''}
                    onChange={(e) =>
                      handleFormulaChange(drawerData.index, formulaIndex, e.target.value, "fieldName")
                    }
                    className="p-3 bg-primary border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                  >
                    <option value="">Select Field</option>
                    
                    {/* Required Fields */}
                    <optgroup label="Required Fields">
                      {permanentFields.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.displayName} ({field.name})
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Custom Fields */}
                    {formData.registrationFields.filter(field => 
                      field.name && 
                      field.name.trim() !== '' && 
                      field.name !== 'custom' &&
                      field.displayName &&
                      field.displayName.trim() !== ''
                    ).length > 0 ? (
                      <optgroup label="Custom Fields">
                        {formData.registrationFields
                          .filter(field => 
                            field.name && 
                            field.name.trim() !== '' && 
                            field.name !== 'custom' &&
                            field.displayName &&
                            field.displayName.trim() !== ''
                          )
                          .map((field) => (
                            <option key={field.name} value={field.name}>
                              {field.displayName} ({field.name})
                            </option>
                          ))}
                      </optgroup>
                    ) : (
                      <optgroup label="Custom Fields">
                        <option disabled>No custom fields created yet</option>
                      </optgroup>
                    )}
                    
                    {/* Calculation Fields */}
                    <optgroup label="Calculation Fields">
                      {constantFieldNames.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label} ({field.value})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formulaItem.fieldName || ''}
                    onChange={(e) =>
                      handleFormulaChange(drawerData.index, formulaIndex, e.target.value, "fieldName")
                    }
                    className="p-3 bg-primary border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                    placeholder={formulaItem.type === 'number' ? 'Enter number (e.g., 10)' : 'Field name or value'}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text-color">Operation</label>
                <select
                  disabled={formulaItem.fieldName === 'customField'}
                  value={formulaItem.operationName || ''}
                  onChange={(e) =>
                    handleFormulaChange(drawerData.index, formulaIndex, e.target.value, "operationName")
                  }
                  className="p-3 bg-primary border border-border rounded-lg w-full text-text-color focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                >
                  <option value="">Select Operation</option>
                  <option value="add">Add (+)</option>
                  <option value="subtract">Subtract (-)</option>
                  <option value="multiply">Multiply (×)</option>
                  <option value="divide">Divide (÷)</option>
                  <option value="modulus">Percentage (%)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => deleteFormula(drawerData.index, formulaIndex)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Help text for formula configuration */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>Formula Help:</strong> 
                {formulaItem.type === 'customField' && ' Select a field from the dropdown to reference its value.'}
                {formulaItem.type === 'number' && ' Enter a numeric value to use in calculations.'}
                {formulaItem.type === 'operation' && ' This defines how the next value will be combined.'}
                {formulaItem.type === 'symbol' && ' Use for special symbols or constants.'}
              </p>
            </div>

            {/* Debug Information */}
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h6 className="text-gray-700 font-medium mb-2">Available Fields Debug:</h6>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Required Fields:</strong> {permanentFields.map(f => f.name).join(', ')}
                </div>
                <div>
                  <strong>Custom Fields:</strong> {
                    formData.registrationFields
                      .filter(field => 
                        field.name && 
                        field.name.trim() !== '' && 
                        field.name !== 'custom' &&
                        field.displayName &&
                        field.displayName.trim() !== ''
                      )
                      .map(f => `${f.displayName}(${f.name})`)
                      .join(', ') || 'None'
                  }
                </div>
                <div>
                  <strong>All Registration Fields:</strong> {
                    formData.registrationFields
                      .map(f => `${f.displayName || 'No Display'}(${f.name || 'No Name'})`)
                      .join(', ') || 'None'
                  }
                </div>
                <div>
                  <strong>Custom Field Inputs Active:</strong> {JSON.stringify(customFieldInputs)}
                </div>
                <div>
                  <strong>Current Selection:</strong> {formulaItem.fieldName || 'None'}
                </div>
                <div>
                  <strong>Formula Item Type:</strong> {formulaItem.type || 'None'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Formula Example - moved outside scrollable area */}
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h5 className="text-green-800 font-medium mb-2">Formula Example</h5>
        <p className="text-green-700 text-sm mb-2">
          To calculate: <code>quantity × unit_price + tax</code>
        </p>
        <ol className="text-green-700 text-sm space-y-1">
          <li>1. Type: "customField", Field: "quantity"</li>
          <li>2. Type: "operation", Operation: "multiply"</li>
          <li>3. Type: "customField", Field: "unit_price"</li>
          <li>4. Type: "operation", Operation: "add"</li>
          <li>5. Type: "customField", Field: "tax"</li>
        </ol>
      </div>
    </div>
  </div>
)}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default RegistrationDetails;