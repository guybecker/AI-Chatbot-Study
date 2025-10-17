import React from 'react';

interface ModalProps {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="modal-backdrop">
    <div className="modal-content modal-disclosure">
      <div className="modal-header">
        <span className="modal-title">Disclosure</span>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="modal-body">
        <p>This message was generated based on sponsored content.</p>
      </div>
    </div>
  </div>
);

export default Modal; 