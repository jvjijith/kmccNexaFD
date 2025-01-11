import React, { useState, useEffect } from 'react';
import { appDefault, languages, stateCountryCurrencyMapping } from '../../constant';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import Autosuggest from 'react-autosuggest';
import { useNavigate } from 'react-router';

const appTypeOptions = [
  { value: 'web', label: 'Web' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'IOS' },
  // Add more options as needed
];

const ruleTypeOptions = [
  { value: 'allow', label: 'Allow' },
  { value: 'deny', label: 'Deny' },
];

function AppForm({ appDatas }) {
  const navigate = useNavigate();
  const [appData, setAppData] = useState(appDatas ? appDatas : appDefault);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  const mutationHook = appDatas ? usePutData : usePostData;
  const api_url = appDatas ? `/app/update/${appDatas._id}` : '/app/add';
  const api_key = appDatas ? 'updateApp' : 'addApp';
  const { mutate: saveApp, isLoading, isError } = mutationHook(api_key, api_url);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Simulate loading for 3 seconds

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, []);

  const handleSuggestionsFetchRequested = (value, type) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let filteredSuggestions = [];

    if (type === 'language') {
      filteredSuggestions = inputLength === 0 ? [] : languages.filter(lang =>
        lang.name.toLowerCase().slice(0, inputLength) === inputValue
      );
    } else if (type === 'geo') {
      filteredSuggestions = Object.keys(stateCountryCurrencyMapping).filter(geo =>
        geo.toLowerCase().slice(0, inputLength) === inputValue
      ).map(location => ({ name: location }));
    }

    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion, { query }) => {
    const matchIndex = suggestion.name.toLowerCase().indexOf(query.toLowerCase());
    const beforeMatch = suggestion.name.slice(0, matchIndex);
    const matchText = suggestion.name.slice(matchIndex, matchIndex + query.length);
    const afterMatch = suggestion.name.slice(matchIndex + query.length);

    return (
      <div>
        {beforeMatch}<strong className="text-blue-500">{matchText}</strong>{afterMatch}
      </div>
    );
  };

  const handleSettingsChange = (type, index, field, value) => {
    setAppData(prevState => {
      const updatedSettings = [...prevState.settings[type]];
      updatedSettings[index][field] = value;

      // Automatically update language code if language name is changed
      if (type === 'language' && field === 'langName') {
        const matchedLanguage = languages.find(lang => lang.name === value);
        if (matchedLanguage) {
          updatedSettings[index]['langCode'] = matchedLanguage.code;
        }
      }

      return {
        ...prevState,
        settings: {
          ...prevState.settings,
          [type]: updatedSettings,
        }
      };
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppData({ ...appData, [name]: value });
  };

  const handleSelectChange = (type, selectedOption) => {
    setAppData({ ...appData, [type]: selectedOption.value });
  };

  const addSetting = (type) => {
    setAppData(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        [type]: [...prevState.settings[type], type === 'language' ? { langName: '', langCode: '' } : { ruleType: 'allow', [type === 'geo' ? 'location' : 'domain']: '' }]
      }
    }));
  };

  const deleteSetting = (type, index) => {
    setAppData(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        [type]: prevState.settings[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedLanguageSetting = 
    appData?.settings?.language?.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });

    const cleanedGeoSetting =  
    appData?.settings?.geo?.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });

    const cleanedDomainSetting =  
    appData?.settings?.domain?.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });

    const { _id, __v, ...cleanedData } = appData;

    const payload = appDatas ? {
      ...cleanedData,
      settings: {
      geo: cleanedGeoSetting,
      domain: cleanedDomainSetting,
      language: cleanedLanguageSetting}
    } : {
      ...appData
    };

    saveApp( payload, {
      onSuccess: (response) => {
        navigate("/store/appmanagement/appsetting/list");
      },
      onError: (error) => {
        console.error("Error signing up:", error);
        toast.error('Error signing up.');
      },
    } );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">App Title *</label>
              <input
                type="text"
                name="title"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter App Title"
                autoComplete="off"
                value={appData.title}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">App Type *</label>
              <Select
                options={appTypeOptions}
                value={appTypeOptions.find(option => option.value === appData.appType) || null}
                onChange={(selectedOption) => handleSelectChange('appType', selectedOption)}
                classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
              />
            </div>
          </div>
        </div>

       {/* Geo Settings */}
<div className="p-4">
<div className="flex items-center justify-between mb-4">
  <label className="block w-full mb-2 text-text-color primary-text">Geo Settings</label>
  <button type="button" onClick={() => addSetting('geo')} className="bg-secondary-card text-text-color px-4 py-2 rounded">Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
        {(appData?.settings?.geo?.length===0)&&<p className='text-text-color'>No Geo Settings added</p>}
  {appData?.settings?.geo?.map((geo, index) => (
    <div key={index} className="flex flex-wrap p-4 mb-4 bg-nexa-gray">
      <div className="w-full sm:w-1/2 p-4">
        <Select
          options={ruleTypeOptions}
          value={ruleTypeOptions.find(option => option.value === geo.ruleType) || null}
          onChange={(selectedOption) => handleSettingsChange('geo', index, 'ruleType', selectedOption.value)}
          classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
        />
      </div>
      <div className="w-full sm:w-1/2 p-4">
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={({ value }) => handleSuggestionsFetchRequested(value, 'geo')}
          onSuggestionsClearRequested={() => handleSuggestionsClearRequested('geo')}
          getSuggestionValue={(suggestion) => suggestion.name}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: 'Enter Geo Location',
            value: geo.location,
            onChange: (e, { newValue }) => handleSettingsChange('geo', index, 'location', newValue),
            className: 'block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color'
          }}
          theme={{
            container: 'relative',
            suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
            suggestion: 'p-2 cursor-pointer',
            suggestionHighlighted: 'bg-blue-500 text-black'
          }}
        />
      </div>
      <div className="w-full sm:w-1/3 p-4">
        <button type="button" onClick={() => deleteSetting('geo', index)} className="bg-secondary-card text-text-color px-4 py-2 rounded">Delete</button>
      </div>
    </div>
  ))}
  </div>
</div>


        {/* Domain Settings */}
        <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Domain Settings</label> 
          <button type="button" onClick={() => addSetting('domain')} className="bg-secondary-card text-text-color px-4 py-2 rounded">Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
        {(appData?.settings?.domain?.length===0)&&<p className='text-text-color'>No Domain Settings added</p>}
          {appData?.settings?.domain?.map((domain, index) => (
            <div key={index} className="flex flex-wrap p-4 mb-4 bg-nexa-gray">
              <div className="w-full sm:w-1/2 p-4">
                <Select
                  options={ruleTypeOptions}
                  value={ruleTypeOptions.find(option => option.value === domain.ruleType) || null}
                  onChange={(selectedOption) => handleSettingsChange('domain', index, 'ruleType', selectedOption.value)}
                  classNames={{
        control: ({ isFocused }) =>
          `bg-primary border ${
            isFocused ? 'border-secondary' : 'border-focus-color'
          } border-b-2 rounded-none h-10 px-2 text-text-color`,
        singleValue: () => `text-focus-color`,
        placeholder: () => `text-focus-color`,
        menu: () => `bg-primary text-focus-color`,
        option: ({ isSelected }) =>
          `cursor-pointer ${
            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
          }`,
      }}
                />
              </div>
              <div className="w-full sm:w-1/2 p-4">
                <input
                  type="text"
                  name={`domain${index}`}
                  className="block w-full h-10 px-2 py-1 mb-2 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                  placeholder="Domain"
                  value={domain.domain}
                  onChange={(e) => handleSettingsChange('domain', index, 'domain', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/3 p-4">
                <button type="button" onClick={() => deleteSetting('domain', index)} className="bg-secondary-card text-text-color px-4 py-2 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
        </div>

        <div>

        {/* Language Settings */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Language Settings</label>
            <button type="button" onClick={() => addSetting('language')} className="bg-secondary-card text-text-color px-4 py-2 rounded">Add</button>
          </div>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {appData?.settings?.language?.length === 0 && <p className='text-text-color'>No Language Settings added</p>}
            {appData?.settings?.language?.map((language, index) => (
              <div key={index} className="flex flex-wrap p-4 mb-4 bg-nexa-gray">
                <div className="w-full sm:w-1/2 p-4">
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={({ value }) => handleSuggestionsFetchRequested(value, 'language')}
                    onSuggestionsClearRequested={() => handleSuggestionsClearRequested('language')}
                    getSuggestionValue={(suggestion) => suggestion.name}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                      placeholder: 'Enter Language',
                      value: language.langName,
                      onChange: (e, { newValue }) => handleSettingsChange('language', index, 'langName', newValue),
                      className: 'block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color'
                    }}
                    theme={{
                      container: 'relative',
                      suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
                      suggestion: 'p-2 cursor-pointer',
                      suggestionHighlighted: 'bg-blue-500 text-black'
                    }}
                  />
                </div>
                <div className="w-full sm:w-1/2 p-4">
                  <input
                    type="text"
                    name={`languageCode${index}`}
                    className="block w-full h-10 px-2 py-1 mb-2 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                    placeholder="Language Code"
                    value={language.langCode}
                    onChange={(e) => handleSettingsChange('language', index, 'langCode', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-1/3 p-4">
                  <button type="button" onClick={() => deleteSetting('language', index)} className="bg-secondary-card text-text-color px-4 py-2 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
</div>


        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">Submit</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default AppForm;
