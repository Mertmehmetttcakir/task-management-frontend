import { Modals } from "toprak-state/src/stores/ModalStore";

// Export a direct instance to avoid MobX makeAutoObservable inheritance issues
export const uiStore = new Modals();
