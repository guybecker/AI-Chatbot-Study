import React from 'react';

interface ModalProps {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="modal-backdrop">
    <div className="modal-content modal-disclosure">
      <div className="modal-header">
        <span className="modal-title">Sponsored labels</span>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="modal-body">
        {/*<p>This message was generated based on sponsored content.</p>*/}
        <p>Some of the content behind this answer was labeled as sponsored, meaning it was financially supported by a brand.</p>
      </div>
    </div>
  </div>
);

export default Modal; 