import React from 'react';
import '../../../styles/Modal.css';



//when reseting password
const Modal = ({ show, children, onClose }) => {
  return (
    <div className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        {children}
      </div>
    </div>
  );
}

export default Modal;
