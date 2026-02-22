"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["1591"],{1149(e,r,n){n.r(r),n.d(r,{metadata:()=>t,default:()=>u,frontMatter:()=>l,contentTitle:()=>a,toc:()=>d,assets:()=>c});var t=JSON.parse('{"id":"winglet/react-utils/hook/useRestProperties","title":"useRestProperties","description":"Maintains referential stability for object props by returning the same reference when contents are identical.","source":"@site/docs/winglet/react-utils/hook/useRestProperties.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useRestProperties","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useRestProperties","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useRestProperties.mdx","tags":[],"version":"current","frontMatter":{"title":"useRestProperties","sidebar_label":"useRestProperties"},"sidebar":"winglet","previous":{"title":"useReference","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useReference"},"next":{"title":"useSnapshot","permalink":"/albatrion/ko/docs/winglet/react-utils/hook/useSnapshot"}}'),s=n(62540),o=n(43023),i=n(91297);let l={title:"useRestProperties",sidebar_label:"useRestProperties"},a="useRestProperties",c={},d=[{value:"Performance Problem it Solves",id:"performance-problem-it-solves",level:3},{value:"Use Cases",id:"use-cases",level:3},{value:"Shallow Comparison Algorithm",id:"shallow-comparison-algorithm",level:3},{value:"Performance Characteristics",id:"performance-characteristics",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function p(e){let r={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r.header,{children:(0,s.jsx)(r.h1,{id:"userestproperties",children:"useRestProperties"})}),"\n",(0,s.jsx)(r.p,{children:"Maintains referential stability for object props by returning the same reference when contents are identical.\nThis hook performs shallow equality comparison and returns the previous object reference\nif all properties and values remain the same. It's essential for preventing unnecessary\nre-renders in memoized components when object props are created inline or computed dynamically."}),"\n",(0,s.jsx)(r.h3,{id:"performance-problem-it-solves",children:"Performance Problem it Solves"}),"\n",(0,s.jsx)(r.p,{children:"React creates new object references on every render for:"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:["Inline object literals: ",(0,s.jsx)(r.code,{children:"&lt;Component config={{ theme: 'dark' }} />"})]}),"\n",(0,s.jsxs)(r.li,{children:["Spread operations: ",(0,s.jsx)(r.code,{children:"&lt;Component {...restProps} />"})]}),"\n",(0,s.jsxs)(r.li,{children:["Computed objects: ",(0,s.jsx)(r.code,{children:"&lt;Component data={{ ...state, computed: value }} />"}),"\nEven when contents are identical, new references break memoization and cause re-renders."]}),"\n"]}),"\n",(0,s.jsx)(r.h3,{id:"use-cases",children:"Use Cases"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Rest Props Optimization"}),": Stabilize ",(0,s.jsx)(r.code,{children:"{...restProps}"})," in component APIs"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Context Value Stability"}),": Prevent context consumer re-renders"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Dynamic Prop Objects"}),": Maintain stable references for computed configurations"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"HOC Prop Forwarding"}),": Optimize prop forwarding in higher-order components"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Form Field Props"}),": Stabilize field configurations in form libraries"]}),"\n"]}),"\n",(0,s.jsx)(r.h3,{id:"shallow-comparison-algorithm",children:"Shallow Comparison Algorithm"}),"\n",(0,s.jsxs)(r.ol,{children:["\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Reference Check"}),": Return immediately if object reference unchanged"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Nullish Check"}),": Handle null/undefined consistently"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Key Count Comparison"}),": Fast path for different property counts"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Value Comparison"}),": Shallow comparison of all property values"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Reference Preservation"}),": Return previous reference if contents identical"]}),"\n"]}),"\n",(0,s.jsx)(r.h3,{id:"performance-characteristics",children:"Performance Characteristics"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Best Case"}),": O(1) for unchanged references"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Typical Case"}),": O(n) where n = number of properties"]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.strong,{children:"Memory"}),": Stores one previous reference per hook instance"]}),"\n"]}),"\n",(0,s.jsx)(r.h2,{id:"signature",children:"Signature"}),"\n",(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-typescript",children:"const useRestProperties: <T extends Dictionary>(props: T) => T\n"})}),"\n",(0,s.jsx)(r.h2,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(r.table,{children:[(0,s.jsx)(r.thead,{children:(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.th,{children:"Name"}),(0,s.jsx)(r.th,{children:"Type"}),(0,s.jsx)(r.th,{children:"Description"})]})}),(0,s.jsx)(r.tbody,{children:(0,s.jsxs)(r.tr,{children:[(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"props"})}),(0,s.jsx)(r.td,{children:(0,s.jsx)(r.code,{children:"-"})}),(0,s.jsx)(r.td,{children:"The properties object to stabilize via shallow comparison"})]})})]}),"\n",(0,s.jsx)(r.h2,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(r.p,{children:"The same object reference if contents are unchanged, otherwise the new object"}),"\n",(0,s.jsx)(r.h2,{id:"examples",children:"Examples"}),"\n",(0,s.jsx)(r.h3,{id:"example-1",children:"Example 1"}),"\n",(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-typescript",children:"// \u274C Problem: New object on every render\nconst ExpensiveChild = React.memo(({ config }) => {\n  return <div>Renders on every parent update</div>;\n});\n\nconst Parent = ({ theme, user }) => {\n  return (\n    <ExpensiveChild\n      config={{ theme, userId: user.id }} // New object every time!\n    />\n  );\n};\n\n// \u2705 Solution: Stabilize object reference\nconst Parent = ({ theme, user }) => {\n  const stableConfig = useRestProperties({\n    theme,\n    userId: user.id\n  });\n\n  return <ExpensiveChild config={stableConfig} />; // Only re-renders when content changes\n};\n\n// Rest props in reusable components\nconst Button = ({ variant, size, children, ...restProps }) => {\n  const stableRestProps = useRestProperties(restProps);\n\n  return (\n    <MemoizedButton\n      variant={variant}\n      size={size}\n      {...stableRestProps} // Stable reference prevents re-renders\n    >\n      {children}\n    </MemoizedButton>\n  );\n};\n\n// Context provider optimization\nconst AuthProvider = ({ children }) => {\n  const [user, setUser] = useState(null);\n  const [permissions, setPermissions] = useState([]);\n\n  const contextValue = useRestProperties({\n    user,\n    permissions,\n    isAuthenticated: !!user,\n    hasPermission: (perm) => permissions.includes(perm),\n    login: setUser,\n    logout: () => setUser(null)\n  });\n\n  // Consumers only re-render when auth state actually changes\n  return (\n    <AuthContext.Provider value={contextValue}>\n      {children}\n    </AuthContext.Provider>\n  );\n};\n\n// Form field configuration\nconst FormField = ({ name, label, validation, ...fieldProps }) => {\n  const stableFieldConfig = useRestProperties({\n    name,\n    required: validation?.required ?? false,\n    pattern: validation?.pattern,\n    ...fieldProps\n  });\n\n  return <MemoizedInput config={stableFieldConfig} label={label} />;\n};\n\n// Table/List component props\nconst DataTable = ({ data, sortBy, filterBy, pageSize }) => {\n  const processedData = useMemo(() =>\n    applyFiltersAndSort(data, filterBy, sortBy), [data, filterBy, sortBy]\n  );\n\n  const tableConfig = useRestProperties({\n    items: processedData,\n    totalCount: data.length,\n    isEmpty: processedData.length === 0,\n    pageSize,\n    sortBy,\n    filterBy\n  });\n\n  return <VirtualizedTable config={tableConfig} />;\n};\n\n// HOC with stable prop forwarding\nconst withErrorBoundary = (Component) => {\n  return React.memo((props) => {\n    const stableProps = useRestProperties(props);\n    const [hasError, setHasError] = useState(false);\n\n    if (hasError) {\n      return <ErrorFallback onRetry={() => setHasError(false)} />;\n    }\n\n    return (\n      <ErrorBoundary onError={() => setHasError(true)}>\n        <Component {...stableProps} />\n      </ErrorBoundary>\n    );\n  });\n};\n"})}),"\n",(0,s.jsx)(r.h2,{id:"playground",children:"Playground"}),"\n",(0,s.jsx)(i.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// \u{274C} Problem: New object on every render
const ExpensiveChild = React.memo(({ config }) => {
return <div>Renders on every parent update</div>;
});

const Parent = ({ theme, user }) => {
return (
  <ExpensiveChild
    config={{ theme, userId: user.id }} // New object every time!
  />
);
};

// \u{2705} Solution: Stabilize object reference
const Parent = ({ theme, user }) => {
const stableConfig = useRestProperties({
  theme,
  userId: user.id
});

return <ExpensiveChild config={stableConfig} />; // Only re-renders when content changes
};

// Rest props in reusable components
const Button = ({ variant, size, children, ...restProps }) => {
const stableRestProps = useRestProperties(restProps);

return (
  <MemoizedButton
    variant={variant}
    size={size}
    {...stableRestProps} // Stable reference prevents re-renders
  >
    {children}
  </MemoizedButton>
);
};

// Context provider optimization
const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [permissions, setPermissions] = useState([]);

const contextValue = useRestProperties({
  user,
  permissions,
  isAuthenticated: !!user,
  hasPermission: (perm) => permissions.includes(perm),
  login: setUser,
  logout: () => setUser(null)
});

// Consumers only re-render when auth state actually changes
return (
  <AuthContext.Provider value={contextValue}>
    {children}
  </AuthContext.Provider>
);
};

// Form field configuration
const FormField = ({ name, label, validation, ...fieldProps }) => {
const stableFieldConfig = useRestProperties({
  name,
  required: validation?.required ?? false,
  pattern: validation?.pattern,
  ...fieldProps
});

return <MemoizedInput config={stableFieldConfig} label={label} />;
};

// Table/List component props
const DataTable = ({ data, sortBy, filterBy, pageSize }) => {
const processedData = useMemo(() =>
  applyFiltersAndSort(data, filterBy, sortBy), [data, filterBy, sortBy]
);

const tableConfig = useRestProperties({
  items: processedData,
  totalCount: data.length,
  isEmpty: processedData.length === 0,
  pageSize,
  sortBy,
  filterBy
});

return <VirtualizedTable config={tableConfig} />;
};

// HOC with stable prop forwarding
const withErrorBoundary = (Component) => {
return React.memo((props) => {
  const stableProps = useRestProperties(props);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />;
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <Component {...stableProps} />
    </ErrorBoundary>
  );
});
};`})]})}function u(e={}){let{wrapper:r}={...(0,o.R)(),...e.components};return r?(0,s.jsx)(r,{...e,children:(0,s.jsx)(p,{...e})}):p(e)}}}]);