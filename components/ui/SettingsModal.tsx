'use client'

import { useState, useEffect } from 'react'
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('anthropic_api_key')
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('anthropic_api_key', apiKey)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem('anthropic_api_key')
    setApiKey('')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-2xl shadow-purple-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <KeyIcon className="w-6 h-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-medium text-white">Anthropic API Key</h3>
          </div>
          
          <p className="text-gray-400 mb-4 text-sm">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-200 pr-24 text-white"
              />
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!apiKey}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 text-white"
              >
                Save API Key
              </button>
              <button
                onClick={handleClear}
                disabled={!apiKey}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-gray-700/30 text-white"
              >
                Clear
              </button>
            </div>
            
            {isSaved && (
              <div className="text-center text-sm text-green-400 animate-pulse">
                ✓ Changes saved
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all duration-200 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}