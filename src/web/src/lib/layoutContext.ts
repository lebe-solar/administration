import { useOutletContext } from 'react-router-dom';

export interface LayoutContext {
  mobile: boolean;
  onMenu: () => void;
}

export function useLayout() {
  return useOutletContext<LayoutContext>();
}
