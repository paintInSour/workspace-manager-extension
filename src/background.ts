// Define interfaces for the data types
interface HotLink {
    id: string;
    name: string;
    url: string;
    iconUrl: string;
  }
  
  interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    active: boolean;
  }
  
  type ThemeType = 'daybreakBlue' | 'goldenPurple';
  
  // Initialize default data if not already present
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['hotlinks', 'todolist', 'theme'], (result) => {
      if (!result.hotlinks) {
        chrome.storage.local.set({ hotlinks: [] as HotLink[] });
      }
      if (!result.todolist) {
        chrome.storage.local.set({ todolist: [] as TodoItem[] });
      }
      if (!result.theme) {
        chrome.storage.local.set({ theme: 'daybreakBlue' as ThemeType }); // Default theme
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
  
  // This export is needed to make TypeScript treat this as a module
  export {};