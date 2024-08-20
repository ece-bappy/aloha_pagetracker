// content.js
document.addEventListener('click', function(e) {
  if (e.target && e.target.matches('button.btn-primary')) {
    chrome.runtime.sendMessage({
      action: "trackPage",
      url: window.location.href
    }, (response) => {
      if (response && response.status === "success") {
        console.log("Page tracked successfully");
      }
    });
  }
});