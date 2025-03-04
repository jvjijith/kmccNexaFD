import React, { useEffect, useState } from 'react';
import { usePostData, usePutData } from '../../../common/api';
import LoadingScreen from '../../ui/loading/loading';
import CreateEvent from './createEvent';
import EventDetails from './eventDetails';
import GeoAllowForm from './locationDetails';
import EventPermissions from './eventPermission';
import RegistrationDetails from './registrationDetails';
import EventRegistrationDates from './scheduleEvent';
import { toast } from 'react-toastify';

function EventForm({ event }) {

    const [formData, setFormData] = useState({
        name:  null,
        description: null,
        type: 'public',
        metadata: {
            name: null,
            description: null,
        },
        location: null,
        GeoAllow: {
            location: null,
            coordinates: [null, null],
        },
        allowGuest: false,
        allowLogin: false,
        allowMemberLogin:  false,
        seatsAvailable:  0,
        totalregisteredSeats:  0,
        registrationFields: [],
        eventStatus: 'Draft',
        startingDate: null,
        endingDate: null,
        paymentType: 'Free',
        priceConfig: {
            type: 'fixed',
            amount: 0,
            dependantField: null,
        },
        registrationStartDate: null,
        registrationEndDate: null,
    });
    


    const mutationHook = event ? usePutData : usePostData;
    const api_url = event ? `/events/${event._id}` : '/events';
    const api_key = event ? 'updateEvent' : 'addEvent';
    const { mutate: saveEvent, isLoading, isError } = mutationHook(api_key, api_url);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const removeUnwantedFields = (data, fields = ['_id', 'updated_at', 'created_at', '__v' ]) => {
        if (Array.isArray(data)) {
          return data.map((item) => removeUnwantedFields(item, fields));
        } else if (typeof data === 'object' && data !== null) {
          return Object.keys(data).reduce((acc, key) => {
            if (!fields.includes(key)) {
              acc[key] = removeUnwantedFields(data[key], fields);
            }
            return acc;
          }, {});
        }
        return data;
      };

    useEffect(() => {
        if (event) {

            
      // Remove unwanted fields
      const cleanedContainer = removeUnwantedFields(event);
    
            setFormData({
            name: event?.name || null,
            description: event?.description || null,
            type: event?.type || 'public',
            metadata: {
                name: event?.metadata?.name || null,
                description: event?.metadata?.description || null,
            },
            location: event?.location || null,
            GeoAllow: {
                location: event?.GeoAllow?.location || null,
                coordinates: event?.GeoAllow?.coordinates || [null, null],
            },
            allowGuest: event?.allowGuest ?? false,
            allowLogin: event?.allowLogin ?? false,
            allowMemberLogin: event?.allowMemberLogin ?? false,
            seatsAvailable: event?.seatsAvailable || 0,
            totalregisteredSeats: event?.totalRegisteredSeats || 0,
            registrationFields: cleanedContainer?.registrationFields || [],
            eventStatus: event?.eventStatus || 'Draft',
            startingDate: formatDate(event?.startingDate) || null,
            endingDate: formatDate(event?.endingDate) || null,
            paymentType: event?.paymentType || 'Free',
            priceConfig: {
                type: event?.priceConfig?.type || 'fixed',
                amount: event?.priceConfig?.amount || 0,
                dependantField: event?.priceConfig?.dependantField || null,
            },
            registrationStartDate: formatDate(event?.registrationStartDate) || null,
            registrationEndDate: formatDate(event?.registrationEndDate) || null,
        });
        }
      }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegistrationChange = (index, value, fieldPath) => {
        setFormData((prevState) => {
            const updatedFields = [...prevState.registrationFields];
            const field = updatedFields[index];
    
            if (fieldPath.includes(".")) {
                // Handle nested updates (e.g., options)
                const [fieldKey, nestedKey] = fieldPath.split(".");
                if (fieldKey === "options") {
                    const optionIndex = parseInt(nestedKey, 10);
                    field.options[optionIndex].labelName = value;
                }
            } else {
                // Handle top-level updates
                field[fieldPath] = value;
    
                // Reset options if the field type changes to non-option types
                if (
                    fieldPath === "type" &&
                    !["option", "checkBoxGroup", "radioButtonGroup"].includes(value)
                ) {
                    field.options = [];
                }
            }
    
            updatedFields[index] = field;
            return { ...prevState, registrationFields: updatedFields };
        });
    };
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
      
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      

    const addField = () => {
        setFormData((prev) => ({
            ...prev,
            registrationFields: [
                ...prev.registrationFields,
                {
                    name: "",
                    displayName: "",
                    type: "",
                    options: [],
                    valueType: "",
                    fixedValue: null,
                    userValue: null,
                    truthValue: null,
                    falseValue: null,
                    formula: []
                }
            ]
        }));
    };

    const addOption = (fieldIndex) => {
        setFormData((prev) => {
            const updatedFields = prev.registrationFields.map((field, index) => {
                if (index === fieldIndex) {
                    return {
                        ...field,
                        options: [
                            ...(field.options || []), // Ensure options exist or initialize as an empty array
                            { fieldName: "", parentName: "", labelName: "" },
                        ],
                    };
                }
                return field;
            });
            return { ...prev, registrationFields: updatedFields };
        });
    };
    
    
    const deleteOption = (fieldIndex, optionIndex) => {
        setFormData((prev) => {
            const updatedFields = [...prev.registrationFields];
            updatedFields[fieldIndex].options.splice(optionIndex, 1);
            return { ...prev, registrationFields: updatedFields };
        });
    };
    
    
    const deleteField = (fieldIndex, optionIndex = null, type = null) => {
        setFormData((prevState) => {
            const updatedFields = [...prevState.registrationFields];
            if (type === "option" && optionIndex !== null) {
                updatedFields[fieldIndex].options.splice(optionIndex, 1);
            } else {
                updatedFields.splice(fieldIndex, 1);
            }
            return { ...prevState, registrationFields: updatedFields };
        });
    };

    const handleOptionChange = (fieldIndex, optionIndex, value, key) => {
        setFormData((prev) => {
            const updatedFields = [...prev.registrationFields];
            const updatedOptions = [...(updatedFields[fieldIndex]?.options || [])];
    
            // Update the specific key for the option at optionIndex
            updatedOptions[optionIndex] = {
                ...updatedOptions[optionIndex],
                [key]: value,
            };
    
            // Update the options array in the field
            updatedFields[fieldIndex].options = updatedOptions;
    
            return { ...prev, registrationFields: updatedFields };
        });
    };
    
    const handleMetadataChange = (event, field) =>  {
        const { name, value } = event.target;
    
        // Update the 'metadata' properties directly
        setFormData(prevData => {
            return {
                ...prevData,
                metadata: {
                    ...prevData.metadata,
                    [name]: value, // Dynamically update the field (name or description) in metadata
                },
            };
        });
    };

    

    const handleLocationChange = (event) => {
        const { name, value } = event.target;
    
        setFormData((prevData) => {
            let updatedGeoAllow = { ...prevData.GeoAllow };
    
            if (name === "location") {
                // Sync location with GeoAllow.location
                updatedGeoAllow.location = value;
                return {
                    ...prevData,
                    location: value,
                    GeoAllow: updatedGeoAllow,
                };
            }
    
            if (name === "coordinates") {
                // Ensure coordinates are updated correctly
                const [lat, lng] = value;
                updatedGeoAllow.coordinates = [
                    lat !== undefined ? lat : prevData.GeoAllow.coordinates[0],
                    lng !== undefined ? lng : prevData.GeoAllow.coordinates[1],
                ];
                return { ...prevData, GeoAllow: updatedGeoAllow };
            }
    
            return prevData;
        });
    };
    
    

    function handlePriceConfigChange(event) {
        const { name, value } = event.target;
    
        // Update the nested priceConfig object
        setFormData((prevFormData) => ({
            ...prevFormData,
            priceConfig: {
                ...prevFormData.priceConfig,
                [name.replace('priceConfig.', '')]: value, // Extract the specific key
            },
        }));
    }
    
    

    const addFormulaField = (fieldIndex) => {
        setFormData((prev) => {
            const updatedFields = prev.registrationFields.map((field, index) => {
                if (index === fieldIndex) {
                    return {
                        ...field,
                        formula: [
                            ...(field.formula || []), // Ensure formula exists or initialize as an empty array
                            { type: "", fieldName: "", operationName: "" },
                        ],
                    };
                }
                return field;
            });
            return { ...prev, registrationFields: updatedFields };
        });
    };
    
      
      const deleteFormula = (fieldIndex, formulaIndex) => {
        setFormData((prev) => {
          const updatedFields = [...prev.registrationFields];
          const updatedFormula = [...(updatedFields[fieldIndex]?.formula || [])];
      
          updatedFormula.splice(formulaIndex, 1);
          updatedFields[fieldIndex].formula = updatedFormula;
      
          return { ...prev, registrationFields: updatedFields };
        });
      };

      const handleFormulaChange = (fieldIndex, formulaIndex, value, key) => {
        setFormData((prev) => {
          const updatedFields = [...prev.registrationFields];
          const updatedFormula = [...(updatedFields[fieldIndex]?.formula || [])];
      
          updatedFormula[formulaIndex] = {
            ...updatedFormula[formulaIndex],
            [key]: value,
          };
      
          updatedFields[fieldIndex].formula = updatedFormula;
      
          return { ...prev, registrationFields: updatedFields };
        });
      };
      

    const validateCreateEvent = () => {
        return formData.name.trim() !== '' && formData.description.trim() !== '' && formData.type.trim() !== '';
    };
    const validateEventDetails = () => {
        return formData.metadata.name.trim() !== '' && formData.metadata.description.trim() !== '' && formData.paymentType.trim() !== '';
    };
    const validateLocationDetails = () => {
        console.log("formData.GeoAllow.coordinates.length",formData.GeoAllow.coordinates.length);
        return formData.location.trim() !== '' && formData.GeoAllow.coordinates.length === 2;
    };
    const validateRegistrationDetails = () => {
        return (
            formData.registrationStartDate !== null &&
            formData.registrationEndDate !== null &&
            // formData.registrationFields.length !== 0 &&
            !formData.registrationFields.some(
                (field) =>
                    field.name.trim() === '' ||
                    field.displayName.trim() === '' ||
                    field.type.trim() === '' ||
                    field.valueType.trim() === ''
            )
        );
    };    
    const validateScheduleEvent = () => {
        return formData.startingDate.trim() !== '' && formData.endingDate.trim() !== '';
    };

    const handleContinue = () => {
        if (activeTab === 0 && !validateCreateEvent() || activeTab === 1 && !validateEventDetails() || activeTab === 2 && !validateRegistrationDetails() || activeTab === 3 && !validateLocationDetails() || activeTab === 4 && !validateScheduleEvent() ) {
            toast.error('Please complete all required fields in the tab before continuing.');
            return;
        }
        if (activeTab < tabs.length - 1) {
            setActiveTab((prev) => prev + 1);
        } else {
            handleSubmit(); // Submit if on the last tab
        }
    };

    const handlePrevious = () => {
        if (activeTab > 0) {
            setActiveTab((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await saveEvent(formData);
        } catch (err) {
            console.error('Error submitting form:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { name: 'Basic Details', component: <CreateEvent formData={formData} handleChange={handleChange} isSubmitting={isSubmitting} /> },
        { name: 'Advanced Details', component: <EventDetails formData={formData} handleChange={handleChange} handleMetadataChange={handleMetadataChange} handlePriceConfigChange={handlePriceConfigChange} isSubmitting={isSubmitting} /> },
        { name: 'Registration Details', component: <RegistrationDetails formData={formData} handleChange={handleChange} handleOptionChange={handleOptionChange}
        handleRegistrationChange={handleRegistrationChange} handleFormulaChange={handleFormulaChange} addField={addField} deleteField={deleteField} addOption={addOption} 
        deleteOption={deleteOption} addFormulaField={addFormulaField} deleteFormula={deleteFormula} isSubmitting={isSubmitting} /> },
        { name: 'Event Location', component: <GeoAllowForm formData={formData} handleLocationChange={handleLocationChange} handleChange={handleChange} isSubmitting={isSubmitting} /> },
        { name: 'Access and Login Options', component: <EventPermissions formData={formData} handleChange={handleChange} isSubmitting={isSubmitting} /> },
        { name: 'Schedule', component: <EventRegistrationDates formData={formData} handleChange={handleChange} isSubmitting={isSubmitting} /> },
    ];

    if (isSubmitting || isLoading){
        return <LoadingScreen />;
      }

    console.log("formData",formData);

    return (
        <div className="flex flex-col w-full p-5 bg-card text-text-color rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-5">{event ? 'Edit Event' : 'Create Event'}</h1>

            <nav className="mb-5">
                <ul className="flex justify-center list-none p-0 m-0 bg-secondary-card border-b border-border">
                    {tabs.map((tab, index) => (
                        <li key={index} className="mr-5">
                            <button
                                className={`py-2 px-4 block ${
                                    activeTab === index
                                        ? 'text-primary-button-color border-b-2 border-primary-button-color'
                                        : 'text-text-color hover:border-b-2 hover:border-primary-button-color hover:text-primary-button-color'
                                }`}
                                onClick={() => setActiveTab(index)} // Allow free navigation
                            >
                                {tab.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>


            {tabs[activeTab].component}

            <div className="flex items-center justify-between mt-5">
                {/* Previous Button */}
                {activeTab > 0 ? (
                    <button
                        className="bg-primary-button-color text-white py-2 px-4 rounded"
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>
                ) : (
                    <div></div> // Placeholder to maintain alignment
                )}
                {/* Continue/Submit Button */}
                <button
                    className="bg-primary-button-color text-white py-2 px-4 rounded ml-auto"
                    onClick={handleContinue}
                >
                    {activeTab < tabs.length - 1 ? 'Continue' : 'Submit'}
                </button>
            </div>

        </div>
    );
}

export default EventForm;
