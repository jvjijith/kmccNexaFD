import React, { useState, useEffect } from 'react';
import { usePostData, usePutData, useGetData } from '../../common/api';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import Select from 'react-select';

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
  const [mediaId, setMediaId] = useState([]);
  const [loading, setLoading] = useState(true);

  const mutationHook = variantId ? usePutData : usePostData;
  const api_url = variantId ? `/variant/update/${variantId}` : '/variant/add';
  const api_key = variantId ? 'updateProduct' : 'addProduct';
  const { mutate: saveProduct, isLoading: isSaving } = mutationHook(api_key, api_url);
  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });
  const { data: productDatas, isLoading: isProductLoading } = useGetData('product', '/product', {});
  
  // Fetch variant data if variantId is provided
  const { data: variantData, refetch: refetchVariant } = useGetData('variant', `/variant/${variantId}`);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSelectChange = (field) => (selectedOption) => {
    console.log(selectedOption);
    setProductData((prevData) => ({
      ...prevData,
      [field]: selectedOption.value,
    }));
  };

  const productOptions = productDatas?.products?.map((product) => ({
    value: product._id,
    label: product.name || product._id,
  }));


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
      setLoading(true);
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

  const handleUploadImages = async (index) => {
    try {
        const image = images[index];
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
            thrownewError('Signed URL data is undefined');
        }

        const signedUrlData = signedUrlResponse;
        const signedUrl = signedUrlData.signedUrl;
        const mediaId = signedUrlData.media._id;

        console.log("API Data:", signedUrlData);
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

                // Update media status
                if(progress === 100  )
                updateMediaStatus({
                    // media: {
                        // _id: mediaId,
                        mediaType: "image",
                        title: image.name,
                        active: true,
                        uploadStatus: "completed",
                        uploadProgress: 100,
                    // }
                });
            }
        });

        // Add the uploaded image's URL to the list 
        setUploadedImages(prev => [
            ...prev,
            {
                url: signedUrl.split("?")[0], // Extract the base URL for the imagealtText: image.name
            }
        ]);

    } catch (error) {
        console.error('Error uploading image:', error);
        alert('An error occurred while uploading the image. Please try again.');
    }
};

  if (isSaving || (variantId && !variantData) || loading) {
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
              <label className="float-left inline-block mb-2 text-text-color">Varient Name *</label>
              <input
                type="text"
                name="name"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Varient Name"
                autoComplete="off"
                value={productData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Varient Color *</label>
              <input
                type="text"
                name="color"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
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
        <label className="block w-full mb-2 text-text-color">Size *</label>
        <input
                type="text"
                name="size"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Varient Size"
                autoComplete="off"
                value={productData.size}
                onChange={handleChange}
              />
      </div>
    </div>
    
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">HSN *</label>
              <input
                type="text"
                name="HSN"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
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
              <label className="float-left inline-block mb-2 text-text-color">Model *</label>
              <input
                type="text"
                name="model"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Model"
                autoComplete="off"
                value={productData.model}
                onChange={handleChange}
                
              />
            </div>
          </div>
      
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color">Product Code *</label>
              <input
                type="text"
                name="productCode"
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                placeholder="Enter Product Code"
                autoComplete="off"
                value={productData.productCode}
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block mb-2 text-text-color">Product *</label>
          <Select
                  options={productOptions}
                  placeholder="Select Product"
                  value={productOptions.find((opt) => opt.value === productData.productId)}
                  
            onChange={handleSelectChange('productId')}
                  className="w-full"
                 
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: "black",
                      borderColor: state.isFocused ? "white" : "#D3D3D3",
                      borderBottomWidth: "2px",
                      borderRadius: "0px",
                      height: "40px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      color: "white",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "black",
                      color: "white",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? "#007bff" : "black",
                      color: state.isSelected ? "black" : "white",
                      cursor: "pointer",
                    }),
                  }}
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
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ms-3 text-md font-medium text-text-color dark:text-text-color">
                RFQ
                </span>
              </label>
              <div className="correct"></div>
            </div>
          </div>
        </div>

        <div className="w-full p-4">
  <label className="block w-full mb-2 text-text-color">Images</label><div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-secondary-card text-text-color border-2 border-nexa-gray rounded mb-4">
    <input {...getInputProps()} />
    <p className='text-text-color'>Drag & drop images here, or click to select files</p>
    <div className="w-full p-4">
      {images.map((file, index) => (
        <div key={index} className="flex items-center justify-between mb-2">
          {/* Image preview */}
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-16 h-16 object-cover mr-4"
          />
          <span>{file.name}</span>
          <progress value={uploadProgress[file.name] || 0} max="100" className="flex-1 mx-2">
            {uploadProgress[file.name] || 0}%
          </progress>
          <button
            className="ml-2 text-blue-500"
            onClick={(e) => {
              e.stopPropagation();  // Prevent the event from bubbling up
              e.preventDefault(); 
              handleUploadImages(index);  // Upload only this image
            }}
          >
            Upload
          </button>
          <button
            className="ml-2 text-red-500"
            onClick={(e) => {
              e.stopPropagation();  // Prevent the event from bubbling up
              handleRemoveImage(index);
            }}
          >
            X
          </button>
        </div>
      ))}
    </div>
  </div>
</div>

      

        {/* Bank Details */}
        <div className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color">Notes</label>
          <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded" onClick={addNotes}>Add</button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {(notes.length===0)&&<p className='text-text-color'>No notes added</p>}
          {notes.map((note, index) => (
            <div key={index} className="flex flex-wrap items-center mb-4 p-2  rounded-lg">
              <input
                type="text"
                placeholder="Note Name"
                value={note.name}
                onChange={(e) => handleNotesChange(index, 'name', e.target.value)}
                className="block w-2/5 h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              />
              <textarea
                type="text"
                placeholder="Note Description"
                value={note.description}
                onChange={(e) => handleNotesChange(index, 'description', e.target.value)}
                className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color ml-2"
              />
              <button type="button" className="bg-secondary-button-color text-text-color px-4 py-2 rounded ml-2" onClick={() => removeNotes(index)}>Remove</button>
            </div>
          ))}
          </div>
        </div>

        

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-butt
          olor px-6 py-2 rounded">
            {isSaving  ? 'Saving...' : 'Save'}
          </button>
        </div>

      </form>

      

    </div>
  );
}

export default VarientForm;
