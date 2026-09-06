import bcrypt from 'bcrypt';

export default class PasswordService {
  private static readonly SALT_ROUNDS = 10;

  static async hash(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}