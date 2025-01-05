import * as forge from 'node-forge';

export class CryptoService {

    async generateKeyPair() {
        const rsaKeyPair = forge.pki.rsa.generateKeyPair({bits: 2048});
        const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);

        return {publicKeyPem, privateKeyPem}
    }

    generateAesKey = async () => {
        const aesSalt = forge.random.getBytesSync(16);
        const keyPassPhrase = forge.random.getBytesSync(16);
        const aesKey = forge.pkcs5.pbkdf2(
            keyPassPhrase,
            aesSalt,
            1000,
            16
        );
        return forge.util.encode64(aesKey);
    }

    decryptAesKey = async (privateKeyPem: string, aesKey: string) => {
        try {
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

            const decodedAesKey = forge.util.decode64(aesKey);

            const decryptedKey = privateKey.decrypt(decodedAesKey, 'RSA-OAEP');

            return decryptedKey;
        } catch (error) {
            console.error('Error decrypting AES key:', error);
            throw error;
        }
    };


    encryptAesKey = async (receivedPublicKeyPem: string, aesKey: string) => {
        try {
            const publicKey = forge.pki.publicKeyFromPem(receivedPublicKeyPem);

            const decodedAesKey = forge.util.decode64(aesKey);

            const encryptedKey = publicKey.encrypt(decodedAesKey, 'RSA-OAEP');

            return forge.util.encode64(encryptedKey);
        } catch (error) {
            console.error('Error encrypting AES key:', error);
            throw error;
        }
    }


    encryptFile = async (aesKey: string, fileData: string) => {
        const iv = forge.random.getBytesSync(16);
        const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(fileData));
        cipher.finish();

        // Convert IV and encrypted data to Uint8Array directly
        const ivBytes = new Uint8Array(iv.split('').map((c) => c.charCodeAt(0)));
        const encryptedBytes = new Uint8Array(cipher.output.getBytes().split('').map((c) => c.charCodeAt(0)));

        // Combine IV and encrypted data into a single Uint8Array
        const encryptedFile = new Uint8Array(ivBytes.length + encryptedBytes.length);
        encryptedFile.set(ivBytes, 0); // Copy IV to the beginning
        encryptedFile.set(encryptedBytes, ivBytes.length); // Append encrypted data after IV

        return {encryptedFile, iv};
    }


    decryptFile = async (aesKey: Uint8Array[], fileData: string, iv: string) => {
        //TODO
    }
}
