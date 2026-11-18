/**
 * Dify SaaS - Lightweight Embeddable Chat Widget (< 10KB)
 * Usage:
 * <script src="http://your-domain.com/embed.js" data-token="YOUR_APP_TOKEN"></script>
 */
(function () {
  'use strict';

  var currentScript =
    document.currentScript ||
    document.querySelector('script[data-token]');
  if (!currentScript) return;

  var token = currentScript.getAttribute('data-token');
  var baseUrl =
    currentScript.getAttribute('data-base-url') ||
    window.location.origin;

  if (!token) {
    console.warn('[Dify Embed] Missing data-token attribute.');
    return;
  }

  // Create Container
  var container = document.createElement('div');
  container.id = 'dify-chat-widget-root';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // Create Floating Button
  var button = document.createElement('button');
  button.type = 'button';
  button.style.width = '56px';
  button.style.height = '56px';
  button.style.borderRadius = '28px';
  button.style.backgroundColor = '#2563EB';
  button.style.color = '#FFFFFF';
  button.style.border = 'none';
  button.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.4)';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.fontSize = '24px';
  button.style.transition = 'transform 0.2s, background-color 0.2s';
  button.innerHTML = '💬';

  // Create Iframe Container
  var iframeContainer = document.createElement('div');
  iframeContainer.style.position = 'fixed';
  iframeContainer.style.bottom = '96px';
  iframeContainer.style.right = '24px';
  iframeContainer.style.width = '380px';
  iframeContainer.style.height = '600px';
  iframeContainer.style.maxHeight = 'calc(100vh - 120px)';
  iframeContainer.style.maxWidth = 'calc(100vw - 48px)';
  iframeContainer.style.borderRadius = '16px';
  iframeContainer.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  iframeContainer.style.border = '1px solid #E2E8F0';
  iframeContainer.style.overflow = 'hidden';
  iframeContainer.style.display = 'none';
  iframeContainer.style.backgroundColor = '#FFFFFF';
  iframeContainer.style.zIndex = '999999';

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/en/share/chat/' + token;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframeContainer.appendChild(iframe);

  var isOpen = false;
  button.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'block';
      button.innerHTML = '✕';
      button.style.transform = 'scale(0.95)';
    } else {
      iframeContainer.style.display = 'none';
      button.innerHTML = '💬';
      button.style.transform = 'scale(1)';
    }
  });

  container.appendChild(button);
  document.body.appendChild(container);
  document.body.appendChild(iframeContainer);
})();
