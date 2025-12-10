import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import base44 from '../lib/base44Client';

const WorkspaceContext = createContext();

const RATE_LIMIT_KEY = 'workspace_api_last_call';
const RATE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const RETRY_DELAYS = [1000, 2000]; // Retry delays in ms

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation(operation, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = RETRY_DELAYS[attempt] || 2000;
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms...`);
      await sleep(delay);
    }
  }
}

function checkRateLimit() {
  const lastCall = localStorage.getItem(RATE_LIMIT_KEY);
  if (!lastCall) return true;

  const timeSinceLastCall = Date.now() - parseInt(lastCall, 10);
  return timeSinceLastCall >= RATE_LIMIT_MS;
}

function updateRateLimit() {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}

export const WorkspaceProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && !checkRateLimit()) {
      console.log('[WorkspaceContext] Rate limited - using cached data');
      return;
    }

    try {
      setIsLoading(true);

      const currentUser = await retryOperation(() => base44.entities.User.me());

      if (!currentUser) {
        setUser(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
        setActiveRole(null);
        return;
      }

      setUser(currentUser);

      // Always ensure personal workspace exists
      const personalWorkspace = {
        id: 'personal',
        name: 'Personal',
        type: 'personal',
        created_by: currentUser.email
      };

      // Load team workspaces
      let teamWorkspaces = [];
      try {
        const memberships = await retryOperation(() =>
          base44.entities.WorkspaceMember.filter({ user_email: currentUser.email })
        );

        if (memberships && memberships.length > 0) {
          const workspaceIds = memberships.map(m => m.workspace_id);
          const loadedWorkspaces = await retryOperation(() =>
            base44.entities.Workspace.filter({ id: { $in: workspaceIds } })
          );

          teamWorkspaces = loadedWorkspaces.map(ws => {
            const membership = memberships.find(m => m.workspace_id === ws.id);
            return {
              ...ws,
              role: membership?.role || 'member'
            };
          });
        }
      } catch (error) {
        console.error('[WorkspaceContext] Error loading team workspaces:', error);
      }

      const allWorkspaces = [personalWorkspace, ...teamWorkspaces];
      setWorkspaces(allWorkspaces);

      // Set active workspace (from localStorage or default to personal)
      const storedWorkspaceId = localStorage.getItem('active_workspace_id');
      const targetWorkspace = storedWorkspaceId
        ? allWorkspaces.find(w => w.id === storedWorkspaceId)
        : personalWorkspace;

      if (targetWorkspace) {
        setActiveWorkspace(targetWorkspace);
        setActiveRole(targetWorkspace.role || 'owner');
        localStorage.setItem('active_workspace_id', targetWorkspace.id);
      }

      updateRateLimit();

    } catch (error) {
      console.error('[WorkspaceContext] Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    loadData();
  }, [loadData]);

  const switchWorkspace = useCallback((workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspace(workspace);
      setActiveRole(workspace.role || 'owner');
      localStorage.setItem('active_workspace_id', workspace.id);
    }
  }, [workspaces]);

  const deleteWorkspace = useCallback(async (workspaceId) => {
    if (workspaceId === 'personal') {
      throw new Error('Cannot delete personal workspace');
    }

    try {
      await base44.entities.Workspace.delete(workspaceId);
      await loadData(true);

      if (activeWorkspace?.id === workspaceId) {
        const personalWorkspace = workspaces.find(w => w.id === 'personal');
        if (personalWorkspace) {
          switchWorkspace('personal');
        }
      }
    } catch (error) {
      console.error('[WorkspaceContext] Error deleting workspace:', error);
      throw error;
    }
  }, [activeWorkspace, workspaces, loadData, switchWorkspace]);

  const login = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const logout = useCallback(() => {
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setActiveRole(null);
    localStorage.removeItem('active_workspace_id');
    localStorage.removeItem(RATE_LIMIT_KEY);
  }, []);

  const isPersonalWorkspace = activeWorkspace?.id === 'personal';

  const validateWorkspaceAccess = useCallback((requiredRole = 'member') => {
    if (!activeWorkspace) return false;
    if (isPersonalWorkspace) return true;

    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const userRoleLevel = roleHierarchy[activeRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }, [activeWorkspace, activeRole, isPersonalWorkspace]);

  const isFounder = user?.email === activeWorkspace?.created_by;

  const value = {
    user,
    workspaces,
    activeWorkspace,
    activeRole,
    isLoading,
    isInitialized,
    switchWorkspace,
    deleteWorkspace,
    loadData,
    login,
    logout,
    isPersonalWorkspace,
    validateWorkspaceAccess,
    isFounder
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
