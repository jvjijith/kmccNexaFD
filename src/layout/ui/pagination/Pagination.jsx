import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center items-center mt-4 space-x-1">
      {/* First Page */}
      {showFirstLast && currentPage > 1 && (
        <>
          {/* <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded bg-gray-700 text-btn-text-color hover:bg-gray-600 transition-colors"
            disabled={currentPage === 1}
          >
            First
          </button> */}
          {visiblePages[0] > 2 && <span className="px-2 text-text-color">...</span>}
        </>
      )}

      {/* Previous Page */}
      {/* {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-700 text-btn-text-color hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
        >
          Previous
        </button>
      )} */}

      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded transition-colors ${
            currentPage === page 
              ? "bg-primary-button-color text-btn-text-color" 
              : "bg-gray-700 text-btn-text-color hover:bg-gray-600"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Page */}
      {/* {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 rounded bg-gray-700 text-btn-text-color hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      )} */}

      {/* Last Page */}
      {showFirstLast && currentPage < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-text-color">...</span>
          )}
          {/* <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded bg-gray-700 text-btn-text-color hover:bg-gray-600 transition-colors"
            disabled={currentPage === totalPages}
          >
            Last
          </button> */}
        </>
      )}

      {/* Page Info */}
      {/* <div className="ml-4 text-text-color text-sm">
        Page {currentPage} of {totalPages}
      </div> */}
    </div>
  );
};

export default Pagination;