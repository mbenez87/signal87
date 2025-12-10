/**
 * Base44 Client Wrapper for Signal87 AI
 *
 * This provides a client-side interface to the base44 SDK
 * All server functions are Deno Edge Functions that use the full SDK
 */

class Base44Client {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://your-base44-project.deno.dev';
  }

  // === INTEGRATIONS ===
  integrations = {
    Core: {
      /**
       * Upload a file to storage
       * @param {Object} params - Upload parameters
       * @param {File} params.file - File object to upload
       * @returns {Promise<{file_url: string}>}
       */
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.apiUrl}/upload-file`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        return await response.json();
      },

      /**
       * Invoke LLM with prompt
       * @param {Object} params
       * @param {string} params.prompt - Prompt text or JSON string
       * @param {boolean} params.add_context_from_internet - Enable web search
       * @param {Object} params.response_json_schema - Optional JSON schema
       * @returns {Promise<string|Object>}
       */
      InvokeLLM: async ({ prompt, add_context_from_internet = false, response_json_schema = null }) => {
        const response = await fetch(`${this.apiUrl}/invoke-llm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ prompt, add_context_from_internet, response_json_schema })
        });

        if (!response.ok) {
          throw new Error(`LLM invocation failed: ${response.statusText}`);
        }

        return await response.json();
      }
    }
  };

  // === FUNCTIONS ===
  functions = {
    /**
     * Invoke a serverless function
     * @param {string} functionName - Name of the function
     * @param {Object} payload - Function parameters
     * @returns {Promise<any>}
     */
    invoke: async (functionName, payload) => {
      const response = await fetch(`${this.apiUrl}/functions/${functionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Function ${functionName} failed`);
      }

      return await response.json();
    }
  };

  // === ENTITIES ===
  entities = {
    Document: {
      filter: async (filterObj) => {
        const response = await fetch(`${this.apiUrl}/entities/Document/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filter: filterObj })
        });

        if (!response.ok) throw new Error('Failed to filter documents');
        const data = await response.json();
        return data.documents || [];
      },

      get: async (id) => {
        const response = await fetch(`${this.apiUrl}/entities/Document/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Document not found');
        return await response.json();
      },

      create: async (data) => {
        const response = await fetch(`${this.apiUrl}/entities/Document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create document');
        return await response.json();
      },

      update: async (id, updates) => {
        const response = await fetch(`${this.apiUrl}/entities/Document/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update document');
        return await response.json();
      },

      delete: async (id) => {
        const response = await fetch(`${this.apiUrl}/entities/Document/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete document');
        return await response.json();
      }
    },

    Folder: {
      filter: async (filterObj) => {
        const response = await fetch(`${this.apiUrl}/entities/Folder/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filter: filterObj })
        });

        if (!response.ok) throw new Error('Failed to filter folders');
        const data = await response.json();
        return data.folders || [];
      },

      get: async (id) => {
        const response = await fetch(`${this.apiUrl}/entities/Folder/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Folder not found');
        return await response.json();
      },

      create: async (data) => {
        const response = await fetch(`${this.apiUrl}/entities/Folder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create folder');
        return await response.json();
      },

      update: async (id, updates) => {
        const response = await fetch(`${this.apiUrl}/entities/Folder/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update folder');
        return await response.json();
      },

      delete: async (id) => {
        const response = await fetch(`${this.apiUrl}/entities/Folder/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete folder');
        return await response.json();
      }
    },

    User: {
      me: async () => {
        const response = await fetch(`${this.apiUrl}/auth/me`, {
          credentials: 'include'
        });

        if (!response.ok) return null;
        return await response.json();
      }
    },

    Workspace: {
      filter: async (filterObj) => {
        const response = await fetch(`${this.apiUrl}/entities/Workspace/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filter: filterObj })
        });

        if (!response.ok) throw new Error('Failed to filter workspaces');
        const data = await response.json();
        return data.workspaces || [];
      },

      create: async (data) => {
        const response = await fetch(`${this.apiUrl}/entities/Workspace`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create workspace');
        return await response.json();
      },

      update: async (id, updates) => {
        const response = await fetch(`${this.apiUrl}/entities/Workspace/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update workspace');
        return await response.json();
      },

      delete: async (id) => {
        const response = await fetch(`${this.apiUrl}/entities/Workspace/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete workspace');
        return await response.json();
      }
    },

    WorkspaceMember: {
      filter: async (filterObj) => {
        const response = await fetch(`${this.apiUrl}/entities/WorkspaceMember/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filter: filterObj })
        });

        if (!response.ok) throw new Error('Failed to filter workspace members');
        const data = await response.json();
        return data.members || [];
      },

      create: async (data) => {
        const response = await fetch(`${this.apiUrl}/entities/WorkspaceMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create workspace member');
        return await response.json();
      },

      delete: async (id) => {
        const response = await fetch(`${this.apiUrl}/entities/WorkspaceMember/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete workspace member');
        return await response.json();
      }
    },

    DocumentChunk: {
      filter: async (filterObj) => {
        const response = await fetch(`${this.apiUrl}/entities/DocumentChunk/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filter: filterObj })
        });

        if (!response.ok) throw new Error('Failed to filter document chunks');
        const data = await response.json();
        return data.chunks || [];
      }
    },

    DocumentInsight: {
      filter: async (filterObj) => {
        const response = await fetch(`${this.apiUrl}/entities/DocumentInsight/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filter: filterObj })
        });

        if (!response.ok) throw new Error('Failed to filter insights');
        const data = await response.json();
        return data.insights || [];
      },

      create: async (data) => {
        const response = await fetch(`${this.apiUrl}/entities/DocumentInsight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create insight');
        return await response.json();
      }
    }
  };

  // === AUTH ===
  auth = {
    me: async () => {
      return await this.entities.User.me();
    }
  };

  // Service role access (same as regular for client)
  asServiceRole = this;
}

// Export singleton instance
export const base44 = new Base44Client();
export default base44;
