/**
 * Client-Side Encryption Module
 * Encrypts sensitive data (POS API keys) in the browser
 * Platform admin NEVER sees the unencrypted keys
 *
 * Uses AES-256-GCM encryption with Web Crypto API
 */

class ClientSideEncryption {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  /**
   * Generate encryption key from passphrase
   * @param {string} passphrase User's password/passphrase
   * @returns {Promise<CryptoKey>} Encryption key
   */
  async deriveKey(passphrase) {
    const encoder = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Use PBKDF2 for key derivation (slow = more secure)
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('gulf-coast-radar-salt-v1'), // Static salt for deterministic key
        iterations: 100000,
        hash: 'SHA-256'
      },
      passphraseKey,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data
   * @param {string} plaintext Data to encrypt (e.g., API key)
   * @param {string} passphrase User's password
   * @returns {Promise<string>} Base64 encoded encrypted data
   */
  async encrypt(plaintext, passphrase) {
    try {
      const key = await this.deriveKey(passphrase);
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);

      // Generate random IV for each encryption
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   * @param {string} encryptedData Base64 encoded encrypted data
   * @param {string} passphrase User's password
   * @returns {Promise<string>} Decrypted plaintext
   */
  async decrypt(encryptedData, passphrase) {
    try {
      const key = await this.deriveKey(passphrase);

      // Convert from base64
      const combined = this.base64ToArrayBuffer(encryptedData);

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data. Wrong password?');
    }
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Hash data for blockchain storage
   * @param {object} data Data to hash
   * @returns {Promise<string>} Hex encoded hash
   */
  async hashData(data) {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);

    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }

  /**
   * Generate passphrase-based key for business owner
   * Uses their email + password to derive a consistent passphrase
   * @param {string} email Business owner email
   * @param {string} password Business owner password
   * @returns {Promise<string>} Derived passphrase
   */
  async derivePassphrase(email, password) {
    const combined = `${email}:${password}`;
    const hash = await this.hashData(combined);
    return hash;
  }
}

// Create global instance
window.encryption = new ClientSideEncryption();

/**
 * USAGE EXAMPLES:
 *
 * // Encrypt POS API key
 * const apiKey = "sk_live_51234567890";
 * const passphrase = await encryption.derivePassphrase(email, password);
 * const encrypted = await encryption.encrypt(apiKey, passphrase);
 * // Store 'encrypted' in Google Sheets
 *
 * // Decrypt POS API key
 * const passphrase = await encryption.derivePassphrase(email, password);
 * const decrypted = await encryption.decrypt(encrypted, passphrase);
 * // Use 'decrypted' to call POS API
 *
 * // Hash menu data for blockchain
 * const menuData = { items: [...], prices: [...] };
 * const hash = await encryption.hashData(menuData);
 * // Record 'hash' on blockchain
 */
