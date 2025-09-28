import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../../config/firebase';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  LAB_TECH = 'lab_tech',
  PATIENT = 'patient'
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly SALT_ROUNDS = 12;

  static async register(data: RegisterData): Promise<{ user: AuthenticatedUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await db.collection('users')
        .where('email', '==', data.email)
        .get();

      if (!existingUser.empty) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // Create user document
      const userRef = await db.collection('users').add({
        email: data.email,
        password: hashedPassword,
        role: data.role,
        name: data.name,
        createdAt: new Date(),
        isActive: true
      });

      // Generate JWT token
      const user: AuthenticatedUser = {
        id: userRef.id,
        email: data.email,
        role: data.role,
        permissions: this.getPermissionsForRole(data.role)
      };

      const token = jwt.sign(user, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });

      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthenticatedUser; token: string }> {
    try {
      // Find user by email
      const userSnapshot = await db.collection('users')
        .where('email', '==', credentials.email)
        .where('isActive', '==', true)
        .get();

      if (userSnapshot.empty) {
        throw new Error('Invalid credentials');
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, userData.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const user: AuthenticatedUser = {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        permissions: this.getPermissionsForRole(userData.role)
      };

      const token = jwt.sign(user, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  static async verifyToken(token: string): Promise<AuthenticatedUser> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as AuthenticatedUser;
      
      // Verify user still exists and is active
      const userDoc = await db.collection('users').doc(decoded.id).get();
      if (!userDoc.exists || !userDoc.data()?.isActive) {
        throw new Error('User not found or inactive');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, userData.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update password
      await db.collection('users').doc(userId).update({
        password: hashedPassword,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Password change error:', error);
      throw new Error('Password change failed');
    }
  }

  private static getPermissionsForRole(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ['*'], // All permissions
      [UserRole.DOCTOR]: [
        'patients:read', 'patients:write',
        'lab_orders:read', 'lab_orders:write',
        'results:read', 'results:write',
        'upload:write'
      ],
      [UserRole.LAB_TECH]: [
        'lab_orders:read',
        'results:read', 'results:write',
        'upload:write'
      ],
      [UserRole.PATIENT]: [
        'patients:read:own',
        'lab_orders:read:own',
        'results:read:own'
      ]
    };

    return permissions[role] || [];
  }

  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (userPermissions.includes('*')) {
      return true;
    }
    return userPermissions.includes(requiredPermission);
  }
}
