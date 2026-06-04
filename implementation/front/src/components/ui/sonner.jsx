import { Toaster as Sonner } from 'sonner'

export function Toaster({ ...props }) {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        }
      }
      {...props}
    />
  )
}