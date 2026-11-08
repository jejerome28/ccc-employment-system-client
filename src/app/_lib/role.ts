import "server-only";
import { cache } from "react";
import { apiData } from "./api.server";
import type { Role, User } from "./types";

export const currentUser = cache(async (): Promise<User> => (await apiData<{ user: User }>("/api/me")).user);
export const canEdit = (role: Role): boolean => role === "admin" || role === "hr";
export const isAdmin = (role: Role): boolean => role === "admin";
