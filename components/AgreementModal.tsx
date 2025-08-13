// src/components/AgreementModal.tsx
import { useRouter } from 'next/router';

interface AgreementModalProps {
  label: string;
  route: string;
}

export default function AgreementModal({ label, route }: AgreementModalProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <div className="crt-tile" onClick={handleClick}>
      <div className="crt-label">{label}</div>
    </div>
  );
}
