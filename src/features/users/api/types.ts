export interface CreateProfileInput {
  displayName: string;
  age: number;
  bio?: string | undefined;
}

export interface UpdateProfileInput {
  displayName?: string | undefined;
  bio?: string | undefined;
  interests?: string[] | undefined;
}

export interface MyProfile {
  id: string;
  email: string;
  profile: {
    displayName: string;
    age: number;
    bio?: string | null;
    interests: string[];
    avatarUrl?: string | null;
  } | null;
}
