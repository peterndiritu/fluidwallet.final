
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const registerPasskey = async (username: string, userId: string): Promise<string | null> => {
    // 1. Check environment support
    const isSupported = window.PublicKeyCredential && 
                        (await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());

    if (!isSupported) {
        console.log("WebAuthn not fully supported in this environment. Using simulation.");
        await wait(1500); // Simulate biometric prompt delay
        return "mock_cred_id_" + Date.now();
    }

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const publicKey: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: { 
                name: "SuperWallet Next-Gen", 
                id: window.location.hostname 
            },
            user: {
                id: new TextEncoder().encode(userId),
                name: username,
                displayName: username
            },
            pubKeyCredParams: [
                { alg: -7, type: "public-key" }, // ES256
                { alg: -257, type: "public-key" } // RS256
            ],
            authenticatorSelection: { 
                authenticatorAttachment: "platform", 
                userVerification: "required" 
            },
            timeout: 60000,
            attestation: "none"
        };

        const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
        return credential.id;
    } catch (e: any) {
        console.warn("Passkey Registration Error (likely environment restriction). Falling back to simulation.", e);
        // Fallback for demo purposes so user can see the flow
        await wait(1000);
        return "mock_cred_id_" + Date.now();
    }
};

export const authenticatePasskey = async (): Promise<boolean> => {
    // 1. Check environment support
    const isSupported = window.PublicKeyCredential;

    if (!isSupported) {
        await wait(1000);
        return true;
    }

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const publicKey: PublicKeyCredentialRequestOptions = {
            challenge,
            rpId: window.location.hostname,
            userVerification: "required",
            timeout: 60000
        };

        const assertion = await navigator.credentials.get({ publicKey });
        return !!assertion;
    } catch (e) {
        console.warn("Passkey Auth Error. Falling back to simulation for demo.", e);
        // In a real app we would return false here, but for the demo we want the flow to proceed
        // if it's just a technical environment restriction.
        const isDemo = confirm("[DEMO] Biometric Auth failed or not available. Simulate success?");
        return isDemo;
    }
};
