import { Highlight, Paragraph } from '@/types/editor'

export class HighlightService {
  private highlightsMap: Map<string, Highlight[]> = new Map()

  /**
   * Get all highlights
   */
  getAllHighlights(): Highlight[] {
    const allHighlights: Highlight[] = []
    this.highlightsMap.forEach(highlights => {
      allHighlights.push(...highlights)
    })
    return allHighlights
  }

  /**
   * Get highlights for a specific paragraph
   */
  getHighlightsForParagraph(paragraphId: string): Highlight[] {
    return this.highlightsMap.get(paragraphId) || []
  }

  /**
   * Set highlights for a paragraph
   */
  setHighlightsForParagraph(paragraphId: string, highlights: Highlight[]): void {
    if (highlights.length === 0) {
      this.highlightsMap.delete(paragraphId)
    } else {
      this.highlightsMap.set(paragraphId, highlights)
    }
  }

  /**
   * Remove all highlights for a paragraph
   */
  removeHighlightsForParagraph(paragraphId: string): void {
    this.highlightsMap.delete(paragraphId)
  }

  /**
   * Find a highlight by ID
   */
  findHighlightById(highlightId: string): Highlight | undefined {
    for (const highlights of this.highlightsMap.values()) {
      const found = highlights.find(h => h.id === highlightId)
      if (found) return found
    }
    return undefined
  }

  /**
   * Update highlights for multiple paragraphs
   */
  updateHighlights(paragraphHighlights: Map<string, Highlight[]>): void {
    paragraphHighlights.forEach((highlights, paragraphId) => {
      this.setHighlightsForParagraph(paragraphId, highlights)
    })
  }

  /**
   * Filter highlights by type
   */
  getHighlightsByType(type: string): Highlight[] {
    const filtered: Highlight[] = []
    this.highlightsMap.forEach(highlights => {
      filtered.push(...highlights.filter(h => h.type === type))
    })
    return filtered
  }

  /**
   * Filter highlights by priority
   */
  getHighlightsByPriority(priority: 'high' | 'medium' | 'low'): Highlight[] {
    const filtered: Highlight[] = []
    this.highlightsMap.forEach(highlights => {
      filtered.push(...highlights.filter(h => h.priority === priority))
    })
    return filtered
  }

  /**
   * Clear all highlights
   */
  clearAllHighlights(): void {
    this.highlightsMap.clear()
  }

  /**
   * Check if a paragraph has highlights
   */
  hasHighlights(paragraphId: string): boolean {
    return this.highlightsMap.has(paragraphId)
  }

  /**
   * Get highlight count for a paragraph
   */
  getHighlightCount(paragraphId: string): number {
    return this.getHighlightsForParagraph(paragraphId).length
  }

  /**
   * Get total highlight count
   */
  getTotalHighlightCount(): number {
    let count = 0
    this.highlightsMap.forEach(highlights => {
      count += highlights.length
    })
    return count
  }

  /**
   * Export highlights to array format (for compatibility)
   */
  toArray(): Highlight[] {
    return this.getAllHighlights()
  }

  /**
   * Import highlights from array format
   */
  fromArray(highlights: Highlight[]): void {
    this.clearAllHighlights()
    
    // Group by paragraph ID
    const grouped = highlights.reduce((acc, highlight) => {
      if (!acc[highlight.paragraphId]) {
        acc[highlight.paragraphId] = []
      }
      acc[highlight.paragraphId].push(highlight)
      return acc
    }, {} as Record<string, Highlight[]>)

    // Set highlights for each paragraph
    Object.entries(grouped).forEach(([paragraphId, paragraphHighlights]) => {
      this.setHighlightsForParagraph(paragraphId, paragraphHighlights)
    })
  }
}

export const highlightService = new HighlightService()