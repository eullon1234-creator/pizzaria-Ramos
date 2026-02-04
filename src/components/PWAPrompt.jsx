import { useEffect, useState } from 'react';
import { Bell, Download, X, RefreshCw } from 'lucide-react';

export default function PWAPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Detectar quando o app pode ser instalado
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Verificar se já foi instalado ou se o usuário já dispensou
      const hasDissmissed = localStorage.getItem('pwa-install-dismissed');
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      
      if (!hasDissmissed && !isInstalled) {
        // Mostrar após 3 segundos
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    // Detectar quando há uma atualização disponível
    const handleUpdateFound = (reg) => {
      const newWorker = reg.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setShowUpdatePrompt(true);
          setRegistration(reg);
        }
      });
    };

    // Registrar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar atualizações do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => handleUpdateFound(reg));
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!showInstallPrompt && !showUpdatePrompt) return null;

  return (
    <>
      {/* Prompt de Instalação */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-white rounded-lg shadow-2xl border-2 border-red-600 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                <Download className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                  Instale nosso App! 📱
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Instale a Pizzaria Ramos no seu celular para acesso rápido, 
                  notificações de pedidos e funcionamento offline!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Instalar Agora
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de Atualização */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="font-bold mb-1">
                  Nova Versão Disponível! ✨
                </h3>
                <p className="text-sm text-blue-100 mb-3">
                  Atualize agora para a versão mais recente com novas funcionalidades.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Atualizar Agora
                  </button>
                  <button
                    onClick={() => setShowUpdatePrompt(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
