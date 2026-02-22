"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["1097"],{76138(n,e,i){i.r(e),i.d(e,{metadata:()=>t,default:()=>u,frontMatter:()=>r,contentTitle:()=>d,toc:()=>l,assets:()=>c});var t=JSON.parse('{"id":"winglet/react-utils/hook/useWindowSize","title":"useWindowSize","description":"Tracks browser window dimensions with automatic updates on resize events.","source":"@site/docs/winglet/react-utils/hook/useWindowSize.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useWindowSize","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useWindowSize","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useWindowSize.mdx","tags":[],"version":"current","frontMatter":{"title":"useWindowSize","sidebar_label":"useWindowSize"},"sidebar":"winglet","previous":{"title":"useVersion","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useVersion"},"next":{"title":"renderComponent","permalink":"/albatrion/ko/docs/winglet/react-utils/render/renderComponent"}}'),s=i(62540),o=i(43023),a=i(91297);let r={title:"useWindowSize",sidebar_label:"useWindowSize"},d="useWindowSize",c={},l=[{value:"Use Cases",id:"use-cases",level:3},{value:"Performance Considerations",id:"performance-considerations",level:3},{value:"Responsive Design Patterns",id:"responsive-design-patterns",level:3},{value:"Signature",id:"signature",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function h(n){let e={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.R)(),...n.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(e.header,{children:(0,s.jsx)(e.h1,{id:"usewindowsize",children:"useWindowSize"})}),"\n",(0,s.jsx)(e.p,{children:"Tracks browser window dimensions with automatic updates on resize events.\nThis hook subscribes to window resize events and provides real-time viewport dimensions,\nenabling responsive components that adapt to window size changes. It handles event listener\ncleanup automatically and provides initial size measurement after component mount."}),"\n",(0,s.jsx)(e.h3,{id:"use-cases",children:"Use Cases"}),"\n",(0,s.jsxs)(e.ul,{children:["\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Responsive Components"}),": Adapt layout based on current viewport size"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Conditional Rendering"}),": Show/hide elements based on available screen space"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Dynamic Calculations"}),": Calculate dimensions relative to viewport (e.g., modals, overlays)"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Breakpoint Logic"}),": Implement custom responsive breakpoints in JavaScript"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Performance Optimization"}),": Render different components for mobile vs desktop"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Accessibility"}),": Adjust UI density and touch targets based on screen size"]}),"\n"]}),"\n",(0,s.jsx)(e.h3,{id:"performance-considerations",children:"Performance Considerations"}),"\n",(0,s.jsxs)(e.ul,{children:["\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"High Frequency Events"}),": Resize events fire frequently during window resizing"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Debouncing Recommended"}),": For expensive computations, combine with ",(0,s.jsx)(e.code,{children:"useDebounce"})]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"SSR Compatibility"}),": Returns ",(0,s.jsx)(e.code,{children:"{width: 0, height: 0}"})," on server-side"]}),"\n",(0,s.jsxs)(e.li,{children:[(0,s.jsx)(e.strong,{children:"Memory Efficiency"}),": Automatically cleans up event listeners on unmount"]}),"\n"]}),"\n",(0,s.jsx)(e.h3,{id:"responsive-design-patterns",children:"Responsive Design Patterns"}),"\n",(0,s.jsx)(e.p,{children:"Use this hook to implement responsive behavior that CSS media queries can't handle:"}),"\n",(0,s.jsxs)(e.ul,{children:["\n",(0,s.jsx)(e.li,{children:"Dynamic grid columns based on available width"}),"\n",(0,s.jsx)(e.li,{children:"Conditional component rendering"}),"\n",(0,s.jsx)(e.li,{children:"Viewport-aware animations and transitions"}),"\n",(0,s.jsx)(e.li,{children:"Content sizing relative to viewport"}),"\n"]}),"\n",(0,s.jsx)(e.h2,{id:"signature",children:"Signature"}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-typescript",children:"const useWindowSize: () => {\n    width: number;\n    height: number;\n}\n"})}),"\n",(0,s.jsx)(e.h2,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(e.p,{children:"An object containing the current window dimensions: - width: The inner width of the window in pixels (0 during SSR) - height: The inner height of the window in pixels (0 during SSR)"}),"\n",(0,s.jsx)(e.h2,{id:"examples",children:"Examples"}),"\n",(0,s.jsx)(e.h3,{id:"example-1",children:"Example 1"}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-typescript",children:"// Basic responsive layout switching\nconst ResponsiveLayout = () => {\n  const { width, height } = useWindowSize();\n\n  const isMobile = width < 768;\n  const isTablet = width >= 768 && width < 1024;\n  const isDesktop = width >= 1024;\n\n  // Content area sized to viewport\n  return (\n    <div className={`layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>\n      {isMobile ? (\n        <MobileNavigation />\n      ) : (\n        <DesktopNavigation />\n      )}\n\n      <main style={{ minHeight: height - 80 }}>\n        <Content />\n      </main>\n    </div>\n  );\n};\n\n// Custom breakpoint hook composition\nconst useBreakpoint = () => {\n  const { width } = useWindowSize();\n\n  return useMemo(() => {\n    if (width < 480) return 'xs';\n    if (width < 768) return 'sm';\n    if (width < 1024) return 'md';\n    if (width < 1280) return 'lg';\n    if (width < 1536) return 'xl';\n    return '2xl';\n  }, [width]);\n};\n\nconst AdaptiveComponent = () => {\n  const breakpoint = useBreakpoint();\n\n  const config = useMemo(() => {\n    switch (breakpoint) {\n      case 'xs': return { columns: 1, cardSize: 'small', showSidebar: false };\n      case 'sm': return { columns: 2, cardSize: 'small', showSidebar: false };\n      case 'md': return { columns: 2, cardSize: 'medium', showSidebar: true };\n      case 'lg': return { columns: 3, cardSize: 'medium', showSidebar: true };\n      default: return { columns: 4, cardSize: 'large', showSidebar: true };\n    }\n  }, [breakpoint]);\n\n  return (\n    <div className={`responsive-grid grid-${config.columns}`}>\n      // Component adapts to breakpoint\n    </div>\n  );\n};\n\n// Dynamic grid with calculated columns\nconst ResponsiveGrid = ({ items, minItemWidth = 250 }) => {\n  const { width } = useWindowSize();\n\n  const columns = Math.max(1, Math.floor(width / minItemWidth));\n  const itemWidth = Math.floor((width - (columns + 1) * 20) / columns);\n\n  return (\n    <div\n      style={{\n        display: 'grid',\n        gridTemplateColumns: `repeat(${columns}, 1fr)`,\n        gap: '20px',\n        padding: '20px'\n      }}\n    >\n      {items.map((item, index) => (\n        <GridItem\n          key={item.id}\n          data={item}\n          width={itemWidth}\n        />\n      ))}\n    </div>\n  );\n};\n\n// Viewport-aware modal positioning\nconst AdaptiveModal = ({ isOpen, onClose, children }) => {\n  const { width, height } = useWindowSize();\n\n  const modalStyle = useMemo(() => {\n    const isMobile = width < 768;\n\n    if (isMobile) {\n      // Full-screen on mobile\n      return {\n        position: 'fixed',\n        top: 0,\n        left: 0,\n        width: '100%',\n        height: '100%',\n        transform: 'none'\n      };\n    } else {\n      // Centered with max dimensions on desktop\n      const maxWidth = Math.min(800, width * 0.9);\n      const maxHeight = Math.min(600, height * 0.8);\n\n      return {\n        position: 'fixed',\n        top: '50%',\n        left: '50%',\n        transform: 'translate(-50%, -50%)',\n        width: maxWidth,\n        height: maxHeight,\n        maxWidth: '90vw',\n        maxHeight: '90vh'\n      };\n    }\n  }, [width, height]);\n\n  if (!isOpen) return null;\n\n  return (\n    <>\n      <div className=\"modal-backdrop\" onClick={onClose} />\n      <div className=\"modal\" style={modalStyle}>\n        {children}\n      </div>\n    </>\n  );\n};\n\n// Performance-optimized with debouncing\nconst DeboucedResponsiveChart = ({ data }) => {\n  const windowSize = useWindowSize();\n\n  // Debounce resize events to prevent excessive chart re-renders\n  const debouncedSize = useDebounce(() => windowSize, 250);\n\n  const chartDimensions = useMemo(() => {\n    const { width, height } = debouncedSize;\n    const chartWidth = Math.min(width - 40, 1200);\n    const chartHeight = Math.min(height * 0.6, 400);\n\n    return { width: chartWidth, height: chartHeight };\n  }, [debouncedSize]);\n\n  return (\n    <div className=\"chart-container\">\n      <Chart\n        data={data}\n        width={chartDimensions.width}\n        height={chartDimensions.height}\n      />\n    </div>\n  );\n};\n\n// Orientation-aware component\nconst OrientationSensitive = () => {\n  const { width, height } = useWindowSize();\n\n  const orientation = width > height ? 'landscape' : 'portrait';\n  const aspectRatio = (width / height).toFixed(2);\n\n  return (\n    <div className={`app-${orientation}`}>\n      <div className=\"viewport-info\">\n        <span>Size: {width} \xd7 {height}</span>\n        <span>Orientation: {orientation}</span>\n        <span>Aspect Ratio: {aspectRatio}</span>\n      </div>\n\n      {orientation === 'landscape' ? (\n        <LandscapeLayout />\n      ) : (\n        <PortraitLayout />\n      )}\n    </div>\n  );\n};\n\n// Fullscreen component with viewport sizing\nconst FullscreenCanvas = () => {\n  const { width, height } = useWindowSize();\n  const canvasRef = useRef<HTMLCanvasElement>(null);\n\n  useEffect(() => {\n    const canvas = canvasRef.current;\n    if (!canvas) return;\n\n    // Update canvas size to match viewport\n    canvas.width = width;\n    canvas.height = height;\n\n    // Update canvas rendering based on new size\n    const ctx = canvas.getContext('2d');\n    if (ctx) {\n      redrawCanvas(ctx, width, height);\n    }\n  }, [width, height]);\n\n  return (\n    <canvas\n      ref={canvasRef}\n      style={{\n        position: 'fixed',\n        top: 0,\n        left: 0,\n        width: '100vw',\n        height: '100vh'\n      }}\n    />\n  );\n};\n\n// Responsive text sizing\nconst ScalingText = ({ children }) => {\n  const { width } = useWindowSize();\n\n  const fontSize = useMemo(() => {\n    // Scale font size based on viewport width\n    const baseSize = 16;\n    const scaleFactor = Math.max(0.8, Math.min(1.5, width / 1200));\n    return baseSize * scaleFactor;\n  }, [width]);\n\n  return (\n    <div style={{ fontSize: `${fontSize}px` }}>\n      {children}\n    </div>\n  );\n};\n\n// Conditional loading based on screen size\nconst ConditionalFeatures = () => {\n  const { width } = useWindowSize();\n  const isLargeScreen = width >= 1200;\n\n  return (\n    <div>\n      <MainContent />\n      // Only load heavy components on large screens\n      {isLargeScreen && (\n        <Suspense fallback={<div>Loading advanced features...</div>}>\n          <AdvancedAnalytics />\n          <RealTimeChart />\n          <DetailedControls />\n        </Suspense>\n      )}\n    </div>\n  );\n};\n"})}),"\n",(0,s.jsx)(e.h2,{id:"playground",children:"Playground"}),"\n",(0,s.jsx)(a.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// Basic responsive layout switching
const ResponsiveLayout = () => {
const { width, height } = useWindowSize();

const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

// Content area sized to viewport
return (
  <div className={\`layout \${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}\`}>
    {isMobile ? (
      <MobileNavigation />
    ) : (
      <DesktopNavigation />
    )}

    <main style={{ minHeight: height - 80 }}>
      <Content />
    </main>
  </div>
);
};

// Custom breakpoint hook composition
const useBreakpoint = () => {
const { width } = useWindowSize();

return useMemo(() => {
  if (width < 480) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}, [width]);
};

const AdaptiveComponent = () => {
const breakpoint = useBreakpoint();

const config = useMemo(() => {
  switch (breakpoint) {
    case 'xs': return { columns: 1, cardSize: 'small', showSidebar: false };
    case 'sm': return { columns: 2, cardSize: 'small', showSidebar: false };
    case 'md': return { columns: 2, cardSize: 'medium', showSidebar: true };
    case 'lg': return { columns: 3, cardSize: 'medium', showSidebar: true };
    default: return { columns: 4, cardSize: 'large', showSidebar: true };
  }
}, [breakpoint]);

return (
  <div className={\`responsive-grid grid-\${config.columns}\`}>
    // Component adapts to breakpoint
  </div>
);
};

// Dynamic grid with calculated columns
const ResponsiveGrid = ({ items, minItemWidth = 250 }) => {
const { width } = useWindowSize();

const columns = Math.max(1, Math.floor(width / minItemWidth));
const itemWidth = Math.floor((width - (columns + 1) * 20) / columns);

return (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: \`repeat(\${columns}, 1fr)\`,
      gap: '20px',
      padding: '20px'
    }}
  >
    {items.map((item, index) => (
      <GridItem
        key={item.id}
        data={item}
        width={itemWidth}
      />
    ))}
  </div>
);
};

// Viewport-aware modal positioning
const AdaptiveModal = ({ isOpen, onClose, children }) => {
const { width, height } = useWindowSize();

const modalStyle = useMemo(() => {
  const isMobile = width < 768;

  if (isMobile) {
    // Full-screen on mobile
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      transform: 'none'
    };
  } else {
    // Centered with max dimensions on desktop
    const maxWidth = Math.min(800, width * 0.9);
    const maxHeight = Math.min(600, height * 0.8);

    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: maxWidth,
      height: maxHeight,
      maxWidth: '90vw',
      maxHeight: '90vh'
    };
  }
}, [width, height]);

if (!isOpen) return null;

return (
  <>
    <div className="modal-backdrop" onClick={onClose} />
    <div className="modal" style={modalStyle}>
      {children}
    </div>
  </>
);
};

// Performance-optimized with debouncing
const DeboucedResponsiveChart = ({ data }) => {
const windowSize = useWindowSize();

// Debounce resize events to prevent excessive chart re-renders
const debouncedSize = useDebounce(() => windowSize, 250);

const chartDimensions = useMemo(() => {
  const { width, height } = debouncedSize;
  const chartWidth = Math.min(width - 40, 1200);
  const chartHeight = Math.min(height * 0.6, 400);

  return { width: chartWidth, height: chartHeight };
}, [debouncedSize]);

return (
  <div className="chart-container">
    <Chart
      data={data}
      width={chartDimensions.width}
      height={chartDimensions.height}
    />
  </div>
);
};

// Orientation-aware component
const OrientationSensitive = () => {
const { width, height } = useWindowSize();

const orientation = width > height ? 'landscape' : 'portrait';
const aspectRatio = (width / height).toFixed(2);

return (
  <div className={\`app-\${orientation}\`}>
    <div className="viewport-info">
      <span>Size: {width} \xd7 {height}</span>
      <span>Orientation: {orientation}</span>
      <span>Aspect Ratio: {aspectRatio}</span>
    </div>

    {orientation === 'landscape' ? (
      <LandscapeLayout />
    ) : (
      <PortraitLayout />
    )}
  </div>
);
};

// Fullscreen component with viewport sizing
const FullscreenCanvas = () => {
const { width, height } = useWindowSize();
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  // Update canvas size to match viewport
  canvas.width = width;
  canvas.height = height;

  // Update canvas rendering based on new size
  const ctx = canvas.getContext('2d');
  if (ctx) {
    redrawCanvas(ctx, width, height);
  }
}, [width, height]);

return (
  <canvas
    ref={canvasRef}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh'
    }}
  />
);
};

// Responsive text sizing
const ScalingText = ({ children }) => {
const { width } = useWindowSize();

const fontSize = useMemo(() => {
  // Scale font size based on viewport width
  const baseSize = 16;
  const scaleFactor = Math.max(0.8, Math.min(1.5, width / 1200));
  return baseSize * scaleFactor;
}, [width]);

return (
  <div style={{ fontSize: \`\${fontSize}px\` }}>
    {children}
  </div>
);
};

// Conditional loading based on screen size
const ConditionalFeatures = () => {
const { width } = useWindowSize();
const isLargeScreen = width >= 1200;

return (
  <div>
    <MainContent />
    // Only load heavy components on large screens
    {isLargeScreen && (
      <Suspense fallback={<div>Loading advanced features...</div>}>
        <AdvancedAnalytics />
        <RealTimeChart />
        <DetailedControls />
      </Suspense>
    )}
  </div>
);
};`})]})}function u(n={}){let{wrapper:e}={...(0,o.R)(),...n.components};return e?(0,s.jsx)(e,{...n,children:(0,s.jsx)(h,{...n})}):h(n)}}}]);