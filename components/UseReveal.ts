//src/components/useReveal.ts
import { useEffect, useRef } from 'react';

export function useReveal() {
const ref = useRef<HTMLDivElement|null>(null);
useEffect(() => {
const el = ref.current; if (!el) return;
el.style.opacity = '0'; el.style.transform = 'translateY(10px)';
const io = new IntersectionObserver(([e]) => {
if (e.isIntersecting) {
el.style.transition = 'opacity .5s ease, transform .5s ease';
el.style.opacity = '1'; el.style.transform = 'translateY(0)';
io.disconnect();
}
}, { threshold: .15 });
io.observe(el);
return () => io.disconnect();
}, []);
return ref;
}
