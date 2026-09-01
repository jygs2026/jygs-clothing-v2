"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      // "some" (any part of the target enters the viewport) rather than a
      // fixed fraction — a fraction of the target's own height breaks for
      // very tall content (e.g. a many-row product grid on a short mobile
      // viewport can never show 10% of a 12,000px-tall element), leaving
      // it permanently stuck at `initial` opacity.
      viewport={{ once: true, amount: "some", margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.8, ease: [0.2, 0.6, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
