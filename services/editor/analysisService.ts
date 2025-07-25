import { anthropicService } from '@/lib/ai/anthropic'
import { SpanIdentification } from '@/lib/ai/types'
import { Paragraph, Highlight } from '@/types/editor'

export class AnalysisService {
  private abortControllers: Map<string, AbortController> = new Map()
  private lastAnalyzedContent: Map<string, string> = new Map()
  private analysisTimestamps: Map<string, number> = new Map()

  async analyzeParagraph(
    paragraph: Paragraph,
    allParagraphs: Paragraph[],
    signal?: AbortSignal
  ): Promise<Highlight[]> {
    if (!paragraph.content.trim()) {
      return []
    }

    // Skip if content hasn't changed
    if (this.lastAnalyzedContent.get(paragraph.id) === paragraph.content) {
      return []
    }

    // Cancel any ongoing analysis for this paragraph
    this.cancelAnalysis(paragraph.id)

    // Create new abort controller
    const abortController = new AbortController()
    this.abortControllers.set(paragraph.id, abortController)

    // Combine signals if external signal provided
    const combinedSignal = signal 
      ? this.combineSignals([signal, abortController.signal])
      : abortController.signal

    try {
      // Update service credentials
      anthropicService.updateCredentials()

      // Prepare context
      const fullDocumentContext = {
        paragraphs: allParagraphs,
        targetParagraphId: paragraph.id
      }

      const response = await anthropicService.identifySpans(
        paragraph.content,
        fullDocumentContext,
        combinedSignal
      )

      // Convert spans to highlights
      const highlights: Highlight[] = response.spans.map((span: SpanIdentification, idx: number) => ({
        id: `highlight-${paragraph.id}-${idx}`,
        paragraphId: paragraph.id,
        type: span.type,
        priority: span.priority,
        text: this.truncateText(span.text, 30),
        startIndex: Math.max(0, span.startOffset),
        endIndex: Math.min(paragraph.content.length, span.endOffset),
        note: span.reasoning,
        confidence: span.confidence,
        fullText: span.text
      }))

      // Mark as analyzed
      this.lastAnalyzedContent.set(paragraph.id, paragraph.content)
      this.analysisTimestamps.set(paragraph.id, Date.now())

      return highlights
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return []
      }
      throw error
    } finally {
      // Clean up
      if (this.abortControllers.get(paragraph.id) === abortController) {
        this.abortControllers.delete(paragraph.id)
      }
    }
  }

  cancelAnalysis(paragraphId: string): void {
    const controller = this.abortControllers.get(paragraphId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(paragraphId)
    }
  }

  clearAnalysisTracking(paragraphId: string): void {
    // Don't clear if analysis was completed very recently (within 500ms)
    // This prevents clearing when highlight application triggers content changes
    const analysisTime = this.analysisTimestamps.get(paragraphId)
    if (analysisTime && Date.now() - analysisTime < 500) {
      return
    }
    
    this.lastAnalyzedContent.delete(paragraphId)
    this.analysisTimestamps.delete(paragraphId)
    this.cancelAnalysis(paragraphId)
  }

  hasBeenAnalyzed(paragraphId: string, content: string): boolean {
    return this.lastAnalyzedContent.get(paragraphId) === content
  }

  private truncateText(text: string, maxLength: number): string {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }

  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()
    
    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort()
      } else {
        signal.addEventListener('abort', () => controller.abort())
      }
    })

    return controller.signal
  }
}

export const analysisService = new AnalysisService()