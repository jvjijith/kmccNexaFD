import React from 'react';
import '@dotlottie/player-component/dist/dotlottie-player';

const ErrorComponent = ({ title = "Access Denied", message = "You are not authorized to visit this page at this time" }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <dotlottie-player
        src="/errorAnimation.json" // Replace with your .lottie file path
        background="transparent"
        speed="1"
        style={{ width: '300px', height: '300px' }}
        loop
        autoplay
      />
      <h2 className="text-3xl font-semibold text-red-600 mt-2">{title}</h2>
      <p className="text-lg text-gray-600 mt-4">{message}</p>
    </div>
  );
};

export default ErrorComponent;
