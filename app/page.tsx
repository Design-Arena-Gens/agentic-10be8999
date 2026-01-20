'use client'

import { useState } from 'react'
import { Send, Trash2, Settings } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type AIModel = 'gpt-4' | 'claude-3-opus' | 'gemini-pro'

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: AIModel
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: ''
  })

  const modelInfo = {
    'gpt-4': { name: 'ChatGPT 4', color: 'bg-green-600', icon: '🤖' },
    'claude-3-opus': { name: 'Claude 3 Opus', color: 'bg-orange-600', icon: '🧠' },
    'gemini-pro': { name: 'Gemini Pro', color: 'bg-blue-600', icon: '✨' }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const hasApiKey =
      (selectedModel === 'gpt-4' && apiKeys.openai) ||
      (selectedModel === 'claude-3-opus' && apiKeys.anthropic) ||
      (selectedModel === 'gemini-pro' && apiKeys.google)

    if (!hasApiKey) {
      alert(`Por favor, configure sua chave API para ${modelInfo[selectedModel].name} nas configurações`)
      setShowSettings(true)
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          apiKeys
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        model: selectedModel
      }])
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Chat Unificado AI</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Configurações"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Limpar conversa"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Configurações de API</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Anthropic API Key</label>
                <input
                  type="password"
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                  placeholder="sk-ant-..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Google API Key</label>
                <input
                  type="password"
                  value={apiKeys.google}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, google: e.target.value }))}
                  placeholder="AIza..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              As chaves são armazenadas apenas localmente no seu navegador
            </p>
          </div>
        </div>
      )}

      {/* Model Selector */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            {(Object.keys(modelInfo) as AIModel[]).map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedModel === model
                    ? modelInfo[model].color + ' text-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <span>{modelInfo[model].icon}</span>
                <span>{modelInfo[model].name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Chat Unificado!</h2>
              <p className="text-gray-400">
                ChatGPT Plus, Claude e Gemini em um só lugar
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Configure suas chaves API em Configurações e comece a conversar
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {message.role === 'assistant' && message.model && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                    <span>{modelInfo[message.model].icon}</span>
                    <span>{modelInfo[message.model].name}</span>
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Pensando...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send size={20} />
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
