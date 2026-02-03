// Back Button - Navigate to previous page
function goBack() {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // If no history, go to home page
    window.location.href = 'index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Only add back button if not on home page
  const isHomePage = window.location.pathname === '/' ||
                     window.location.pathname.endsWith('/index.html') ||
                     window.location.pathname === '/index.html';

  // Check if back button already exists in HTML (like profile.html)
  const existingBackButton = document.getElementById('back-btn') ||
                              document.querySelector('.back-button');

  if (!isHomePage && !existingBackButton) {
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.className = 'back-button';
    backButton.innerHTML = '←';
    backButton.setAttribute('aria-label', 'Go back to previous page');
    document.body.appendChild(backButton);

    backButton.addEventListener('click', goBack);
  }
});
