const isValidUrl = (url) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

const createContextMenuItem = (id, title) => {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: ['selection'],
  });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['richText', 'markdownLink'], function (items) {
    if (items.richText !== false) {
      createContextMenuItem('copy-as-rich-text', '_Copy GitHub PR');
    }
    if (items.markdownLink === true) {
      createContextMenuItem('copy-as-markdown-link', 'Copy as Markdown Link');
    }
  });
});

const copySelectedText = (info, tab) => {
  const text = info.selectionText;
  const url = info.linkUrl;

  const emoji = tab.url.includes('closed') || tab.url.includes('merged') ? ':merged:' : ':open:';

  if (!isValidUrl(url) || !text) return;

  if (info.menuItemId === 'copy-as-rich-text') {
    const html = `${emoji} <a href="${url}">${text}</a>`;
    sendToClipboard(html, text, tab.id);
  } else if (info.menuItemId === 'copy-as-markdown-link') {
    const markdown = `[${text}](${url})`;
    sendToClipboard(null, markdown, tab.id);
  }
};

const sendToClipboard = (content, plainText, tabId) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['content.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, {
        action: 'copyToClipboard',
        html: content,
        plainText: plainText,
      });
    },
  );
};


chrome.contextMenus.onClicked.addListener(copySelectedText);
