// API helper functions for client-side use
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function getTokenHeader() {
  const token = getToken();
  return token ? { Authorization: 'Bearer ' + token } : {};
}

export async function apiGet(path) {
  try {
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getTokenHeader(),
      },
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function apiPost(path, body) {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getTokenHeader(),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function apiPut(path, body) {
  try {
    const response = await fetch(path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getTokenHeader(),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function apiPatch(path, body) {
  try {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getTokenHeader(),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function apiDelete(path) {
  try {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getTokenHeader(),
      },
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw error;
  }
}
