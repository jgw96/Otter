export function enableVibrate(root: ShadowRoot) {
    // find all fluent-button elements in the shadow root
    const buttons = root.querySelectorAll('fluent-button');

    // add a click event listener to each button
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            // vibrate for 30ms
            navigator.vibrate(30);
        });
    });
}