"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { settle } from "@/lib/motion";

export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  y = 12,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "figure" | "article";
  y?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.64, ease: settle, delay }}
    >
      {children}
    </Tag>
  );
}

export function RevealList({ children, className = "", stagger = 0.06 }: { children: ReactNode; className?: string; stagger?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.ul>
  );
}

export function RevealItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.li
      className={className}
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.64, ease: settle } } }}
    >
      {children}
    </motion.li>
  );
}
