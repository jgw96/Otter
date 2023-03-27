export function enableVibrate(root: ShadowRoot) {
    // find all fluent-button elements in the shadow root
    const buttons = root.querySelectorAll('fluent-button');
    const slButtons = root.querySelectorAll('sl-button');

    // add a click event listener to each button
    [...buttons, ...slButtons].forEach((button) => {
        button.addEventListener('click', () => {
            // vibrate for 10ms
            navigator.vibrate(10);
        });
    });
}