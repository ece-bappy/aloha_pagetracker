// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const trackButton = document.getElementById('trackButton');
  const exportButton = document.getElementById('exportButton');
  const importButton = document.getElementById('importButton');
  const importInput = document.getElementById('importInput');
  const lastVisitDiv = document.getElementById('lastVisit');

  function updateLastVisit(url) {
    chrome.storage.local.get(url, function(data) {
      if (data[url]) {
        const date = new Date(data[url]).toLocaleString();
        lastVisitDiv.innerHTML = `Last Print On <span class="date">${date}</span>`;
      } else {
        lastVisitDiv.innerHTML = '<span class="date">Not Printed Yet</span>';
      }
    });
  }

  // Display last visit date if available
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = tabs[0].url;
    updateLastVisit(url);
  });

  // Track button click event
  trackButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = tabs[0].url;
      const data = {};
      data[url] = new Date().toISOString();
      chrome.storage.local.set(data, function() {
        updateLastVisit(url);
      });
    });
  });

  // Export button click event
  exportButton.addEventListener('click', function() {
    chrome.storage.local.get(null, function(data) {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'webpage_tracker_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // Import button click event
  importButton.addEventListener('click', function() {
    importInput.click();
  });

  // Handle file selection for import
  importInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          chrome.storage.local.set(data, function() {
            alert('Data imported successfully!');
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              updateLastVisit(tabs[0].url);
            });
          });
        } catch (error) {
          alert('Error importing data. Please make sure the file is valid.');
        }
      };
      reader.readAsText(file);
    }
  });
});