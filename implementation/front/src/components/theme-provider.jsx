import * as React from 'react'

const ThemeContext = React.createContext({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
  ...props
}) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      return stored || defaultTheme
    }
    return defaultTheme
  })

  React.useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, storageKey])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme])

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}