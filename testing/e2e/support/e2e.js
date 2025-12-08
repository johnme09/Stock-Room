const app = window.top;

try {
  if (app.document.head) {
    const style = app.document.createElement('style');
    style.textContent =
      app.document.head.createTextNode(
        '.command-name-request, .command-name-xhr { display: none }',
      );
    app.document.head.appendChild(style);
  }
} catch (e) {
  // do nothing
}
