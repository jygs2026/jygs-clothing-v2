import { daysBefore, daysSince, seeded } from "@/lib/admin/format";

/**
 * Stand-in customer records. The shape is what a real customers table would
 * hold — everything else on the screen (group, average order, the order
 * history on a customer's own page) is derived from these numbers rather than
 * stored beside them, so nothing can drift out of step with anything else.
 */

export type CustomerStatus = "Active" | "Inactive";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  /** Two-letter state code, as an Indian address is written. */
  state: string;
  status: CustomerStatus;
  orders: number;
  /** Rupees, all time. */
  spent: number;
  /** ISO date. */
  joined: string;
};

/**
 * What kind of customer this is, read off their order count. Derived rather
 * than stored: a customer who orders a sixth time becomes Loyal that
 * afternoon, without anyone remembering to re-tag them.
 */
export type CustomerGroup = "New" | "Returning" | "Loyal" | "VIP";

export function groupFor(customer: Customer): CustomerGroup {
  if (customer.orders >= 12) return "VIP";
  if (customer.orders >= 6) return "Loyal";
  if (customer.orders >= 2) return "Returning";
  return "New";
}

export const CUSTOMER_GROUPS: CustomerGroup[] = ["New", "Returning", "Loyal", "VIP"];

type Seed = [
  name: string,
  city: string,
  state: string,
  orders: number,
  spent: number,
  status: CustomerStatus,
  joined: string,
  phone: string,
];

const SEED: Seed[] = [
  ["Arjun Menon", "Bengaluru", "KA", 12, 245600, "Active", "2026-09-03", "98765 43210"],
  ["Vikram Singh", "Mumbai", "MH", 8, 152300, "Active", "2026-09-02", "91234 56789"],
  ["Karthik Ramesh", "Chennai", "TN", 5, 98900, "Active", "2026-09-01", "99887 76655"],
  ["Priya Sharma", "New Delhi", "DL", 15, 297600, "Active", "2026-08-31", "87654 32109"],
  ["Rahul Verma", "Pune", "MH", 3, 54900, "Inactive", "2026-08-28", "99876 54321"],
  ["Siddharth Jain", "Hyderabad", "TG", 7, 123400, "Active", "2026-08-26", "96543 21098"],
  ["Sneha Thomas", "Kochi", "KL", 2, 31800, "Active", "2026-08-23", "95432 10987"],
  ["Anil Kumar", "Jaipur", "RJ", 4, 68900, "Inactive", "2026-08-20", "88990 11223"],
  ["Neha Gupta", "Lucknow", "UP", 6, 112300, "Active", "2026-08-18", "94123 56789"],
  ["Rohan Kapoor", "Ahmedabad", "GJ", 1, 12900, "Active", "2026-08-16", "90987 65432"],
  ["Ananya Reddy", "Hyderabad", "TG", 9, 178400, "Active", "2026-08-12", "93456 78123"],
  ["Farhan Sheikh", "Mumbai", "MH", 13, 264100, "Active", "2026-08-07", "97865 43219"],
  ["Divya Nair", "Kochi", "KL", 3, 47200, "Active", "2026-08-03", "98123 45670"],
  ["Manish Agarwal", "Kolkata", "WB", 2, 28700, "Inactive", "2026-07-30", "90123 45678"],
  ["Tara Krishnan", "Chennai", "TN", 11, 219800, "Active", "2026-07-26", "99001 22334"],
  ["Imran Qureshi", "Bengaluru", "KA", 5, 86500, "Active", "2026-07-21", "98800 11223"],
  ["Kavya Suresh", "Coimbatore", "TN", 1, 9800, "Active", "2026-07-17", "97411 25896"],
  ["Aditya Bose", "Kolkata", "WB", 7, 141900, "Active", "2026-07-11", "98301 45612"],
  ["Meera Iyer", "Chennai", "TN", 18, 362400, "Active", "2026-07-06", "94440 11223"],
  ["Sanjay Patel", "Surat", "GJ", 4, 71500, "Inactive", "2026-07-01", "99250 88776"],
  ["Riya Chandran", "Bengaluru", "KA", 6, 108700, "Active", "2026-06-27", "95555 67890"],
  ["Nikhil Joshi", "Pune", "MH", 2, 34600, "Active", "2026-06-22", "90280 33445"],
  ["Zoya Rahman", "Hyderabad", "TG", 10, 196300, "Active", "2026-06-17", "99490 55667"],
  ["Dev Anand", "New Delhi", "DL", 0, 0, "Inactive", "2026-06-12", "98110 77889"],
  ["Lakshmi Venkat", "Chennai", "TN", 8, 159200, "Active", "2026-06-06", "90030 44556"],
  ["Harsh Malhotra", "Gurugram", "HR", 14, 281700, "Active", "2026-05-31", "98180 22110"],
  ["Pooja Deshmukh", "Nagpur", "MH", 3, 52800, "Active", "2026-05-25", "97640 99887"],
  ["Rajesh Pillai", "Thiruvananthapuram", "KL", 5, 91300, "Active", "2026-05-19", "94470 66554"],
  ["Ishaan Gupta", "Noida", "UP", 2, 26900, "Inactive", "2026-05-13", "98910 33221"],
  ["Aisha Khan", "Bhopal", "MP", 7, 134500, "Active", "2026-05-07", "97550 11445"],
  ["Vivek Rao", "Mysuru", "KA", 0, 0, "Active", "2026-05-01", "98450 77332"],
  ["Shreya Banerjee", "Kolkata", "WB", 9, 172600, "Active", "2026-04-25", "98315 22668"],
  ["Amit Chaudhary", "Chandigarh", "CH", 4, 63400, "Active", "2026-04-19", "98720 44556"],
  ["Nandini Raju", "Vijayawada", "AP", 2, 29800, "Inactive", "2026-04-13", "99590 88112"],
  ["Yusuf Ansari", "Mumbai", "MH", 16, 318900, "Active", "2026-04-06", "98200 66774"],
  ["Sarika Menon", "Bengaluru", "KA", 6, 117800, "Active", "2026-03-29", "98860 55221"],
  ["Gaurav Sethi", "New Delhi", "DL", 3, 49700, "Active", "2026-03-21", "98730 11009"],
  ["Anjali Pandey", "Varanasi", "UP", 0, 0, "Inactive", "2026-03-13", "94150 33667"],
  ["Rekha Nambiar", "Kozhikode", "KL", 11, 214300, "Active", "2026-03-04", "97460 22558"],
  ["Suresh Iyengar", "Bengaluru", "KA", 5, 88400, "Active", "2026-02-24", "98440 77116"],
  ["Tanvi Shah", "Ahmedabad", "GJ", 8, 163500, "Active", "2026-02-15", "99790 44880"],
  ["Kabir Grewal", "Ludhiana", "PB", 2, 33100, "Inactive", "2026-02-06", "98150 66223"],
];

const HAND_WRITTEN: Customer[] = SEED.map(
  ([name, city, state, orders, spent, status, joined, phone], i) => ({
    id: `c-${String(i + 1).padStart(3, "0")}`,
    name,
    // The studio's customers are not on its own domain — these are the
    // addresses people actually order under.
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
    phone: `+91 ${phone}`,
    city,
    state,
    status,
    orders,
    spent,
    joined,
  })
);

/**
 * The rest of the book. Forty-two records is enough to design against and
 * nowhere near enough to trust: a table that feels fine at forty rows can be
 * unusable at four thousand. These are generated from name and place pools so
 * the studio has a realistic book to work in — deterministic, because the
 * server and the browser have to build the same one.
 *
 * Swapping the whole of `SEED_CUSTOMERS` for a fetch is the single change
 * that makes this real; nothing downstream reads anything else.
 */
const FIRST = [
  "Aarav", "Aditi", "Advait", "Akash", "Amrita", "Ananya", "Anil", "Anjali",
  "Arjun", "Asha", "Bhavya", "Chetan", "Deepa", "Dhruv", "Divya", "Farida",
  "Gaurav", "Gita", "Harsh", "Indira", "Ishaan", "Jaya", "Kabir", "Kavya",
  "Kiran", "Lata", "Madhav", "Maya", "Mohan", "Naina", "Nikhil", "Nisha",
  "Omkar", "Pallavi", "Pranav", "Priya", "Rahul", "Rani", "Ravi", "Rhea",
  "Rohit", "Sanya", "Shaan", "Shalini", "Sunil", "Tanya", "Uday", "Varun",
  "Vidya", "Yash",
];

const LAST = [
  "Agarwal", "Banerjee", "Bhat", "Chandra", "Chopra", "Das", "Desai", "Dutta",
  "Ghosh", "Gupta", "Iyer", "Jain", "Joshi", "Kapoor", "Khanna", "Kulkarni",
  "Menon", "Mehta", "Mishra", "Nair", "Pillai", "Rao", "Reddy", "Sharma",
  "Shetty", "Singh", "Sinha", "Subramanian", "Thakur", "Varma",
];

const PLACES: [string, string][] = [
  ["Bengaluru", "KA"], ["Mumbai", "MH"], ["Chennai", "TN"], ["New Delhi", "DL"],
  ["Hyderabad", "TG"], ["Pune", "MH"], ["Kolkata", "WB"], ["Ahmedabad", "GJ"],
  ["Kochi", "KL"], ["Jaipur", "RJ"], ["Lucknow", "UP"], ["Chandigarh", "CH"],
  ["Coimbatore", "TN"], ["Indore", "MP"], ["Nagpur", "MH"], ["Surat", "GJ"],
  ["Bhopal", "MP"], ["Mysuru", "KA"], ["Gurugram", "HR"], ["Visakhapatnam", "AP"],
];

function generated(count: number, from: number): Customer[] {
  const out: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const random = seeded(i * 97 + 11);
    const name = `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 13) % LAST.length]}`;
    const [city, state] = PLACES[(i * 3) % PLACES.length];

    // Most people buy once or twice; a few buy constantly. A flat spread
    // would make every tile on the customers page read the same.
    const roll = random();
    const orders =
      roll > 0.94 ? 10 + Math.floor(random() * 9)
      : roll > 0.78 ? 5 + Math.floor(random() * 4)
      : roll > 0.42 ? 2 + Math.floor(random() * 3)
      : roll > 0.12 ? 1
      : 0;

    // Order values cluster around the studio's mid-price pieces.
    const perOrder = 9000 + Math.round(random() * 22000);

    out.push({
      id: `c-${String(from + i + 1).padStart(3, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}${i}@email.com`,
      phone: `+91 ${70 + (i % 30)}${String(100 + (i % 900))} ${String(10000 + ((i * 7919) % 89999))}`,
      city,
      state,
      status: random() > 0.88 ? "Inactive" : "Active",
      orders,
      spent: orders === 0 ? 0 : orders * perOrder,
      joined: daysBefore(20 + Math.floor(random() * 640)),
    });
  }
  return out;
}

export const SEED_CUSTOMERS: Customer[] = [...HAND_WRITTEN, ...generated(198, HAND_WRITTEN.length)];

/* -------------------------------------------------------------- derived */

export function averageOrder(customer: Customer) {
  return customer.orders ? Math.round(customer.spent / customer.orders) : 0;
}

export type CustomerStats = {
  total: number;
  fresh: number;
  withOrders: number;
  repeat: number;
  averageOrder: number;
  spent: number;
};

/** Everything the six tiles at the top of the list show. */
export function statsFor(customers: Customer[]): CustomerStats {
  const spent = customers.reduce((sum, c) => sum + c.spent, 0);
  const orders = customers.reduce((sum, c) => sum + c.orders, 0);
  return {
    total: customers.length,
    fresh: customers.filter((c) => daysSince(c.joined) <= 30).length,
    withOrders: customers.filter((c) => c.orders > 0).length,
    repeat: customers.filter((c) => c.orders >= 2).length,
    averageOrder: orders ? Math.round(spent / orders) : 0,
    spent,
  };
}

/** Every state anybody is in, for the location filter. */
export function locationsIn(customers: Customer[]) {
  return [...new Set(customers.map((c) => c.state))].sort();
}
