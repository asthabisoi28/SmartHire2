let loadingPromise = null;

export async function loadPyodideOnce() {
  if (window.__pyodide) return window.__pyodide;
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
        window.__pyodide = pyodide;
        resolve(pyodide);
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = (e) => reject(new Error('Failed to load Pyodide'));
    document.head.appendChild(script);
  });
  return loadingPromise;
}
