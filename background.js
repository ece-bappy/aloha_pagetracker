// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "trackPage") {
    const url = request.url;
    const data = {};
    data[url] = new Date().toISOString();
    chrome.storage.local.set(data, () => {
      sendResponse({status: "success"});
    });
    return true; // Indicates that the response is sent asynchronously
  }
});