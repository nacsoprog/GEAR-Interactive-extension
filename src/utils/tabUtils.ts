const GOLD_PROGRESS_URL = "https://my.sa.ucsb.edu/gold/AcademicProgress.aspx";

/**
 * Orchestrates finding/opening the GOLD tab and sending the scrape command.
 */
export const sendImportCommandToGold = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any[]) => void,
    onError: (msg: string) => void
) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
        onError("This feature only works when running as a Chrome Extension.");
        return;
    }

    const sendMessage = (tabId: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chrome.tabs.sendMessage(tabId, { action: "IMPORT_COURSES" }, (response: any) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                onError("Make sure you're logged into GOLD. If you are, refresh.");
            } else if (response && response.result) {
                onSuccess(response.result);
            } else {
                onError("No course data found. Please ensure you are on the Progress tab.");
            }
        });
    };

    const waitForLoadAndSend = (tabId: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const listener = (tid: number, changeInfo: any) => {
            if (tid === tabId && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                sendMessage(tabId);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    };

    chrome.tabs.query({ url: "https://my.sa.ucsb.edu/gold/*" }, (tabs) => {
        if (tabs.length > 0) {
            const tab = tabs[0];
            if (tab.id) {
                chrome.tabs.update(tab.id, { active: true });
                if (tab.url === GOLD_PROGRESS_URL) {
                    sendMessage(tab.id);
                } else {
                    chrome.tabs.update(tab.id, { url: GOLD_PROGRESS_URL });
                    waitForLoadAndSend(tab.id);
                }
            }
        } else {
            chrome.tabs.create({ url: GOLD_PROGRESS_URL }, (tab) => {
                if (tab.id) waitForLoadAndSend(tab.id);
            });
        }
    });
};
