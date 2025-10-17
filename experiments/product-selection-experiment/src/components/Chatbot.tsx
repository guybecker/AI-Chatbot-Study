import React, { useState, useEffect, useRef, useMemo } from 'react';
import Modal from './Modal';
import BlenderSelectionModal from './BlenderSelectionModal';

interface ChatbotProps {
  descriptionType: "textWithLinks" | "textWithLinksDisclosure" | "chatDisclosure" | "chatConfirmation";
  prolificId: string;
  studyId: string;
  sessionId: string;
}

interface Product {
  name: string;
  price: string;
  seller: string;
  rating: string;
  image: string;
  description: string;
  buyUrl: string;
  disclosureButton?: string; // Optional field for disclosure button HTML
}

const userMessage = "Recommend a portable blender under $50. Give me 2 options to choose from"
const assistantMessage = "Here are two solid portable blenders under $50 available for purchase, each offering good value for basic blending needs: 1. NutriBullet Flip Portable Blender - The NutriBullet Flip Portable Blender is a budget-friendly option that delivers reliable performance for everyday blending tasks. Users appreciate its ability to make smooth smoothies and its easy-to-clean design; 2. Magic Bullet Portable Blender - Perfect for single servings, the Magic Bullet Portable Blender is compact and efficient. Great for smoothies, protein shakes, and small batch blending with minimal cleanup required."
//const disclosureMessage = "Good question! Note, however, that my response will be based on sources that include sponsorship labels. "

// Add placeholder message for sponsored content
const placeholderMessage = "Sponsored content"

const baseProductData: Product[] = [
  {
    name: "NutriBullet Flip Portable Blender",
    price: "$39.95",
    seller: "Amazon.com",
    rating: "★ 4.2",
    image: "/nutri_bullet.jpg",
    description: "The NutriBullet Flip Portable Blender is a budget-friendly option that delivers reliable performance for everyday blending tasks. Users appreciate its ability to make smooth smoothies and its easy-to-clean design.",
    buyUrl: "https://www.amazon.com/sspa/click?ie=UTF8&spc=MTo1NDAxNzUwMTg1NDkwMjQ4OjE3NTgxMjQ5NzY6c3BfYXRmOjMwMDU5MzExMTIzMTMwMjo6MDo6&url=%2Fnutribullet-Portable-Cordless-Rechargeable-NBPB50100K%2Fdp%2FB0DNL4K4MD%2Fref%3Dsr_1_1_sspa%3Fdib%3DeyJ2IjoiMSJ9.-4k5k-4O7u4OMKryNNTsAwCkjLVzIg9OLiQ3wBT2dpEaglXT3rckCEAiGBriTOf4JSfV-KtmwUusM0FhRbe6qh6_tx2VzK1yJd8P1R82X9UbtBrWaHpBZncVep7LFHfEb_6ZDAdmEQ-NqFBOb6-7_8isnnWzySd_c6KIVFqi_YyEL__qEPgX-qk-DUFjjUs556xWWfnSueGW0GAGhnpOoXYj6FgWfcp1Z5G0hb8jVGk.GTVbDp9M0bXqmUeeT0OpEoESYNzJAih0Q667VtC2oyA%26dib_tag%3Dse%26hvadid%3D570569684624%26hvdev%3Dc%26hvexpln%3D0%26hvlocphy%3D9031958%26hvnetw%3Dg%26hvocijid%3D3548462531752457541--%26hvqmt%3De%26hvrand%3D3548462531752457541%26hvtargid%3Dkwd-121932601939%26hydadcr%3D13932_13379002%26keywords%3Dnutribullet%2Bflip%26mcid%3D789eea2372da3762a178653a3efb8ba8%26qid%3D1758124976%26sr%3D8-1-spons%26sp_csd%3Dd2lkZ2V0TmFtZT1zcF9hdGY%26psc%3D1"
  },
  {
    name: "Magic Bullet Portable Blender",
    price: "$39.95",
    seller: "Amazon.com",
    rating: "★ 4.2",
    image: "/magic_bullet.webp",
    description: "Perfect for single servings, the Magic Bullet Portable Blender is compact and efficient. Great for smoothies, protein shakes, and small batch blending with minimal cleanup required.",
    buyUrl: "https://www.amazon.com/magic-bullet-Portable-Blender-MBPB50100/dp/B0CFSD8DHF/ref=sr_1_1?dib=eyJ2IjoiMSJ9.963esd1WBF-4bvZPTKklrIzjW1MOSqasSVBoBnh5-1Ozq3WyPjqyw5LEQkZb4ejQsGQTRUxR4zXbjIk61N8YPCOdg9Gc9ofnzlNai6IcJW4aL9wChEYd-cow_OfiWDjMWLlGR2T6sg3BT77Hy8p-Dk1GnmV9WXQ3vUeuwER4IuXBKLoC0YBQW9Hdk4jgZG9n_cN9_cLJ-1l-vHYs3wB3H1-WVFMa21eHIsXDbYVfFM0.dyTy1udx6Dc98HthHos47awZkX-OGsKpxtkAtnp94KI&dib_tag=se&hvadid=321825085612&hvdev=c&hvexpln=0&hvlocphy=9031958&hvnetw=g&hvocijid=16753818189342009835--&hvqmt=e&hvrand=16753818189342009835&hvtargid=kwd-615489066652&hydadcr=20213_9566459&keywords=magic+bullet+portable+blender&mcid=ca929c1248363573806608640ba4c8a3&qid=1758125316&sr=8-1"
  }
];

// Function to shuffle array
const shuffleArray = (array: Product[]): Product[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to randomly assign baseline and variant roles
const assignProductRoles = (products: Product[]): { baseline: Product; variant: Product; baselineIndex: number; variantIndex: number } => {
  // Randomly choose which product is baseline (0 or 1)
  const baselineIndex = Math.floor(Math.random() * 2);
  const variantIndex = baselineIndex === 0 ? 1 : 0;
  
  return {
    baseline: products[baselineIndex],
    variant: products[variantIndex],
    baselineIndex,
    variantIndex
  };
};

// Function to determine citation URL based on product role and description type
const getCitationUrl = (productName: string, isBaseline: boolean, descriptionType: string): string => {
  const isNutriBullet = productName === "NutriBullet Flip Portable Blender";
  
  if (isBaseline) {
    // Rule 1: Baseline product always gets "not-sp" URL
    return isNutriBullet ? 'nutri-not-sp.html' : 'magic-not-sp.html';
  } else {
    // This is the variant product
    if (descriptionType === "textWithLinks") {
      // Rule 2: For textWithLinks, variant gets "not-sp" URL
      return isNutriBullet ? 'nutri-not-sp.html' : 'magic-not-sp.html';
    } else {
      // Rule 3: For all other descriptionTypes, variant gets "sp" URL
      return isNutriBullet ? 'nutri-sp.html' : 'magic-sp.html';
    }
  }
};

// Function to modify variant product based on descriptionType
const createVariantProduct = (baseProduct: Product, descriptionType: string): Product => {
  // The baseline product stays exactly the same
  // The variant product gets modified description based on descriptionType
  
  let modifiedDescription = baseProduct.description;
  let disclosureButtonHtml: string | undefined;
  
  switch (descriptionType) {
    case "textWithLinksDisclosure":
      // Mark that this product should show a sponsored button (will be rendered next to Sources button)
      disclosureButtonHtml = "sponsored"; // Just a flag, not actual HTML
      modifiedDescription = baseProduct.description; // Don't modify description
      break;
    case "chatDisclosure":
       // Add disclosure button to description and product data
       disclosureButtonHtml = "<button class='disclosure-btn' data-disclosure='true' style='background: none; border: 1px solid #353740; color: #b3b8c5; padding: 4px 8px; border-radius: 20px; cursor: pointer; font-size: 12px;'>Note: This product recommendation is based on sources that include sponsorship disclosure.</button>";
       modifiedDescription = baseProduct.description + "<br><br>" + disclosureButtonHtml;
       break;
    case "chatConfirmation":
      // Add links with chat confirmation
       disclosureButtonHtml = "<button class='disclosure-btn' data-disclosure='true' style='background: none; border: 1px solid #353740; color: #b3b8c5; padding: 4px 8px; border-radius: 20px; cursor: pointer; font-size: 12px;'>Note: This product recommendation is based on sources that include sponsorship disclosure.</button>";
       modifiedDescription = baseProduct.description + "<br><br>" + disclosureButtonHtml;
       break;
      default: // "textWithLinks"
      // Add some links to the description
      //modifiedDescription = baseProduct.description + " [Learn more about blender features](https://example.com/features)";
      break;
  }
  
  return {
    ...baseProduct,
    description: modifiedDescription,
    disclosureButton: disclosureButtonHtml
  };
};

// Generate randomized product data
const shuffledProducts: Product[] = shuffleArray(baseProductData);

// Updated Product Card Component - now unclickable with more spacing
const ProductCard: React.FC<{ 
  product: Product; 
  onSourcesClick: (e: React.MouseEvent) => void;
  onDisclosureClick?: () => void;
  isPlaceholder?: boolean;
  isVariant?: boolean;
  revealImage?: boolean;
  prolificId?: string;
  effectiveDescriptionType?: string;
  variantProductName?: string;
}> = ({ product, onSourcesClick, onDisclosureClick, isPlaceholder = false, isVariant = false, revealImage = false, prolificId, effectiveDescriptionType, variantProductName }) => (
  <div 
    className="product-card" 
    style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      flex: '1',
      minWidth: '200px',
      maxWidth: '300px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      // Removed cursor: 'pointer' and transition
    }}
    // Removed onClick and mouse event handlers
  >
    <div className="product-image" style={{
      width: '100%',
      height: '180px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px 8px 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#666',
      overflow: 'hidden'
    }}>
      {(isPlaceholder && isVariant) ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f9fa',
          color: '#333',
          fontSize: '18px',
          textAlign: 'center',
          padding: '20px',
          lineHeight: '1.4',
          fontWeight: '500',
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => onDisclosureClick?.()}
        >
          {placeholderMessage}
          {/* Gradual image reveal overlay */}
          {revealImage && product.image && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeInImage 2s ease-in-out forwards'
            }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  borderRadius: '8px 8px 0 0',
                  backgroundColor: '#f8f9fa',
                  opacity: 0,
                  animation: 'fadeInImage 2s ease-in-out 0.5s forwards'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {product.image ? (
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement;
                if (sibling) {
                  sibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div style={{
            display: product.image ? 'none' : 'flex',
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
        </>
      )}
    </div>
    <div className="product-info" style={{ 
      color: '#ececf1',
      backgroundColor: '#1a1d21',
      padding: '12px',
      borderRadius: '0 0 8px 8px',
      textAlign: 'left',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div className="product-details">
        <div className="product-name" style={{
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '4px',
          lineHeight: '1.2',
          color: '#ececf1'
        }}>
          {(isPlaceholder && isVariant) ? "" : product.name}
        </div>
        {!(isPlaceholder && isVariant) && (
          <>
            <div className="product-price" style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
              {product.price}
            </div>
            <div className="product-seller" style={{
              fontSize: '16px',
              color: '#b3b8c5',
              marginBottom: '2px'
            }}>
              {product.seller}
            </div>
            <div className="product-rating" style={{
              fontSize: '16px',
              color: '#b3b8c5',
              marginBottom: '16px' // Increased from '8px' to '16px' for more spacing
            }}>
              {product.rating}
            </div>
          </>
        )}
        
        {/* Disclosure button - only for non-sponsored buttons (chatDisclosure, etc.) */}
        {!(isPlaceholder && isVariant) && product.disclosureButton && product.disclosureButton !== "sponsored" && (
          <div 
            style={{ marginBottom: '12px' }}
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
      
      {/* Buttons container - hide for placeholder */}
      {!(isPlaceholder && isVariant) && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center',
          marginTop: 'auto' 
        }}>
        {/* Sources button */}
        <button 
          className="sources-btn source-btn-bordered" 
          onClick={onSourcesClick}
          style={{
            background: 'none',
            border: '1px solid #353740',
            color: '#b3b8c5',
            padding: '4px 8px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#23272f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span className="sources-icons" style={{ display: 'flex', gap: '2px' }}>
            <span className="source-icon" style={{
              background: '#222',
              color: '#fff',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              F
            </span>
          </span>
          <span className="sources-label">Sources</span>
        </button>
        
        {/* Sponsored button - only show for textWithLinksDisclosure */}
        {product.disclosureButton === "sponsored" && (
          <button 
            className="sponsored-btn" 
            onClick={(e) => {
              e.preventDefault();
              onDisclosureClick?.();
              
              // Log sponsored button click
              if (prolificId && effectiveDescriptionType) {
                fetch(`${process.env.REACT_APP_API_URL}/log`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: prolificId,
                    description_type: effectiveDescriptionType,
                    event_name: "clicked_sponsored_button",
                    value: true,
                    variant: variantProductName
                  })
                });
              }
            }}
            style={{
              background: '#2d2f34',
              border: '1px solid #44474f',
              color: '#ececf1',
              padding: '4px 8px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '600',
              height: '38px',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#23272f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2f34';
            }}
          >
            Sponsored
          </button>
        )}
        </div>
      )}
      
      {/* Continue button for variant product in placeholder mode */}
      {(isPlaceholder && isVariant) && (
        <div style={{ 
          padding: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('continueConfirmation');
              window.dispatchEvent(event);
            }}
            style={{
              background: '#2d2f34',
              border: '1px solid #44474f',
              color: '#ececf1',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#23272f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2f34';
            }}
          >
            Display sponsored content <span></span>
          </button>
        </div>
      )}
    </div>
  </div>
);


var conversationToLog = []
const Chatbot: React.FC<ChatbotProps> = ({ descriptionType, prolificId }) => {
  // Check for debug query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const showDebug = urlParams.get('debug') === 'true';
  
  // Check for descriptionType override query parameter
  const descriptionTypeOverride = urlParams.get('descriptionType');
  const validDescriptionTypes = ['textWithLinks', 'textWithLinksDisclosure', 'chatDisclosure', 'chatConfirmation'];
  
  // Use query parameter override if it's valid, otherwise use prop
  const effectiveDescriptionType = descriptionTypeOverride && validDescriptionTypes.includes(descriptionTypeOverride) 
    ? descriptionTypeOverride as "textWithLinks" | "textWithLinksDisclosure" | "chatDisclosure" | "chatConfirmation"
    : descriptionType;
  
  // Log when override is being used
  if (descriptionTypeOverride && validDescriptionTypes.includes(descriptionTypeOverride)) {
    console.log(`🎯 DescriptionType override: ${descriptionType} → ${effectiveDescriptionType}`);
  }

  // Use useMemo to ensure randomization only happens once and track which is variant
  const { productData, variantProductName, baselineProductName, variantPosition } = useMemo(() => {
    // Randomly assign baseline and variant roles
    const productRoles = assignProductRoles(shuffledProducts);
    
    // Create the final product array maintaining original positions
    const finalProducts = new Array(2);
    finalProducts[productRoles.baselineIndex] = productRoles.baseline; // Keep baseline unchanged
    finalProducts[productRoles.variantIndex] = createVariantProduct(productRoles.variant, effectiveDescriptionType); // Modify variant

    // Determine if variant is on left (index 0) or right (index 1)
    const variantIsOnLeft = productRoles.variantIndex === 0;

    return {
      productData: finalProducts,
      variantProductName: productRoles.variant.name,
      baselineProductName: productRoles.baseline.name,
      variantPosition: variantIsOnLeft ? 'LEFT' : 'RIGHT'
    };
  }, [effectiveDescriptionType]); // Only recalculate if effectiveDescriptionType changes

  const disclosure = effectiveDescriptionType === 'textWithLinksDisclosure' || effectiveDescriptionType === 'chatDisclosure' || effectiveDescriptionType === 'chatConfirmation';
  const [showModal, setShowModal] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showMagicBulletCitations, setShowMagicBulletCitations] = useState(false);
  const [showBlenderSelection, setShowBlenderSelection] = useState(false);
  const [selectedBlenderForRaffle, setSelectedBlenderForRaffle] = useState<Product | null>(null);
  const [showContinueConfirmation, setShowContinueConfirmation] = useState(effectiveDescriptionType === 'chatConfirmation');
  const [revealVariantImage, setRevealVariantImage] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage},
  ]);
  const [input, setInput] = useState('');

  // Timer state 
  const [timeLeft, setTimeLeft] = useState(30); // seconds
  const [showSurvey, setShowSurvey] = useState(false);
  const [showSurveyMsg, setShowSurveyMsg] = useState(false);
  const [surveyReady, setSurveyReady] = useState(false); // New state for enabling the button

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showSurvey) return;
    
    // Timer now starts immediately for all description types
    if (timeLeft <= 0) {
      setShowSurveyMsg(true);
      setSurveyReady(true); // Enable the button when timer ends
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showSurvey]);

  // Add event listener for Continue button from ProductCard
  useEffect(() => {
    const handleContinueConfirmation = () => {
      setShowContinueConfirmation(false);
      
      // Start image reveal animation
      setRevealVariantImage(true);
      
      // Event for Azure SQL
      fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          description_type: effectiveDescriptionType,
          event_name: "clicked_continue_confirmation",
          value: true,
          variant: variantProductName
        })
      });
      
      // Add smooth scroll effect with 1 second delay and slower animation
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      }, 1000); // 1 second delay as requested
    };

    window.addEventListener('continueConfirmation', handleContinueConfirmation);
    return () => window.removeEventListener('continueConfirmation', handleContinueConfirmation);
  }, [prolificId, effectiveDescriptionType, variantProductName]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (showSurvey) {
    // Pass userID and selected blender as query string
    const selectedBlenderInfo = selectedBlenderForRaffle ? 
      `&selected_blender=${encodeURIComponent(selectedBlenderForRaffle.name)}&blender_price=${encodeURIComponent(selectedBlenderForRaffle.price)}` : '';
    
    if (!process.env.REACT_APP_QUALTRICS_SURVEY_URL) {
      console.error('REACT_APP_QUALTRICS_SURVEY_URL environment variable is not defined');
      return <div>Survey configuration error. Please contact support.</div>;
    }
    
    const surveyUrl = `${process.env.REACT_APP_QUALTRICS_SURVEY_URL}?user_id=${encodeURIComponent(prolificId)}&description_type=${encodeURIComponent(effectiveDescriptionType)}${selectedBlenderInfo}`;
    return (
      <div className="chatbot-container" style={{ padding: 0, margin: 0 }}>
        <iframe
          src={surveyUrl}
          title="Survey"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            border: 'none',
            margin: 0,
            padding: 0,
            zIndex: 9999,
            background: '#fff',
          }}
        />
      </div>
    );
  }

  // Timer is hidden when showSurveyMsg is true (after timer reaches 0)
  const showTimer = !showSurveyMsg && timeLeft > 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add the user's message to the chat
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Create conversation array: messageHistory + followUp as user message
    const conversation = [
      ...messages,
      { role: 'user', content: input }
    ];

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          messageHistory: newMessages,
          followUp: input,
          sponsored: disclosure,
          variant: variantProductName
        }),
      });
      conversationToLog = conversation.slice(2);
      // Event for Azure SQL
      fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          description_type: effectiveDescriptionType,
          event_name: "chat",
          value: JSON.stringify(conversationToLog),
          variant: variantProductName
        })
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();

      // Add the assistant's response to the chat
      setMessages(msgs => [...msgs, { role: 'assistant', content: data.response }]);
      // Append assistant response to conversation
      conversation.push({ role: 'assistant', content: data.response });
      conversationToLog.push({ role: 'assistant', content: data.response });
      // Event for Azure SQL
      fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          description_type: effectiveDescriptionType,
          event_name: "chat",
          value: JSON.stringify(conversationToLog),
          variant: variantProductName
        })
      });
    } catch (err) {
      setMessages(msgs => [
        ...msgs,
        { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }
      ]);
      conversationToLog.push({ role: 'assistant', content: 'Sorry, there was an error. Please try again.' });
    }
  };

  // Handler for the Start Survey button
  const handleStartSurvey = () => {
    setShowBlenderSelection(true);
    // Event for Azure SQL
    fetch(`${process.env.REACT_APP_API_URL}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: prolificId,
        description_type: effectiveDescriptionType,
        event_name: "clicked_survey",
        value: true,
        variant: variantProductName
      })
    });
  };

  // Handler for blender selection
  const handleBlenderSelection = (product: Product) => {
    setSelectedBlenderForRaffle(product);
    setShowBlenderSelection(false);
    setShowSurvey(true);
    
    // Event for Azure SQL - log the selected blender
    fetch(`${process.env.REACT_APP_API_URL}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: prolificId,
        description_type: effectiveDescriptionType,
        event_name: "selected_blender_for_raffle",
        value: JSON.stringify({
          name: product.name
        }),
        variant: variantProductName
      })
    });
  };


  // Function to get NutriBullet citations with dynamic URL
  const getNutriBulletCitations = () => {
    const isBaseline = baselineProductName === "NutriBullet Flip Portable Blender";
    const url = getCitationUrl("NutriBullet Flip Portable Blender", isBaseline, effectiveDescriptionType);
    
    return [
      {
        site: 'Forbes',
        icon: 'F',
        color: '#fff',
        bg: '#222',
        title: 'Portable Blender Reviews 2025',
        snippet: 'The NutriBullet Flip Portable Blender is a budget-friendly option that delivers reliable performance for everyday blending tasks. Users appreciate its ability to make smooth smoothies...',
        url: url
      },
    ];
  };

  // Function to get Magic Bullet citations with dynamic URL
  const getMagicBulletCitations = () => {
    const isBaseline = baselineProductName === "Magic Bullet Portable Blender";
    const url = getCitationUrl("Magic Bullet Portable Blender", isBaseline, effectiveDescriptionType);
    
    return [
      {
        site: 'Forbes',
        icon: 'F',
        color: '#fff',
        bg: '#222',
        title: 'Best Blenders',
        snippet: 'The Magic Bullet Portable Blender combines convenience with performance, making it the clear winner...',
        url: url
      },
    ];
  };

  const handleDescriptionClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href') === 'https://example.com/features') {
      event.preventDefault();
      setShowModal(true);
    } else if (target.tagName === 'BUTTON' && target.getAttribute('data-disclosure') === 'true') {
      event.preventDefault();
      setShowModal(true);
      
      // Log disclosure button click
      fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          description_type: effectiveDescriptionType,
          event_name: "clicked_disclosure_button",
          value: true,
          variant: variantProductName
        })
      });
    }
  };

  return (
    <div className="chatbot-container">
      {/* CSS for image reveal animation */}
      <style>
        {`
          @keyframes fadeInImage {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      {/* Debug Information - only show if debug=true query param */}
      {showDebug && (
        <div style={{
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '1px solid #ccc'
        }}>
          🐛 DEBUG MODE | Description Type: {effectiveDescriptionType} | Variant Product: {variantProductName} ({variantPosition}) | Baseline Product: {baselineProductName}
        </div>
      )}

      <div className="chatbot-header-row">
        {showTimer && (
          <div className="chatbot-timer" style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              {formatTime(timeLeft)}{' '}
              <span className="chatbot-timer-sub">left before survey can start</span>
            </div>
          </div>
        )}
        <button
          onClick={handleStartSurvey}
          disabled={!surveyReady}
          className={`chatbot-survey-btn${surveyReady ? ' enabled' : ''}`}
        >
          Take me to the survey
        </button>
      </div>
      {/* Show "Taking you to survey" message when timer ends, but before button is clicked */}
      {showSurveyMsg && !surveyReady && (
        <div style={{ position: 'fixed', top: 60, right: 20, zIndex: 1000, padding: '10px 20px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          Taking you to survey
        </div>
      )}
      {/* Move chat window down to clear timer height (e.g., 60px) */}
      <div className="chat-window" style={{ marginTop: 0 }}>
        {messages.map((msg, i) => (
          <React.Fragment key={i}>
            <div className={`chat-message ${msg.role}`}>
              {msg.content}
            </div>
            
            
            {/* Insert Product Cards after the first assistant message */}
            {msg.role === 'assistant' && i === messages.findIndex(m => m.role === 'assistant') && (
              <>
                <div className="products-container" style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '12px',
                  marginBottom: '6px',
                  justifyContent: 'space-between',
                  flexWrap: 'nowrap',
                  padding: '0 1.25rem'
                }}>
                  {productData.map((product, index) => (
                    <ProductCard 
                      key={index} 
                      product={product} 
                      isPlaceholder={effectiveDescriptionType === 'chatConfirmation' && showContinueConfirmation}
                      isVariant={product.name === variantProductName}
                      revealImage={product.name === variantProductName && revealVariantImage}
                      prolificId={prolificId}
                      effectiveDescriptionType={effectiveDescriptionType}
                      variantProductName={variantProductName}
                      onSourcesClick={(e) => {
                        // Don't allow sources click for placeholder variant
                        if (effectiveDescriptionType === 'chatConfirmation' && showContinueConfirmation && product.name === variantProductName) return;
                        
                        if (product.name === "Magic Bullet Portable Blender") {
                          setShowMagicBulletCitations(true);
                          setShowCitations(false); // Close the other panel
                        } else {
                          setShowCitations(true);
                          setShowMagicBulletCitations(false); // Close the other panel
                        }
                        
                        // Event for Azure SQL
                        const eventName = product.name === "Magic Bullet Portable Blender" 
                          ? "clicked_magicbullet_sources" 
                          : "clicked_nutribullet_sources";
                        
                        fetch(`${process.env.REACT_APP_API_URL}/log`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            user_id: prolificId,
                            description_type: effectiveDescriptionType,
                            event_name: eventName,
                            value: true,
                            variant: variantProductName
                          })
                        });
                      }}
                      onDisclosureClick={() => {
                        setShowModal(true);
                        
                        // Log disclosure button click
                        fetch(`${process.env.REACT_APP_API_URL}/log`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            user_id: prolificId,
                            description_type: effectiveDescriptionType,
                            event_name: "clicked_disclosure_button",
                            value: true,
                            variant: variantProductName
                          })
                        });
                      }}
                    />
                  ))}
                </div>
                
                {/* Product descriptions section - always show, but with placeholder for variant in chatConfirmation */}
                <div className="product-descriptions" style={{
                  marginTop: '6px',
                  marginBottom: '12px',
                  textAlign: 'left',
                  padding: '0 1.25rem'
                }}>
                {productData.map((product, index) => (
                  <div key={index} style={{
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      margin: '0 0 4px 0',
                      color: '#ececf1',
                      textDecoration: 'underline'
                    }}>
                      {product.name}
                    </h3>
                    {effectiveDescriptionType === 'chatConfirmation' && showContinueConfirmation && product.name === variantProductName ? (
                      <div style={{
                        fontSize: '16px',
                        lineHeight: '1.4',
                        margin: '0 0 8px 0',
                        color: '#b3b8c5',
                        fontStyle: 'italic'
                      }}>
                      </div>
                    ) : (
                      <p style={{
                        fontSize: '16px',
                        lineHeight: '1.4',
                        margin: '0 0 8px 0',
                        color: '#b3b8c5'
                      }} 
                      onClick={handleDescriptionClick}
                      dangerouslySetInnerHTML={{ __html: product.description }}>
                      </p>
                    )}
                      {/* Sources buttons for NutriBullet */}
                      {product.name === "NutriBullet Flip Portable Blender" && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {effectiveDescriptionType === 'chatConfirmation' && showContinueConfirmation && product.name === variantProductName ? (
                            <div style={{
                              fontSize: '14px',
                              color: '#b3b8c5',
                              fontStyle: 'italic'
                            }}>
                              Display sponsored content to view blender information
                            </div>
                          ) : (
                            <button 
                              className="sources-btn source-btn-bordered" 
                              onClick={() => {
                                setShowCitations(true);
                                setShowMagicBulletCitations(false); // Close MagicBullet panel
                                // Event for Azure SQL
                                fetch(`${process.env.REACT_APP_API_URL}/log`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    user_id: prolificId,
                                    description_type: effectiveDescriptionType,
                                    event_name: "clicked_nutribullet_sources",
                                    value: true,
                                    variant: variantProductName
                                  })
                                });
                              }}
                              style={{
                                background: 'none',
                                border: '1px solid #353740',
                                color: '#b3b8c5',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#23272f';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span className="sources-icons" style={{ display: 'flex', gap: '2px' }}>
                                <span className="source-icon f" style={{
                                  background: '#222',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: '16px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>F</span>
                              </span>
                              <span className="sources-label">Sources</span>
                            </button>
                          )}
                          
                          {/* Add Sponsored button if this product has sponsored flag */}
                          {product.disclosureButton === "sponsored" && (
                            <button 
                              className="sponsored-btn" 
                              onClick={() => {
                                setShowModal(true);
                                
                                // Log sponsored button click
                                fetch(`${process.env.REACT_APP_API_URL}/log`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    user_id: prolificId,
                                    description_type: effectiveDescriptionType,
                                    event_name: "clicked_sponsored_button",
                                    value: true,
                                    variant: variantProductName
                                  }) 
                                });
                              }}
                              style={{
                                background: '#2d2f34',
                                border: '1px solid #44474f',
                                color: '#ececf1',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: '600',
                                height: '38px',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#23272f';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#2d2f34';
                              }}
                            >
                              Sponsored
                            </button>
                          )}
                        </div>
                      )}
                      {product.name === "Magic Bullet Portable Blender" && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {effectiveDescriptionType === 'chatConfirmation' && showContinueConfirmation && product.name === variantProductName ? (
                            <div style={{
                              fontSize: '14px',
                              color: '#b3b8c5',
                              fontStyle: 'italic'
                            }}>
                              Display sponsored content to view sources
                            </div>
                          ) : (
                            <button 
                              className="sources-btn source-btn-bordered" 
                              onClick={() => {
                                setShowMagicBulletCitations(true);
                                setShowCitations(false); // Close NutriBullet Flip Portable Blender panel
                                // Event for Azure SQL
                                fetch(`${process.env.REACT_APP_API_URL}/log`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    user_id: prolificId,
                                    description_type: effectiveDescriptionType,
                                    event_name: "clicked_magicbullet_sources",
                                    value: true,
                                    variant: variantProductName
                                  })
                                });
                              }}
                              style={{
                                background: 'none',
                                border: '1px solid #353740',
                                color: '#b3b8c5',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#23272f';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span className="sources-icons" style={{ display: 'flex', gap: '2px' }}>
                                <span className="source-icon f" style={{
                                  background: '#222',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: '16px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>F</span>
                              </span>
                              <span className="sources-label">Sources</span>
                            </button>
                          )}
                          
                          {/* Add Sponsored button if this product has sponsored flag */}
                          {product.disclosureButton === "sponsored" && (
                            <button 
                              className="sponsored-btn" 
                              onClick={() => {
                                setShowModal(true);
                                
                                // Log sponsored button click
                                fetch(`${process.env.REACT_APP_API_URL}/log`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    user_id: prolificId,
                                    description_type: effectiveDescriptionType,
                                    event_name: "clicked_sponsored_button",
                                    value: true,
                                    variant: variantProductName
                                  })
                                });
                              }}
                              style={{
                                background: 'none',
                                border: '1px solid #353740',
                                color: '#b3b8c5',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#23272f';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Sponsored
                            </button>
                          )}
                        </div>
                      )}
                      
                    </div>
                  ))}
                  </div>
              </>
            )}

          </React.Fragment>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon"><path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path></svg>
        </button>
      </form>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      {/* Blender Selection Modal */}
      {showBlenderSelection && (
        <BlenderSelectionModal
          onSelect={handleBlenderSelection}
          onClose={() => setShowBlenderSelection(false)}
          products={productData}
          effectiveDescriptionType={effectiveDescriptionType}
          variantProductName={variantProductName}
          showContinueConfirmation={showContinueConfirmation}
          onDisclosureClick={() => {
            setShowModal(true);
            
            // Log disclosure button click
            fetch(`${process.env.REACT_APP_API_URL}/log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: prolificId,
                description_type: effectiveDescriptionType,
                event_name: "clicked_disclosure_button",
                value: true,
                variant: variantProductName
              })
            });
          }}
        />
      )}
      {/* Citations panel */}
      {showCitations && (
        <div className="citations-panel">
          <div className="citations-header">
            <span style={{ textAlign: 'left' }}>NutriBullet Flip Portable Blender - Citations</span>
            <button className="close-citations" onClick={() => setShowCitations(false)} aria-label="Close Citations">×</button>
          </div>
          <div className="citations-list">
            {getNutriBulletCitations().map((c, idx) => (
              <a
                key={idx}
                className="citation-item"
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (idx === 0) {
                    // Event for Azure SQL
                    fetch(`${process.env.REACT_APP_API_URL}/log`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: prolificId,
                        description_type: effectiveDescriptionType,
                        event_name: "clicked_nutribullet_citation",
                        value: true,
                        variant: variantProductName
                      })
                    });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderBottom: '1px solid #e5e5e5',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div className="citation-icon" style={{
                  backgroundColor: c.bg,
                  color: c.color,
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {c.icon}
                </div>
                <div className="citation-content">
                  <div className="citation-title" style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {c.title}
                  </div>
                  <div className="citation-snippet" style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    {c.snippet}
                  </div>
                  <div className="citation-url" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {c.site}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MagicBullet Citations panel */}
      {showMagicBulletCitations && (
        <div className="citations-panel">
          <div className="citations-header">
            <span style={{ textAlign: 'left' }}>Magic Bullet Portable Blender - Citations</span>
            <button className="close-citations" onClick={() => setShowMagicBulletCitations(false)} aria-label="Close Citations">×</button>
          </div>
          <div className="citations-list">
            {getMagicBulletCitations().map((c, idx) => (
              <a
                key={idx}
                className="citation-item"
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Event for Azure SQL
                  fetch(`${process.env.REACT_APP_API_URL}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: prolificId,
                      description_type: effectiveDescriptionType,
                      event_name: "clicked_magicbullet_citation",
                      value: true,
                      variant: variantProductName
                    })
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderBottom: '1px solid #e5e5e5',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div className="citation-icon" style={{
                  backgroundColor: c.bg,
                  color: c.color,
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {c.icon}
                </div>
                <div className="citation-content">
                  <div className="citation-title" style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {c.title}
                  </div>
                  <div className="citation-snippet" style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    {c.snippet}
                  </div>
                  <div className="citation-url" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {c.site}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 