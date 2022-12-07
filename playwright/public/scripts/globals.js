const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

window.sleep = sleep;