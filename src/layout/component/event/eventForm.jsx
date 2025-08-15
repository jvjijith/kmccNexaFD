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
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router';

function EventForm({ event }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'public',
        eventType: '',
        customAttendance: false,
        metadata: {
            name: '',
            description: '',
            imageUrl: null,
        },
        location: '',
        GeoAllow: {
            location: '',
            coordinates: [null, null],
        },
        allowGuest: false,
        allowLogin: true,
        allowMemberLogin: false,
        seatsAvailable: 0,
        totalregisteredSeats: 0,
        registrationFields: [],
        eventStatus: 'Draft',
        startingDate: '',
        endingDate: '',
        paymentType: 'Free',
        priceConfig: {
            type: 'fixed',
            amount: 0,
            dependantField: "",
        },
        registrationStartDate: '',
        registrationEndDate: '',
    });
    
    // Add state variables for image handling
    const [images, setImages] = useState([]);
    const [uploadedImages, setUploadedImages] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    const [mediaId, setMediaId] = useState(null);
    
    // Add validation state
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    const navigate = useNavigate();

    const mutationHook = event ? usePutData : usePostData;
    const api_url = event ? `/events/${event._id}` : '/events';
    const api_key = event ? 'updateEvent' : 'addEvent';
    const { mutate: saveEvent, isLoading, isError } = mutationHook(api_key, api_url);
    const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
    const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Validation functions
    const validateField = (fieldName, value, formData) => {
        const errors = {};

        switch (fieldName) {
            case 'name':
                if (!value || value.trim() === '') {
                    errors.name = 'Event name is required';
                } else if (value.length < 3) {
                    errors.name = 'Event name must be at least 3 characters long';
                } else if (value.length > 100) {
                    errors.name = 'Event name must be less than 100 characters';
                }
                break;

            case 'description':
                if (!value || value.trim() === '') {
                    errors.description = 'Event description is required';
                } else if (value.length < 10) {
                    errors.description = 'Event description must be at least 10 characters long';
                } else if (value.length > 1000) {
                    errors.description = 'Event description must be less than 1000 characters';
                }
                break;

            case 'type':
                if (!value || !['public', 'members'].includes(value)) {
                    errors.type = 'Please select a valid event type';
                }
                break;

            case 'eventType':
                const validEventTypes = ['donation', 'conference', 'workshop', 'seminar', 'meetup', 'webinar', 'fundraiser', 'networking', 'training'];
                if (!value || value.trim() === '') {
                    errors.eventType = 'Event category is required';
                } else if (!validEventTypes.includes(value)) {
                    errors.eventType = 'Please select a valid event category';
                }
                break;

            case 'seatsAvailable':
                const seats = parseInt(value);
                if (isNaN(seats) || seats < 1) {
                    errors.seatsAvailable = 'Seats available must be at least 1';
                } else if (seats > 10000) {
                    errors.seatsAvailable = 'Seats available cannot exceed 10,000';
                }
                break;

            case 'totalregisteredSeats':
                const registeredSeats = parseInt(value);
                const availableSeats = parseInt(formData.seatsAvailable);
                if (isNaN(registeredSeats) || registeredSeats < 0) {
                    errors.totalregisteredSeats = 'Registered seats cannot be negative';
                } else if (registeredSeats > availableSeats) {
                    errors.totalregisteredSeats = 'Registered seats cannot exceed available seats';
                }
                break;

            case 'metadata.name':
                if (!value || value.trim() === '') {
                    errors['metadata.name'] = 'Event category is required';
                } else if (value.length < 2) {
                    errors['metadata.name'] = 'Event category must be at least 2 characters long';
                }
                break;

            case 'metadata.description':
                if (!value || value.trim() === '') {
                    errors['metadata.description'] = 'Event description is required';
                } else if (value.length < 20) {
                    errors['metadata.description'] = 'Event description must be at least 20 characters long';
                } else if (value.length > 2000) {
                    errors['metadata.description'] = 'Event description must be less than 2000 characters';
                }
                break;

            case 'location':
                if (!value || value.trim() === '') {
                    errors.location = 'Event location is required';
                } else if (value.length < 5) {
                    errors.location = 'Location must be at least 5 characters long';
                }
                break;

            case 'startingDate':
                if (!value) {
                    errors.startingDate = 'Event start date is required';
                } else {
                    const startDate = new Date(value);
                    const now = new Date();
                    if (startDate <= now) {
                        errors.startingDate = 'Event start date must be in the future';
                    }
                }
                break;

            case 'endingDate':
                if (!value) {
                    errors.endingDate = 'Event end date is required';
                } else if (formData.startingDate) {
                    const startDate = new Date(formData.startingDate);
                    const endDate = new Date(value);
                    if (endDate <= startDate) {
                        errors.endingDate = 'Event end date must be after start date';
                    }
                }
                break;

            case 'registrationStartDate':
                if (!value) {
                    errors.registrationStartDate = 'Registration start date is required';
                } else {
                    const regStartDate = new Date(value);
                    const now = new Date();
                    if (regStartDate <= now) {
                        errors.registrationStartDate = 'Registration start date must be in the future';
                    }
                }
                break;

            case 'registrationEndDate':
                if (!value) {
                    errors.registrationEndDate = 'Registration end date is required';
                } else if (formData.registrationStartDate) {
                    const regStartDate = new Date(formData.registrationStartDate);
                    const regEndDate = new Date(value);
                    if (regEndDate <= regStartDate) {
                        errors.registrationEndDate = 'Registration end date must be after registration start date';
                    }
                    if (formData.startingDate) {
                        const eventStartDate = new Date(formData.startingDate);
                        if (regEndDate >= eventStartDate) {
                            errors.registrationEndDate = 'Registration must end before event starts';
                        }
                    }
                }
                break;

            case 'paymentType':
                if (!value || !['Free', 'Fixed Price', 'registration Payment'].includes(value)) {
                    errors.paymentType = 'Please select a valid payment type';
                }
                break;

            case 'priceConfig.amount':
                if (formData.paymentType !== 'Free' && formData.priceConfig?.type === 'fixed') {
                    const amount = parseFloat(value);
                    if (isNaN(amount) || amount < 0) {
                        errors['priceConfig.amount'] = 'Amount must be a valid positive number';
                    } else if (amount > 10000) {
                        errors['priceConfig.amount'] = 'Amount cannot exceed $10,000';
                    }
                }
                break;

            default:
                break;
        }

        return errors;
    };

    const validateAllFields = () => {
        let allErrors = {};

        // Validate basic fields
        const fieldsToValidate = [
            'name', 'description', 'type', 'eventType', 'seatsAvailable', 'totalregisteredSeats',
            'metadata.name', 'metadata.description', 'location', 'startingDate',
            'endingDate', 'registrationStartDate', 'registrationEndDate', 'paymentType'
        ];

        fieldsToValidate.forEach(fieldName => {
            let value;
            if (fieldName.includes('.')) {
                const [parent, child] = fieldName.split('.');
                value = formData[parent]?.[child];
            } else {
                value = formData[fieldName];
            }
            
            const fieldErrors = validateField(fieldName, value, formData);
            allErrors = { ...allErrors, ...fieldErrors };
        });

        // Validate price config if needed
        if (formData.paymentType !== 'Free' && formData.priceConfig?.type === 'fixed') {
            const priceErrors = validateField('priceConfig.amount', formData.priceConfig.amount, formData);
            allErrors = { ...allErrors, ...priceErrors };
        }

        // Validate registration fields
        formData.registrationFields.forEach((field, index) => {
            if (!field.name || field.name.trim() === '') {
                allErrors[`registrationField.${index}.name`] = 'Field name is required';
            }
            if (!field.displayName || field.displayName.trim() === '') {
                allErrors[`registrationField.${index}.displayName`] = 'Display name is required';
            }
            if (!field.type || field.type.trim() === '') {
                allErrors[`registrationField.${index}.type`] = 'Field type is required';
            }
            if (!field.valueType || field.valueType.trim() === '') {
                allErrors[`registrationField.${index}.valueType`] = 'Value type is required';
            }
        });

        // Validate coordinates
        if (!formData.GeoAllow.coordinates || formData.GeoAllow.coordinates.length !== 2 || 
            formData.GeoAllow.coordinates.some(coord => coord === null || coord === undefined)) {
            allErrors.coordinates = 'Valid coordinates are required';
        }

        return allErrors;
    };

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
        
            const newFormData = {
                name: event?.name || '',
                description: event?.description || '',
                type: event?.type || 'public',
                eventType: event?.eventType || '',
                customAttendance: event?.customAttendance ?? false,
                metadata: {
                    name: event?.metadata?.name || '',
                    description: event?.metadata?.description || '',
                    imageUrl: event?.metadata?.imageUrl || null,
                },
                location: event?.location || '',
                GeoAllow: {
                    location: event?.GeoAllow?.location || '',
                    coordinates: event?.GeoAllow?.coordinates || [null, null],
                },
                allowGuest: event?.allowGuest ?? false,
                allowLogin: event?.allowLogin ?? true,
                allowMemberLogin: event?.allowMemberLogin ?? false,
                seatsAvailable: event?.seatsAvailable || 0,
                totalregisteredSeats: event?.totalregisteredSeats || 0,
                registrationFields: cleanedContainer?.registrationFields || [],
                eventStatus: event?.eventStatus || 'Draft',
                startingDate: formatDate(event?.startingDate) || '',
                endingDate: formatDate(event?.endingDate) || '',
                paymentType: event?.paymentType || 'Free',
                priceConfig: {
                    type: event?.priceConfig?.type || 'fixed',
                    amount: event?.priceConfig?.amount || 0,
                    dependantField: event?.priceConfig?.dependantField || '',
                },
                registrationStartDate: formatDate(event?.registrationStartDate) || '',
                registrationEndDate: formatDate(event?.registrationEndDate) || '',
            };
            setFormData(newFormData);
            
            // Set uploaded image if it exists in metadata
            if (event?.metadata?.imageUrl) {
                setUploadedImages(event.metadata.imageUrl);
            }
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        
        setFormData((prev) => ({ ...prev, [name]: fieldValue }));
        
        // Mark field as touched
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        
        // Validate field and update errors
        const fieldErrors = validateField(name, fieldValue, { ...formData, [name]: fieldValue });
        setErrors(prev => {
            const newErrors = { ...prev };
            // Remove existing errors for this field
            delete newErrors[name];
            // Add new errors if any
            return { ...newErrors, ...fieldErrors };
        });
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

                // Automatically set type to "number" when valueType is "attendanceInput"
                if (fieldPath === "valueType" && value === "attendanceInput") {
                    field.type = "number";
                }
            }
    
            updatedFields[index] = field;
            return { ...prevState, registrationFields: updatedFields };
        });
        
        // Clear related errors
        const errorKey = `registrationField.${index}.${fieldPath}`;
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
        });
    };
    
    function formatDate(dateString) {
        if (!dateString) return '';
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
                            ...(field.options || []),
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
        
        // Clear related errors
        setErrors(prev => {
            const newErrors = { ...prev };
            Object.keys(newErrors).forEach(key => {
                if (key.startsWith(`registrationField.${fieldIndex}.`)) {
                    delete newErrors[key];
                }
            });
            return newErrors;
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
                    [name]: value,
                },
            };
        });
        
        // Mark field as touched and validate
        const fieldName = `metadata.${name}`;
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        
        const fieldErrors = validateField(fieldName, value, formData);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return { ...newErrors, ...fieldErrors };
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
        
        // Validate location field
        if (name === "location") {
            setTouchedFields(prev => ({ ...prev, location: true }));
            const fieldErrors = validateField('location', value, formData);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.location;
                return { ...newErrors, ...fieldErrors };
            });
        }
    };
    
    function handlePriceConfigChange(event) {
        const { name, value } = event.target;
    
        // Update the nested priceConfig object
        setFormData((prevFormData) => ({
            ...prevFormData,
            priceConfig: {
                ...prevFormData.priceConfig,
                [name]: value,
            },
        }));
        
        // Validate price config fields
        const fieldName = `priceConfig.${name}`;
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        
        const fieldErrors = validateField(fieldName, value, formData);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return { ...newErrors, ...fieldErrors };
        });
    }
    
    const addFormulaField = (fieldIndex) => {
        setFormData((prev) => {
            const updatedFields = prev.registrationFields.map((field, index) => {
                if (index === fieldIndex) {
                    return {
                        ...field,
                        formula: [
                            ...(field.formula || []),
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
      
    // Image upload functions
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            // Validate file types and sizes
            const validFiles = acceptedFiles.filter(file => {
                const isValidType = file.type.startsWith('image/');
                const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
                
                if (!isValidType) {
                    toast.error(`${file.name} is not a valid image file`);
                    return false;
                }
                if (!isValidSize) {
                    toast.error(`${file.name} is too large. Maximum size is 10MB`);
                    return false;
                }
                return true;
            });
            
            setImages([...images, ...validFiles]);
        },
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false
    });
    
    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };
    
    const handleRemoveExistingImage = () => {
        setUploadedImages(null);
        setFormData((prev) => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                imageUrl: null,
            }
        }));
    };
    
    const handleUploadImages = async (index) => {
        try {
            const image = images[index];
            console.log(`Generating signed URL for ${image.name}`);
    
            // Generate signed URL for the image upload
            const signedUrlResponse = await generateSignedUrl({
                title: image.name,
                mediaType: "image",
                ext: image.name.split('.').pop(),
                active: true,
                uploadStatus: "progressing",
                uploadProgress: 0,
            });
    
            if (!signedUrlResponse) {
                throw new Error('Signed URL data is undefined');
            }
    
            const signedUrl = signedUrlResponse.signedUrl;
            const mediaId = signedUrlResponse.media._id;
    
            console.log("Signed URL generated:", signedUrl);
            console.log("Media ID generated:", mediaId);
    
            setMediaId(mediaId);
    
            // Proceed with uploading the image to the signed URL
            await axios.put(signedUrl, image, {
                headers: {
                    'Content-Type': image.type
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [image.name]: progress }));
    
                    // Update media status when the upload is complete
                    if (progress === 100) {
                        updateMediaStatus({
                            mediaType: "image",
                            title: image.name,
                            ext: image.name.split('.').pop(),
                            active: true,
                            uploadStatus: "completed",
                            uploadProgress: 100,
                        });
                    }
                }
            });
    
            // Add the uploaded image's URL to the list
            const imageUrl = `${import.meta.env.VITE_MEDIA_BASE_URL || 'https://media.nexalogics.in/'}${mediaId}.${image.name.split('.').pop()}`;
            console.log("Image URL:", imageUrl);
            setUploadedImages(imageUrl);
            
            // Update formData with the image URL in metadata
            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    imageUrl: imageUrl
                }
            }));
            
            // Remove uploaded image from pending list
            setImages(prev => prev.filter((_, i) => i !== index));
            
            toast.success('Image uploaded successfully!');
    
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('An error occurred while uploading the image. Please try again.');
        }
    };

    // Enhanced validation functions for each tab
    const validateCreateEvent = () => {
        const requiredFields = ['name', 'description', 'type', 'eventType', 'seatsAvailable'];
        const tabErrors = {};

        requiredFields.forEach(field => {
            const fieldErrors = validateField(field, formData[field], formData);
            Object.assign(tabErrors, fieldErrors);
        });

        return Object.keys(tabErrors).length === 0;
    };
    
    const validateEventDetails = () => {
        const requiredFields = ['metadata.name', 'metadata.description', 'paymentType'];
        const tabErrors = {};
        
        requiredFields.forEach(field => {
            let value;
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                value = formData[parent]?.[child];
            } else {
                value = formData[field];
            }
            const fieldErrors = validateField(field, value, formData);
            Object.assign(tabErrors, fieldErrors);
        });
        
        // Validate price config for paid events
        if (formData.paymentType !== 'Free' && formData.priceConfig?.type === 'fixed') {
            const priceErrors = validateField('priceConfig.amount', formData.priceConfig.amount, formData);
            Object.assign(tabErrors, priceErrors);
        }
        
        return Object.keys(tabErrors).length === 0;
    };
    
    const validateLocationDetails = () => {
        const locationErrors = validateField('location', formData.location, formData);
        const hasValidCoordinates = formData.GeoAllow.coordinates && 
            formData.GeoAllow.coordinates.length === 2 && 
            formData.GeoAllow.coordinates.every(coord => coord !== null && coord !== undefined);
        
        return Object.keys(locationErrors).length === 0 && hasValidCoordinates;
    };
    
    const validateRegistrationDetails = () => {
        const dateFields = ['registrationStartDate', 'registrationEndDate'];
        const tabErrors = {};
        
        dateFields.forEach(field => {
            const fieldErrors = validateField(field, formData[field], formData);
            Object.assign(tabErrors, fieldErrors);
        });
        
        // Validate registration fields
        const hasInvalidFields = formData.registrationFields.some(
            (field) =>
                !field.name || field.name.trim() === '' ||
                !field.displayName || field.displayName.trim() === '' ||
                !field.type || field.type.trim() === '' ||
                !field.valueType || field.valueType.trim() === ''
        );
        
        return Object.keys(tabErrors).length === 0 && !hasInvalidFields;
    };    
    
    const validateScheduleEvent = () => {
        const dateFields = ['startingDate', 'endingDate'];
        const tabErrors = {};
        
        dateFields.forEach(field => {
            const fieldErrors = validateField(field, formData[field], formData);
            Object.assign(tabErrors, fieldErrors);
        });
        
        return Object.keys(tabErrors).length === 0;
    };

    const handleContinue = () => {
        let isValid = false;
        let errorMessage = 'Please complete all required fields before continuing.';
        
        switch (activeTab) {
            case 0:
                isValid = validateCreateEvent();
                errorMessage = 'Please complete all required basic details.';
                break;
            case 1:
                isValid = validateEventDetails();
                errorMessage = 'Please complete all required advanced details.';
                break;
            case 2:
                isValid = validateRegistrationDetails();
                errorMessage = 'Please complete all required registration details.';
                break;
            case 3:
                isValid = validateLocationDetails();
                errorMessage = 'Please provide valid location and coordinates.';
                break;
            case 4:
                // Event permissions - no specific validation needed
                isValid = true;
                break;
            case 5:
                isValid = validateScheduleEvent();
                errorMessage = 'Please provide valid event dates.';
                break;
            default:
                isValid = true;
        }
        
        if (!isValid) {
            toast.error(errorMessage);
            return;
        }
        
        if (activeTab < tabs.length - 1) {
            setActiveTab((prev) => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (activeTab > 0) {
            setActiveTab((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Final validation
        const allErrors = validateAllFields();
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            toast.error('Please fix all validation errors before submitting.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Clean the form data before submission
            const cleanedFormData = {
                ...formData,
                // Ensure coordinates are properly formatted
                GeoAllow: {
                    ...formData.GeoAllow,
                    coordinates: formData.GeoAllow.coordinates.map(coord => 
                        coord === null || coord === undefined ? 0 : parseFloat(coord)
                    )
                },
                // Ensure numeric fields are properly typed
                seatsAvailable: parseInt(formData.seatsAvailable),
                totalregisteredSeats: parseInt(formData.totalregisteredSeats),
                priceConfig: {
                    ...formData.priceConfig,
                    amount: parseFloat(formData.priceConfig.amount) || 0
                }
            };
            
            await saveEvent(cleanedFormData);
            toast.success(event ? 'Event updated successfully!' : 'Event created successfully!');
            navigate(`/event/list`);
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('Error submitting form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { 
            name: 'Basic Details', 
            component: <CreateEvent 
                formData={formData} 
                handleChange={handleChange} 
                isSubmitting={isSubmitting}
                errors={errors}
            /> 
        },
        { 
            name: 'Advanced Details', 
            component: <EventDetails 
                formData={formData} 
                handleChange={handleChange} 
                handleMetadataChange={handleMetadataChange} 
                handlePriceConfigChange={handlePriceConfigChange} 
                isSubmitting={isSubmitting}
                errors={errors}
                // Pass image upload functions and state
                images={images}
                uploadedImages={uploadedImages}
                uploadProgress={uploadProgress}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                handleRemoveImage={handleRemoveImage}
                handleRemoveExistingImage={handleRemoveExistingImage}
                handleUploadImages={handleUploadImages}
            /> 
        },
        { 
            name: 'Registration Details', 
            component: <RegistrationDetails 
                formData={formData} 
                handleChange={handleChange} 
                handleOptionChange={handleOptionChange}
                handleRegistrationChange={handleRegistrationChange} 
                handleFormulaChange={handleFormulaChange} 
                addField={addField} 
                deleteField={deleteField} 
                addOption={addOption} 
                deleteOption={deleteOption} 
                addFormulaField={addFormulaField} 
                deleteFormula={deleteFormula} 
                isSubmitting={isSubmitting}
                errors={errors}
            /> 
        },
        { 
            name: 'Event Location', 
            component: <GeoAllowForm 
                formData={formData} 
                handleLocationChange={handleLocationChange} 
                handleChange={handleChange} 
                isSubmitting={isSubmitting}
                errors={errors}
            /> 
        },
        { 
            name: 'Access and Login Options', 
            component: <EventPermissions 
                formData={formData} 
                handleChange={handleChange} 
                isSubmitting={isSubmitting}
                errors={errors}
            /> 
        },
        { 
            name: 'Schedule', 
            component: <EventRegistrationDates 
                formData={formData} 
                handleChange={handleChange} 
                isSubmitting={isSubmitting}
                errors={errors}
            /> 
        },
    ];

    if (isSubmitting || isLoading){
        return <LoadingScreen />;
    }

    console.log("formData", formData);
    console.log("errors", errors);

    return (
        <div className="flex flex-col w-full p-6 bg-card text-text-color rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text-color mb-2">
                    {event ? 'Edit Event' : 'Create Event'}
                </h1>
                <p className="text-gray-600">
                    {event ? 'Update your event details' : 'Create a new event by filling out the information below'}
                </p>
            </div>

            {/* Progress indicator */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm text-gray-600">{activeTab + 1} of {tabs.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((activeTab + 1) / tabs.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <nav className="mb-6">
                <ul className="flex flex-wrap justify-center list-none p-0 m-0 bg-secondary-card border-b border-border rounded-t-lg">
                    {tabs.map((tab, index) => (
                        <li key={index} className="flex-1 min-w-0">
                            <button
                                className={`py-3 px-2 block w-full text-center text-sm font-medium transition-colors ${
                                    activeTab === index
                                        ? 'text-secondary border-b-2 border-secondary bg-primary'
                                        : 'text-text-color hover:border-b-2 hover:border-secondary hover:text-secondary hover:bg-primary'
                                }`}
                                onClick={() => setActiveTab(index)}
                            >
                                <span className="truncate">{tab.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="flex-1 mb-6">
                {tabs[activeTab].component}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
                {/* Previous Button */}
                {activeTab > 0 ? (
                    <button
                        className="bg-secondary-button-color hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors font-medium"
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>
                ) : (
                    <div></div>
                )}
                
                {/* Continue/Submit Button */}
                <button
                    className="bg-secondary-button-color hover:bg-secondary-hover text-white py-2 px-6 rounded-lg transition-colors font-medium ml-auto"
                    onClick={handleContinue}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : (activeTab < tabs.length - 1 ? 'Continue' : 'Submit')}
                </button>
            </div>
        </div>
    );
}

export default EventForm;