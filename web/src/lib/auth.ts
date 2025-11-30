// Auth utilities

export interface User {
  id: number;
  email: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatarUrl?: string;
  };
  wallet?: {
    id: number;
    balance: string;
  };
}

// Token хадгалах
export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
}

// Token авах
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Token устгах
export function clearAuthToken() {
  localStorage.removeItem('token');
}

// Нэвтэрсэн эсэхийг шалгах
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
