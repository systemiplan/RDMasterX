// Absolute simplest test - signal bundle loaded immediately
console.log('BUNDLE.JS LOADED - BASIC TEST');
window.bundleLoaded = true;

// Immediately update debug info
var debugElement = document.getElementById('debug-info');
if (debugElement) {
    debugElement.textContent = 'SUCCESS: Bundle.js executed immediately!';
    debugElement.style.color = 'purple';
    debugElement.style.fontWeight = 'bold';
    console.log('SUCCESS: Debug element updated immediately');
} else {
    console.log('Debug element not found immediately, trying in timeout...');
}

// Test 1: Can we update the debug element after a short delay?
setTimeout(function() {
    var debugElement = document.getElementById('debug-info');
    if (debugElement) {
        debugElement.textContent = 'SUCCESS: Bundle.js executed (timeout)!';
        debugElement.style.color = 'green';
        debugElement.style.fontWeight = 'bold';
        console.log('SUCCESS: Debug element updated in timeout');
    } else {
        console.log('ERROR: Debug element not found in timeout');
    }
}, 100);

// Test 2: Can we replace the entire root content?
setTimeout(function() {
    var rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `
            <div style="padding: 40px; background: linear-gradient(135deg, #28a745, #20c997); color: white; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: Arial, sans-serif;">
                <h1 style="font-size: 4em; margin-bottom: 30px;">🎉 SUCCESS!</h1>
                <h2 style="font-size: 2em; margin-bottom: 20px;">Bundle.js is Working!</h2>
                <p style="font-size: 1.5em; margin-bottom: 30px;">JavaScript execution successful</p>
                <button onclick="alert('Button clicked!')" style="padding: 20px 40px; font-size: 20px; background: #fff; color: #28a745; border: none; border-radius: 50px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    🚀 Test Button
                </button>
                <p style="font-size: 14px; margin-top: 30px; opacity: 0.8;">If you see this, the JavaScript bundle is working correctly!</p>
            </div>
        `;
        console.log('SUCCESS: Root element content replaced');
    } else {
        console.log('ERROR: Root element not found');
    }
}, 1000);

console.log('BUNDLE.JS EXECUTION COMPLETE');
