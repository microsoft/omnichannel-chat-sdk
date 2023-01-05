const loadScript = async (scriptUrl: string, callbackOnload: CallableFunction = () => void(0), callbackError: CallableFunction = () => void(0), retries = 0, attempt = 0): Promise<void> => {
  return new Promise (async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
    const scriptElements = Array.from(document.getElementsByTagName('script'));
    const foundScriptElement = scriptElements.filter(scriptElement => scriptElement.src == scriptUrl);

    if (foundScriptElement.length) {
      await callbackOnload();
      return resolve();
    }

    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('src', scriptUrl);
    scriptElement.setAttribute('type', 'text/javascript');
    document.head.appendChild(scriptElement);

    scriptElement.addEventListener('load', async () => {
      await callbackOnload();
      resolve();
    });

    scriptElement.addEventListener('error', async () => {
      if (++attempt >= retries) {
        await callbackError();

        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/error_event
        return reject(new Error("Resource failed to load, or can't be used."));
      }

      scriptElement.remove();

      try {
        await loadScript(scriptUrl, callbackOnload, callbackError, retries, attempt);
      } catch (e) {
        reject(e);
      }
    });
  });
};

const removeElementById = (id: string): void => {
  document.getElementById(id)?.remove();
}

export default {
  loadScript,
  removeElementById
}

export {
  loadScript,
  removeElementById
}