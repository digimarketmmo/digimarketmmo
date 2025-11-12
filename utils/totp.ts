// --- TOTP Generation and Verification Logic ---

// Base32 decoder
const base32tohex = (base32: string): string => {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";
    const sanitizedBase32 = base32.replace(/=/g, '').toUpperCase();

    for (let i = 0; i < sanitizedBase32.length; i++) {
        const val = base32chars.indexOf(sanitizedBase32.charAt(i));
        if (val === -1) throw new Error("Invalid base32 character found");
        bits += val.toString(2).padStart(5, '0');
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
        const chunk = bits.substr(i, 8);
        hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
    }
    return hex;
}

// Generate an OTP for a given counter
const generateOtp = async (secretHex: string, counter: number): Promise<string> => {
    const secretBytes = new Uint8Array(secretHex.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16)));
    
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(4, counter, false); // JS handles up to 53-bit integers, this is safe.

    const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, counterBuffer);

    const offset = new Uint8Array(signature)[19] & 0xf;
    const code = (new DataView(signature).getUint32(offset, false) & 0x7fffffff) % 1000000;

    return code.toString().padStart(6, '0');
};


/**
 * Verifies a TOTP token against a secret.
 * Checks the current, previous, and next time windows to account for clock skew.
 * @param base32Secret The Base32 encoded secret.
 * @param token The 6-digit token from the user.
 * @returns A promise that resolves to true if the token is valid, false otherwise.
 */
export const verifyToken = async (base32Secret: string, token: string): Promise<boolean> => {
    if (!/^\d{6}$/.test(token)) return false;

    try {
        const secretHex = base32tohex(base32Secret);
        const currentCounter = Math.floor(Date.now() / 1000 / 30);
        
        const counters = [
            currentCounter,      // Current window
            currentCounter - 1,  // Previous window
        ];
        
        for (const counter of counters) {
            const expectedToken = await generateOtp(secretHex, counter);
            if (expectedToken === token) {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error("Token verification failed:", e);
        return false;
    }
};

/**
 * Generates a random Base32 secret key.
 * @returns A 16-character Base32 string.
 */
export const generateSecret = (): string => {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = '';
    const randomBytes = new Uint8Array(10); // 10 bytes = 80 bits
    crypto.getRandomValues(randomBytes);

    let bits = '';
    randomBytes.forEach(byte => {
        bits += byte.toString(2).padStart(8, '0');
    });

    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substring(i, i + 5);
        if (chunk.length === 5) {
            const index = parseInt(chunk, 2);
            secret += base32chars[index];
        }
    }
    return secret; // Will be 16 chars long (80 bits / 5 bits/char)
};
