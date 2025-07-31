import React from 'react';
import { Modal } from 'react-bootstrap';

const FavsModals = ({
  showRemoveModal,
  showClearModal,
  selectedProduct,
  onConfirmRemove,
  onConfirmClear,
  onCancel
}) => {
  return (
    <>
      {/* Modal para eliminar producto de favoritos */}
      <Modal 
        show={showRemoveModal} 
        onHide={onCancel}
        centered
        className="favs-modal"
      >
        <Modal.Header closeButton className="border-0"></Modal.Header>
        
        <Modal.Body className="text-center py-4">
          <p className="modal-title sans-regular mb-4">
            ¿Querés eliminar este producto de favoritos?
          </p>
        </Modal.Body>
        
        <Modal.Footer className="border-0 justify-content-center gap-3">
          <button 
            variant="outline-secondary" 
            onClick={onCancel}
            className="button-white sans-light px-4"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirmRemove}
            className="button-green sans-light px-4"
          >
            Eliminar
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal para limpiar favoritos */}
      <Modal 
        show={showClearModal} 
        onHide={onCancel}
        centered
        className="favs-modal"
      >
        <Modal.Header closeButton className="border-0"></Modal.Header>
        
        <Modal.Body className="text-center py-4">
          <p className="modal-title sans-regular mb-4">
            ¿Estás seguro que deseas eliminar todos <br /> tus productos favoritos?
          </p>
        </Modal.Body>
        
        <Modal.Footer className="border-0 justify-content-center gap-3">
          <button 
            onClick={onCancel}
            className="button-white sans-light px-4"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirmClear}
            className="button-green sans-light px-4"
          >
            Limpiar favoritos
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FavsModals;