import React, { useState, useCallback } from "react";
import Autosuggest from 'react-autosuggest';
import { categoryDefault, industries } from "../../constant";
import { usePostData, usePutData } from "../../common/api";

function CategoryForm({ id, name, industry }) {
  const [categoryData, setCategoryData] = useState({
    categoryName: name || categoryDefault.categoryName,
    categoryType: industry || categoryDefault.categoryType,
  });

  const [suggestions, setSuggestions] = useState([]);

  const { mutate: addCategory, isPending, error } = usePostData("addCategory", "/category/add");
  const { mutate: editCategory, isPending: isEditing, error: editError } = usePutData("editCategory", `/category/update/${id}`);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Autosuggest functions
  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion}
    </div>
  );

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : industries.filter(
      (industry) => industry.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const onCategoryTypeChange = (event, { newValue }) => {
    setCategoryData((prevState) => ({
      ...prevState,
      categoryType: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      editCategory(categoryData, {
        onSuccess: () => {},
        onError: (error) => {},
      });
    } else {
      addCategory(categoryData, {
        onSuccess: () => {},
        onError: (error) => {},
      });
    }
    setCategoryData(categoryDefault);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="block">
          <div className="w-full">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">
                &nbsp;Category Name *&nbsp;
              </label>
              <input
                type="text"
                name="categoryName"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter Your Category Name"
                autoComplete="off"
                style={{ textAlign: "initial" }}
                value={categoryData.categoryName}
                onChange={handleChange}
              />
              <div className="correct"></div>
            </div>
          </div>

          <div className="w-full">
            <div className="mb-4">
              <label className="float-left block mb-2 text-text-color">
                &nbsp;Industry *&nbsp;
              </label>
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  placeholder: "Enter Industry",
                  value: categoryData.categoryType,
                  onChange: onCategoryTypeChange,
                  className:
                    "block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color",
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end p-4">
            <button type="submit" className="bg-primary-button-color hover:bg-green-400 text-text-color px-4 py-2 rounded">
              {id ? "Edit Category" : "Add Category"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;
