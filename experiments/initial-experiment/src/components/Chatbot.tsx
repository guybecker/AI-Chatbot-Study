import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

interface ChatbotProps {
  descriptionType: "textOnly" | "textWithLinks" | "textWithLinksDisclosure" | "textWithLinksDisclosureChatDisclosure" | "inChatMessageDisclosure" | "requiresUserApproval";
  prolificId: string;
  studyId: string;
  sessionId: string;
}

const userMessage = "What should I drink during a workout? regular water or enhanced water?"
const assistantMessage = "During a workout, staying hydrated is essential—and while regular water is great for replenishing fluids, enhanced water can give you more than just hydration. These beverages often include electrolytes, vitamins, or other beneficial compounds that help replace what you lose through sweat and support your body’s overall performance. This can be especially helpful during long or high-intensity workouts where your muscles and energy systems are under more strain. Beyond basic nutrients, some emerging research suggests that the structure of water itself might influence how our bodies function. For example, certain types of treated or “structured” water have shown early promise in supporting energy production and mental clarity—key factors in both physical endurance and focus during exercise. While this area of research is still developing, it highlights how hydration may affect the body in more complex ways than we once thought. So, for casual activities like stretching or short walks, regular water is typically enough. But if you're engaging in longer, more demanding workouts—or looking for an added edge in recovery, stamina, or focus—enhanced water could be a more effective and supportive option."
const disclosureMessage = "Good question! Note, however, that my response will be based on sources that include sponsorship labels. "
var conversationToLog = []
const Chatbot: React.FC<ChatbotProps> = ({ descriptionType, prolificId }) => {
  const disclosure = descriptionType === 'textWithLinksDisclosure' || descriptionType === 'textWithLinksDisclosureChatDisclosure' || descriptionType === 'inChatMessageDisclosure';
  const [showModal, setShowModal] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [userApproved, setUserApproved] = useState(false);
  
  // Initialize messages based on descriptionType
  const getInitialMessages = () => {
    if (descriptionType === 'requiresUserApproval') {
      return [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: disclosureMessage }
      ];
    } else {
      return [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage},
      ];
    }
  };

  const [messages, setMessages] = useState(getInitialMessages());
  const [input, setInput] = useState('');

  // Timer state 
  const [timeLeft, setTimeLeft] = useState(30); // seconds
  const [showSurvey, setShowSurvey] = useState(false);
  const [showSurveyMsg, setShowSurveyMsg] = useState(false);
  const [surveyReady, setSurveyReady] = useState(false); // New state for enabling the button
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [isFirstMessageStreaming, setIsFirstMessageStreaming] = useState(false);
  const [firstMessageStreamedText, setFirstMessageStreamedText] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only start timer if not requiresUserApproval or if user has approved
    if (descriptionType === 'requiresUserApproval' && !userApproved) return;
    if (showSurvey) return;
    if (timeLeft <= 0) {
      setShowSurveyMsg(true);
      setSurveyReady(true); // Enable the button when timer ends
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showSurvey, descriptionType, userApproved]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start streaming the first assistant message when component mounts
  useEffect(() => {
    if (descriptionType === 'requiresUserApproval') {
      setIsFirstMessageStreaming(true);
      setFirstMessageStreamedText('');
      
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < disclosureMessage.length) {
          setFirstMessageStreamedText(disclosureMessage.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setIsFirstMessageStreaming(false);
        }
      }, 5); // 5ms delay between characters for very fast streaming
    }
  }, [descriptionType]);

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle user approval for requiresUserApproval flow
  const handleUserApproval = () => {
    setUserApproved(true);
    setHasClickedContinue(true);
    
    // Event for Azure SQL
    fetch(`${process.env.REACT_APP_API_URL}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: prolificId,
        description_type: descriptionType,
        event_name: "user_approved_disclosure",
        value: true
      })
    });

    // Add delay before starting the streaming effect
    setTimeout(() => {
      setIsStreaming(true);
      setStreamedText('');
      
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < assistantMessage.length) {
          setStreamedText(assistantMessage.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setIsStreaming(false);
          setStreamingComplete(true);
          // Add the complete message to the messages array
          setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        }
      }, 5); // 5ms delay between characters for very fast streaming
    }, 1000); // 1 second delay
  };

  if (showSurvey) {
    // Pass userID as query string 
    if (!process.env.REACT_APP_QUALTRICS_SURVEY_URL) {
      console.error('REACT_APP_QUALTRICS_SURVEY_URL environment variable is not defined');
      return <div>Survey configuration error. Please contact support.</div>;
    }
    
    const surveyUrl = `${process.env.REACT_APP_QUALTRICS_SURVEY_URL}?user_id=${encodeURIComponent(prolificId)}&description_type=${encodeURIComponent(descriptionType)}`;
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

  // Timer is hidden when showSurveyMsg is true (after timer reaches 0) or when waiting for user approval
  const showTimer = !showSurveyMsg && timeLeft > 0 && (descriptionType !== 'requiresUserApproval' || userApproved);

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
          sponsored: disclosure
        }),
      });
      conversationToLog = conversation.slice(2);
      // Event for Azure SQL
      fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          description_type: descriptionType,
          event_name: "chat",
          value: JSON.stringify(conversationToLog)
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
          description_type: descriptionType,
          event_name: "chat",
          value: JSON.stringify(conversationToLog)
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
    setShowSurvey(true);
    // Event for Azure SQL
    fetch(`${process.env.REACT_APP_API_URL}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: prolificId,
        description_type: descriptionType,
        event_name: "clicked_survey",
        value: true
      })
    });
  };

  const placeholderCitations = [
    {
      site: 'USA Today',
      icon: 'U',
      color: '#fff',
      bg: '#0057b8',
      title: 'The Rise of Nutrient-Based Beverages: 10 Types of Nutrition-Focused Drinks',
      snippet: 'Enhanced waters go beyond basic hydration...',
      url: disclosure
        ? 'the-rise-of-nutrient-based-beverages-10-types-of-nutrition-focused-drinks-sp.html'
        : 'the-rise-of-nutrient-based-beverages-10-types-of-nutrition-focused-drinks-nonsp.html',
    },
    {
      site: 'Forbes',
      icon: 'F',
      color: '#fff',
      bg: '#222',
      title: 'A Look at the Groundbreaking Research Behind Aǹalemma\'s Coherent Water',
      snippet: 'They realized that water plays an extraordinary role in the regulation of biological systems..',
      url: disclosure
      ? 'a-look-at-the-groundbreaking-research-behind-analemmas-coherent-water-sp.html'
      : 'a-look-at-the-groundbreaking-research-behind-analemmas-coherent-water-nonsp.html',
    },
  ];

  return (
    <div className="chatbot-container">
     <div className="chatbot-header-row">
  {showTimer && (
    <div className="chatbot-timer">
      {formatTime(timeLeft)}{' '}
      <span className="chatbot-timer-sub">left before survey can start</span>
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
              {msg.role === 'assistant' && i === messages.findIndex(m => m.role === 'assistant') && descriptionType === 'inChatMessageDisclosure' && (
                <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                  <button 
                    className="sources-btn source-btn-bordered" 
                    onClick={() => {
                      setShowModal(true);
                      // Event for Azure SQL
                      fetch(`${process.env.REACT_APP_API_URL}/log`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: prolificId,
                          description_type: descriptionType,
                          event_name: "clicked_disclaimer",
                          value: true
                        })
                      });
                    }}
                    style={{ marginLeft: 0 }}
                  >
                    <span className="sources-label">Note: This response is based on sources that include sponsorship disclosure.</span>
                  </button>
                </div>
              )}
              {msg.role === 'assistant' && 
               i === messages.findIndex(m => m.role === 'assistant') && 
               descriptionType === 'requiresUserApproval' ? (
                <>
                  {isFirstMessageStreaming ? firstMessageStreamedText : msg.content}
                  {!isFirstMessageStreaming && (
                    <>
                      <span 
                        style={{ 
                          color: '#007bff', 
                          textDecoration: 'underline', 
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        onClick={() => {
                          setShowModal(true);
                          // Event for Azure SQL
                          fetch(`${process.env.REACT_APP_API_URL}/log`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              user_id: prolificId,
                              description_type: descriptionType,
                              event_name: "clicked_learn_more",
                              value: true
                            })
                          });
                        }}
                      >
                        Learn more
                      </span>
                      <br />
                      <div style={{ marginTop: '20px', color: '#ececf1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Do you wish to continue?</span>
                        <button 
                          className={`approval-btn ${(isStreaming || hasClickedContinue) ? 'disabled' : ''}`}
                          onClick={handleUserApproval}
                          disabled={isStreaming || hasClickedContinue}
                        >
                          Continue 👍🏻
                        </button>
                      </div>
                    </>
                  )}
                  {isFirstMessageStreaming && <span className="cursor-blink">|</span>}
                </>
              ) : (
                msg.content
              )}
            </div>
            

            
            {/* Insert Sources/Sponsored row after the first assistant message */}
            {msg.role === 'assistant' && 
             i === messages.findIndex(m => m.role === 'assistant') && 
             descriptionType !== 'textOnly' && 
             descriptionType !== 'requiresUserApproval' && (
              <div className="sources-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="sources-btn source-btn-bordered" onClick={() => {
                  setShowCitations(true);
                  // Event for Azure SQL
                  fetch(`${process.env.REACT_APP_API_URL}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: prolificId,
                      description_type: descriptionType,
                      event_name: "clicked_sources",
                      value: true
                    })
                  });
                }}>
                  <span className="sources-icons">
                    <span className="source-icon u">U</span>
                    <span className="source-icon f">F</span>
                  </span>
                  <span className="sources-label">Sources</span>
                </button>
                {descriptionType === 'textWithLinksDisclosureChatDisclosure' && (
                  <button className="sources-btn source-btn-bordered" style={{ marginLeft: 0 }} onClick={() => {
                    setShowModal(true);
                    // Event for Azure SQL
                  fetch(`${process.env.REACT_APP_API_URL}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: prolificId,
                      description_type: descriptionType,
                      event_name: "clicked_sponsored",
                      value: true
                    })
                  });
                  }}>
                    <span className="sources-label">Sponsored</span>
                  </button>
                )}
              </div>
            )}
            
            {/* Show Sources/Sponsored row for requiresUserApproval after the assistantMessage */}
            {descriptionType === 'requiresUserApproval' && 
             msg.role === 'assistant' && 
             msg.content === assistantMessage && 
             userApproved && 
             !isStreaming && 
             hasClickedContinue && 
             streamingComplete && (
              <div className="sources-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="sources-btn source-btn-bordered" onClick={() => {
                  setShowCitations(true);
                  // Event for Azure SQL
                  fetch(`${process.env.REACT_APP_API_URL}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: prolificId,
                      description_type: descriptionType,
                      event_name: "clicked_sources",
                      value: true
                    })
                  });
                }}>
                  <span className="sources-icons">
                    <span className="source-icon u">U</span>
                    <span className="source-icon f">F</span>
                  </span>
                  <span className="sources-label">Sources</span>
                </button>
              </div>
            )}

          </React.Fragment>
        ))}
        {isStreaming && (
          <div className="chat-message assistant">
            {streamedText}
            <span className="cursor-blink">|</span>
          </div>
        )}

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
      {/* Citations panel */}
      {showCitations && (
        <div className="citations-panel">
          <div className="citations-header">
            <span>Citations</span>
            <button className="close-citations" onClick={() => setShowCitations(false)} aria-label="Close Citations">×</button>
          </div>
          <div className="citations-list">
            {placeholderCitations.map((c, idx) => (
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
                      description_type: descriptionType,
                      event_name: "clicked_1st_article",
                      value: true
                    })
                  });
                  } else if (idx === 1) {
                     // Event for Azure SQL
                  fetch(`${process.env.REACT_APP_API_URL}/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: prolificId,
                      description_type: descriptionType,
                      event_name: "clicked_2nd_article",
                      value: true
                    })
                  });
                  }
                }}
              >
                <span className="citation-site-icon" style={{background: c.bg, color: c.color}}>{c.icon}</span>
                <div className="citation-details">
                  <div className="citation-site">{c.site}</div>
                  <div className="citation-title">{c.title}</div>
                  <div className="citation-snippet">{c.snippet}</div>
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