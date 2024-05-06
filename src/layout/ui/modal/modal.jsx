import React from 'react';
import { Modal } from 'flowbite-react';


const CustomModalHeader = ({title,onClose}) => {
    return (
      <div className="flex items-center justify-between text-white bg-black card-header w-full">
         <div className="items-center">
            <div className="text-md font-bold text-white-400 p-6">{title}</div>
            </div>
            <button aria-label="Close" onClick={onClose} className="ml-auto inline-flex items-center rounded-lg p-1.5 text-sm text-white-400 hover:bg-black-200 hover:text-white-900 dark:hover:bg-black-600 dark:hover:text-white" type="button"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>
      </div>
    );
  };

const PopUpModal = ({ isOpen, onClose,title, children }) => {
 

  return (
    <Modal show={isOpen} size="md" onClose={onClose} className='text-white'>
    <CustomModalHeader title={title} onClose={onClose}></CustomModalHeader>
    <Modal.Body className='bg-black text-white'>
      <div className="space-y-6">
        {children}
      </div>
    </Modal.Body>
  </Modal>
  );
};

export default PopUpModal;
