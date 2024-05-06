import React from 'react';

const Card = ({ title, children }) => {
  return (
    <div className="w-full mx-auto bg-card rounded-xl overflow-hidden shadow-md card mt-4">
      <div className="p-6">
        {title && (
          <div className="mb-4 text-md font-bold text-white-400 card-header w-full pb-4">{title}</div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Card;
