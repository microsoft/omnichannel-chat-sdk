const fetchCallingConfig = () => {
    const callingConfig = {
        disable: true
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calling') !== null) {
        callingConfig.disable = urlParams.get('calling') == 'false'? true: false;
    }

    return callingConfig;
}

export default fetchCallingConfig;