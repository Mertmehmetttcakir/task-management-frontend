import { Modals } from "toprak-state/src/stores/ModalStore";

// Orijinal Modals instance
const base = new Modals();


// Tür genişletmesi
type MessageType = 'success' | 'error' | 'warning';

function showMessage(type: MessageType, text: string) {
  switch (type) {
    case 'success':
      base.onShowSuccessModal?.(text);
      break;
    case 'error':
      base.onShowErrorModal?.(text);
      break;
    case 'warning':
      base.onShowSuccessModal?.(text);
      break;
  }
}

// Kısa yol fonksiyonları
(base as any).showMessage = showMessage;
(base as any).success = (msg: string) => showMessage('success', msg);
(base as any).error = (msg: string) => showMessage('error', msg);
(base as any).warning = (msg: string) => showMessage('warning', msg);

// Export
export const uiStore = base;
export default uiStore;
