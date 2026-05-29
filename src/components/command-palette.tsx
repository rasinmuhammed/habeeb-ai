'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import {
    FolderGit2,
    MessageSquare,
    Users,
    CreditCard,
    Plus,
    Search,
    Settings,
    LogOut,
    Moon,
    Sun,
    Video,
    HelpCircle,
    Sparkles,
    ExternalLink,
    Keyboard,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'

interface CommandPaletteProps {
    onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ onOpenChange }: CommandPaletteProps) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { projects, project, setProjectId } = useProject()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    React.useEffect(() => {
        onOpenChange?.(open)
    }, [open, onOpenChange])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Quick Actions */}
                <CommandGroup heading="Quick Actions">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/create'))}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New Project</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            // Trigger ask question modal
                            const event = new CustomEvent('open-ask-question')
                            window.dispatchEvent(event)
                        })}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Ask AI a Question</span>
                        <CommandShortcut>⌘/</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Navigation */}
                <CommandGroup heading="Navigation">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/dashboard'))}
                    >
                        <FolderGit2 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <CommandShortcut>⌘D</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/qa'))}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Q&A History</span>
                        <CommandShortcut>⌘Q</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/meetings'))}
                    >
                        <Video className="mr-2 h-4 w-4" />
                        <span>Meetings</span>
                        <CommandShortcut>⌘M</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/billing'))}
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <>
                        <CommandGroup heading="Switch Project">
                            {projects.map((p) => (
                                <CommandItem
                                    key={p.id}
                                    onSelect={() => runCommand(() => {
                                        setProjectId(p.id)
                                        router.push('/dashboard')
                                    })}
                                >
                                    <FolderGit2 className="mr-2 h-4 w-4" />
                                    <span>{p.name}</span>
                                    {project?.id === p.id && (
                                        <span className="ml-auto text-xs text-muted-foreground">Current</span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {/* Theme */}
                <CommandGroup heading="Preferences">
                    <CommandItem
                        onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                    >
                        {theme === 'dark' ? (
                            <Sun className="mr-2 h-4 w-4" />
                        ) : (
                            <Moon className="mr-2 h-4 w-4" />
                        )}
                        <span>Toggle Theme</span>
                        <CommandShortcut>⌘T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            const event = new CustomEvent('open-keyboard-shortcuts')
                            window.dispatchEvent(event)
                        })}
                    >
                        <Keyboard className="mr-2 h-4 w-4" />
                        <span>Keyboard Shortcuts</span>
                        <CommandShortcut>?</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Help */}
                <CommandGroup heading="Help">
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            window.open('https://github.com/rasinmuhammed/habeeb-ai', '_blank')
                        })}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>View on GitHub</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            const event = new CustomEvent('open-help')
                            window.dispatchEvent(event)
                        })}
                    >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help & Documentation</span>
                        <CommandShortcut>⌘H</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}

/* ============================================
   Keyboard Shortcuts Hook
   ============================================ */

interface ShortcutConfig {
    key: string
    ctrl?: boolean
    meta?: boolean
    shift?: boolean
    alt?: boolean
    callback: () => void
    description?: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey
                const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
                const altMatch = shortcut.alt ? e.altKey : !e.altKey
                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

                // Allow either meta or ctrl for cross-platform compatibility
                const modifierMatch = (shortcut.meta || shortcut.ctrl)
                    ? (e.metaKey || e.ctrlKey)
                    : (metaMatch && ctrlMatch)

                if (modifierMatch && shiftMatch && altMatch && keyMatch) {
                    e.preventDefault()
                    shortcut.callback()
                    break
                }
            }
        }

        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [shortcuts])
}

/* ============================================
   Keyboard Shortcuts Modal
   ============================================ */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export function KeyboardShortcutsModal() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const handler = () => setOpen(true)
        window.addEventListener('open-keyboard-shortcuts', handler)
        return () => window.removeEventListener('open-keyboard-shortcuts', handler)
    }, [])

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault()
                setOpen(true)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const shortcuts = [
        { keys: ['⌘', 'K'], description: 'Open command palette' },
        { keys: ['⌘', 'N'], description: 'Create new project' },
        { keys: ['⌘', '/'], description: 'Ask AI a question' },
        { keys: ['⌘', 'D'], description: 'Go to dashboard' },
        { keys: ['⌘', 'Q'], description: 'Go to Q&A history' },
        { keys: ['⌘', 'M'], description: 'Go to meetings' },
        { keys: ['⌘', 'T'], description: 'Toggle dark/light theme' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close dialogs' },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                    {shortcuts.map((shortcut, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                            <span className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, j) => (
                                    <kbd
                                        key={j}
                                        className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-muted px-1.5 text-xs font-medium text-muted-foreground"
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

/* ============================================
   Command Palette Provider
   ============================================ */

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <CommandPalette />
            <KeyboardShortcutsModal />
        </>
    )
}
