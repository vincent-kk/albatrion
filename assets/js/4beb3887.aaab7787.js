"use strict";(self.webpackChunk_albatrion_documents=self.webpackChunk_albatrion_documents||[]).push([["955"],{48160(e,t,n){n.r(t),n.d(t,{metadata:()=>s,default:()=>p,frontMatter:()=>i,contentTitle:()=>l,toc:()=>d,assets:()=>c});var s=JSON.parse('{"id":"winglet/react-utils/hook/useSnapshot","title":"useSnapshot","description":"Creates a stable object reference that only changes when the object\'s contents actually change through deep comparison.","source":"@site/docs/winglet/react-utils/hook/useSnapshot.mdx","sourceDirName":"winglet/react-utils/hook","slug":"/winglet/react-utils/hook/useSnapshot","permalink":"/albatrion/docs/winglet/react-utils/hook/useSnapshot","draft":false,"unlisted":false,"editUrl":"https://github.com/vincent-kk/albatrion/tree/master/documents/docs/winglet/react-utils/hook/useSnapshot.mdx","tags":[],"version":"current","frontMatter":{"title":"useSnapshot","sidebar_label":"useSnapshot"},"sidebar":"winglet","previous":{"title":"useRestProperties","permalink":"/albatrion/docs/winglet/react-utils/hook/useRestProperties"},"next":{"title":"useSnapshotReference","permalink":"/albatrion/docs/winglet/react-utils/hook/useSnapshotReference"}}'),a=n(62540),r=n(43023),o=n(91297);let i={title:"useSnapshot",sidebar_label:"useSnapshot"},l="useSnapshot",c={},d=[{value:"Core Problem it Solves",id:"core-problem-it-solves",level:3},{value:"When to Use vs useRestProperties",id:"when-to-use-vs-userestproperties",level:3},{value:"Deep Comparison Features",id:"deep-comparison-features",level:3},{value:"Performance Considerations",id:"performance-considerations",level:3},{value:"Signature",id:"signature",level:2},{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Examples",id:"examples",level:2},{value:"Example 1",id:"example-1",level:3},{value:"Playground",id:"playground",level:2}];function u(e){let t={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.header,{children:(0,a.jsx)(t.h1,{id:"usesnapshot",children:"useSnapshot"})}),"\n",(0,a.jsx)(t.p,{children:"Creates a stable object reference that only changes when the object's contents actually change through deep comparison.\nThis hook performs deep equality comparison to detect genuine content changes versus\nreference changes, returning the same object reference when contents are identical.\nIt's essential for breaking the \"new object every render\" pattern that breaks memoization."}),"\n",(0,a.jsx)(t.h3,{id:"core-problem-it-solves",children:"Core Problem it Solves"}),"\n",(0,a.jsx)(t.p,{children:"React components often create new objects on every render:"}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-typescript",children:"// These create new references even with identical content:\nconst config = { theme: 'dark', size: 'large' };\nconst user = { ...userData, isOnline: checkOnlineStatus() };\nconst settings = processSettings(rawSettings);\n"})}),"\n",(0,a.jsxs)(t.p,{children:["Even identical contents break ",(0,a.jsx)(t.code,{children:"useMemo"}),", ",(0,a.jsx)(t.code,{children:"useCallback"}),", and ",(0,a.jsx)(t.code,{children:"React.memo"})," optimizations."]}),"\n",(0,a.jsx)(t.h3,{id:"when-to-use-vs-userestproperties",children:"When to Use vs useRestProperties"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"useSnapshot"}),": Deep comparison for nested objects, complex data structures"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"useRestProperties"}),": Shallow comparison for flat objects, better performance"]}),"\n"]}),"\n",(0,a.jsx)(t.h3,{id:"deep-comparison-features",children:"Deep Comparison Features"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Nested Object Support"}),": Compares deeply nested properties"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Array Handling"}),": Compares array contents and nested objects within arrays"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Property Exclusion"}),": Skip volatile properties from comparison"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Null/Undefined Safety"}),": Handles edge cases gracefully"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Type Preservation"}),": Maintains TypeScript types perfectly"]}),"\n"]}),"\n",(0,a.jsx)(t.h3,{id:"performance-considerations",children:"Performance Considerations"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Time Complexity"}),": O(n) where n = total properties in object tree"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Memory"}),": Stores one previous reference per hook instance"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Best for"}),": Complex nested objects, API responses, configuration objects"]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Avoid for"}),": Large arrays, frequently changing data"]}),"\n"]}),"\n",(0,a.jsx)(t.h2,{id:"signature",children:"Signature"}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-typescript",children:"const useSnapshot: <Input extends object | undefined>(input: Input, omit?: Set<keyof Input> | Array<keyof Input>) => Input\n"})}),"\n",(0,a.jsx)(t.h2,{id:"parameters",children:"Parameters"}),"\n",(0,a.jsxs)(t.table,{children:[(0,a.jsx)(t.thead,{children:(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.th,{children:"Name"}),(0,a.jsx)(t.th,{children:"Type"}),(0,a.jsx)(t.th,{children:"Description"})]})}),(0,a.jsxs)(t.tbody,{children:[(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"input"})}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"-"})}),(0,a.jsx)(t.td,{children:"The object to create a deep-compared snapshot of"})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"omit"})}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"-"})}),(0,a.jsx)(t.td,{children:"Properties to exclude from deep comparison (as Set or Array)"})]})]})]}),"\n",(0,a.jsx)(t.h2,{id:"returns",children:"Returns"}),"\n",(0,a.jsx)(t.p,{children:"A stable reference that only changes when object contents actually change"}),"\n",(0,a.jsx)(t.h2,{id:"examples",children:"Examples"}),"\n",(0,a.jsx)(t.h3,{id:"example-1",children:"Example 1"}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-typescript",children:"// \u274C Problem: Effect runs on every render despite identical content\nconst MyComponent = ({ userData }) => {\n  const config = { theme: userData.theme, locale: userData.locale };\n\n  useEffect(() => {\n    initializeWidget(config); // Runs every render!\n  }, [config]);\n};\n\n// \u2705 Solution: Stable reference for identical content\nconst MyComponent = ({ userData }) => {\n  const stableConfig = useSnapshot({\n    theme: userData.theme,\n    locale: userData.locale\n  });\n\n  useEffect(() => {\n    initializeWidget(stableConfig); // Only runs when content changes\n  }, [stableConfig]);\n};\n\n// Complex nested data stabilization\nconst UserProfile = ({ user, preferences, metadata }) => {\n  const stableUserData = useSnapshot({\n    personal: {\n      id: user.id,\n      name: user.name,\n      email: user.email\n    },\n    settings: {\n      theme: preferences.theme,\n      language: preferences.language,\n      notifications: {\n        email: preferences.notifications.email,\n        push: preferences.notifications.push\n      }\n    },\n    meta: {\n      lastLogin: metadata.lastLogin,\n      accountType: metadata.accountType\n    }\n  });\n\n  // Only recomputes when actual user data changes\n  const displayName = useMemo(() =>\n    formatUserName(stableUserData.personal), [stableUserData.personal]\n  );\n\n  return <ProfileDisplay data={stableUserData} name={displayName} />;\n};\n\n// API response caching with exclusions\nconst DataFetcher = ({ endpoint, params }) => {\n  const [response, setResponse] = useState(null);\n\n  // Exclude timestamp from comparison to prevent unnecessary requests\n  const stableResponse = useSnapshot(response, ['timestamp', 'requestId']);\n\n  const processedData = useMemo(() => {\n    if (!stableResponse) return null;\n    return expensiveTransform(stableResponse.data);\n  }, [stableResponse]);\n\n  return <DataDisplay data={processedData} />;\n};\n\n// Form state comparison for \"dirty\" detection\nconst FormEditor = ({ initialData }) => {\n  const [formData, setFormData] = useState(initialData);\n\n  const stableInitialData = useSnapshot(initialData);\n  const stableCurrentData = useSnapshot(formData);\n\n  // Accurate dirty detection based on content, not references\n  const isDirty = stableCurrentData !== stableInitialData;\n  const hasChanges = !equals(stableCurrentData, stableInitialData);\n\n  return (\n    <form>\n      <button disabled={!isDirty}>Save Changes</button>\n    </form>\n  );\n};\n\n// Context optimization with deep comparison\nconst AppStateProvider = ({ children }) => {\n  const [user, setUser] = useState(null);\n  const [settings, setSettings] = useState({});\n  const [permissions, setPermissions] = useState([]);\n\n  const contextValue = useSnapshot({\n    user: {\n      ...user,\n      isAuthenticated: !!user,\n      fullName: user ? `${user.firstName} ${user.lastName}` : ''\n    },\n    settings: {\n      ...settings,\n      isDarkMode: settings.theme === 'dark'\n    },\n    permissions,\n    actions: {\n      login: setUser,\n      updateSettings: setSettings,\n      updatePermissions: setPermissions\n    }\n  });\n\n  // Only re-renders when state actually changes\n  return (\n    <AppContext.Provider value={contextValue}>\n      {children}\n    </AppContext.Provider>\n  );\n};\n\n// Comparing arrays with nested objects\nconst TodoList = ({ todos, filters }) => {\n  const stableFilteredTodos = useSnapshot(\n    todos\n      .filter(todo => matchesFilters(todo, filters))\n      .map(todo => ({\n        ...todo,\n        isOverdue: new Date(todo.dueDate) < new Date()\n      }))\n  );\n\n  return (\n    <VirtualizedList\n      items={stableFilteredTodos} // Stable reference prevents scroll position reset\n      renderItem={({ item }) => <TodoItem todo={item} />}\n    />\n  );\n};\n"})}),"\n",(0,a.jsx)(t.h2,{id:"playground",children:"Playground"}),"\n",(0,a.jsx)(o.A,{dependencies:{"@winglet/react-utils":"0.10.0"},code:`// \u{274C} Problem: Effect runs on every render despite identical content
const MyComponent = ({ userData }) => {
const config = { theme: userData.theme, locale: userData.locale };

useEffect(() => {
  initializeWidget(config); // Runs every render!
}, [config]);
};

// \u{2705} Solution: Stable reference for identical content
const MyComponent = ({ userData }) => {
const stableConfig = useSnapshot({
  theme: userData.theme,
  locale: userData.locale
});

useEffect(() => {
  initializeWidget(stableConfig); // Only runs when content changes
}, [stableConfig]);
};

// Complex nested data stabilization
const UserProfile = ({ user, preferences, metadata }) => {
const stableUserData = useSnapshot({
  personal: {
    id: user.id,
    name: user.name,
    email: user.email
  },
  settings: {
    theme: preferences.theme,
    language: preferences.language,
    notifications: {
      email: preferences.notifications.email,
      push: preferences.notifications.push
    }
  },
  meta: {
    lastLogin: metadata.lastLogin,
    accountType: metadata.accountType
  }
});

// Only recomputes when actual user data changes
const displayName = useMemo(() =>
  formatUserName(stableUserData.personal), [stableUserData.personal]
);

return <ProfileDisplay data={stableUserData} name={displayName} />;
};

// API response caching with exclusions
const DataFetcher = ({ endpoint, params }) => {
const [response, setResponse] = useState(null);

// Exclude timestamp from comparison to prevent unnecessary requests
const stableResponse = useSnapshot(response, ['timestamp', 'requestId']);

const processedData = useMemo(() => {
  if (!stableResponse) return null;
  return expensiveTransform(stableResponse.data);
}, [stableResponse]);

return <DataDisplay data={processedData} />;
};

// Form state comparison for "dirty" detection
const FormEditor = ({ initialData }) => {
const [formData, setFormData] = useState(initialData);

const stableInitialData = useSnapshot(initialData);
const stableCurrentData = useSnapshot(formData);

// Accurate dirty detection based on content, not references
const isDirty = stableCurrentData !== stableInitialData;
const hasChanges = !equals(stableCurrentData, stableInitialData);

return (
  <form>
    <button disabled={!isDirty}>Save Changes</button>
  </form>
);
};

// Context optimization with deep comparison
const AppStateProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [settings, setSettings] = useState({});
const [permissions, setPermissions] = useState([]);

const contextValue = useSnapshot({
  user: {
    ...user,
    isAuthenticated: !!user,
    fullName: user ? \`\${user.firstName} \${user.lastName}\` : ''
  },
  settings: {
    ...settings,
    isDarkMode: settings.theme === 'dark'
  },
  permissions,
  actions: {
    login: setUser,
    updateSettings: setSettings,
    updatePermissions: setPermissions
  }
});

// Only re-renders when state actually changes
return (
  <AppContext.Provider value={contextValue}>
    {children}
  </AppContext.Provider>
);
};

// Comparing arrays with nested objects
const TodoList = ({ todos, filters }) => {
const stableFilteredTodos = useSnapshot(
  todos
    .filter(todo => matchesFilters(todo, filters))
    .map(todo => ({
      ...todo,
      isOverdue: new Date(todo.dueDate) < new Date()
    }))
);

return (
  <VirtualizedList
    items={stableFilteredTodos} // Stable reference prevents scroll position reset
    renderItem={({ item }) => <TodoItem todo={item} />}
  />
);
};`})]})}function p(e={}){let{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(u,{...e})}):u(e)}}}]);