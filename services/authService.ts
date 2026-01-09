
// Simulates a backend Auth Service with in-memory state for the session

// Store the last generated code in memory
const demoStore: {
    emailCode: string | null;
    email: string | null;
} = {
    emailCode: null,
    email: null
};

export const sendEmailOTP = async (email: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    demoStore.emailCode = code;
    demoStore.email = email;
    
    // In a real app, this sends an email. For the demo, we alert the user.
    console.log(`[SuperWallet Auth] OTP for ${email}: ${code}`);
    // Using setTimeout to ensure the alert doesn't block the React render cycle immediately
    setTimeout(() => {
        alert(`[DEMO] 📬 Email Verification\n\nCode for ${email}: ${code}`);
    }, 100);
    
    return true;
};

export const verifyEmailOTP = async (email: string, code: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Allow '123456' as a universal test code for ease of testing
    if (code === '123456') return true;
    
    // Verify against the code stored in memory
    if (demoStore.email === email && demoStore.emailCode === code) {
        return true;
    }
    return false;
};

export const generateTOTPSecret = async (): Promise<{ secret: string, qrCode: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const secret = 'JBSWY3DPEHPK3PXP'; // Standard Base32 test secret
    const label = 'SuperWallet';
    const issuer = 'Fluid';
    
    // Generate a valid QR code URL using a public API
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
    
    return {
        secret,
        qrCode
    };
};

export const verifyTOTP = async (token: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In a real app, we verify against the secret and current time.
    // For this demo, we accept '123456' or the specific demo flow.
    return token === '123456';
};
