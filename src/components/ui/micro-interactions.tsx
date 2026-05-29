'use client'

import React from 'react'
import { motion, AnimatePresence, type HTMLMotionProps, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ============================================
   Animation Variants
   ============================================ */

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 }
    }
}

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
}

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15 }
    }
}

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.2 }
    }
}

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
}

/* ============================================
   Animated Presence Wrapper
   ============================================ */

interface AnimatedPresenceProps {
    children: React.ReactNode
    show?: boolean
    mode?: 'wait' | 'sync' | 'popLayout'
}

export function AnimatedPresenceWrapper({
    children,
    show = true,
    mode = 'wait'
}: AnimatedPresenceProps) {
    return (
        <AnimatePresence mode={mode}>
            {show && children}
        </AnimatePresence>
    )
}

/* ============================================
   Fade In Component
   ============================================ */

interface FadeInProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.3,
    direction = 'up',
    className,
    ...props
}: FadeInProps) {
    const directionMap = {
        up: { y: 10 },
        down: { y: -10 },
        left: { x: 20 },
        right: { x: -20 },
        none: {}
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directionMap[direction] }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, ...directionMap[direction] }}
            transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Scale In Component
   ============================================ */

interface ScaleInProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    delay?: number
}

export function ScaleIn({
    children,
    delay = 0,
    className,
    ...props
}: ScaleInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.2,
                delay,
                ease: [0.175, 0.885, 0.32, 1.275]
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Stagger Container Component
   ============================================ */

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    staggerDelay?: number
    initialDelay?: number
}

export function StaggerContainer({
    children,
    staggerDelay = 0.05,
    initialDelay = 0.1,
    className,
    ...props
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: initialDelay
                    }
                }
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Stagger Item Component
   ============================================ */

interface StaggerItemProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
}

export function StaggerItem({
    children,
    className,
    ...props
}: StaggerItemProps) {
    return (
        <motion.div
            variants={staggerItem}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Pressable Component - Tactile Button Feedback
   ============================================ */

interface PressableProps extends HTMLMotionProps<'button'> {
    children: React.ReactNode
    scale?: number
    disabled?: boolean
}

export function Pressable({
    children,
    scale = 0.97,
    disabled = false,
    className,
    ...props
}: PressableProps) {
    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={cn('cursor-pointer', disabled && 'cursor-not-allowed', className)}
            disabled={disabled}
            {...props}
        >
            {children}
        </motion.button>
    )
}

/* ============================================
   Hover Card Component - Lift Effect
   ============================================ */

interface HoverCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    lift?: number
}

export function HoverCard({
    children,
    lift = 4,
    className,
    ...props
}: HoverCardProps) {
    return (
        <motion.div
            whileHover={{
                y: -lift,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Shimmer Skeleton Component
   ============================================ */

interface ShimmerProps {
    className?: string
    rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Shimmer({
    className,
    rounded = 'md'
}: ShimmerProps) {
    const roundedMap = {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full'
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden bg-muted',
                roundedMap[rounded],
                className
            )}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['calc(-100%)', 'calc(100%)'] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </div>
    )
}

/* ============================================
   Pulse Glow Component
   ============================================ */

interface PulseGlowProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    color?: string
}

export function PulseGlow({
    children,
    color = 'rgba(139, 92, 246, 0.3)',
    className,
    ...props
}: PulseGlowProps) {
    return (
        <motion.div
            animate={{
                boxShadow: [
                    `0 0 20px ${color}`,
                    `0 0 30px ${color}`,
                    `0 0 20px ${color}`
                ]
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Float Component - Gentle Floating Animation
   ============================================ */

interface FloatProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    amplitude?: number
    duration?: number
}

export function Float({
    children,
    amplitude = 5,
    duration = 3,
    className,
    ...props
}: FloatProps) {
    return (
        <motion.div
            animate={{ y: [0, -amplitude, 0] }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Reveal Component - Scroll Triggered Animation
   ============================================ */

interface RevealProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    delay?: number
}

export function Reveal({
    children,
    delay = 0,
    className,
    ...props
}: RevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/* ============================================
   Typing Indicator Component
   ============================================ */

export function TypingIndicator({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut'
                    }}
                />
            ))}
        </div>
    )
}

/* ============================================
   Success Checkmark Animation
   ============================================ */

export function SuccessCheckmark({
    size = 24,
    className
}: {
    size?: number
    className?: string
}) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={cn('text-green-500', className)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20
            }}
        >
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
            />
            <motion.path
                d="M8 12l2.5 2.5L16 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            />
        </motion.svg>
    )
}

/* ============================================
   Progress Ring Animation
   ============================================ */

interface ProgressRingProps {
    progress: number
    size?: number
    strokeWidth?: number
    className?: string
}

export function ProgressRing({
    progress,
    size = 40,
    strokeWidth = 4,
    className
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    return (
        <svg
            width={size}
            height={size}
            className={cn('transform -rotate-90', className)}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-muted/30"
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                className="text-primary"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    strokeDasharray: circumference
                }}
            />
        </svg>
    )
}

/* ============================================
   Notification Badge with Bounce
   ============================================ */

interface NotificationBadgeProps {
    count: number
    className?: string
}

export function NotificationBadge({
    count,
    className
}: NotificationBadgeProps) {
    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 15
                    }}
                    className={cn(
                        'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground',
                        className
                    )}
                >
                    {count > 99 ? '99+' : count}
                </motion.span>
            )}
        </AnimatePresence>
    )
}

/* ============================================
   Tooltip Animation Wrapper
   ============================================ */

interface AnimatedTooltipProps {
    children: React.ReactNode
    show: boolean
    className?: string
}

export function AnimatedTooltip({
    children,
    show,
    className
}: AnimatedTooltipProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={className}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
