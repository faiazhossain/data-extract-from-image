'use client';

import { ReduxProvider } from './redux/provider';
import AppContent from './AppContent';

export default function Home() {
  return (
    <ReduxProvider>
      <AppContent />
    </ReduxProvider>
  );
}
