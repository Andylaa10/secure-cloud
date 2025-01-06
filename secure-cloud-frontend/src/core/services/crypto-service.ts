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

        // Convert ArrayBuffer to byte string and create cipher
        const fileDataBytes = new Uint8Array(fileData);
        const cipher = forge.cipher.createCipher('AES-CBC', forge.util.decode64(aesKey));  // Decode the Base64 key

        cipher.start({iv});
        cipher.update(forge.util.createBuffer(fileDataBytes));
        cipher.finish();

        // Get encrypted file data and IV
        const encryptedBytes = cipher.output.getBytes();

        // Convert IV and encrypted data to Uint8Array
        const ivBytes = new Uint8Array(iv.split('').map((c) => c.charCodeAt(0)));
        const encryptedFile = new Uint8Array(ivBytes.length + encryptedBytes.length);
        encryptedFile.set(ivBytes, 0);  // Copy IV to the beginning
        encryptedFile.set(new Uint8Array(encryptedBytes.split('').map((c) => c.charCodeAt(0))), ivBytes.length); // Append encrypted data after IV

        return {encryptedFile, ivBytes};
    }

    decryptFile = async (aesKey: string, encryptedFile: Uint8Array, iv: Uint8Array): Promise<Uint8Array> => {
        try {
            // Debugging log to check types and values
            console.log('AES Key (Base64):', aesKey);
            console.log('Encrypted File (Uint8Array):', encryptedFile);
            console.log('IV (Uint8Array or Base64):', iv);

            // Decode the AES key from Base64
            const decodedAesKey = forge.util.decode64(aesKey);

            // Convert the decoded AES key (string) to a forge ByteStringBuffer
            const decodedAesKeyBuffer = forge.util.createBuffer(decodedAesKey, 'raw');

            console.log('Decoded AES Key Buffer:', decodedAesKeyBuffer);

            // If IV is a Base64 string, decode it into Uint8Array, otherwise use the provided Uint8Array
            const ivBuffer= forge.util.createBuffer(iv);

            console.log('IV Buffer:', ivBuffer);

            // The encrypted data starts after the IV, so we slice it from the encryptedFile
            const encryptedData = encryptedFile.slice(ivBuffer.length());
            const encryptedBuffer = forge.util.createBuffer(encryptedData);
            console.log('Encrypted Data Buffer:', encryptedBuffer);

            // Create the cipher using the decoded AES key (ByteStringBuffer)
            const cipher = forge.cipher.createDecipher('AES-CBC', decodedAesKeyBuffer);

            // Start the decryption with the provided IV (ByteStringBuffer)
            cipher.start({ iv: ivBuffer });

            // Decrypt the encrypted data
            cipher.update(encryptedBuffer);

            // Convert the output (string) to Uint8Array
            let decryptedData = new Uint8Array(cipher.output.bytes().split('').map(char => char.charCodeAt(0)));
            console.log('Decrypted Data (Uint8Array) with padding:', decryptedData);

            // Remove padding (PKCS#7 padding)
            const paddingLength = decryptedData[decryptedData.length - 1];
            if (paddingLength > 0 && paddingLength <= 16) {
                decryptedData = decryptedData.slice(0, decryptedData.length - paddingLength);
            }

            console.log('Decrypted Data (Uint8Array) after removing padding:', decryptedData);

            return decryptedData; // Return the decrypted data as Uint8Array
        } catch (error) {
            console.error('Decryption error:', error);
            throw error; // Re-throw the error so that it's handled in the calling code
        }
    };

}
