import React from 'react';

import { ModalProvider, alert } from '../src';

export default {
  title: 'PromiseModal/BackdropUsecase',
};

export const LegacyColorBackdrop = () => {
  const handleAlert = () => {
    alert({
      title: 'Legacy Color Backdrop',
      content: 'This modal uses the legacy color string for backdrop',
    });
  };

  return (
    <ModalProvider
      options={{
        backdrop: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div>
        <button onClick={handleAlert}>Open Modal with Color String</button>
        <p>Tests backward compatibility with color string backdrop</p>
      </div>
    </ModalProvider>
  );
};

export const DarkGrayBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(50, 50, 50, 0.8)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Dark Gray Backdrop',
              content: 'This modal uses a dark gray solid color backdrop',
            })
          }
        >
          Open Modal with Dark Gray Backdrop
        </button>
        <p>Tests dark gray backdrop using CSSProperties</p>
      </div>
    </ModalProvider>
  );
};

export const BlueBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(30, 58, 138, 0.7)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Blue Backdrop',
              content: 'This modal uses a blue backdrop',
            })
          }
        >
          Open Modal with Blue Backdrop
        </button>
        <p>Tests blue backdrop using CSSProperties</p>
      </div>
    </ModalProvider>
  );
};

export const RedBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(185, 28, 28, 0.6)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Red Backdrop',
              content: 'This modal uses a red backdrop',
            })
          }
        >
          Open Modal with Red Backdrop
        </button>
        <p>Tests red backdrop using CSSProperties</p>
      </div>
    </ModalProvider>
  );
};

export const LinearGradientBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          background:
            'linear-gradient(135deg, rgba(79, 70, 229, 0.5) 0%, rgba(239, 68, 68, 0.5) 100%)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Linear Gradient Backdrop',
              content: 'This modal uses a linear gradient backdrop',
            })
          }
        >
          Open Modal with Linear Gradient
        </button>
        <p>Tests linear gradient backdrop</p>
      </div>
    </ModalProvider>
  );
};

export const RadialGradientBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(17, 24, 39, 0.8) 100%)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Radial Gradient Backdrop',
              content: 'This modal uses a radial gradient backdrop',
            })
          }
        >
          Open Modal with Radial Gradient
        </button>
        <p>Tests radial gradient backdrop</p>
      </div>
    </ModalProvider>
  );
};

export const ConicGradientBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          background:
            'conic-gradient(from 0deg, rgba(239, 68, 68, 0.5), rgba(234, 179, 8, 0.5), rgba(34, 197, 94, 0.5), rgba(59, 130, 246, 0.5), rgba(239, 68, 68, 0.5))',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Conic Gradient Backdrop',
              content: 'This modal uses a conic gradient backdrop',
            })
          }
        >
          Open Modal with Conic Gradient
        </button>
        <p>Tests conic gradient backdrop</p>
      </div>
    </ModalProvider>
  );
};

export const BlurBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)', // Safari support
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Blur Backdrop',
              content: 'This modal uses a backdrop with blur filter',
            })
          }
        >
          Open Modal with Blur Backdrop
        </button>
        <p>Tests backdrop-filter blur effect (works best with background image)</p>
      </div>
    </ModalProvider>
  );
};

export const StrongBlurBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Strong Blur Backdrop',
              content: 'This modal uses a strong blur filter',
            })
          }
        >
          Open Modal with Strong Blur
        </button>
        <p>Tests strong blur backdrop-filter effect</p>
      </div>
    </ModalProvider>
  );
};

export const BlurWithSaturationBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Blur + Saturation Backdrop',
              content: 'This modal combines blur and saturation filters',
            })
          }
        >
          Open Modal with Blur + Saturation
        </button>
        <p>Tests combined blur and saturation backdrop-filter</p>
      </div>
    </ModalProvider>
  );
};

export const GrayscaleFilterBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'grayscale(100%)',
          WebkitBackdropFilter: 'grayscale(100%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Grayscale Filter',
              content: 'This modal uses grayscale filter on backdrop',
            })
          }
        >
          Open Modal with Grayscale Filter
        </button>
        <p>Tests grayscale backdrop-filter effect</p>
      </div>
    </ModalProvider>
  );
};

export const SepiaFilterBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'sepia(80%)',
          WebkitBackdropFilter: 'sepia(80%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Sepia Filter',
              content: 'This modal uses sepia filter on backdrop',
            })
          }
        >
          Open Modal with Sepia Filter
        </button>
        <p>Tests sepia backdrop-filter effect</p>
      </div>
    </ModalProvider>
  );
};

export const InvertFilterBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'invert(90%)',
          WebkitBackdropFilter: 'invert(90%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Invert Filter',
              content: 'This modal uses invert filter on backdrop',
            })
          }
        >
          Open Modal with Invert Filter
        </button>
        <p>Tests invert backdrop-filter effect</p>
      </div>
    </ModalProvider>
  );
};

export const CombinedFiltersBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          backdropFilter:
            'blur(8px) brightness(0.8) contrast(120%) saturate(150%)',
          WebkitBackdropFilter:
            'blur(8px) brightness(0.8) contrast(120%) saturate(150%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1200)',
            backgroundSize: 'cover',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Combined Filters',
              content: 'This modal uses multiple filters combined',
            })
          }
        >
          Open Modal with Combined Filters
        </button>
        <p>Tests multiple combined backdrop-filter effects</p>
      </div>
    </ModalProvider>
  );
};

export const PatternBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: '#1f2937',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Pattern Backdrop',
              content: 'This modal uses a repeating pattern backdrop',
            })
          }
        >
          Open Modal with Pattern Backdrop
        </button>
        <p>Tests repeating pattern backdrop</p>
      </div>
    </ModalProvider>
  );
};

export const BorderBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '4px solid rgba(59, 130, 246, 0.5)',
          boxSizing: 'border-box',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Border Backdrop',
              content:
                'This modal has a border on the backdrop (unusual but possible)',
            })
          }
        >
          Open Modal with Border Backdrop
        </button>
        <p>Tests backdrop with border (unusual but possible)</p>
      </div>
    </ModalProvider>
  );
};

export const AnimatedBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          background:
            'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        },
      }}
    >
      <div>
        <style>
          {`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>
        <button
          onClick={() =>
            alert({
              title: 'Animated Backdrop',
              content: 'This modal has a subtle animation on backdrop',
            })
          }
        >
          Open Modal with Animated Backdrop
        </button>
        <p>Tests animated backdrop using CSS keyframes</p>
      </div>
    </ModalProvider>
  );
};

export const CustomOpacityBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgb(0, 0, 0)',
          opacity: 0.75,
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Custom Opacity',
              content:
                'This modal uses opacity property in addition to backgroundColor',
            })
          }
        >
          Open Modal with Custom Opacity
        </button>
        <p>Tests custom opacity property on backdrop</p>
      </div>
    </ModalProvider>
  );
};

export const LightGlassmorphismBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Glassmorphism Effect',
              content: 'This modal demonstrates a modern glassmorphism backdrop',
            })
          }
        >
          Open Modal with Light Glassmorphism
        </button>
        <p>Tests light glassmorphism effect (frosted glass look)</p>
      </div>
    </ModalProvider>
  );
};

export const DarkGlassBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px) brightness(80%)',
          WebkitBackdropFilter: 'blur(20px) brightness(80%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Dark Glass Effect',
              content: 'This modal uses a dark glassmorphism backdrop',
            })
          }
        >
          Open Modal with Dark Glass
        </button>
        <p>Tests dark glassmorphism effect</p>
      </div>
    </ModalProvider>
  );
};

export const ColoredGlassBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          backdropFilter: 'blur(15px) saturate(200%) brightness(110%)',
          WebkitBackdropFilter: 'blur(15px) saturate(200%) brightness(110%)',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: -1,
          }}
        />
        <button
          onClick={() =>
            alert({
              title: 'Colored Glass Effect',
              content: 'This modal uses a colored glassmorphism backdrop',
            })
          }
        >
          Open Modal with Colored Glass
        </button>
        <p>Tests colored glassmorphism effect</p>
      </div>
    </ModalProvider>
  );
};

export const HighContrastBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'High Contrast Backdrop',
              content:
                'This modal uses a high contrast backdrop for better visibility',
            })
          }
        >
          Open Modal with High Contrast (0.9)
        </button>
        <p>Tests high contrast backdrop for better accessibility</p>
      </div>
    </ModalProvider>
  );
};

export const LowContrastBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Low Contrast Backdrop',
              content: 'This modal uses a subtle backdrop',
            })
          }
        >
          Open Modal with Low Contrast (0.2)
        </button>
        <p>Tests low contrast backdrop for subtle effect</p>
      </div>
    </ModalProvider>
  );
};

export const TransparentBackdrop = () => {
  return (
    <ModalProvider
      options={{
        backdrop: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <div>
        <button
          onClick={() =>
            alert({
              title: 'Transparent Backdrop',
              content: 'This modal has a fully transparent backdrop',
            })
          }
        >
          Open Modal with No Backdrop (transparent)
        </button>
        <p>Tests fully transparent backdrop</p>
      </div>
    </ModalProvider>
  );
};
