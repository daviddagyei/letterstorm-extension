chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "handlePasswordReset") {
      // Handle password reset flow coming from Firebase
      console.log("Received password reset continuation request");
      chrome.tabs.create({ url: chrome.runtime.getURL('login.html') });
      sendResponse({success: true});
    }
  }
);

// Open initial popup when extension is installed
chrome.runtime.onInstalled.addListener(function() {
  console.log("LetterStorm extension installed");
});
