import { Workbox } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-window.prod.mjs';
if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  let registration;

  const promptForUpdate = async () => {
    // show a prompt to the user

    const updateToast = document.getElementById('updateToast');

    updateToast.style.display = 'flex';

    return new Promise((resolve) => {
      const updateButton = document.getElementById('updateButton');

      updateButton.addEventListener('click', () => {
        updateToast.style.display = 'none';
        resolve(true);
      });
    });
  };

  const showSkipWaitingPrompt = async (event) => {
    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    const updateAccepted = await promptForUpdate();

    if (updateAccepted) {
      wb.messageSkipWaiting();
    }
  };

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', (event) => {
    showSkipWaitingPrompt(event);
  });

  wb.register();

}