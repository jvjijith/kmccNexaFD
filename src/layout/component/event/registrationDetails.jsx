import React, { useState } from "react";
import LoadingScreen from "../../ui/loading/loading";

function RegistrationDetails({ formData, handleChange, handleRegistrationChange, handleOptionChange, handleFormulaChange, addField, deleteField, addOption, deleteOption, addFormulaField, deleteFormula, isSubmitting }) {
    const [activeDrawer, setActiveDrawer] = useState(null);
    const [drawerData, setDrawerData] = useState({});
  
    const openDrawer = (type, index) => {
      setActiveDrawer(type);
      setDrawerData({ index });
    };
  
    const closeDrawer = () => {
      setActiveDrawer(null);
      setDrawerData({});
    };

            
    if (isSubmitting){
      return <LoadingScreen />;
    }

    return (
        <section className="w-full p-5 bg-white shadow-md rounded-md relative">
            <h2 className="text-2xl font-bold mb-6">Event Registration Form</h2>
            <div className="space-y-6">
                {/* Registration Start Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Registration Start Date*
                    </label>
                    <input
                        type="datetime-local"
                        name="registrationStartDate"
                        value={formData.registrationStartDate}
                        onChange={handleChange}
                        className="p-3 border-border border rounded w-full"
                        required
                    />
                </div>

                {/* Registration End Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Registration End Date*
                    </label>
                    <input
                        type="datetime-local"
                        name="registrationEndDate"
                        value={formData.registrationEndDate}
                        onChange={handleChange}
                        className="p-3 border-border border rounded w-full"
                        required
                    />
                </div>

                {/* Registration Fields */}
<div className="p-4 bg-secondary-card rounded-lg">
    <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium">
            Registration Fields
        </label>
        <button
            type="button"
            onClick={() => addField()}
            className="bg-secondary-card text-text-color px-4 py-2 rounded"
        >
            Add Field
        </button>
    </div>

    <div className="space-y-6">
        {formData.registrationFields?.length === 0 && (
            <p className="text-gray-500">No Registration Fields added</p>
        )}

        {formData.registrationFields?.map((field, index) => (
            <div
                key={index}
                className="p-4 bg-gray-50 border-gray-200 rounded-md mb-4"
            >
                <div className="flex flex-wrap">
                    {/* Name */}
                    <div className="w-full sm:w-1/2 p-4">
                        <label className="block text-sm font-medium mb-1">
                            Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name={`field-name-${index}`}
                            value={field.name}
                            onChange={(e) =>
                                handleRegistrationChange(index, e.target.value, "name")
                            }
                            className="p-3 border-border border rounded w-full"
                            required
                        />
                    </div>
                    {/* Display Name */}
                    <div className="w-full sm:w-1/2 p-4">
                        <label className="block text-sm font-medium mb-1">
                            Display Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name={`field-displayName-${index}`}
                            value={field.displayName}
                            onChange={(e) =>
                                handleRegistrationChange(index, e.target.value, "displayName")
                            }
                            className="p-3 border-border border rounded w-full"
                            required
                        />
                    </div>
                </div>


                <div className="mb-4 flex flex-wrap">
                    {/* Field Type */}
                    <div className="w-full md:w-1/2 p-4 flex items-center space-x-4">
                      <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                          Field Type<span className="text-red-500">*</span>
                        </label>
                        <select
                          name={`field-type-${index}`}
                          value={field.type}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            handleRegistrationChange(index, newValue, "type");
                          
                            // Automatically open the drawer for specific field types
                            if (["radioButtonGroup", "checkBoxGroup", "option", "boolean"].includes(newValue)) {
                              openDrawer("fieldTypeDrawer", null);
                            }
                          }}
                          className="p-3 border border-border rounded w-full focus:ring-2 focus:ring-primary focus:outline-none"
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="text">Text</option>
                          <option value="boolean">Boolean</option>
                          <option value="number">Number</option>
                          <option value="option">Option</option>
                          <option value="checkBoxGroup">CheckBox Group</option>
                          <option value="radioButtonGroup">RadioButton Group</option>
                        </select>
                      </div>
                        
                      <button
                        type="button"
                        onClick={() => openDrawer("fieldTypeDrawer", null)}
                        className="bg-secondary-card text-text-color p-3 mt-5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!["radioButtonGroup", "checkBoxGroup", "option", "boolean"].includes(field.type)}
                      >
                        Configure
                      </button>
                    </div>

                        
                    {/* Value Type */}
                    <div className="w-full md:w-1/2 p-4 flex items-center space-x-4">
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                            Value Type<span className="text-red-500">*</span>
                        </label>
                        <select
                            name={`field-valueType-${index}`}
                            value={field.valueType}
                            onChange={(e) => {
                              const newValue = e.target.value;
                                handleRegistrationChange(index, newValue, "valueType")
                          
                                // Automatically open the drawer for specific field types
                                if (["dynamic", "fixed", "userInput"].includes(newValue)) {
                                  openDrawer("valueTypeDrawer", null);
                                }
                            }}
                            className="p-3 border-border border rounded w-full focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        >
                            <option value="">Select Value Type</option>
                            <option value="dynamic">Dynamic</option>
                            <option value="fixed">Fixed</option>
                            <option value="userInput">User Input</option>
                        </select>
                    </div>
                <button
                            type="button"
                            onClick={() => openDrawer("valueTypeDrawer", null)}
                            className="bg-secondary-card text-text-color p-3 mt-5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!["dynamic", "fixed", "userInput"].includes(field.valueType)}
                        >
                            Configure
                        </button>
                </div>
                </div>
                
                
                {/* Delete Field */}
                <button
                    type="button"
                    onClick={() => deleteField(index)}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                >
                    Delete Field
                </button>
            </div>
        ))}
     </div>
 </div>

            </div>

{/* Bottom Drawer */}
{activeDrawer && (
  <div
    className={`absolute bottom-0 left-0 w-full bg-white shadow-lg p-6 border-t transition-transform transform ${
      activeDrawer ? "translate-y-0" : "translate-y-full"
    } min-h-fit max-h-3/4 overflow-y-auto`}
  >
    <button
      onClick={closeDrawer}
      className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
    >
      Close
    </button>

    {/* Field Type Drawer */}
    {activeDrawer === "fieldTypeDrawer" && (
      <div>
        <h3 className="text-lg font-bold mb-4">Configure Field Type</h3>
        {formData?.registrationFields?.map((field, index) => (
          <div key={index} className="mb-4 p-4 border-b">
            {/* Options for Selectable Fields */}
            {["option", "checkBoxGroup", "radioButtonGroup"].includes(field.type) && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Options
                        </label>
                        <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="bg-secondary-card text-text-color px-4 py-2 rounded"
                        >
                            Add
                        </button>
                    </div>
                            
                  <div className="notes-container p-4 bg-secondary-card rounded-lg">
                    {formData?.registrationFields[index]?.options?.length === 0 && (
                      <p className="text-text-color">No Options added</p>
                    )}
                        {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={option.fieldName}
                                    onChange={(e) =>
                                        handleOptionChange(index, optIndex, e.target.value, "fieldName")
                                    }
                                    className="p-2 border-border border rounded w-full mr-2"
                                    placeholder="Field Name"
                                />
                                <input
                                    type="text"
                                    value={option.parentName}
                                    onChange={(e) =>
                                        handleOptionChange(index, optIndex, e.target.value, "parentName")
                                    }
                                    className="p-2 border-border border rounded w-full mr-2"
                                    placeholder="Parent Name"
                                />
                                <input
                                    type="text"
                                    value={option.labelName}
                                    onChange={(e) =>
                                        handleOptionChange(index, optIndex, e.target.value, "labelName")
                                    }
                                    className="p-2 border-border border rounded w-full mr-2"
                                    placeholder="Label Name"
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteOption(index, optIndex)}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    </div>
                )}

            {/* Boolean / Checkbox / Radio Group */}
            {["boolean", "checkBoxGroup", "radioButtonGroup"].includes(field.type) && (
              <div>
                <label className="block text-sm font-medium mb-1">Truth Value</label>
                <input
                  type="text"
                  name={`field-truthValue-${index}`}
                  value={field.truthValue || ""}
                  onChange={(e) =>
                    handleRegistrationChange(index, e.target.value, "truthValue")
                  }
                  className="p-3 border border-gray-300 rounded w-full"
                />

                <label className="block text-sm font-medium mb-1 mt-2">False Value</label>
                <input
                  type="text"
                  name={`field-falseValue-${index}`}
                  value={field.falseValue || ""}
                  onChange={(e) =>
                    handleRegistrationChange(index, e.target.value, "falseValue")
                  }
                  className="p-3 border border-gray-300 rounded w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Value Type Drawer */}
    {activeDrawer === "valueTypeDrawer" && (
      <div>
        <h3 className="text-lg font-bold mb-4">Configure Value Type</h3>
        {formData?.registrationFields?.map((field, index) => (
          <div key={index} className="mb-4 p-4 border-b">
            {/* User Input Value */}
            {field.valueType === "userInput" && (
              <div>
                <label className="block text-sm font-medium mb-1">User Value</label>
                <input
                  type="text"
                  name={`field-userValue-${index}`}
                  value={field.userValue || ""}
                  onChange={(e) =>
                    handleRegistrationChange(index, e.target.value, "userValue")
                  }
                  className="p-3 border border-gray-300 rounded w-full"
                />
              </div>
            )}

            {/* Fixed Value */}
            {field.valueType === "fixed" && (
              <div>
                <label className="block text-sm font-medium mb-1">Fixed Value</label>
                <input
                  type="text"
                  name={`field-fixedValue-${index}`}
                  value={field.fixedValue || ""}
                  onChange={(e) =>
                    handleRegistrationChange(index, e.target.value, "fixedValue")
                  }
                  className="p-3 border border-gray-300 rounded w-full"
                />
              </div>
            )}

{["dynamic", "userInput"].includes(field.valueType) && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block w-full mb-2 text-text-color primary-text">
                      Formula Settings
                    </label>
                    <button
                      type="button"
                      onClick={() => addFormulaField(index)}
                      className="bg-secondary-card text-text-color px-4 py-2 rounded"
                    >
                      Add
                    </button>
                  </div>
                            
                  <div className="notes-container p-4 bg-secondary-card rounded-lg">
                    {formData?.registrationFields[index]?.formula?.length === 0 && (
                      <p className="text-text-color">No Formula added</p>
                    )}
                    {formData?.registrationFields[index]?.formula?.map((formulaItem, formulaIndex) => (
                      <div
                        key={formulaIndex}
                        className="flex flex-wrap p-4 mb-4 border-rounded-lg"
                      >
                        {/* Type Selector */}
                        <div className="w-full sm:w-1/3 p-4">
                          <label className="block text-sm font-medium mb-1">Formula Type</label>
                          <select
                            value={formulaItem.type}
                            onChange={(e) =>
                              handleFormulaChange(index, formulaIndex, e.target.value, "type")
                            }
                            className="block w-full h-10 px-2 py-1 border-b border-border border focus:outline-none focus:border-white transition text-text-color"
                          >
                            <option value="">Select Type</option>
                            {/* <option value="symbol">Symbol</option> */}
                            <option value="operation">Operation</option>
                            <option value="customField">Custom Field</option>
                            <option value="number">Number</option>
                          </select>
                        </div>
                        
                        {/* Field/Value Selector */}
                        {formulaItem.type === "customField" && (
                          <div className="w-full sm:w-1/3 p-4">
                            <label className="block text-sm font-medium mb-1">Custom Field</label>
                            <select
                              value={formulaItem.fieldName}
                              onChange={(e) =>
                                handleFormulaChange(index, formulaIndex, e.target.value, "fieldName")
                              }
                              className="block w-full h-10 px-2 py-1 border-b border-border border focus:outline-none focus:border-white transition text-text-color"
                            >
                              <option value="">Select Field</option>
                              {formData.registrationFields.map((field, fieldIndex) => (
                                <option key={fieldIndex} value={field.name}>
                                  {field.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                
                        {/* Operation Selector */}
                        {formulaItem.type === "operation" && (
                          <div className="w-full sm:w-1/3 p-4">
                            <label className="block text-sm font-medium mb-1">Operation</label>
                            <select
                              value={formulaItem.operationName}
                              onChange={(e) =>
                                handleFormulaChange(index, formulaIndex, e.target.value, "operationName")
                              }
                              className="block w-full h-10 px-2 py-1 border-b border-border border focus:outline-none focus:border-white transition text-text-color"
                            >
                              <option value="">Select Operation</option>
                              <option value="add">Add (+)</option>
                              <option value="subtract">Subtract (-)</option>
                              <option value="multiply">Multiply (*)</option>
                              <option value="divide">Divide (/)</option>
                              <option value="modulus">Modulus (%)</option>
                            </select>
                          </div>
                        )}
                
                        {/* Number Input */}
                        {formulaItem.type === "number" && (
                          <div className="w-full sm:w-1/3 p-4">
                            <label className="block text-sm font-medium mb-1">Number</label>
                            <input
                              type="number"
                              value={formulaItem.fieldName}
                              onChange={(e) =>
                                handleFormulaChange(index, formulaIndex, e.target.value, "fieldName")
                              }
                              className="block w-full h-10 px-2 py-1 border-b border-border border focus:outline-none focus:border-white transition text-text-color"
                              placeholder="Enter Number"
                            />
                          </div>
                        )}
                
                        {/* Delete Formula Item */}
                        <div className="w-full sm:w-1/3 p-4 mt-6">
                          <button
                            type="button"
                            onClick={() => deleteFormula(index, formulaIndex)}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

          </div>
        ))}
      </div>
    )}
  </div>
)}



        </section>
    );
}

export default RegistrationDetails;
