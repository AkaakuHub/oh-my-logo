import React from 'react';
import { render, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { containsJapanese } from './japanese-renderer.js';
import stringWidth from 'string-width';

interface LogoProps {
  text: string;
  colors: string[];
}

const Logo: React.FC<LogoProps> = ({ text, colors }) => {
  // Check if text contains Japanese characters
  if (containsJapanese(text)) {
    // For Japanese text, use simpler text rendering
    const japaneseArt = createJapaneseBlock(text);
    
    if (colors.length > 0) {
      return (
        <Gradient colors={colors}>
          <Text>{japaneseArt}</Text>
        </Gradient>
      );
    }
    
    return (
      <Gradient name="rainbow">
        <Text>{japaneseArt}</Text>
      </Gradient>
    );
  }
  
  // Regular ASCII text rendering
  if (colors.length > 0) {
    return (
      <Gradient colors={colors}>
        <BigText text={text} font="block" />
      </Gradient>
    );
  }

  // Default gradient
  return (
    <Gradient name="rainbow">
      <BigText text={text} font="block" />
    </Gradient>
  );
};

// Helper function to create Japanese block text with proper width handling
function createJapaneseBlock(text: string): string {
  const chars = Array.from(text);
  const scale = 5;
  const lines: string[] = [];
  
  // Initialize lines for the height
  for (let i = 0; i < scale; i++) {
    lines.push('');
  }
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const charWidth = stringWidth(char) || 1;
    const blockWidth = Math.max(charWidth * 3, 6); // Minimum 6 characters wide for better display
    
    for (let row = 0; row < scale; row++) {
      if (row === 0 || row === scale - 1) {
        // Top and bottom borders
        lines[row] += '█'.repeat(blockWidth);
      } else if (row === Math.floor(scale / 2)) {
        // Middle row with character
        const padding = Math.max(0, blockWidth - charWidth);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        lines[row] += '█'.repeat(leftPad) + char + '█'.repeat(rightPad);
      } else {
        // Side borders
        lines[row] += '█' + ' '.repeat(blockWidth - 2) + '█';
      }
      
      // Add spacing between characters
      if (i < chars.length - 1) {
        lines[row] += '  '; // Double space for better separation
      }
    }
  }
  
  return lines.join('\n');
}

export function renderInkLogo(text: string, palette: string[]): Promise<void> {
  return new Promise((resolve) => {
    const { unmount } = render(<Logo text={text} colors={palette} />);
    
    // Automatically unmount after rendering to allow process to exit
    setTimeout(() => {
      unmount();
      resolve();
    }, 100);
  });
}