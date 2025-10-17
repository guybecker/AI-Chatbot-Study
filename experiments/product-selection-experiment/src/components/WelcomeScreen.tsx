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
          value: true,
          variant: "welcome_screen"
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
      You will be shown product suggestions provided by an AI assistant in response to a user’s query about purchasing a blender at an affordable price. These responses may include links to additional sources and/or to the products themselves.
      </p>
      <p>  
      Please review the product suggestions as if you were personally considering the product. You may click on any links if you wish to read more or explore the products—just as you would if you were researching a purchase yourself.
      </p>
      <p>
      After viewing each suggestion, you’ll be asked to choose the blender you’d most like to have. You’ll be entered into a raffle associated with the value of that blender. Then, you'll be asked to answer a few short questions about your impressions. There are no right or wrong answers—we’re simply interested in your honest reactions.
      </p>
      <p>
      The study should take about 5–7 minutes. Let’s get started. 
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
