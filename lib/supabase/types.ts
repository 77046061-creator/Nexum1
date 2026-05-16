export type ItemType = "exam" | "practice" | "summary" | "formula";

export interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
  streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  type: ItemType;
  subject_id: string | null;
  description: string | null;
  file_url: string;
  file_size: number | null;
  file_type: string;
  tags: string[];
  downloads: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemWithRelations extends Item {
  user: Pick<User, "username" | "avatar_url">;
  subject: Pick<Subject, "name" | "display_name"> | null;
}

export interface Download {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at" | "streak">;
        Update: Partial<
          Omit<User, "id" | "discord_id" | "created_at">
        >;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, "id" | "created_at">;
        Update: Partial<Omit<Subject, "id" | "created_at">>;
      };
      items: {
        Row: Item;
        Insert: Omit<Item, "id" | "downloads" | "is_verified" | "created_at" | "updated_at">;
        Update: Partial<Omit<Item, "id" | "user_id" | "created_at">>;
      };
      downloads: {
        Row: Download;
        Insert: Omit<Download, "id" | "created_at">;
        Update: never;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
