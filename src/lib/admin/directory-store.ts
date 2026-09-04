"use client";

import { create } from "zustand";

import {
  SEED_ROLES,
  SEED_USERS,
  type AdminRole,
  type AdminUser,
  type UserStatus,
} from "@/lib/admin/directory";

/**
 * The studio's directory while you are looking at it. Seeded from the mock
 * and held in memory only — deliberately not persisted, so a reload puts the
 * module back to a known state and nobody mistakes it for a real database.
 *
 * The seed is the same object on the server and the client, so the first
 * render matches and there is nothing to rehydrate.
 */
type DirectoryState = {
  users: AdminUser[];
  roles: AdminRole[];

  addUser: (user: Omit<AdminUser, "id" | "lastActive" | "createdAt">) => void;
  updateUser: (id: string, patch: Partial<AdminUser>) => void;
  setStatus: (ids: string[], status: UserStatus) => void;
  removeUsers: (ids: string[]) => void;
  /** Puts a whole list back — what Undo on a removal restores. */
  replaceUsers: (users: AdminUser[]) => void;

  saveRole: (role: AdminRole) => void;
  removeRole: (code: string) => void;
};

/** Today's date as the mock writes them — new records are stamped with it. */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export const useDirectoryStore = create<DirectoryState>()((set) => ({
  users: SEED_USERS,
  roles: SEED_ROLES,

  addUser: (user) =>
    set((state) => ({
      users: [
        {
          ...user,
          id: `u-${Date.now().toString(36)}`,
          // Nobody has signed in as someone you have just added.
          lastActive: "",
          createdAt: todayIso(),
        },
        ...state.users,
      ],
    })),

  updateUser: (id, patch) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...patch } : user)),
    })),

  setStatus: (ids, status) =>
    set((state) => ({
      users: state.users.map((user) =>
        ids.includes(user.id) ? { ...user, status } : user
      ),
    })),

  removeUsers: (ids) =>
    set((state) => ({ users: state.users.filter((user) => !ids.includes(user.id)) })),

  replaceUsers: (users) => set({ users }),

  // One call for both create and edit: a role is identified by its code, so
  // saving one that already exists replaces it in place rather than appending.
  saveRole: (role) =>
    set((state) => {
      const at = state.roles.findIndex((existing) => existing.code === role.code);
      if (at === -1) return { roles: [...state.roles, role] };
      const roles = [...state.roles];
      roles[at] = { ...roles[at], ...role };
      return { roles };
    }),

  removeRole: (code) =>
    set((state) => ({ roles: state.roles.filter((role) => role.code !== code) })),
}));

/** How many people hold each role — the Roles table's "users" column. */
export function countByRole(users: AdminUser[]) {
  const counts = new Map<string, number>();
  for (const user of users) {
    counts.set(user.roleCode, (counts.get(user.roleCode) ?? 0) + 1);
  }
  return counts;
}
