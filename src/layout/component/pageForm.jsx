import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from 'react-router';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';
import Autosuggest from 'react-autosuggest';
import { languages } from '../../constant';

function SortableItem({ id, item, handleRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
        transition,
        padding: '8px',
        marginBottom: '4px',
        backgroundColor: '#333',
        color: 'white',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <span>{item}</span>
        <div className="text-sm text-gray-400">{item.description}</div>
      </div>
      <button onClick={() => handleRemove(id)} className="text-red-500">
        Remove
      </button>
    </div>
  );
}

function PageForm({ pageDatas }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(() => ({
    slug: "",
    referenceName: "",
    items: [],
    type: "normal",
    internalType: "payment",
    externalUrl: "",
    bannerImage: "",
    portraitImage: "",
    landscapeImage: "",
    available: [],
    numberItems: { web: 0, android: 0, iOS: 0 },
    title: [{ lanCode: "", title: "" }],
    metaDescription: [{ lanCode: "", description: "" }],
    keywords: [""],
    ogTitle: [{ lanCode: "", title: "" }],
    ogDescription: [{ lanCode: "", description: "" }],
    ogImage: "",
    twitterCard: "summary",
    twitterCreator: "",
    publish: false,
    draft: false,
  }));
  const [suggestions, setSuggestions] = useState([]);

  const mutationHook = pageDatas ? usePutData : usePostData;
  const api_url = pageDatas ? `/pages/${pageDatas._id}` : '/pages';
  const api_key = pageDatas ? 'updatePage' : 'addPage';
  const { mutate: saveLayout, isLoading, isError } = mutationHook(api_key, api_url);

  // Fetch app data
  const { data: appData, isLoading: isAppLoading } = useGetData("appdata", "/app", {});

  // Fetch container data
  const { data: containerData, isLoading: isContainerLoading } = useGetData("containerdata", "/containers", {});

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
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pageDatas) {

      // Remove unwanted fields
      const cleanedContainer = removeUnwantedFields(pageDatas);

       // Transform availability to only include appId as a string
      const transformedAppId = pageDatas.available?.map(avail => ({
          appId: avail.appId?._id,
      }));

      // Transform availability to only include appId as a string
      const transformedItems = pageDatas.items?.map((avail) => avail._id).filter(Boolean);

      setPageData({
        slug: pageDatas.slug,
        referenceName: pageDatas.referenceName,
        items: transformedItems,
        type: pageDatas.type,
        internalType: pageDatas.internalType,
        externalUrl: pageDatas.externalUrl,
        bannerImage: pageDatas.bannerImage,
        portraitImage: pageDatas.portraitImage,
        landscapeImage: pageDatas.landscapeImage,
        available: transformedAppId,
        numberItems: pageDatas.numberItems,
        title: cleanedContainer.title,
        metaDescription: cleanedContainer.metaDescription,
        keywords: cleanedContainer.keywords,
        ogTitle: cleanedContainer.ogTitle,
        ogDescription: cleanedContainer.ogDescription,
        ogImage: pageDatas.ogImage,
        twitterCard: pageDatas.twitterCard,
        twitterCreator: pageDatas.twitterCreator,
        publish: pageDatas.publish,
        draft: pageDatas.draft,
      });
    }
  }, [pageDatas]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveLayout(pageData, {
      onSuccess: (response) => {
        console.log("response",response);
        setPageData(response.data);
        toast.success('Layout saved successfully!');
      },
      onError: (error) => {
        toast.error('Failed to save layout.');
        console.error(error);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPageData((prevData) => ({ ...prevData, [name]: value }));
  };

  
  const handleNestedChange = (field, index, nestedField, value) => {
    setPageData((prevData) => {
      const updatedField = prevData[field].map((item, idx) =>
        idx === index ? { ...item, [nestedField]: value } : item
      );
      return { ...prevData, [field]: updatedField };
    });
  };

  const handleTypeChange = (selectedOption) => {
    setPageData((prevData) => ({ ...prevData, type: selectedOption.value }));
  };

  const handleAvailableChange = (selectedOptions) => {
    // Map selected options to an array of objects with appId as a string
    const selectedAppIds = selectedOptions.map(option => ({ appId: option.value }));
    
    // Update the available field in the page data
    setPageData(prevData => ({
      ...prevData,
      available: selectedAppIds,
    }));
  };
  


  const addTitle = () => {
    setPageData((prevData) => ({
      ...prevData,
      title: [...prevData.title, { lanCode: "", title: "" }],
    }));
  };

  const removeTitle = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      title: prevData.title.filter((_, idx) => idx !== index),
    }));
  };

  const getSuggestions = (value) => {
    const inputValue = value?.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : languages.filter(lang =>
      lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.code;

  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion.name} ({suggestion.code})
    </div>
  );

  const addMetaDescription = () => {
    setPageData((prevData) => ({
      ...prevData,
      metaDescription: [...prevData.metaDescription, { lanCode: "", description: "" }],
    }));
  };
  
  const removeMetaDescription = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      metaDescription: prevData.metaDescription.filter((_, idx) => idx !== index),
    }));
  };
  
  const addOgTitle = () => {
    setPageData((prevData) => ({
      ...prevData,
      ogTitle: [...prevData.ogTitle, { lanCode: "", title: "" }],
    }));
  };

  const removeOgTitle = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      ogTitle: prevData.ogTitle.filter((_, idx) => idx !== index),
    }));
  };

  const addOgDescription = () => {
    setPageData((prevData) => ({
      ...prevData,
      ogDescription: [...prevData.ogDescription, { lanCode: "", description: "" }],
    }));
  };
  
  const removeOgDescription = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      ogDescription: prevData.ogDescription.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddItem = (selectedOption) => {
    // Extract the selected container by matching its _id
    const selectedContainer = containerData?.containers.find(
      (container) => container._id === selectedOption.value
    );
  
    if (!selectedContainer) {
      console.error("Container not found");
      return;
    }
  
    setPageData((prevData) => {
      // Prevent duplicate addition of the same ObjectId
      if (prevData.items.includes(selectedContainer._id)) {
        console.warn("Item already added");
        return prevData;
      }
  
      return {
        ...prevData,
        items: [...prevData.items, selectedContainer._id], // Add only the ObjectId
      };
    });
  };
  

  const handleRemoveItem = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPageData((prevData) => ({
        ...prevData,
        items: arrayMove(prevData.items, active.id, over.id),
      }));
    }
  };

  const handleDraftSubmit = () => {
    const dataToSave = { ...pageData, draft: true, publish: false };
    saveLayout(dataToSave, {
      onSuccess: (response) => {
        setPageData(response.data);
        toast.success('Draft saved successfully!');
      },
      onError: (error) => {
        toast.error('Failed to save draft.');
        console.error(error);
      }
    });
  };

  const handlePublishSubmit = () => {
    const dataToSave = { ...pageData, draft: false, publish: true };
    saveLayout(dataToSave, {
      onSuccess: (response) => {
        setPageData(response.data);
        toast.success('Page published successfully!');
      },
      onError: (error) => {
        toast.error('Failed to publish page.');
        console.error(error);
      }
    });
  };

  const renderSubmitButtons = () => {
    const { draft, publish } = pageData;
    if (draft && !publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleDraftSubmit} className="bg-orange-500 text-text-color px-4 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-green-500 text-text-color px-4 py-2 rounded-md">
            Publish
          </button>
        </div>
      );
    } else if (draft && publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleDraftSubmit} className="bg-orange-500 text-text-color px-4 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-green-500 text-text-color px-4 py-2 rounded-md">
            Republish
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-end">
          <button type="button" onClick={handleDraftSubmit} className="bg-orange-500 text-text-color px-4 py-2 rounded-md">
            Save Draft
          </button>
        </div>
      );
    }
  };

  const handleInputChange = (field, value) => {
    setPageData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  
  console.log("appData",appData);
  console.log("containerData",containerData);
  console.log("pageData",pageData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
        {/* Slug */}
    <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Slug</label>
      <input
        type="text"
        name="slug"
        value={pageData.slug}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>

    {/* Reference Name */}
    <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Reference Name</label>
      <input
        type="text"
        name="referenceName"
        value={pageData.referenceName}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>
    </div>

    {/* Type */}
    <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <label className="block mb-2 text-text-color">Select Page Type</label>
            <Select
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'details', label: 'Details' },
                { value: 'landing', label: 'Landing' },
                { value: 'internal', label: 'Internal' },
                { value: 'external', label: 'External' },
                { value: 'search', label: 'Search' },
              ]}
              value={{
                value: pageData.type,
                label: pageData.type.charAt(0).toUpperCase() + pageData.type.slice(1),
              }}
              onChange={handleTypeChange}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : 'black',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white'
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                  color: state.isSelected ? '#f8f9fa' : 'black',
                  cursor: 'pointer'
                })
              }}
            />
          </div>

          {/* Internal Type */}
    {(pageData.type==="internal") && <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Internal Type</label>
      <input
        type="text"
        name="internalType"
        value={pageData.internalType}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

    {/* External URL */}
    {(pageData.type==="external") && <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">External URL</label>
      <input
        type="text"
        name="externalUrl"
        value={pageData.externalUrl}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

    {/* Banner Image URL */}
    {((pageData.type!=="external") && (pageData.type!=="internal")) && <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Banner Image URL</label>
      <input
        type="text"
        name="bannerImage"
        value={pageData.bannerImage}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

        {/* Banner Image URL */}
    {((pageData.type==="external") || (pageData.type==="internal")) && <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Banner Image URL</label>
      <input
        type="text"
        name="bannerImage"
        value={pageData.bannerImage}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

 {/* Portrait Image URL */}
 {<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Portrait Image URL</label>
      <input
        type="text"
        name="portraitImage"
        value={pageData.portraitImage}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

     {/* Landscape Image URL */}
     {<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Landscape Image URL</label>
      <input
        type="text"
        name="landscapeImage"
        value={pageData.landscapeImage}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

    {/* <div className="mb-4"> */}
    <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Available Apps</label>
          <Select
            isMulti
            options={appData?.apps?.map((app) => ({
              value: app._id,
              label: app.title,
            })) || []}
            onChange={handleAvailableChange}
            value={pageData.available.map((item) => ({
              value: item.appId,
              label: appData?.apps?.find((app) => app._id === item.appId)?.title || "Unknown",
          }))}
            isLoading={isAppLoading}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : 'black',
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px',
                paddingLeft: '8px',
                paddingRight: '8px',
                color: 'white',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white',
              }),
              placeholder: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'black',
                color: 'white',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                color: state.isSelected ? '#f8f9fa' : 'black',
                cursor: 'pointer',
              })
            }}
          />
        </div>
        {/* </div> */}

            {/* Keywords */}
    <div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Keywords</label>
      <input
        type="text"
        name="keywords"
        value={pageData.keywords.join(", ")}
        onChange={(e) =>
          setPageData((prevData) => ({
            ...prevData,
            keywords: e.target.value.split(",").map((kw) => kw.trim()),
          }))
        }
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>

     {/* Canonical URL */}
     {<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Canonical URL</label>
      <input
        type="text"
        name="canonicalUrl"
        value={pageData.canonicalUrl}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

         {/* OG Image */}
         {<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">OG Image</label>
      <input
        type="text"
        name="ogImage"
        value={pageData.ogImage}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

  <div className="w-full sm:w-1/2 p-4">
    <label className="block mb-2 text-text-color">Select Twitter Card Type</label>
    <Select
      options={[
        { value: 'summary', label: 'Summary' },
        { value: 'summary_large_image', label: 'Summary Large Image' },
        { value: 'app', label: 'App' },
        { value: 'player', label: 'Player' },
      ]}
      value={{
        value: pageData.twitterCard,
        label: pageData.twitterCard.charAt(0).toUpperCase() + pageData.twitterCard.slice(1).replace('_', ' '),
      }}
      onChange={(selectedOption) => 
        setPageData((prevData) => ({ ...prevData, twitterCard: selectedOption.value }))
      }
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: '#f8f9fa',
          borderColor: state.isFocused ? 'white' : 'black',
          borderBottomWidth: '2px',
          borderRadius: '0px',
          height: '40px',
          paddingLeft: '8px',
          paddingRight: '8px',
          color: 'white',
        }),
        singleValue: (provided) => ({
          ...provided,
          color: 'black',
        }),
        placeholder: (provided) => ({
          ...provided,
          color: 'black',
        }),
        menu: (provided) => ({
          ...provided,
          backgroundColor: '#f8f9fa',
          color: 'black',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
          color: state.isSelected ? '#f8f9fa' : 'black',
          cursor: 'pointer',
        }),
      }}
    />
</div>

 {/* Twitter Creator */}
 {<div className="w-full sm:w-1/2 p-4">
      <label className="block w-full mb-2 text-text-color primary-text">Twitter Creator</label>
      <input
        type="text"
        name="twitterCreator"
        value={pageData.twitterCreator}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
      />
    </div>}

    </div>

     {/* Number Items */}
     <div className="mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Number of Items (Web, Android, iOS)</label>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            <div className="flex gap-4">
              <input
                type="number"
                value={pageData.numberItems.web}
                onChange={(e) =>
                  handleInputChange('numberItems', { ...pageData.numberItems, web: e.target.value })
                }
                className="block w-1/3 px-3 py-2 text-text-color secondary-card border rounded"
                placeholder="Web"
              />
              <input
                type="number"
                value={pageData.numberItems.android}
                onChange={(e) =>
                  handleInputChange('numberItems', { ...pageData.numberItems, android: e.target.value })
                }
                className="block w-1/3 px-3 py-2 text-text-color secondary-card border rounded"
                placeholder="Android"
              />
              <input
                type="number"
                value={pageData.numberItems.iOS}
                onChange={(e) =>
                  handleInputChange('numberItems', { ...pageData.numberItems, iOS: e.target.value })
                }
                className="block w-1/3 px-3 py-2 text-text-color secondary-card border rounded"
                placeholder="iOS"
              />
            </div>
          </div>
        </div>


 {/* Titles */}
 <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Titles</label>
            <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addTitle}>
              Add
            </button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {pageData.title.length === 0 && <p className='text-text-color'>No Titles added</p>}
            {pageData.title?.map((title, index) => (
              <div className="flex gap-4 mb-2" key={index}>
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                  onSuggestionsClearRequested={handleSuggestionsClearRequested}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={{
                    placeholder: 'Enter Language',
                    value: title.lanCode,
                    onChange: (e, { newValue }) =>
                      handleNestedChange('title', index, 'lanCode', newValue),
                    className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded',
                  }}
                  theme={{
                    container: 'relative',
                    suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
                    suggestion: 'p-2 cursor-pointer',
                    suggestionHighlighted: 'bg-blue-500 text-black',
                  }}
                />
                <input
                  type="text"
                  value={title.title}
                  onChange={(e) => handleNestedChange('title', index, 'title', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  placeholder="Title Name"
                />
                <button
                  type="button"
                  className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
                  onClick={() => removeTitle(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>


    {/* Meta Descriptions */}
<div className="mb-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Meta Descriptions</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addMetaDescription}>Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {pageData.metaDescription.length === 0 && <p className='text-text-color'>No Meta Descriptions added</p>}
    {pageData.metaDescription.map((description, index) => (
      <div className="flex gap-4 mb-2" key={index}>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: 'Enter Language',
            value: description.lanCode,
            onChange: (e, { newValue }) =>
              handleNestedChange('metaDescription', index, 'lanCode', newValue),
            className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded',
          }}
          theme={{
            container: 'relative',
            suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
            suggestion: 'p-2 cursor-pointer',
            suggestionHighlighted: 'bg-blue-500 text-black',
          }}
        />
        <input
          type="text"
          value={description.description}
          onChange={(e) => handleNestedChange('metaDescription', index, 'description', e.target.value)}
          className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          placeholder="Meta Description"
        />
        <button
          type="button"
          className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
          onClick={() => removeMetaDescription(index)}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
</div>

{/* OG Titles */}
<div className="mb-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">OG Titles</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addOgTitle}>Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {pageData.ogTitle.length === 0 && <p className='text-text-color'>No OG Titles added</p>}
    {pageData.ogTitle?.map((ogTitle, index) => (
      <div className="flex gap-4 mb-2" key={index}>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: 'Enter Language',
            value: ogTitle.lanCode,
            onChange: (e, { newValue }) =>
              handleNestedChange('ogTitle', index, 'lanCode', newValue),
            className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded'
          }}
          theme={{
            container: 'relative',
            suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
            suggestion: 'p-2 cursor-pointer',
            suggestionHighlighted: 'bg-blue-500 text-black'
          }}
        />
        <input
          type="text"
          value={ogTitle.title}
          onChange={(e) => handleNestedChange('ogTitle', index, 'title', e.target.value)}
          className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          placeholder="Open Graph Title"
        />
        <button
          type="button"
          className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
          onClick={() => removeOgTitle(index)}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
</div>

{/* OG Descriptions */}
<div className="mb-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">OG Descriptions</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addOgDescription}>Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {pageData.ogDescription.length === 0 && <p className='text-text-color'>No OG Descriptions added</p>}
    {pageData.ogDescription?.map((desc, index) => (
      <div key={index} className="flex gap-4 mb-2">
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: 'Enter Language',
            value: desc.lanCode,
            onChange: (e, { newValue }) =>
              handleNestedChange('ogDescription', index, 'lanCode', newValue),
            className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded'
          }}
          theme={{
            container: 'relative',
            suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
            suggestion: 'p-2 cursor-pointer',
            suggestionHighlighted: 'bg-blue-500 text-black'
          }}
        />
        <input
          type="text"
          value={desc.description}
          onChange={(e) => handleNestedChange('ogDescription', index, 'description', e.target.value)}
          className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          placeholder="Description"
        />
        <button
          type="button"
          className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
          onClick={() => removeOgDescription(index)}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
</div>

 {/* Select Dropdown for Containers */}
 <div className="w-full p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Items</label>
          <Select
            options={containerData?.containers.map((container) => ({
              value: container._id,
              label: container.referenceName,
              description: container.description,
            }))}
            onChange={handleAddItem}
            placeholder="Select an Element to Add"
            className="mb-4"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : 'black',
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px',
                paddingLeft: '8px',
                paddingRight: '8px',
                color: 'white',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white',
              }),
              placeholder: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'black',
                color: 'white',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? 'black' : '#f8f9fa',
                color: 'white',
                cursor: 'pointer',
              }),
            }}
          />

          {/* Drag-and-Drop Items */}
          {pageData.items.length !== 0 && (
            <div className="notes-container p-4 bg-secondary-card rounded-lg">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pageData.items.map((_, index) => index)}>
                  {pageData.items.map((item, index) => (
                    <SortableItem
                      key={index}
                      id={index}
                      item={
                        containerData?.containers?.find((container) => container._id === item)?.referenceName || "Unknown"
                      }
                      
                      handleRemove={handleRemoveItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>


        {renderSubmitButtons()}
      </form>
      <ToastContainer />
    </div>
  );
}

export default PageForm;
