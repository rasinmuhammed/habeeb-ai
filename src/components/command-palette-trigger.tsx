'use client'

import * as React from 'react'

export function CommandPaletteTrigger() {
    const handleClick = React.useCallback(() => {
        // Dispatch keyboard event to open command palette
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            bubbles: true
        })
        document.dispatchEvent(event)
    }, [])

    return (
        <button
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            onClick={handleClick}
        >
            <span className="text-xs">Search or command</span>
            <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
            </kbd>
        </button>
    )
}
