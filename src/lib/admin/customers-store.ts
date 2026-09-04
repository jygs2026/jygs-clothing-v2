"use client";

import { create } from "zustand";

import {
  SEED_CUSTOMERS,
  type Customer,
  type CustomerStatus,
} from "@/lib/admin/customers";

/**
 * The customer book while you are looking at it. Session-only, like the staff
 * directory — a reload puts it back to the forty-two it starts with, so
 * nobody mistakes it for a real database.
 */
type CustomerState = {
  customers: Customer[];
  addCustomer: (
    customer: Omit<Customer, "id" | "orders" | "spent" | "joined">
  ) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  setStatus: (ids: string[], status: CustomerStatus) => void;
  removeCustomers: (ids: string[]) => void;
  /** Puts a whole list back — what Undo on a removal restores. */
  replaceCustomers: (customers: Customer[]) => void;
};

export const useCustomerStore = create<CustomerState>()((set) => ({
  customers: SEED_CUSTOMERS,

  addCustomer: (customer) =>
    set((state) => ({
      customers: [
        {
          ...customer,
          id: `c-${Date.now().toString(36)}`,
          // Somebody added by hand has not bought anything yet.
          orders: 0,
          spent: 0,
          joined: new Date().toISOString().slice(0, 10),
        },
        ...state.customers,
      ],
    })),

  updateCustomer: (id, patch) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, ...patch } : customer
      ),
    })),

  setStatus: (ids, status) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        ids.includes(customer.id) ? { ...customer, status } : customer
      ),
    })),

  removeCustomers: (ids) =>
    set((state) => ({
      customers: state.customers.filter((customer) => !ids.includes(customer.id)),
    })),

  replaceCustomers: (customers) => set({ customers }),
}));
