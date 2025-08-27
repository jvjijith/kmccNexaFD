import React, { useState, useEffect, useRef } from 'react';
import { useGetData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../layout/ui/loading/loading';
import QrScanner from 'qr-scanner';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Scanner() {
    const [scannedUrl, setScannedUrl] = useState('');
    const [eventId, setEventId] = useState('');
    const [registrationId, setRegistrationId] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [attendanceUpdate, setAttendanceUpdate] = useState(1);
    const [qrScanner, setQrScanner] = useState(null);
    const [html5Scanner, setHtml5Scanner] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [scannerType, setScannerType] = useState('qr-scanner'); // 'qr-scanner' or 'html5-qrcode'

    const videoRef = useRef(null);
    const html5ScannerRef = useRef(null);

    // API hooks for fetching registration data - using the correct format
    const {
        data: registrationData,
        loading: registrationLoading,
        error: registrationError,
        refetch: fetchRegistration
    } = useGetData("registration", `/event-registrations/${registrationId}`, registrationId);

    // API hooks for fetching event data - using the correct format
    const {
        data: eventData,
        loading: eventLoading,
        error: eventError,
        refetch: fetchEvent
    } = useGetData("event", `/events/event/${eventId}`, eventId);

    // API hook for updating attendance
    const {
        mutate: updateAttendance,
        isLoading: updateLoading,
        isError: attendanceError
    } = usePutData("event-registrations", `/event-registrations/${registrationId}`);

    // Parse URL to extract eventId and registrationId
    const parseScannedUrl = (url) => {
        try {
            console.log('Parsing URL:', url);
            
            // Updated regex to match the correct URL format
            const urlPattern = /\/event-verification\/([^\/]+)\/([^\/]+)(?:\/|$)/;
            const match = url.match(urlPattern);
            
            if (match) {
                const extractedEventId = match[1];
                const extractedRegistrationId = match[2];
                
                console.log('Extracted Event ID:', extractedEventId);
                console.log('Extracted Registration ID:', extractedRegistrationId);
                
                setEventId(extractedEventId);
                setRegistrationId(extractedRegistrationId);
                setScannedUrl(url);
                
                return true;
            }
            
            console.log('URL pattern did not match');
            return false;
        } catch (error) {
            console.error('Error parsing URL:', error);
            return false;
        }
    };

    // Refetch data when IDs are set
    useEffect(() => {
        if (registrationId) {
            console.log('Fetching registration data for ID:', registrationId);
            fetchRegistration();
        }
    }, [registrationId, fetchRegistration]);

    useEffect(() => {
        if (eventId) {
            console.log('Fetching event data for ID:', eventId);
            fetchEvent();
        }
    }, [eventId, fetchEvent]);

    // Check QR Scanner support
    useEffect(() => {
        const checkQrSupport = async () => {
            try {
                const hasCamera = await QrScanner.hasCamera();
                console.log('Camera available:', hasCamera);
                if (!hasCamera) {
                    console.log('No camera found, defaulting to HTML5 scanner');
                    setCameraError('No camera found on this device');
                    setScannerType('html5-qrcode');
                } else {
                    console.log('Camera found, using primary QR scanner');
                    setScannerType('qr-scanner');
                }
            } catch (error) {
                console.error('Error checking camera:', error);
                console.log('Camera check failed, defaulting to HTML5 scanner');
                setCameraError('Unable to access camera with primary scanner, using alternative...');
                setScannerType('html5-qrcode');
            }
        };

        checkQrSupport();
    }, []);

    // Initialize QR Scanner (primary)
    const initializeQrScanner = async () => {
        console.log('Initializing QR Scanner...');
        console.log('Video ref current:', videoRef.current);
        console.log('Scanner type:', scannerType);

        if (!videoRef.current) {
            console.error('Video element not found');
            return null;
        }

        try {
            // Destroy existing scanner if any
            if (qrScanner) {
                qrScanner.destroy();
                setQrScanner(null);
            }

            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    console.log('QR Code detected:', result.data);
                    const isValid = parseScannedUrl(result.data);
                    if (isValid) {
                        stopScanning();
                        toast.success('QR Code scanned successfully!');
                    } else {
                        toast.warning('Invalid QR code format. Please scan a valid event verification QR code.');
                    }
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5,
                }
            );

            console.log('QR Scanner initialized');
            setQrScanner(scanner);
            setCameraError('');
            return scanner;
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            setCameraError('Failed to initialize primary scanner: ' + error.message);
            return null;
        }
    };

    // Initialize HTML5 QR Code Scanner (fallback)
    const initializeHtml5Scanner = () => {
        try {
            console.log('Initializing HTML5 QR Scanner...');

            // Clear existing scanner
            if (html5Scanner) {
                html5Scanner.clear();
                setHtml5Scanner(null);
            }

            // Make sure the element exists
            const readerElement = document.getElementById("qr-reader");
            if (!readerElement) {
                console.error('qr-reader element not found');
                setCameraError('Scanner element not ready, please try again');
                return null;
            }

            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    showZoomSliderIfSupported: true,
                    defaultZoomValueIfSupported: 2,
                },
                false
            );

            scanner.render(
                (decodedText) => {
                    console.log('HTML5 QR Code detected:', decodedText);
                    const isValid = parseScannedUrl(decodedText);
                    if (isValid) {
                        stopScanning();
                        toast.success('QR Code scanned successfully!');
                    } else {
                        toast.warning('Invalid QR code format. Please scan a valid event verification QR code.');
                    }
                },
                (error) => {
                    // Handle scan errors silently - they're too frequent
                    console.debug('HTML5 scan error:', error);
                }
            );

            setHtml5Scanner(scanner);
            setCameraError('');
            console.log('HTML5 QR Scanner initialized');
            return scanner;
        } catch (error) {
            console.error('Error initializing HTML5 scanner:', error);
            setCameraError('Failed to initialize camera: ' + error.message);
            return null;
        }
    };

    // Start scanning
    const startScanning = async () => {
        try {
            console.log('Starting scanner with type:', scannerType);
            setIsScanning(true);
            setCameraError('');

            if (scannerType === 'qr-scanner') {
                // Ensure video element is available by waiting for DOM update
                await new Promise(resolve => setTimeout(resolve, 100));

                console.log('Video element available:', !!videoRef.current);

                if (!videoRef.current) {
                    console.log('Video element not ready, switching to HTML5 scanner...');
                    setScannerType('html5-qrcode');
                    // Wait for DOM update and try HTML5 scanner
                    setTimeout(() => {
                        const html5Scanner = initializeHtml5Scanner();
                        if (!html5Scanner) {
                            setIsScanning(false);
                            setCameraError('Both scanners failed to initialize');
                        }
                    }, 300);
                    return;
                }

                // Try primary scanner first
                let scanner = qrScanner;
                if (!scanner) {
                    scanner = await initializeQrScanner();
                    if (!scanner) {
                        // Fallback to HTML5 scanner
                        console.log('Primary scanner failed, switching to HTML5 scanner...');
                        setScannerType('html5-qrcode');
                        // Wait for the DOM to update and then try HTML5 scanner
                        setTimeout(() => {
                            const html5Scanner = initializeHtml5Scanner();
                            if (!html5Scanner) {
                                setIsScanning(false);
                                setCameraError('Both scanners failed to initialize');
                            }
                        }, 500);
                        return;
                    }
                }

                await scanner.start();
                console.log('QR Scanner started successfully');
                toast.info('Camera started. Point at QR code to scan.');
            } else {
                // Use HTML5 scanner - wait a bit to ensure DOM is ready
                setTimeout(() => {
                    const scanner = initializeHtml5Scanner();
                    if (!scanner) {
                        setIsScanning(false);
                        setCameraError('HTML5 scanner failed to initialize');
                        return;
                    }
                    toast.info('Camera started. Point at QR code to scan.');
                }, 100);
            }
        } catch (error) {
            console.error('Error starting scanner:', error);
            setCameraError('Unable to start camera: ' + error.message);
            toast.error('Unable to access camera. Please check permissions and try again.');
            setIsScanning(false);

            // Try fallback if primary failed
            if (scannerType === 'qr-scanner') {
                console.log('Trying HTML5 scanner as fallback...');
                setScannerType('html5-qrcode');
                setTimeout(() => startScanning(), 1000);
            }
        }
    };

    // Stop scanning
    const stopScanning = () => {
        console.log('Stopping scanner...');
        
        if (qrScanner) {
            qrScanner.stop();
        }
        
        if (html5Scanner) {
            html5Scanner.clear();
            setHtml5Scanner(null);
        }
        
        setIsScanning(false);
        setCameraError('');
    };

    // Handle manual URL input
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            const isValid = parseScannedUrl(manualInput.trim());
            if (!isValid) {
                toast.error('Invalid URL format. Please check the URL and try again.');
            } else {
                setShowManualInput(false);
                setManualInput('');
                toast.success('URL processed successfully!');
            }
        }
    };

    // Update attendance
    const handleAttendanceUpdate = async () => {
        if (!registrationData || attendanceUpdate <= 0) {
            toast.error('Please enter a valid attendance number');
            return;
        }

        const currentAttendance = registrationData.totalAttendance || 0;
        const newTotalAttendance = currentAttendance + attendanceUpdate;
        
        if (newTotalAttendance > registrationData.totalSeats) {
            toast.error(`Cannot exceed total seats (${registrationData.totalSeats}). Current attendance: ${currentAttendance}`);
            return;
        }

        // Determine new attendance status
        let newAttendanceStatus = registrationData.attendanceStatus;
        if (newTotalAttendance >= registrationData.totalSeats) {
            newAttendanceStatus = 'full';
        } else if (newTotalAttendance > 0) {
            newAttendanceStatus = 'partial';
        }

        const updateData = {
            id: registrationData._id,
            eventId: registrationData.eventId,
            userId: registrationData.userId,
            email: registrationData.email,
            eventData: registrationData.eventData,
            price: registrationData.price,
            currency: registrationData.currency,
            status: registrationData.status,
            paymentStatus: registrationData.paymentStatus,
            totalAttendance: newTotalAttendance,
            totalSeats: registrationData.totalSeats,
            attendanceStatus: newAttendanceStatus
        };

        updateAttendance(updateData, {
            onSuccess: (response) => {
                toast.success(`Attendance updated! Added ${attendanceUpdate} attendee(s).`);
                fetchRegistration(); // Refresh data
                setAttendanceUpdate(1); // Reset to default
            },
            onError: (error) => {
                console.error('Error updating attendance:', error);
                toast.error('Failed to update attendance. Please try again.');
            }
        });
    };

    // Reset scanner
    const resetScanner = () => {
        stopScanning();
        setScannedUrl('');
        setEventId('');
        setRegistrationId('');
        setManualInput('');
        setShowManualInput(false);
        setAttendanceUpdate(1);
        setCameraError('');
    };

    // Test function with the provided URL
    const testWithSampleUrl = () => {
        const testUrl = "https://storeapi-vewo.onrender.com/event-verification/68164fd62bd13874f7cc0a4f/68618ed7db3cf777d297c684";
        const isValid = parseScannedUrl(testUrl);
        if (isValid) {
            toast.success('Test URL processed successfully!');
        } else {
            toast.error('Test URL parsing failed');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('Cleaning up scanner...');
            if (qrScanner) {
                qrScanner.destroy();
            }
            if (html5Scanner) {
                html5Scanner.clear();
            }
        };
    }, [qrScanner, html5Scanner]);

    // Show loading screen while fetching data
    if ((registrationLoading || eventLoading) && (eventId && registrationId)) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-primary-bg p-4">
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className="mt-16"
            />
            
            {/* Header */}
            <div className="max-w-md mx-auto mb-6">
                <h1 className="text-2xl font-bold text-text-color text-center mb-2">
                    📱 Event Scanner
                </h1>
                <p className="text-gray-500 text-center text-sm">
                    Scan QR codes to verify event registrations
                </p>
            </div>

            {/* Scanner Section */}
            {!scannedUrl && (
                <div className="max-w-md mx-auto bg-secondary-card rounded-lg p-6 mb-6 shadow-lg">
                    <div className="text-center mb-4">
                        <h2 className="text-lg font-semibold text-text-color mb-4">
                            🎯 Scan QR Code
                        </h2>
                        
                        {/* Scanner Type Indicator */}
                        <div className="mb-2 text-xs text-gray-500">
                            Scanner: {scannerType === 'qr-scanner' ? 'Primary' : 'Alternative'}
                        </div>

                        {/* Scanner Type Switch Button */}
                        <div className="mb-4">
                            <button
                                onClick={() => {
                                    const newType = scannerType === 'qr-scanner' ? 'html5-qrcode' : 'qr-scanner';
                                    console.log('Switching scanner type to:', newType);
                                    setScannerType(newType);
                                    setCameraError('');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                🔄 Switch to {scannerType === 'qr-scanner' ? 'Alternative' : 'Primary'} Scanner
                            </button>
                        </div>

                        {/* Camera Error Display */}
                        {cameraError && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-600 text-sm">⚠️ {cameraError}</p>
                            </div>
                        )}
                        
                        {!isScanning ? (
                            <div className="space-y-4">
                                <button
                                    onClick={startScanning}
                                    className="w-full bg-secondary hover:bg-secondary/80 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    📷 Start Camera Scanner
                                </button>

                                {/* <button
                                    onClick={testWithSampleUrl}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    🧪 Test with Sample URL
                                </button>
                                
                                <div className="text-gray-500 text-sm">or</div> */}
                                
                                <button
                                    onClick={() => setShowManualInput(!showManualInput)}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    ✏️ Enter URL Manually
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Always render both scanner containers, but show only the active one */}
                                <div className={`relative ${scannerType === 'qr-scanner' ? 'block' : 'hidden'}`}>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-64 bg-black rounded-lg object-cover"
                                        playsInline
                                        muted
                                        autoPlay
                                    />

                                    {/* Scanning overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-48 h-48 border-2 border-secondary border-dashed rounded-lg flex items-center justify-center animate-pulse">
                                            <div className="text-white text-center">
                                                <div className="text-2xl mb-2">📱</div>
                                                <div className="text-sm">Position QR code here</div>
                                                <div className="text-xs mt-1 opacity-75">Auto-detection enabled</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`relative ${scannerType === 'html5-qrcode' ? 'block' : 'hidden'}`}>
                                    <div
                                        id="qr-reader"
                                        ref={html5ScannerRef}
                                        className="w-full"
                                    ></div>
                                </div>

                                <button
                                    onClick={stopScanning}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    ❌ Stop Scanner
                                </button>

                                <p className="text-sm text-gray-500 text-center">
                                    Point your camera at the QR code for automatic detection
                                </p>

                                {/* Debug info */}
                                <div className="text-xs text-gray-400 text-center">
                                    Scanner Status: {isScanning ? 'Active' : 'Inactive'} | Type: {scannerType}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Input Form */}
                    {showManualInput && (
                        <form onSubmit={handleManualSubmit} className="mt-4 space-y-4 border-t pt-4">
                            <div>
                                <label className="block text-sm font-medium text-text-color mb-2">
                                    📝 Enter Event Verification URL
                                </label>
                                <input
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="https://example.com/event-verification/eventId/registrationId"
                                    className="w-full p-3 bg-primary-bg border border-border rounded-lg text-text-color focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-secondary hover:bg-secondary/80 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    ✅ Verify URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManualInput(false);
                                        setManualInput('');
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Event and Registration Details */}
            {scannedUrl && eventData && registrationData && (
                <div className="max-w-md mx-auto space-y-4">
                    {/* Event Details Card */}
                    <div className="bg-secondary-card rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-text-color mb-4 flex items-center gap-2">
                            🎉 Event Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-500">Event Name:</span>
                                <p className="font-medium text-text-color">{eventData.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Description:</span>
                                <p className="text-text-color text-sm">{eventData.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Type:</span>
                                    <p className="font-medium text-text-color capitalize">{eventData.type}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <p className="font-medium text-text-color capitalize">{eventData.eventStatus}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Start Date:</span>
                                    <p className="font-medium text-text-color text-sm">
                                        {new Date(eventData.startingDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">End Date:</span>
                                    <p className="font-medium text-text-color text-sm">
                                        {new Date(eventData.endingDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {eventData.location && (
                                <div>
                                    <span className="text-sm text-gray-500">Location:</span>
                                    <p className="font-medium text-text-color">{eventData.location}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Registration Details Card */}
                    <div className="bg-secondary-card rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-text-color mb-4 flex items-center gap-2">
                            👤 Registration Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-500">Email:</span>
                                <p className="font-medium text-text-color">{registrationData.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Price:</span>
                                    <p className="font-medium text-text-color">
                                        {registrationData.currency} {registrationData.price}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Payment:</span>
                                    <p className={`font-medium capitalize ${
                                        registrationData.paymentStatus === 'paid' ? 'text-green-600' : 
                                        registrationData.paymentStatus === 'free' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                        {registrationData.paymentStatus}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <p className={`font-medium capitalize ${
                                        registrationData.status === 'confirmed' ? 'text-green-600' : 
                                        registrationData.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {registrationData.status}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Registration Date:</span>
                                    <p className="font-medium text-text-color text-sm">
                                        {new Date(registrationData.registrationDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Event Data Fields */}
                            {registrationData.eventData && registrationData.eventData.length > 0 && (
                                <div className="border-t pt-3 mt-3">
                                    <span className="text-sm text-gray-500 mb-2 block">Additional Information:</span>
                                    <div className="space-y-2">
                                        {registrationData.eventData.map((field, index) => (
                                            <div key={index} className="flex justify-between">
                                                <span className="text-sm text-gray-500">{field.fieldName}:</span>
                                                <span className="text-sm text-text-color font-medium">
                                                    {field.fieldValue ? String(field.fieldValue) : 'N/A'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Management Card */}
                    <div className="bg-secondary-card rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-text-color mb-4 flex items-center gap-2">
                            📊 Attendance Management
                        </h3>
                        
                        {/* Attendance Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>Current Attendance</span>
                                <span>{registrationData.totalAttendance || 0} / {registrationData.totalSeats}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${Math.min(100, ((registrationData.totalAttendance || 0) / (registrationData.totalSeats || 1)) * 100)}%`
                                    }}
                                ></div>
                            </div>
                            <div className="text-center mt-2">
                                <span className={`text-sm font-medium ${
                                    (registrationData.totalAttendance || 0) >= registrationData.totalSeats 
                                        ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {(registrationData.totalAttendance || 0) >= registrationData.totalSeats 
                                        ? '🔴 Event Full' : '🟢 Seats Available'}
                                </span>
                            </div>
                        </div>

                        {/* Attendance Update */}
                        {(registrationData.totalAttendance || 0) < registrationData.totalSeats && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-color mb-2">
                                        Add Attendees:
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setAttendanceUpdate(Math.max(1, attendanceUpdate - 1))}
                                            className="bg-gray-600 hover:bg-gray-700 text-white w-10 h-10 rounded-lg font-bold"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={registrationData.totalSeats - (registrationData.totalAttendance || 0)}
                                            value={attendanceUpdate}
                                            onChange={(e) => setAttendanceUpdate(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="flex-1 p-2 bg-primary-bg border border-border rounded-lg text-text-color text-center focus:outline-none focus:ring-2 focus:ring-secondary"
                                        />
                                        <button
                                            onClick={() => setAttendanceUpdate(Math.min(
                                                registrationData.totalSeats - (registrationData.totalAttendance || 0),
                                                attendanceUpdate + 1
                                            ))}
                                            className="bg-gray-600 hover:bg-gray-700 text-white w-10 h-10 rounded-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleAttendanceUpdate}
                                    disabled={updateLoading}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {updateLoading ? (
                                        <>⏳ Updating...</>
                                    ) : (
                                        <>✅ Update Attendance (+{attendanceUpdate})</>
                                    )}
                                </button>
                            </div>
                        )}

                        {(registrationData.totalAttendance || 0) >= registrationData.totalSeats && (
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-red-600 font-medium">🚫 Event is at full capacity</p>
                                <p className="text-red-500 text-sm">No more attendees can be added</p>
                            </div>
                        )}
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={resetScanner}
                        className="w-full max-w-md mx-auto bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        🔄 Scan Another QR Code
                    </button>
                </div>
            )}

            {/* Error States */}
            {scannedUrl && (registrationError || eventError) && (
                <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error Loading Data</h3>
                    <p className="text-red-600 text-sm mb-4">
                        {registrationError || eventError || 'Failed to load event or registration data'}
                    </p>
                    <div className="text-xs text-gray-600 mb-4">
                        <p>Event ID: {eventId}</p>
                        <p>Registration ID: {registrationId}</p>
                    </div>
                    <button
                        onClick={resetScanner}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        🔄 Try Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default Scanner;