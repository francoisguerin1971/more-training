'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

export function FadeIn({
    children,
    delay = 0,
    className = "",
    direction = "up"
}: {
    children: ReactNode,
    delay?: number,
    className?: string,
    direction?: "up" | "down" | "left" | "right" | "none"
}) {

    const variants: Variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
            x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: 0.8,
                delay: delay,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function FadeInStagger({ children, className = "", faster = false }: { children: ReactNode, className?: string, faster?: boolean }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: faster ? 0.1 : 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
