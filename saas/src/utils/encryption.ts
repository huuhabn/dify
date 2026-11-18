/**
 * Field Encoding Utilities
 * Provides Base64 encoding for sensitive fields (password, verification code)
 * during transmission from frontend to backend.
 *
 * Matches Dify backend's FieldEncryption.decrypt_field implementation.
 */

/**
 * Encode sensitive field using Base64
 * @param plaintext - The plain text to encode
 * @returns Base64 encoded text
 */
export function encryptField(plaintext: string): string {
  try {
    const utf8Bytes = new TextEncoder().encode(plaintext);
    return btoa(String.fromCharCode(...utf8Bytes));
  } catch (error) {
    console.error('Field encoding failed:', error);
    throw new Error('Encoding failed. Please check your input.');
  }
}

/**
 * Encrypt password field for login and password reset
 * @param password - Plain password
 * @returns Base64 encoded password for Dify API
 */
export function encryptPassword(password: string): string {
  return encryptField(password);
}

/**
 * Encrypt verification code for email code login
 * @param code - Plain verification code
 * @returns Base64 encoded code for Dify API
 */
export function encryptVerificationCode(code: string): string {
  return encryptField(code);
}
