import { HyperDrafterIcon } from './HyperDrafterIcon'

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
  return (
    <header className={`border-b border-dark p-4 flex-shrink-0 ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showIcon && <HyperDrafterIcon size={32} />}
          <h1 className="text-2xl font-bold text-gradient">{title}</h1>
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </header>
  )
}