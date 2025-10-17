import React, { useState } from 'react';
import amplitude from 'amplitude-js'; 

interface WelcomeScreenProps {
  onSuccess: (params: { userId: string; descriptionType: string }) => void;
  prolificId: string;
  studyId: string;
  sessionId: string;
}

declare global {
  interface Window {
    hj?: (...args: any[]) => void;
  }
}

const ampInstance = amplitude.getInstance();

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuccess, prolificId, studyId, sessionId }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) return;

    // Hotjar event: submit button clicked
    if (window.hj) window.hj('event', 'submit_clicked');

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          study_id: studyId,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error('Failed to assign user');
      const data = await res.json();

      // Notify Zapier webhook
      fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prolificId,
          description_type: data.description_type,
          event_name: "new_user",
          value: true
        })
      });

      ampInstance.init('3412073c4f86793ced815d18122f40b0');
      ampInstance.setUserId(prolificId);
      ampInstance.logEvent('set_user_id');

      if (window.hj) {
        window.hj('identify', prolificId, {
          description_type: data.description_type
        });
      }

      onSuccess({
        userId: prolificId,
        descriptionType: data.description_type
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      if (window.hj) window.hj('event', 'submit_error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-screen">
      <h1>Welcome to the Experiment</h1>
      <h3>Please read carefully before starting the study </h3>
      <p>
        Thank you for participating. This study is part of an academic research project. Your participation is voluntary and your responses will remain anonymous.
      </p>
      <p>  
        In this study, you will be shown a conversation of a user within an AI assistant app (such as ChatGPT, AI21 Chat, Claude, or a similar system). The conversation discusses a topic related to enhanced water.
      </p>
      <p>  
        Please read the conversation carefully. You are free to interact with the AI assistant and explore the conversation as you wish, just as you would in a real app.
      </p>
      <p>  
      When you're ready, click the "Take me to survey" button. It will become active after 30 seconds, but feel free to explore the app for as long as you like before starting. You’ll then answer a few short questions about what you read.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
          />
          I agree to participate in this study
        </label>
        <br />
        <button type="submit" disabled={!agreed || loading}>
          {loading ? 'Starting...' : 'Start Study'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default WelcomeScreen;
