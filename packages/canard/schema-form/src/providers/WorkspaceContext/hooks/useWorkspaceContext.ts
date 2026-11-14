import { useContext } from 'react';

import { WorkspaceContext } from '../components/WorkspaceContext';

export const useWorkspaceContext = () => useContext(WorkspaceContext);
