import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { messages, model, apiKeys } = await request.json()

    if (model === 'gpt-4') {
      if (!apiKeys.openai) {
        return NextResponse.json({ error: 'OpenAI API key não configurada' }, { status: 400 })
      }

      const openai = new OpenAI({ apiKey: apiKeys.openai })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        temperature: 0.7,
        max_tokens: 2000
      })

      return NextResponse.json({
        content: completion.choices[0].message.content
      })
    } else if (model === 'claude-3-opus') {
      if (!apiKeys.anthropic) {
        return NextResponse.json({ error: 'Anthropic API key não configurada' }, { status: 400 })
      }

      const anthropic = new Anthropic({ apiKey: apiKeys.anthropic })

      const completion = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      })

      return NextResponse.json({
        content: completion.content[0].type === 'text' ? completion.content[0].text : ''
      })
    } else if (model === 'gemini-pro') {
      if (!apiKeys.google) {
        return NextResponse.json({ error: 'Google API key não configurada' }, { status: 400 })
      }

      const genAI = new GoogleGenerativeAI(apiKeys.google)
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        generationConfig: {
          maxOutputTokens: 2000,
        }
      })

      const result = await chat.sendMessage(messages[messages.length - 1].content)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({
        content: text
      })
    }

    return NextResponse.json({ error: 'Modelo não suportado' }, { status: 400 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
