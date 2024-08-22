// background.js
let lastNotificationTime = {};
const NOTIFICATION_COOLDOWN = 5000; // 5 seconds cooldown

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function checkAndNotify(url) {
  chrome.storage.local.get(url, (result) => {
    if (result[url]) {
      const currentTime = Date.now();
      if (!lastNotificationTime[url] || (currentTime - lastNotificationTime[url] > NOTIFICATION_COOLDOWN)) {
        const visitDate = new Date(result[url]).toLocaleString();
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Certificate Printed Earlier',
          message: `Last Printed On: ${visitDate}`
        });
        lastNotificationTime[url] = currentTime;
      }
    }
  });
}

const debouncedCheckAndNotify = debounce(checkAndNotify, 300);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    debouncedCheckAndNotify(tab.url);
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {  // Only for main frame navigation
    debouncedCheckAndNotify(details.url);
  }
});

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