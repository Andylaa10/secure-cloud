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
            return forge.util.encode64(decryptedKey);
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

    encryptFile = async (aesKey: string, fileData: ArrayBuffer) => {
        const iv = forge.random.getBytesSync(16);

        const fileDataBytes = new Uint8Array(fileData);
        const cipher = forge.cipher.createCipher('AES-CBC', forge.util.decode64(aesKey));

        cipher.start({iv});
        cipher.update(forge.util.createBuffer(fileDataBytes));
        cipher.finish();

        const encryptedBytes = cipher.output.getBytes();

        const ivBytes = new Uint8Array(iv.split('').map((c) => c.charCodeAt(0)));
        const encryptedFile = new Uint8Array(ivBytes.length + encryptedBytes.length);
        encryptedFile.set(ivBytes, 0);
        encryptedFile.set(new Uint8Array(encryptedBytes.split('').map((c) => c.charCodeAt(0))), ivBytes.length);

        return {encryptedFile, ivBytes};
    }

    decryptFile = async (aesKey: string, encryptedFile: Uint8Array, iv: Uint8Array): Promise<Uint8Array> => {
        try {
            const decodedAesKey = forge.util.decode64(aesKey);
            const decodedAesKeyBuffer = forge.util.createBuffer(decodedAesKey, 'raw');
            const ivBuffer= forge.util.createBuffer(iv);

            const encryptedData = encryptedFile.slice(ivBuffer.length());
            const encryptedBuffer = forge.util.createBuffer(encryptedData);

            const cipher = forge.cipher.createDecipher('AES-CBC', decodedAesKeyBuffer);
            cipher.start({ iv: ivBuffer });

            cipher.update(encryptedBuffer);

            let decryptedData = new Uint8Array(cipher.output.bytes().split('').map(char => char.charCodeAt(0)));

            const paddingLength = decryptedData[decryptedData.length - 1];
            if (paddingLength > 0 && paddingLength <= 16) {
                decryptedData = decryptedData.slice(0, decryptedData.length - paddingLength);
            }

            return decryptedData;
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    };

}
