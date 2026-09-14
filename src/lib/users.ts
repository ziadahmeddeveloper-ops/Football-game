// Server-side user store for persistent user accounts and authentication

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password?: string;
  score: number;
  coins: number;
  avatar: string;
  createdAt: number;
}

// Initial demo users
const usersStore: Map<string, UserRecord> = new Map([
  [
    "test@example.com",
    {
      id: 1,
      name: "مدير الفريق",
      email: "test@example.com",
      password: "password123",
      score: 1200,
      coins: 1000000000,
      avatar: "https://ui-avatars.com/api/?name=%D9%85%D8%AF%D9%8A%D8%B1+%D8%A7%D9%84%D9%81%D8%B1%D9%8A%D9%82&background=1a1a2e&color=FFD700&bold=true",
      createdAt: Date.now()
    }
  ]
]);

// Map tokens to emails
const tokenStore: Map<string, string> = new Map([
  ["mock_token_demo", "test@example.com"]
]);

export function getUserByEmail(email: string): UserRecord | undefined {
  if (!email) return undefined;
  return usersStore.get(email.toLowerCase().trim());
}

export function registerUser(name: string, email: string, password?: string, avatar?: string): { user: UserRecord; token: string } {
  const cleanEmail = email.toLowerCase().trim();
  const userName = name || cleanEmail.split('@')[0] || "Manager";
  
  const existing = usersStore.get(cleanEmail);
  if (existing) {
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    tokenStore.set(token, cleanEmail);
    return { user: existing, token };
  }

  const newUser: UserRecord = {
    id: Date.now(),
    name: userName,
    email: cleanEmail,
    password: password || undefined,
    score: 1000,
    coins: 1000000000,
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=FFD700&bold=true`,
    createdAt: Date.now()
  };

  usersStore.set(cleanEmail, newUser);
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  tokenStore.set(token, cleanEmail);

  return { user: newUser, token };
}

export function getUserByToken(token: string): UserRecord | undefined {
  if (!token) return undefined;
  const email = tokenStore.get(token);
  if (email) return usersStore.get(email);
  
  // Fallback token validation for client mock tokens
  if (token.startsWith("mock_token_") || token.startsWith("google_token_") || token.startsWith("token_")) {
    const firstUser = Array.from(usersStore.values())[0];
    return firstUser;
  }
  return undefined;
}
