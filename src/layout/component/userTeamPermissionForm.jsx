import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useGetData, usePostData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import Modules from "./modules";
import PopUpModal from "../ui/modal/modal";

function UserTeamPermissionForm({ formattedData, permission }) {
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState(null);  
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [formValues, setFormValues] = useState({
    referenceName: "",
    allowedModules: formattedData || [],
    empAllowed: [],
  });

  const mutationHook = permission ? usePutData : usePostData;
  const api_url = permission ? `/user-team-permissions/update/${permission._id}` : "/user-team-permissions/add";
  const api_key = permission ? "updateTeamPermissions" : "addTeamPermissions";
  const { mutate: saveTeamPermission, isLoading } = mutationHook(api_key, api_url);

  const { data: employeeData, refetch: refetchEmployees } = useGetData("employees", "/employee");
  
  const { data: moduleData, isLoading: isModuleLoading } = useGetData('modules', '/modules', {});

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
    
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);



    useEffect(() => {
    if (permission) {
  
      // Transform products to include only necessary fields
      const transformedEmpAllowed = permission?.empAllowed?.map(item => (
          item?._id
      ));
  
      // Transform terms and conditions
      const transformedAllowedModules = permission?.allowedModules?.map(term => ({
        allowedOperations: term?.allowedOperations,
        moduleId: term?.moduleId?._id,
      }));
  
      // Transform attachments
      // const transformedAttachments = vendorRequest?.attachments?.map(attachment => ({
      //     fileName: attachment?.fileName,
      //     fileUrl: attachment?.fileUrl,
      // }));
  
      // Set the transformed data
      setFormValues({
        referenceName: permission.referenceName,
        allowedModules: transformedAllowedModules || [],
        empAllowed: transformedEmpAllowed || [],
      });
  }
}, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  
  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
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

  const employeeOptions = employeeData?.employees.map((employee) => ({
    value: employee._id,
    label: `${employee.name} (${employee.email})`,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveTeamPermission(formValues);
      toast.success("Team Permission saved successfully");
      navigate("/permission");
    } catch (error) {
      toast.error("Failed to save Team Permission");
    }
  };


  if ( loading ) {
    return <LoadingScreen />;
  }

  console.log("moduleData",moduleData);
  console.log("formattedData",formattedData);
  console.log("allowedModules",formValues.allowedModules);
  console.log("permission",permission);
  return (
    <div>
      <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
        <div className="w-full">
            <div className="mb-4">
            <label className="float-left inline-block mb-2 text-text-color">Reference Name *</label>
            <input
                type="text"
                name="referenceName"
                value={formValues.referenceName}
                onChange={handleInputChange}
                className="block w-full h-10 px-2 py-1 border-b border-nexa-gray secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                required
            />
            </div>
        </div>

         {/* Employee Dropdown */}
         <div className="w-full mb-4">
            <label htmlFor="empAllowed" className="block w-full mb-2 text-text-color">
              Allowed Employees
            </label>
            <Select
              id="empAllowed"
              options={employeeOptions}
              value={employeeOptions?.filter((option) => formValues.empAllowed.includes(option.value))}
              onChange={(selectedOptions) =>
                setFormValues((prev) => ({
                  ...prev,
                  empAllowed: selectedOptions.map((option) => option.value),
                }))
              }
              isMulti
              classNames={{
                control: ({ isFocused }) =>
                  `bg-[#f8f9fa] border ${
                    isFocused ? "border-white" : "border-black"
                  } border-b-2 rounded-none h-10 px-2 text-gray-800`,
                singleValue: () => `text-black`,
                placeholder: () => `text-black`,
                menu: () => `bg-[#f8f9fa] text-black`,
                option: ({ isSelected }) =>
                  `cursor-pointer ${
                    isSelected ? "bg-black text-[#f8f9fa]" : "bg-[#f8f9fa] text-black"
                  }`,
              }}
              placeholder="Select allowed employees"
            />
          </div>

          <div className="w-full p-4">
          <div className="flex items-center justify-between mb-4">
  <label className="block w-full mb-2 text-text-color">
    Modules
  </label>
          {/* <button type="button" className="bg-primary-button-color text-text-color px-4 py-2 rounded mt-4" onClick={() => openModal()}>Add</button> */}
          </div>
  <div className="accordion-container">
    {formValues.allowedModules.length === 0 && (
      <div className="mb-4 border p-4 rounded border-nexa-gray">
        <p className="text-text-color">No Modules added</p>
      </div>
    )}
    {formValues.allowedModules.map((module, index) => (
      <div key={module.moduleId || index} className="border border-nexa-gray rounded-lg mb-4">
        {/* Accordion Header */}
        <div
          className="accordion-header secondary-card text-text-color px-4 py-2 flex justify-between items-center cursor-pointer"
          onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
        >
          <span>
            {moduleData?.modules?.find((el) => el._id === module.moduleId)?.moduleName || `New Module ${index + 1}`}
          </span>
          {/* Toggle and Close Button */}
          <div className="flex items-center space-x-2">
            <span>{activeAccordion === index ? "-" : "+"}</span>
          </div>
        </div>
        {/* Accordion Content */}
        <div
          className={`accordion-content overflow-hidden transition-all ${
            activeAccordion === index ? "max-h-screen" : "max-h-0"
          }`}
        >
          <div className="p-4">
            <p className="mb-4 text-text-color">
              This module allows the following operations: <strong>{module.allowedOperations.join(", ")}</strong>.
            </p>
            <div className="flex flex-wrap">
              {module?.allowedOperations?.map((operation) => (
                <div
                  key={operation}
                  className="w-full sm:w-1/2 p-4 flex flex-col items-center justify-start mb-2 border-b border-gray-700"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-text-color">{operation}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={module.allowedOperations.includes(operation)}
                        onChange={() => handleToggleOperation(module.moduleId, operation)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
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
          <button type="submit" className="bg-orange-600 text-text-color px-6 py-2 rounded">
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
            <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Add Modules"}>
        <Modules data={formValues.allowedModules} closeModal={closeModal} />
      </PopUpModal>
    </div>
  );
}

export default UserTeamPermissionForm;
