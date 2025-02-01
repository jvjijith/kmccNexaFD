import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGetData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';

function Modules({ data, closeModal, fun }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  // Maintain a separate state for selected operations across all pages
  const [selectedOperations, setSelectedOperations] = useState({});
  const [activeAccordion, setActiveAccordion] = useState(null);

  const { data: moduleData, isLoading: isModuleLoading } = useGetData(
    ['modules', currentPage],
    `/modules?page=${currentPage}&limit=${limit}`,
    {
      keepPreviousData: true,
    }
  );

  // Initialize or update modules with their operations
  const modules = useMemo(() => {
    if (!moduleData?.modules) return [];
    
    return moduleData.modules.map(module => ({
      ...module,
      allowedOperations: selectedOperations[module._id] || 
                        data?.find(d => d.moduleId === module._id)?.allowedOperations || 
                        []
    }));
  }, [moduleData, selectedOperations, data]);

  const totalPages = useMemo(() => 
    Math.ceil((moduleData?.pagination?.totalCount || 0) / limit),
    [moduleData?.pagination?.totalCount]
  );

  // Update selected operations when data prop changes
  useEffect(() => {
    if (data) {
      const initialOperations = {};
      data.forEach(item => {
        initialOperations[item.moduleId] = item.allowedOperations;
      });
      setSelectedOperations(initialOperations);
    }
  }, [data]);

  const handlePageChange = useCallback((page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [currentPage, totalPages]);

  const handleToggleOperation = useCallback((moduleId, operation) => {
    setSelectedOperations(prev => {
      const currentOperations = prev[moduleId] || [];
      const isOperationAllowed = currentOperations.includes(operation);
      
      return {
        ...prev,
        [moduleId]: isOperationAllowed
          ? currentOperations.filter(op => op !== operation)
          : [...currentOperations, operation]
      };
    });
  }, []);

  const handleRemoveModule = useCallback((moduleId, moduleOperations) => {
    setSelectedOperations(prev => {
      const currentOperations = prev[moduleId] || [];
      return {
        ...prev,
        [moduleId]: currentOperations.length === 0 ? [...moduleOperations] : []
      };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = Object.entries(selectedOperations)
      .filter(([_, operations]) => operations.length > 0)
      .map(([moduleId, allowedOperations]) => ({
        moduleId,
        allowedOperations,
      }));

    if (fun) {
      fun(formattedData);
      closeModal();
    } else {
      navigate('/permission/add', { state: { formattedData } });
    }
  };

  if (isModuleLoading && !modules.length) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="accordion-container p-4">
          {modules.map((module, index) => (
            <div key={module._id} className="mb-4 border border-gray-300 rounded-lg">
              <div
                className="accordion-header secondary-card text-text-color px-4 py-2 flex justify-between items-center cursor-pointer"
                onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
              >
                <span>{module.moduleName}</span>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer mr-2">
                    <input
                      type="checkbox"
                      checked={(selectedOperations[module._id] || []).length > 0}
                      onChange={() => handleRemoveModule(module._id, module.moduleOperations)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 secondary-card border border-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                  <span>{activeAccordion === index ? '-' : '+'}</span>
                </div>
              </div>

              {activeAccordion === index && (
                <div className="accordion-content bg-gray-800 p-4 text-text-color">
                  {module.moduleOperations.map(operation => (
                    <div key={operation} className="flex items-center justify-between mb-2">
                      <span>{operation}</span>
                      <label className="relative inline-flex items-center cursor-pointer primary-text">
                        <input
                          type="checkbox"
                          checked={(selectedOperations[module._id] || []).includes(operation)}
                          onChange={() => handleToggleOperation(module._id, operation)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 secondary-card border border-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end p-4">
          <button
            type="submit"
            className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded"
            disabled={isModuleLoading}
          >
            {isModuleLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isModuleLoading}
          className={`px-3 py-1 rounded ${
            currentPage === 1 ? 'bg-gray-500' : 'bg-gray-700'
          } text-text-color`}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={isModuleLoading}
            className={`px-3 py-1 rounded ${
              currentPage === page ? "bg-primary-button-color" : "bg-gray-700"
            } text-text-color`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isModuleLoading}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages ? 'bg-gray-500' : 'bg-gray-700'
          } text-text-color`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default Modules;