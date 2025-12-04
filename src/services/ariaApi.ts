/**
 * Aria API Service
 * Connects frontend to backend for real Aria execution
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AriaCommandResponse {
  success: boolean;
  command: string;
  result: {
    success: boolean;
    action: string;
    message: string;
    folder?: any;
    folders?: any[];
    error?: string;
  };
  executedBy: string;
  timestamp: string;
}

interface Folder {
  id: string;
  name: string;
  userId: string;
  path: string;
  createdAt: string;
  documentsCount: number;
}

/**
 * Send command to Aria for natural language processing and execution
 */
export async function sendAriaCommand(message: string, userId: string = 'default'): Promise<AriaCommandResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aria/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userId }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Aria API error:', error);
    throw error;
  }
}

/**
 * Create folder directly (specific action)
 */
export async function createFolder(name: string, userId: string = 'default') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aria/folders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, userId }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create folder error:', error);
    throw error;
  }
}

/**
 * List all folders
 */
export async function listFolders(userId: string = 'default'): Promise<{ success: boolean; folders: Folder[]; count: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aria/folders?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('List folders error:', error);
    throw error;
  }
}

/**
 * Delete folder
 */
export async function deleteFolder(folderId: string, userId: string = 'default') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aria/folders/${folderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete folder error:', error);
    throw error;
  }
}

/**
 * Check Aria's operational status
 */
export async function checkAriaStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aria/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, status: 'offline' };
    }

    return await response.json();
  } catch (error) {
    return { success: false, status: 'offline', error: error.message };
  }
}

/**
 * Health check
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return { status: 'unhealthy' };
    }
    return await response.json();
  } catch (error) {
    return { status: 'unreachable', error: error.message };
  }
}
