import React, { useState } from 'react';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import Chatbot from './components/Chatbot';



function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [descriptionType, setDescriptionType] = useState<'textOnly' | 'textWithLinks' | 'textWithLinksDisclosure' | 'textWithLinksDisclosureChatDisclosure' | null>(null);
  
  const searchParams = new URLSearchParams(window.location.search);
  const prolificId = searchParams.get('PROLIFIC_PID');
  const studyId = searchParams.get('STUDY_ID');
  const sessionId = searchParams.get('SESSION_ID');

  const handleWelcomeSuccess = (params: { userId: string; descriptionType: string; }) => {
    setUserId(params.userId);
    setDescriptionType(params.descriptionType as 'textOnly' | 'textWithLinks' | 'textWithLinksDisclosure' | 'textWithLinksDisclosureChatDisclosure');

  };

  return (
    <div className="App">
      {!userId || !descriptionType ? (
        <WelcomeScreen onSuccess={handleWelcomeSuccess} 
        prolificId={prolificId ?? ""}
        studyId={studyId ?? ""}
        sessionId={sessionId ?? ""}/>
      ) : (
        <Chatbot descriptionType={descriptionType}  prolificId={prolificId ?? ""} studyId={studyId ?? ""} sessionId={sessionId ?? ""}  />
      )}
    </div>
  );
}

export default App;
