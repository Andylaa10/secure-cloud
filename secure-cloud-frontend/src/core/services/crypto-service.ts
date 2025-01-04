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

    return aesKey;
  }

  // TODO For decrypting
  // const decryptedAesKey = rsaKeyPair.privateKey.decrypt(forge.util.decode64(encryptedAesKey) 'RSA-OAEP');

  encryptAesKey = async (receivedPublicKeyPem: string, aesKey: string) => {
    try{
      console.log(receivedPublicKeyPem);
      const publicKey = forge.pki.publicKeyFromPem(receivedPublicKeyPem);
      const encryptedAesKey = publicKey.encrypt(aesKey, 'RSA-OAEP');
      return forge.util.encode64(encryptedAesKey);
    }catch (error){
      console.error('Error encrypting AES key:', error);
      throw error;
    }
  }


  encryptWithAes = async (aesKey: string, fileData: string) => {
    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(fileData));
    cipher.finish();

    // Convert IV and encrypted data to Uint8Array directly
    const ivBytes = new Uint8Array(iv.split('').map((c) => c.charCodeAt(0)));
    const encryptedBytes = new Uint8Array(cipher.output.getBytes().split('').map((c) => c.charCodeAt(0)));

    // Combine IV and encrypted data into a single Uint8Array
    const resultBytes = new Uint8Array(ivBytes.length + encryptedBytes.length);
    resultBytes.set(ivBytes, 0); // Copy IV to the beginning
    resultBytes.set(encryptedBytes, ivBytes.length); // Append encrypted data after IV

    return resultBytes;
  }
}
