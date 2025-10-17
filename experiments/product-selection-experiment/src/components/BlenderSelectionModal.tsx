import React, { useState, useEffect } from 'react';

interface Product {
  name: string;
  price: string;
  seller: string;
  rating: string;
  image: string;
  description: string;
  gallery: string[];
  buyUrl: string;
  disclosureButton?: string; // Optional field for disclosure button HTML
}

interface BlenderSelectionModalProps {
  onSelect: (product: Product) => void;
  onClose: () => void;
  products: Product[];
  onDisclosureClick?: () => void;
  effectiveDescriptionType?: string;
  variantProductName?: string;
  showContinueConfirmation?: boolean;
}

const BlenderSelectionModal: React.FC<BlenderSelectionModalProps> = ({ onSelect, onClose, products, onDisclosureClick, effectiveDescriptionType, variantProductName, showContinueConfirmation }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSubmit = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
    }
  };

  return (
  <div 
    className="modal-overlay" 
    onClick={onClose}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}
  >
    <div 
      className="modal-content" 
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: '#1a1d21',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid #353740',
        position: 'relative' // Added for absolute positioning of close button
      }}
    >
      {/* X Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          color: '#b3b8c5',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '4px',
          lineHeight: '1',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background-color 0.2s, color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#353740';
          e.currentTarget.style.color = '#ececf1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#b3b8c5';
        }}
        aria-label="Close modal"
      >
        ×
      </button>

       <div className="modal-header" style={{
         marginBottom: '20px',
         textAlign: 'left',
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'flex-start'
       }}>
         <h2 style={{
           color: '#ececf1',
           margin: '0 0 12px 0',
           fontSize: '24px',
           fontWeight: 'bold',
           display: 'block'
         }}>
           Choose Your Blender
         </h2>
         <p style={{
           color: '#b3b8c5',
           margin: 0,
           fontSize: '16px',
           lineHeight: '1.4',
           display: 'block'
         }}>
           Before the survey, please select the blender you’d most like to have. You’ll be entered into a raffle associated with the value of that blender.
         </p>
       </div>
      
      <div className="blender-options" style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
         {products.map((product, index) => {
           const isSelected = selectedProduct && selectedProduct.name === product.name;
           const isVariantProduct = product.name === variantProductName;
           const shouldShowPlaceholder = effectiveDescriptionType === 'chatConfirmation' && showContinueConfirmation && isVariantProduct;
           
           return (
           <div
             key={index}
             onClick={() => !shouldShowPlaceholder && handleProductClick(product)}
             style={{
               backgroundColor: 'white',
               borderRadius: '8px',
               padding: '0',
               boxShadow: isSelected ? '0 8px 24px rgba(44, 123, 229, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
               width: '250px',
               border: isSelected ? '4px solid #2c7be5' : '1px solid #e0e0e0',
               display: 'flex',
               flexDirection: 'column',
               cursor: shouldShowPlaceholder ? 'default' : 'pointer',
               transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s, border-width 0.2s',
               transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
               opacity: shouldShowPlaceholder ? 0.6 : 1
             }}
             onMouseEnter={(e) => {
               if (!isSelected && !shouldShowPlaceholder) {
                 e.currentTarget.style.transform = 'translateY(-2px)';
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
               }
             }}
             onMouseLeave={(e) => {
               if (!isSelected && !shouldShowPlaceholder) {
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
               }
             }}
           >
            <div style={{
              width: '100%',
              height: '150px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {shouldShowPlaceholder ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '20px',
                  lineHeight: '1.4',
                  fontWeight: '500'
                }}>
                  Display sponsored content to view
                </div>
              ) : product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain', 
                    borderRadius: '8px 8px 0 0',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f8f9fa',
                  color: '#999',
                  fontSize: '12px',
                  borderRadius: '8px 8px 0 0'
                }}>
                  Product Image
                </div>
              )}
            </div>
            <div style={{ 
              color: '#ececf1',
              backgroundColor: '#1a1d21',
              padding: '12px',
              borderRadius: '0 0 8px 8px',
              textAlign: 'left',
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              {shouldShowPlaceholder ? (
                <div style={{
                  fontSize: '14px',
                  color: '#b3b8c5',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '20px 0'
                }}>
                  Display sponsored content to view blender information
                </div>
              ) : (
                <>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '4px',
                    lineHeight: '1.2',
                    color: '#ececf1'
                  }}>
                    {product.name}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {product.price}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#b3b8c5',
                    marginBottom: '2px'
                  }}>
                    {product.seller}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#b3b8c5',
                    marginBottom: '8px'
                  }}>
                    {product.rating}
                  </div>
                </>
              )}
              
              {/* Disclosure button - added to blender selection modal */}
              {!shouldShowPlaceholder && product.disclosureButton && (
                <div 
                  style={{ marginBottom: '8px' }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'BUTTON' && target.getAttribute('data-disclosure') === 'true') {
                      e.preventDefault();
                      onDisclosureClick?.();
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: product.disclosureButton }}
                />
              )}
             </div>
           </div>
           );
         })}
       </div>
      
       <div className="modal-footer" style={{
         marginTop: '20px',
         textAlign: 'center',
         display: 'flex',
         gap: '12px',
         justifyContent: 'center'
       }}>
        
         <button
           onClick={handleSubmit}
           disabled={!selectedProduct}
           style={{
             backgroundColor: selectedProduct ? '#2c7be5' : '#353740',
             border: '1px solid #2c7be5',
             color: selectedProduct ? '#ffffff' : '#666666',
             padding: '8px 16px',
             borderRadius: '6px',
             cursor: selectedProduct ? 'pointer' : 'not-allowed',
             fontSize: '14px',
             fontWeight: '600'
           }}
           onMouseEnter={(e) => {
             if (selectedProduct) {
               e.currentTarget.style.backgroundColor = '#1e5bb8';
             }
           }}
           onMouseLeave={(e) => {
             if (selectedProduct) {
               e.currentTarget.style.backgroundColor = '#2c7be5';
             }
           }}
         >
           Select Blender & Continue to Survey
         </button>
       </div>
    </div>
  </div>
  );
};

export default BlenderSelectionModal;
