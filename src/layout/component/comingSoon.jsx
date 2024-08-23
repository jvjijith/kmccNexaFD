import React from 'react';
import '@dotlottie/player-component/dist/dotlottie-player';

const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <dotlottie-player
        src="/comingSoon1.json" // Replace with your .lottie file path
        background="transparent"
        speed="1"
        style={{ width: '300px', height: '300px' }}
        loop
        autoplay
      />
      <h2 className="text-3xl font-semibold text-blue-600 mt-2">{title}</h2>
      <p className="text-lg text-gray-600 mt-4">We're working hard to bring you this feature. Stay tuned!</p>
    </div>
  );
};

export default ComingSoon;
