import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useGetData, usePostData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

function UserTeamPermissionForm({ formattedData, permission }) {
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
  const [formValues, setFormValues] = useState({
    referenceName: "",
    allowedModules: formattedData || [],
    empAllowed: [],
  });

  const mutationHook = permission ? usePutData : usePostData;
  const api_url = permission ? `/teamPermissions/${permission._id}` : "/teamPermissions";
  const api_key = permission ? "updateTeamPermissions" : "addTeamPermissions";
  const { mutate: saveTeamPermission, isLoading } = mutationHook(api_key, api_url);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
    
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleOperation = (moduleId, operation) => {
    setFormValues((prev) => {
      const updatedModules = prev.allowedModules.map((module) => {
        if (module.moduleId === moduleId) {
          const isOperationAllowed = module.allowedOperations.includes(operation);
          return {
            ...module,
            allowedOperations: isOperationAllowed
              ? module.allowedOperations.filter((op) => op !== operation)
              : [...module.allowedOperations, operation],
          };
        }
        return module;
      });
      return { ...prev, allowedModules: updatedModules };
    });
  };

  const handleRemoveModule = (moduleId) => {
    setFormValues((prev) => ({
      ...prev,
      allowedModules: prev.allowedModules.filter((module) => module.moduleId !== moduleId),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveTeamPermission(formValues);
      toast.success("Team Permission saved successfully");
      navigate("/teamPermissions");
    } catch (error) {
      toast.error("Failed to save Team Permission");
    }
  };


  if ( loading ) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
        <div className="w-full">
            <div className="mb-4">
            <label className="float-left inline-block mb-2 text-white">Reference Name *</label>
            <input
                type="text"
                name="referenceName"
                value={formValues.referenceName}
                onChange={handleInputChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
                required
            />
            </div>
        </div>

        <div className="w-full p-4">
  <div className="accordion-container">
    {formValues.allowedModules.length === 0 && (
      <div className="mb-4 border p-4 rounded border-nexa-gray">
        <p>No Modules added</p>
      </div>
    )}
    {formValues.allowedModules.map((module, index) => (
      <div key={module.moduleId || index} className="border border-nexa-gray rounded-lg mb-4">
        {/* Accordion Header */}
        <div
          className="accordion-header bg-black text-white px-4 py-2 flex justify-between items-center cursor-pointer"
          onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
        >
          <span>Module: {module.moduleId || `New Module ${index + 1}`}</span>

          {/* Toggle and Close Button */}
          <div className="flex items-center space-x-2">
            {/* + / - Toggle */}
            <span>{activeAccordion === index ? "-" : "+"}</span>

            {/* Close Button */}
            {/* <button
              type="button"
              className="bg-black text-white px-4 py-2 rounded"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering accordion toggle
                handleRemoveModule(module.moduleId);
              }}
            >
              x
            </button> */}
          </div>
        </div>

        {/* Accordion Content */}
        <div
          className={`accordion-content overflow-hidden transition-all ${
            activeAccordion === index ? "max-h-screen" : "max-h-0"
          }`}
        >
          <div className="p-4">
          <div className="flex flex-wrap">
            {["create", "update", "delete", "view"].map((operation) => (
              <div
              key={operation}
              className="w-full sm:w-1/2 p-4 flex flex-col items-center justify-start mb-2 border-b border-gray-700"
            >
              <div
                  key={operation}
                  className="w-full sm:w-1/2 p-4 flex flex-col items-start justify-start mb-2"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-white">{operation}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={module.allowedOperations.includes(operation)}
                        onChange={() => handleToggleOperation(module.moduleId, operation)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>

              
              {/* {module.allowedOperations.includes(operation) && (
                <div className="mt-2 w-full p-2 bg-gray-800 rounded text-white">
                  <p className="mb-2">Details for {operation}:</p> */}
                  {/* Example Additional Content */}
                  {/* <ul className="list-disc list-inside">
                    <li>Additional setting 1</li>
                    <li>Additional setting 2</li>
                    <li>Additional setting 3</li>
                  </ul>
                </div>
              )} */}
            </div>
            
            ))}
          </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Allowed Employees</label>
          <Select
            isMulti
            options=
            value={formValues.empAllowed.map((id) => ({ value: id, label: id }))}
            onChange={(selected) => setFormValues((prev) => ({ ...prev, empAllowed: selected.map((s) => s.value) }))}
            className="mt-1"
            placeholder="Select employees"
          />
        </div> */}

    </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded">
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserTeamPermissionForm;
