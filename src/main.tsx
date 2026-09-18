import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Intercept global fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Safe URL extraction
  const url = typeof resource === 'string' ? resource : 
             (resource instanceof Request ? resource.url : String(resource));
  
  if (url.includes('/api') && !url.includes('/api/login')) {
    const token = localStorage.getItem('auth_token');
    
    if (resource instanceof Request) {
      resource.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config = config || {};
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
      args[1] = config; // update args
    }
  }
  
  const response = await originalFetch(...args);
  
  if (response.status === 401 && !url.includes('/api/login')) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  
  return response;
};

createRoot(document.getElementById("root")!).render(<App />);
