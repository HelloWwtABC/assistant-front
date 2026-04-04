export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}
