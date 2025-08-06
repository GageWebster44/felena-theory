 // context/GlobalProvider.tsx

import { OperatorProvider } from './OperatorContext';

export default function GlobalProvider({ children }) {
  return (
    <OperatorProvider>
      {children}
    </OperatorProvider>
  );
}