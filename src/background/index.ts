chrome.runtime.onInstalled.addListener(() => {
  console.log("V.1.4.0");

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});
