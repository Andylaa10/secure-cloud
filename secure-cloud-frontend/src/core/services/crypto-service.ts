export class CryptoService {

    /**
     * This generates a key pair used for asymmetric encryption
     * The private key needs to be saved by the user in a secure place
     * The public key needs be saved and updated on the KeyCloak user
     */
    async generateKeyPair(){
        const keyPair = await window.crypto.subtle.generateKey({
                name: "RSA-OAEP",
                modulusLength: 2048, // Key size
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: { name: "SHA-256" },
            },
            true,
            ["encrypt", "decrypt"]);

        // Export the public and private keys
        const exportedPublicKey = await window.crypto.subtle.exportKey(
            "spki", // Format for public key (Subject Public Key Info)
            keyPair.publicKey
        );

        const exportedPrivateKey = await window.crypto.subtle.exportKey(
            "pkcs8", // Format for private key (Private Key Info)
            keyPair.privateKey
        );

        // Convert ArrayBuffer to base64
        const publicKey = this.arrayBufferToBase64(exportedPublicKey);
        const privateKey = this.arrayBufferToBase64(exportedPrivateKey);

        return {publicKey, privateKey}
    }

    private arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
}
