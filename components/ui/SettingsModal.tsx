'use client'

import { useState, useEffect } from 'react'
import { KeyIcon, XMarkIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { anthropicService } from '@/lib/ai/anthropic'
import { ModelInfo } from '@/lib/ai/types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-3-5-haiku-20241022')
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  useEffect(() => {
    const savedKey = localStorage.getItem('anthropic_api_key')
    const savedModel = localStorage.getItem('anthropic_model')
    if (savedKey) {
      setApiKey(savedKey)
    }
    if (savedModel) {
      setSelectedModel(savedModel)
    }
  }, [])

  useEffect(() => {
    if (apiKey && isOpen) {
      fetchModels()
    }
  }, [apiKey, isOpen])

  const fetchModels = async () => {
    setIsLoadingModels(true)
    setModelsError(null)
    
    try {
      anthropicService.updateCredentials()
      const response = await anthropicService.fetchAvailableModels()
      setAvailableModels(response.data)
      
      // If saved model is not in the list, select the first one
      if (response.data.length > 0 && !response.data.find(m => m.id === selectedModel)) {
        setSelectedModel(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setModelsError(error instanceof Error ? error.message : 'Failed to fetch models')
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem('anthropic_api_key', apiKey)
    localStorage.setItem('anthropic_model', selectedModel)
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
          
          {/* Model Selection */}
          {apiKey && (
            <div className="mt-6 pt-6 border-t border-purple-500/20">
              <div className="flex items-center mb-4">
                <CpuChipIcon className="w-6 h-6 text-purple-400 mr-2" />
                <h3 className="text-lg font-medium text-white">AI Model</h3>
              </div>
              
              <p className="text-gray-400 mb-4 text-sm">
                Choose the Claude model for AI analysis.
              </p>
              
              {isLoadingModels ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
              ) : modelsError ? (
                <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                  {modelsError}
                </div>
              ) : availableModels.length > 0 ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-200 text-white"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.display_name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-200 text-white"
                >
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                  <option value="claude-4-20250514">Claude 4 Sonnet</option>
                  <option value="claude-opus-4-20250514">Claude 4 Opus</option>
                </select>
              )}
            </div>
          )}
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