import React, { useState, useEffect } from 'react';
import { useGetData, usePostData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';

function Modules() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const { data: moduleData, isLoading: isModuleLoading } = useGetData('modules', '/modules', {});

  useEffect(() => {
    if (moduleData?.modules) {
      setModules(moduleData.modules.map(module => ({
        ...module,
        allowedOperations: [],
      })));
      setLoading(false);
    }
  }, [moduleData]);

  const handleToggleOperation = (moduleId, operation) => {
    setModules(modules.map(module => {
      if (module._id === moduleId) {
        const isOperationAllowed = module.allowedOperations.includes(operation);
        return {
          ...module,
          allowedOperations: isOperationAllowed
            ? module.allowedOperations.filter(op => op !== operation)
            : [...module.allowedOperations, operation],
        };
      }
      return module;
    }));
  };

  const handleRemoveModule = (moduleId) => {
    setModules(modules.map(module => {
      if (module._id === moduleId) {
        // Toggle between clearing and adding all allowedOperations
        return {
          ...module,
          allowedOperations: module.allowedOperations.length === 0
            ? [...module.moduleOperations] // Add all allowed operations
            : [], // Clear all allowed operations
        };
      }
      return module;
    }));
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = modules
      .filter(module => module.allowedOperations.length > 0)
      .map(module => ({
        moduleId: module._id,
        allowedOperations: module.allowedOperations,
      }));

    console.log("formattedData", formattedData);
        navigate('/permission/add', { state: { formattedData } });
  };

  if (loading || isModuleLoading) {
    return <LoadingScreen />;
  }

  console.log("modules", modules);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="accordion-container p-4">
          {modules.map((module, index) => (
            <div key={module._id} className="mb-4 border border-gray-300 rounded-lg">
              {/* Accordion Header */}
              <div
                  className="accordion-header bg-black text-white px-4 py-2 flex justify-between items-center cursor-pointer"
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                >
                  <span>{module.moduleName}</span>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer mr-2">
                      <input
                        type="checkbox"
                        checked={modules.some(m => m._id === module._id && m.allowedOperations.length > 0)}
                        onChange={() => handleRemoveModule(module._id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-black border border-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600">
                      </div>
                    </label>
                    <span>{activeAccordion === index ? '-' : '+'}</span>
                  </div>
                </div>


              {/* Accordion Content */}
              {activeAccordion === index && (
                <div className="accordion-content bg-gray-800 p-4 text-white">
                  {module.moduleOperations.map(operation => (
                    <div key={operation} className="flex items-center justify-between mb-2">
                      <span>{operation}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={module.allowedOperations.includes(operation)}
                          onChange={() => handleToggleOperation(module._id, operation)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-black border border-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600">
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end p-4">
          <button
            type="submit"
            className="bg-nexa-orange text-white px-6 py-2 rounded"
            disabled={isModuleLoading}
          >
            {isModuleLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Modules;
