import React, { useEffect, useMemo, useState } from 'react';
import ReactWebChat, {createDirectLine} from 'botframework-webchat';
import './App.css';

function App() {
  const [token, setToken] = useState();

  useEffect(() => {
    const init = async () => {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();
      setToken(token);
    }

    init();
  }, []);

  const chatStyle = {
    width: '100vw',
    height: '100vh'
  };

  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  return (
    <>
      <div>
        <button> Start </button>
        <button> End </button>
      </div>
      <div style={chatStyle}>
        <ReactWebChat
          directLine={directLine}
        />
      </div>
    </>
  );
}

export default App;
