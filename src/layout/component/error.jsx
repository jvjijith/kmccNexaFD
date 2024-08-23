import React from 'react';
import '@dotlottie/player-component/dist/dotlottie-player';

const ErrorComponent = ({ title = "Something went wrong!", message = "Please try again later." }) => {
  return (
    <div className="flex flex-wrap mt-20 items-center justify-center">
      <dotlottie-player
        src="/errorAnimation.json" // Replace with your .lottie file path
        background="transparent"
        speed="1"
        style={{ width: '300px', height: '300px' }}
        loop
        autoplay
      />
      
    <div className="flex flex-wrap items-center w-full justify-center">
      <h2 className="text-2xl font-bold text-red-600 mt-4">{title}</h2>
      </div>
      <p className="text-lg text-gray-600 mt-2">{message}</p>
    </div>
  );
};

export default ErrorComponent;
