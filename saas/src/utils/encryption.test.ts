import { describe, expect, it } from 'vitest';
import {
  encryptField,
  encryptPassword,
  encryptVerificationCode,
} from './encryption';

describe('encryption', () => {
  it('encodes standard ascii strings to base64', () => {
    const raw = 'Password123!';
    const encoded = encryptPassword(raw);
    expect(encoded).toBe(Buffer.from(raw, 'utf-8').toString('base64'));
  });

  it('encodes unicode utf-8 strings correctly', () => {
    const raw = 'MậtKhẩu123!🎉';
    const encoded = encryptField(raw);
    expect(encoded).toBe(Buffer.from(raw, 'utf-8').toString('base64'));
  });

  it('encodes verification codes', () => {
    const code = '123456';
    const encoded = encryptVerificationCode(code);
    expect(encoded).toBe(Buffer.from(code, 'utf-8').toString('base64'));
  });
});
