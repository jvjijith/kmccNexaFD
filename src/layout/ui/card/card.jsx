import React from 'react';

const Card = ({ component, title, children }) => {
  return (
    <div className="w-full mx-auto bg-card rounded-xl overflow-hidden shadow-md card mt-4">
      <div className="p-6">
       {title && (
        <div className="mb-4 text-md text-text-color-400 card-header w-full pb-4 flex justify-between items-center">
          <span className="text-3xl main-text text-text-color">{title}</span>
          <div className="flex items-center">
            
              {component}
            
            
          </div>
        </div>
      )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Card;
