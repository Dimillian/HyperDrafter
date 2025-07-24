'use client'

import { HyperDrafterIcon } from './HyperDrafterIcon'
import { useTheme } from '@/contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  title?: string
  showIcon?: boolean
  className?: string
  children?: React.ReactNode
}

export function Header({ 
  title = 'HyperDrafter', 
  showIcon = true, 
  className = '',
  children 
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={`border-b border-gray-200 dark:border-gray-800 p-4 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showIcon && <HyperDrafterIcon size={32} />}
          <h1 className="text-2xl font-bold text-gradient">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded-lg transition-all duration-200"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
          {children}
        </div>
      </div>
    </header>
  )
}