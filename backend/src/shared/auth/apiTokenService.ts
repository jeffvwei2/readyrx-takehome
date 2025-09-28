import jwt from 'jsonwebtoken';
import { db } from '../../config/firebase';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  LAB_TECH = 'lab_tech',
  PATIENT = 'patient'
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface ApiToken {
  id: string;
  name: string;
  role: UserRole;
  token: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = '365d'; // Long-lived tokens

  static async createApiToken(name: string, role: UserRole, customTokenId?: string): Promise<ApiToken> {
    try {
      // Generate a unique token ID (use custom ID if provided for seeding)
      const tokenId = customTokenId || this.generateTokenId();
      
      // Check if token with this ID already exists
      const existingToken = await db.collection('apiTokens')
        .where('id', '==', tokenId)
        .limit(1)
        .get();
      
      if (!existingToken.empty) {
        // Return existing token instead of creating duplicate
        const data = existingToken.docs[0].data();
        return {
          id: data.id,
          name: data.name,
          role: data.role,
          token: data.token,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive
        };
      }
      
      // Create JWT token
      const user: AuthenticatedUser = {
        id: tokenId,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@readyrx.com`,
        role,
        permissions: this.getPermissionsForRole(role)
      };

      const token = jwt.sign(user, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });

      // Store token metadata in database
      const tokenRef = await db.collection('apiTokens').add({
        id: tokenId,
        name,
        role,
        token: token,
        createdAt: new Date(),
        isActive: true
      });

      return {
        id: tokenId,
        name,
        role,
        token,
        createdAt: new Date(),
        isActive: true
      };
    } catch (error) {
      console.error('Error creating API token:', error);
      throw new Error('Failed to create API token');
    }
  }

  static async verifyToken(token: string): Promise<AuthenticatedUser> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as AuthenticatedUser;
      
      // Verify token still exists and is active in database
      const tokenSnapshot = await db.collection('apiTokens')
        .where('id', '==', decoded.id)
        .where('isActive', '==', true)
        .get();

      if (tokenSnapshot.empty) {
        throw new Error('Token not found or inactive');
      }

      // Update last used timestamp
      const tokenDoc = tokenSnapshot.docs[0];
      await tokenDoc.ref.update({
        lastUsed: new Date()
      });

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async revokeToken(tokenId: string): Promise<void> {
    try {
      const tokenSnapshot = await db.collection('apiTokens')
        .where('id', '==', tokenId)
        .get();

      if (!tokenSnapshot.empty) {
        await tokenSnapshot.docs[0].ref.update({
          isActive: false,
          revokedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      throw new Error('Failed to revoke token');
    }
  }

  static async listTokens(): Promise<ApiToken[]> {
    try {
      const snapshot = await db.collection('apiTokens')
        .orderBy('createdAt', 'desc')
        .get();

      const tokens: ApiToken[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        tokens.push({
          id: data.id,
          name: data.name,
          role: data.role,
          token: data.token,
          createdAt: data.createdAt.toDate(),
          lastUsed: data.lastUsed?.toDate(),
          isActive: data.isActive
        });
      });

      return tokens;
    } catch (error) {
      console.error('Error listing tokens:', error);
      throw new Error('Failed to list tokens');
    }
  }

  static async getTokenById(tokenId: string): Promise<ApiToken | null> {
    try {
      const snapshot = await db.collection('apiTokens')
        .where('id', '==', tokenId)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return {
        id: data.id,
        name: data.name,
        role: data.role,
        token: data.token,
        createdAt: data.createdAt.toDate(),
        lastUsed: data.lastUsed?.toDate(),
        isActive: data.isActive
      };
    } catch (error) {
      console.error('Error getting token:', error);
      throw new Error('Failed to get token');
    }
  }

  private static generateTokenId(): string {
    // Generate a deterministic token ID based on role and timestamp
    // This ensures tokens are consistent across server restarts
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return `token_${randomSuffix}_${timestamp}`;
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
