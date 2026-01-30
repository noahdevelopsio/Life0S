
export const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
        return existingSubscription;
    }

    const response = await fetch('/api/notifications/vapid-public-key');
    const { publicKey } = await response.json();

    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
    });

    // Save subscription to server
    await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
    });

    return subscription;
}
