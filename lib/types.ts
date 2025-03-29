import { Session } from "next-auth";

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface DreamUser {
  image?: string;
  name?: string;
  email?: string;
  id?: string;
}

export interface DreamItem {
  _id: string;
  visibility: "private" | "public" | "anonymous";
  userId?: string;
  user?: DreamUser;
  dream: {
    text: string;
    html: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  starred?: boolean;
  starCount?: number;
  commentCount?: number;
}

export interface CommentItem {
  _id: string;
  dreamId: string;
  userId: string;
  user?: DreamUser;
  comment: {
    text: string;
    html: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PageProps {
  serverSession?: Session | null;
  deviceType?: string;
}