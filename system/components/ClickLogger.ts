// components/ClickLogger.ts
import { useEffect } from 'react';

const ClickLogger = () => {
  useEffect(() => {
    // Get game context from localStorage
    const getContext = () => {
      try {
        const gameObj = JSON.parse(localStorage.getItem('currentGameObj') || '{}');
        const stage = gameObj.stage ?? JSON.parse(localStorage.getItem('stage') || 'null');
        return {
          url: window.location.href,
          username: localStorage.getItem('username'),
          gameName: gameObj.gameTitle || 'unknown',
          currentStep: gameObj.currentStep ?? null,
          stage: stage ?? null,
        };
      } catch {
        return { url: window.location.href, username: null, gameName: 'unknown', currentStep: null, stage: null };
      }
    };

    // Send log to API
    const logEvent = (data: Record<string, unknown>) => {
      fetch('/api/logClick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...getContext(), ...data }),
      }).catch(console.error);
    };

    // Handle button clicks
    const handleClick = (event: MouseEvent) => {
      const buttonId = (event.target as HTMLElement).getAttribute('data-button-id');
      if (buttonId) {
        logEvent({ timestamp: Date.now(), buttonId, eventType: 'button_click' });
      }
    };

    // Handle canvas events from iframe
    const handleMessage = (event: MessageEvent) => {
      const { type, timestamp, x, y, key, canvasWidth, canvasHeight, sandboxId } = event.data;
      
      if (type === 'CANVAS_CLICK') {
        logEvent({
          timestamp, buttonId: 'canvas_click', eventType: 'canvas_click',
          canvasX: x, canvasY: y, canvasWidth, canvasHeight, sandboxId,
        });
      } else if (type === 'CANVAS_KEYPRESS') {
        logEvent({
          timestamp, buttonId: 'canvas_keypress', eventType: 'canvas_keypress',
          key, canvasWidth, canvasHeight, sandboxId,
        });
      }
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('message', handleMessage);
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
};

export default ClickLogger;
