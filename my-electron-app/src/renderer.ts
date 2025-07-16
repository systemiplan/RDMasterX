document.addEventListener('DOMContentLoaded', () => {
    const appTitle = document.getElementById('app-title');
    const button = document.getElementById('my-button');

    if (appTitle) {
        appTitle.textContent = 'Welcome to My Electron App';
    }

    if (button) {
        button.addEventListener('click', () => {
            alert('Button clicked!');
        });
    }
});