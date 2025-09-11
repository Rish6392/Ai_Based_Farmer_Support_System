import { useState, useEffect } from 'react';
// import { useToast } from './customtoast/CustomToast';
// import icons from '../../public/icon.png';

const InstallPrompt = ({
  title = "Install KrisiSeva App",
  description = "Install KrisiSeva App on your device to get a better experience.",
  buttonLabel = "Install",
  sessionKey = "installPromptShown",
  forceShow = false,
  onCancel
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  // const { showToast } = useToast();

  useEffect(() => {
    // Prevent if already installed (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      return;
    }

    // Prevent if modal for THIS context was already shown (unless forceShow)
    if (!forceShow && sessionStorage.getItem(sessionKey)) {
      return;
    }

    let installPromptEvent = null;

    // Listener for browser install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      installPromptEvent = e;
      setDeferredPrompt(e);
      setShowPrompt(true);
      if (!forceShow) sessionStorage.setItem(sessionKey, "true");
    };

    // Listen for PWA install event
    const handleAppInstalled = () => {
      // showToast('Application was successfully installed!', "success", "medium");
      setShowPrompt(false);
    };

    // Attach listeners unless forceShow (in which case, open modal directly)
    if (!forceShow) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    } else {
      // force show modal for contexts like order_details
      setShowPrompt(true);
    }
    
    // Clean up
    return () => {
      if (!forceShow) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [forceShow, sessionKey]);

  // User clicks Install
  const handleInstall = () => {
    if (!deferredPrompt) {
      // Some browsers may not support PWA install prompt, just close or show advice
      // showToast('Install option is not available at the moment.', 'error', 'medium');
      setShowPrompt(false);
      return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  // User clicks Not now
  const handleCancel = () => {
    setShowPrompt(false);
    if (typeof onCancel === 'function') onCancel();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-2xl bg-opacity-50">
      <div className="rounded-lg p-6 shadow-xl max-w-md w-full mx-4 bg-white text-gray-800">
        <div className="flex items-center mb-4">
          <div className="mr-3 text-orange w-9 overflow-hidden rounded-full">
            {/* <img src={icons} alt="Logo" className='w-full h-9 object-fill'/> */}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="mb-6">{description}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 hover:scale-102 active:scale-98 cursor-pointer transition duration-300"
          >
            Not Now
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 button-primary text-black rounded hover:bg-orange hover:scale-102 active:scale-98 cursor-pointer transition duration-300"
            disabled={!deferredPrompt && !forceShow} // If no prompt and not force showing
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
