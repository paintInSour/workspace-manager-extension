// Initialize default data if not already present
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['hotlinks', 'todolist', 'theme'], (result) => {
      if (!result.hotlinks) {
        chrome.storage.local.set({ hotlinks: [] });
      }
      if (!result.todolist) {
        chrome.storage.local.set({ todolist: [] });
      }
      if (!result.theme) {
        chrome.storage.local.set({ theme: 'daybreakBlue' }); // Default theme
      }
    });
  });
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getData') {
      chrome.storage.local.get(['hotlinks', 'todolist', 'theme'], (data) => {
        sendResponse(data);
      });
      return true; // Required for async response
    }
    
    if (request.action === 'saveData') {
      chrome.storage.local.set({ 
        [request.dataType]: request.data 
      }, () => {
        sendResponse({ success: true });
      });
      return true; // Required for async response
    }
  });