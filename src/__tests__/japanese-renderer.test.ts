import { describe, it, expect } from 'vitest';
import { containsJapanese, renderJapaneseText } from '../japanese-renderer.js';

describe('Japanese Renderer', () => {
  describe('containsJapanese', () => {
    it('should detect hiragana characters', () => {
      expect(containsJapanese('こんにちは')).toBe(true);
      expect(containsJapanese('あいうえお')).toBe(true);
    });

    it('should detect katakana characters', () => {
      expect(containsJapanese('カタカナ')).toBe(true);
      expect(containsJapanese('アイウエオ')).toBe(true);
    });

    it('should detect kanji characters', () => {
      expect(containsJapanese('日本語')).toBe(true);
      expect(containsJapanese('世界')).toBe(true);
      expect(containsJapanese('漢字')).toBe(true);
    });

    it('should detect mixed Japanese and ASCII', () => {
      expect(containsJapanese('Hello世界')).toBe(true);
      expect(containsJapanese('こんにちはWorld')).toBe(true);
    });

    it('should not detect ASCII-only text', () => {
      expect(containsJapanese('Hello World')).toBe(false);
      expect(containsJapanese('123456')).toBe(false);
      expect(containsJapanese('!@#$%')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(containsJapanese('')).toBe(false);
    });
  });

  describe('renderJapaneseText', () => {
    const testPalette = ['#ff0000', '#00ff00', '#0000ff'];

    it('should render Japanese text as block art', () => {
      const result = renderJapaneseText('こん', testPalette, 'vertical');
      expect(result).toContain('████');
      // Characters are rendered as detailed patterns, not literal characters
      expect(result).toMatch(/█+/);
    });

    it('should handle different gradient directions', () => {
      const verticalResult = renderJapaneseText('日', testPalette, 'vertical');
      const horizontalResult = renderJapaneseText('日', testPalette, 'horizontal');
      const diagonalResult = renderJapaneseText('日', testPalette, 'diagonal');

      expect(verticalResult).toBeTruthy();
      expect(horizontalResult).toBeTruthy();
      expect(diagonalResult).toBeTruthy();
      
      // All should contain block patterns
      expect(verticalResult).toMatch(/█+/);
      expect(horizontalResult).toMatch(/█+/);
      expect(diagonalResult).toMatch(/█+/);
    });

    it('should handle single character', () => {
      const result = renderJapaneseText('日', testPalette);
      expect(result).toContain('████');
      expect(result).toMatch(/█+/);
    });

    it('should handle multiple characters', () => {
      const result = renderJapaneseText('世界', testPalette);
      expect(result).toMatch(/█+/);
      // Should have proper spacing between characters
      expect(result.split('\n').length).toBeGreaterThan(1);
      // Should be wider than single character
      const singleChar = renderJapaneseText('世', testPalette);
      expect(result.length).toBeGreaterThan(singleChar.length);
    });

    it('should create proper detailed character patterns', () => {
      const result = renderJapaneseText('あ', testPalette);
      const lines = result.split('\n');
      
      // Should have multiple lines (20 lines for JIS font or 10 for fallback patterns)
      expect(lines.length).toBeGreaterThanOrEqual(10);
      
      // Should contain block characters
      expect(result).toContain('█');
      
      // Should be a detailed pattern, not just containing the character
      expect(result).toMatch(/█+/);
    });
  });
});