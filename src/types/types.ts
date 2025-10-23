export type User = {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  fullName: string;
  coverPicture: string;
  bio?: string;
  link?: string;
  followers: string[];
  following: string[];
  likedPosts: string[];
    currentPassword?: string;
  newPassword?: string;
  createdAt: string;
};

export interface FormDataEditProfile {
  fullName?: string;
  username?: string;
  email?: string;
  bio?: string;
  link?: string;
  currentPassword?: string;
  newPassword?: string;
  coverPicture?: string | File | null;
  profilePicture?: string | File | null;
  updatedPictureFields?: {
    coverPicture?: string | File | null;
    profilePicture?: string | File | null;
  };
}

type Comment = {
  _id?: string;
  user?: User;
  text?: string;
};

export interface Posts {
  _id: string;
  user: User;
  text: string;
  image?: string;
  likes?: string[];
  comments?: Comment[];
  totalComments?: number;
  hasMoreComments?: boolean;
  createdAt?: string;
}

export interface SignupUserData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}
export interface LoginUserData {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
  fullName: string;
  profileImg?: string;
}

export interface PostType {
  _id: string;
  user: User;
  text: string;
  img?: string;
  likes: string[];
  comments: Comment[];
}

export interface SuggestedUser {
  _id: string;
  username: string;
  profilePicture: string;
  fullName: string;
}

export type Notification = {
  _id: string;
  type: "follow" | "like";
  from: {
    username: string;
    profileImg?: string;
  };
};
