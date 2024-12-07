
// components/ClickLogger.js

import { useEffect } from 'react';

const ClickLogger = () => {
  useEffect(() => {
    const handleClick = async (event) => {
      const target = event.target;
      const buttonId = target.getAttribute('data-button-id')
      if (buttonId) {
        const url = window.location.href;
        const timestamp = Date.now();
        const username = localStorage.getItem('username');
        const currentGameObj = localStorage.getItem('currentGameObj');

        await fetch('/api/logClick', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, timestamp, buttonId, username,gameName:JSON.parse(currentGameObj || '').gameTitle  }),
        });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
};

export default ClickLogger;
