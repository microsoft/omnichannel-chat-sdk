const loadScript = async (scriptUrl: string, callbackOnload: CallableFunction = () => void(0), callbackError: CallableFunction = () => void(0)): Promise<void> => {
  return new Promise ((resolve, reject) => {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('src', scriptUrl);
    scriptElement.setAttribute('type', 'text/javascript');
    document.head.appendChild(scriptElement);

    scriptElement.addEventListener('load', async () => {
      await callbackOnload();
      resolve();
    });

    scriptElement.addEventListener('error', async () => {
      await callbackError();
      reject();
    });
  });
};

export default {
  loadScript
}

export {
  loadScript
}