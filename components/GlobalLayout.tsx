// src/components/GlobalLayout.tsx
import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title?: string; // optional, if you want to pass a page title elsewhere
};

export default function GlobalLayout({ children }: Props) {
  return (
    <>
            {/* Skip link for accessibility */}
            
      <a
        href="#main"
        style={{
          position: 'absolute',
          left: '-10000px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, {
            left: '1rem',
            top: '1rem',
            width: 'auto',
            height: 'auto',
            padding: '0.5rem 0.75rem',
            background: '#000',
            color: '#0f0',
            zIndex: 100000,
          });
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, {
            left: '-10000px',
            top: 'auto',
            width: 1,
            height: 1,
          });
        }}
      >
                Skip to content       
      </a>
            {/* App shell */}
            
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000',
          color: '#0f0',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
                {/* Top bar (optional, super minimal to avoid import issues) */}
                
        <header
          role="banner"
          style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
                    
          <div style={{ fontWeight: 700, letterSpacing: '0.06em' }}>
                        FELENA THEORY           
          </div>
                    
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                        XP Quantum Grid           
          </div>
                  
        </header>
                {/* Main content */}
                
        <main
          id="main"
          role="main"
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '1rem',
          }}
        >
                    {children}
                  
        </main>
                {/* Footer */}
                
        <footer
          role="contentinfo"
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid #0f0',
            fontSize: '0.85rem',
            opacity: 0.8,
          }}
        >
                    © {new Date().getFullYear()} Felena Holdings LLC         
        </footer>
              
      </div>
          
    </>
  );
}
