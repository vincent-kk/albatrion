import { useContext } from 'react';

import { WorkspaceContext } from './WorkspaceContext';

export const useWorkspaceContext = () => useContext(WorkspaceContext);
