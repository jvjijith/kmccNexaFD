import React, { useState, useEffect } from 'react';
import { usePostData, usePutData, useGetData } from '../../common/api';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';

function VarientForm({ typeData, productId, variantId }) {
  
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: "",
    color: "",
    size: "",
    productId: "",
    images: [],
    notes: [],
    model: "",
    RFQ: false,
    HSN: "",
    productCode: "",
    active: true
});
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isRFQ, setRFQ] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);

  const mutationHook = variantId ? usePutData : usePostData;
  const api_url = variantId ? `/variant/update/${variantId}` : '/variant/add';
  const api_key = variantId ? 'updateProduct' : 'addProduct';
  const { mutate: saveProduct, isLoading: isSaving } = mutationHook(api_key, api_url);
  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', '/media/updateMediaStatus');
  
  // Fetch variant data if variantId is provided
  const { data: variantData, refetch: refetchVariant } = useGetData('variant', `/variant/${variantId}`);

  useEffect(() => {
    if (variantId && variantData) {
      // Pre-fill the form with the fetched variant data
      setProductData(variantData);
      setUploadedImages(variantData.images || []);
      setNotes(variantData.notes || []);
      setRFQ(variantData.RFQ || false);
    }
  }, [variantId, variantData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedUploadedImages = variantData?.images.map((item) => {
      const { _id, ...rest } = item;
      return rest;
    });

    const cleanedNotes = variantData?.notes.map((item) => {
      const { _id, ...rest } = item;
      return rest;
    });

    const { _id, __v, updated_at, created_at, ...cleanedData } = productData;

    const variantPayload = variantId?{
      ...cleanedData,
      images: cleanedUploadedImages,
      notes: cleanedNotes,
      RFQ: isRFQ
    }:{
      ...productData,
      images: uploadedImages,
      notes: notes,
      RFQ: isRFQ,
      productId: productId
    };

    try {
      await saveProduct(variantPayload);
      // alert('Variant saved successfully!');
      
        navigate(`/variant/list`, { state: { productId } });
     
    } catch (error) {
      console.error('Error saving variant:', error);
      // alert('An error occurred while saving the variant. Please try again.');
      
        navigate(`/product/list`);
      
    }
  };

  const handleImagesChange = (acceptedFiles) => {
    setImages(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) })));
  };

  const handleNotesChange = (index, field, value) => {
    const newNotes = [...notes];
    newNotes[index][field] = value;
    setNotes(newNotes);
  };

  const addNotes = () => {
    setNotes([...notes, { name: '', description: '' }]);
  };

  const removeNotes = (index) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
  };

  const handleToggle = (field) => {
    if (field === 'RFQ') {
      setRFQ(!isRFQ);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    }
  });

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUploadImages = async (event) => {
    event.preventDefault(); // Prevent form submission

    try {
      for (const image of images) {
        console.log(`Generating signed URL for ${image.name}`);

        // Generate a signed URL
        const signedUrlResponse = await generateSignedUrl({
          title: image.name,
          mediaType: "image",
          active: true,
          uploadStatus: "progressing",
          uploadProgress: 0,
        });

        console.log('Signed URL Response:', signedUrlResponse);

        if (!signedUrlResponse) {
          throw new Error('Signed URL data is undefined');
        }

        const signedUrlData = signedUrlResponse;
        const signedUrl = signedUrlData.signedUrl;
        const mediaId = signedUrlData.media._id;

        console.log("API Data:", signedUrlData);
        console.log("Signed URL generated:", signedUrl);
        console.log("Media ID generated:", mediaId);

        // Proceed with uploading the image to the signed URL
        const formData = new FormData();
        formData.append('file', image);

        await axios.put(signedUrl, image, {
          headers: {
            'Content-Type': image.type
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [image.name]: progress }));

            // Update media status
            updateMediaStatus({
              media: {
                _id: mediaId,
                mediaType: "image",
                title: image.name,
                active: true,
                uploadStatus: progress === 100 ? "completed" : "progressing",
                uploadProgress: progress,
              }
            });
          }
        });

        // Add the uploaded image's URL to the list
        setUploadedImages(prev => [
          ...prev,
          {
            url: signedUrl.split("?")[0], // Extract the base URL for the image
            altText: image.name
          }
        ]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // alert('An error occurred while uploading the image. Please try again.');
    }
  };

  if (isSaving || (variantId && !variantData)) {
    return <LoadingScreen />;
  }

  console.log(productId);
  console.log(productData);
  console.log(uploadedImages);
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Varient Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Varient Name"
                autoComplete="off"
                value={productData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Varient Color *</label>
              <input
                type="text"
                name="color"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Varient Color"
                autoComplete="off"
                value={productData.color}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
    <div className="w-full sm:w-1/2 p-4">
      <div className="mb-4">
        <label className="block w-full mb-2 text-white">Size *</label>
        <input
                type="text"
                name="size"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter Varient Size"
                autoComplete="off"
                value={productData.size}
                onChange={handleChange}
              />
      </div>
    </div>
    
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">HSN *</label>
              <input
                type="text"
                name="HSN"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                placeholder="Enter HSN"
                autoComplete="off"
                value={productData.HSN}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Model *</label>
              <input
                type="text"
                name="model"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Model"
                autoComplete="off"
                value={productData.model}
                onChange={handleChange}
                
              />
            </div>
          </div>
      
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-white">Product Code *</label>
              <input
                type="text"
                name="productCode"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
                placeholder="Enter Product Code"
                autoComplete="off"
                value={productData.productCode}
                onChange={handleChange}
                
              />
            </div>
          </div>
    
        </div>

        {/* Toggle Buttons */}
      <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            {" "}
            {/* col-sm-6 */}
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" name="RFQ"
                id="RFQ"
                checked={isRFQ}
                onChange={() => handleToggle('RFQ')} />
                <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-white dark:text-white">
                RFQ
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="w-full p-4">
      <label className="block w-full mb-2 text-white">Images</label>
      <div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-sidebar-card-top text-white border-2 border-nexa-gray rounded mb-4">
        <input {...getInputProps()} />
        <p>Drag & drop images here, or click to select files</p>
        <div className="w-full p-4">
          {images.map((file, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <span>{file.name}</span>
              <progress value={uploadProgress[file.name] || 0} max="100">{uploadProgress[file.name] || 0}%</progress>
              <button className="ml-2 text-red-500" onClick={() => handleRemoveImage(index)}>X</button>
            </div>
          ))}
        </div>
        <button className="mt-4 bg-blue-500 text-white p-2 rounded" onClick={handleUploadImages}>Upload</button>
      </div>
      </div>

      

        {/* Bank Details */}
        <div className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-white">Notes</label>
          <button type="button" className="bg-black text-white px-4 py-2 rounded" onClick={addNotes}>Add</button>
          </div>
          <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
            {(notes.length===0)&&<p>No notes added</p>}
          {notes.map((note, index) => (
            <div key={index} className="flex flex-wrap items-center mb-4 p-2  rounded-lg">
              <input
                type="text"
                placeholder="Note Name"
                value={note.name}
                onChange={(e) => handleNotesChange(index, 'name', e.target.value)}
                className="block w-2/5 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              />
              <textarea
                type="text"
                placeholder="Note Description"
                value={note.description}
                onChange={(e) => handleNotesChange(index, 'description', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white ml-2"
              />
              <button type="button" className="bg-black text-white px-4 py-2 rounded ml-2" onClick={() => removeNotes(index)}>Remove</button>
            </div>
          ))}
          </div>
        </div>

        

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
            {isSaving  ? 'Saving...' : 'Save'}
          </button>
        </div>

      </form>

      

    </div>
  );
}

export default VarientForm;
