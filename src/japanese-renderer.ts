import gradient from 'gradient-string';
import stringWidth from 'string-width';
import figlet from 'figlet';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore - encoding-japanese has no type definitions
import * as Encoding from 'encoding-japanese';
// @ts-ignore - jconv has no type definitions
import jconv from 'jconv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JIS font data directly
let jisFontData: string | null = null;
let jisCharacterMap: Map<string, string> = new Map(); // Use hex string as key

try {
  const fontPath = join(__dirname, 'fonts', 'jiskan16.flf');
  jisFontData = readFileSync(fontPath, 'utf8');
  parseJisFontData(jisFontData);
} catch (error) {
  console.warn('JIS font loading failed:', error);
}

/**
 * Parse JIS font file and extract character glyphs
 */
function parseJisFontData(fontData: string): void {
  const lines = fontData.split('\n');
  let i = 0;
  
  // Skip header and comments
  while (i < lines.length && !lines[i].match(/^\d+ [0-9a-fA-F]+$/)) {
    i++;
  }
  
  // Parse character entries
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(/^(\d+) ([0-9a-fA-F]+)$/);
    
    if (match) {
      const decimalCode = parseInt(match[1], 10);
      const hexCode = match[2].toLowerCase(); // Use the hex code directly
      const glyphLines: string[] = [];
      i++;
      
      // Read glyph data until we hit the end marker (@@)
      while (i < lines.length) {
        const glyphLine = lines[i];
        if (glyphLine.includes('@@')) {
          // End of character, remove $@ markers
          glyphLines.push(glyphLine.replace('$@@', ''));
          break;
        } else if (glyphLine.includes('$@')) {
          // Regular glyph line, remove $@ marker
          glyphLines.push(glyphLine.replace('$@', ''));
        }
        i++;
      }
      
      // Store the glyph, converting # to █ for proper block display
      if (glyphLines.length > 0) {
        const convertedGlyph = glyphLines.map(line => line.replace(/#/g, '█')).join('\n');
        jisCharacterMap.set(hexCode, convertedGlyph); // Use hex code as key
      }
    }
    i++;
  }
}

/**
 * Convert Unicode character to JIS hex code using ISO-2022-JP encoding
 */
/**
 * Convert Unicode character to JIS hex code using ISO-2022-JP algorithm
 */
function unicodeToJisHexCode(char: string): string | null {
  try {
    // Try jconv library for Unicode to JIS conversion
    const jisBytes = jconv.encode(char, 'JIS');
    if (jisBytes && jisBytes.length >= 5) {
      // JIS encoding includes escape sequences: [ESC] $ B [char_byte1] [char_byte2] [ESC] ( B
      // Skip escape sequence (first 3 bytes: 1B 24 42) and get actual character bytes
      const charByte1 = jisBytes[3];
      const charByte2 = jisBytes[4];
      const hexCode = ((charByte1 << 8) | charByte2).toString(16).toLowerCase().padStart(4, '0');
      console.log('jconv JIS: char', char, '-> hex', hexCode);
      
      // Check if this hex code exists in our font map
      if (jisCharacterMap.has(hexCode)) {
        return hexCode;
      }
    }
    
    // Try SJIS encoding as alternative (simpler structure without escape sequences)
    const sjisBytes = jconv.encode(char, 'SJIS');
    if (sjisBytes && sjisBytes.length >= 2) {
      const hexCode = ((sjisBytes[0] << 8) | sjisBytes[1]).toString(16).toLowerCase().padStart(4, '0');
      console.log('jconv SJIS: char', char, '-> hex', hexCode);
      
      if (jisCharacterMap.has(hexCode)) {
        return hexCode;
      }
    }
    
    // Try encoding-japanese library as fallback
    const codes = [];
    for (let i = 0; i < char.length; i++) {
      codes.push(char.charCodeAt(i));
    }
    
    // Try different JIS conversion methods
    const conversions = ['JISX0208', 'SJIS'];
    for (const encoding of conversions) {
      try {
        const convertedArray = Encoding.convert(codes, {
          to: encoding,
          from: 'UNICODE'
        });
        
        if (convertedArray && convertedArray.length >= 2) {
          const hexCode = ((convertedArray[0] << 8) | convertedArray[1]).toString(16).toLowerCase().padStart(4, '0');
          console.log(`encoding-japanese (${encoding}): char`, char, '-> hex', hexCode);
          
          if (jisCharacterMap.has(hexCode)) {
            return hexCode;
          }
        }
      } catch (e) {
        // Continue to next encoding
      }
    }
    
    console.log('No automatic conversion found for character:', char);
    return null;
  } catch (error) {
    console.log('Error in automatic conversion for', char, ':', error);
    return null;
  }
}

/**
 * Try to render single Japanese character using directly parsed JIS font data
 */
function renderJisCharacter(char: string): string | null {
  if (!jisFontData || jisCharacterMap.size === 0) {
    return null;
  }
  
  try {
    const jisHexCode = unicodeToJisHexCode(char);
    if (!jisHexCode) {
      return null;
    }
    
    // Get the glyph data directly from our parsed map using hex code
    const glyphData = jisCharacterMap.get(jisHexCode);
    if (!glyphData) {
      return null;
    }
    
    return glyphData;
  } catch (error) {
    return null;
  }
}


/**
 * Create detailed ASCII art patterns for common Japanese characters
 */
function getJapaneseCharPattern(char: string): string[] {
  const patterns: { [key: string]: string[] } = {
    'あ': [
      '  ████████  ',
      ' █        █ ',
      '█   ████   █',
      '█  █    █  █',
      '█  █ ████  █',
      '█  █ █  █  █',
      '█  █ ████  █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    'い': [
      '  ████████  ',
      ' █        █ ',
      '█    ██    █',
      '█    ██    █',
      '█    ██    █',
      '█  ██████  █',
      '█  ██  ██  █',
      '█    ██    █',
      ' █        █ ',
      '  ████████  '
    ],
    'う': [
      '  ████████  ',
      ' █        █ ',
      '█  ██████  █',
      '█    ██    █',
      '█    ██    █',
      '█  ██████  █',
      '█  ██  ██  █',
      '█  ██████  █',
      ' █        █ ',
      '  ████████  '
    ],
    'え': [
      '  ████████  ',
      ' █        █ ',
      '█ ████████ █',
      '█ ██    ██ █',
      '█ ████████ █',
      '█ ██    ██ █',
      '█ ████████ █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    'お': [
      '  ████████  ',
      ' █        █ ',
      '█ ██████ █ █',
      '█ ██  ██ █ █',
      '█ ██████ █ █',
      '█ ██     █ █',
      '█ ████████ █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    'こ': [
      '  ████████  ',
      ' █        █ ',
      '█ ████████ █',
      '█          █',
      '█   ████   █',
      '█          █',
      '█ ████████ █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    'ん': [
      '  ████████  ',
      ' █        █ ',
      '█   ████   █',
      '█  █    █  █',
      '█  █    █  █',
      '█  █ ██ █  █',
      '█   ████   █',
      '█    ██    █',
      ' █        █ ',
      '  ████████  '
    ],
    'に': [
      '  ████████  ',
      ' █        █ ',
      '█    ██    █',
      '█    ██    █',
      '█ ████████ █',
      '█    ██    █',
      '█  ██████  █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    'ち': [
      '  ████████  ',
      ' █        █ ',
      '█  ██████  █',
      '█     ██   █',
      '█     ██   █',
      '█   ██████ █',
      '█     ██   █',
      '█   ██████ █',
      ' █        █ ',
      '  ████████  '
    ],
    'は': [
      '  ████████  ',
      ' █        █ ',
      '█ ██  ██   █',
      '█ ██  ██   █',
      '█ ████████ █',
      '█ ██  ██   █',
      '█ ██  ████ █',
      '█ ██    ██ █',
      ' █        █ ',
      '  ████████  '
    ],
    '世': [
      '  ████████  ',
      ' █        █ ',
      '█  █████   █',
      '█  █   █   █',
      '█ ███████  █',
      '█  █   █   █',
      '█  █   █   █',
      '█ ████████ █',
      ' █        █ ',
      '  ████████  '
    ],
    '界': [
      '  ████████  ',
      ' █        █ ',
      '█ ████████ █',
      '█ █  ██  █ █',
      '█ █  ██  █ █',
      '█ ████████ █',
      '█    ██    █',
      '█ ████████ █',
      ' █        █ ',
      '  ████████  '
    ],
    '日': [
      '  ████████  ',
      ' █        █ ',
      '█ ████████ █',
      '█ ██    ██ █',
      '█ ████████ █',
      '█ ██    ██ █',
      '█ ████████ █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    '本': [
      '  ████████  ',
      ' █        █ ',
      '█    ██    █',
      '█    ██    █',
      '█ ████████ █',
      '█    ██    █',
      '█   ████   █',
      '█  ██  ██  █',
      ' █        █ ',
      '  ████████  '
    ],
    '語': [
      '  ████████  ',
      ' █        █ ',
      '█ ██ ██ ██ █',
      '█ ██ ██ ██ █',
      '█ ████████ █',
      '█ ██    ██ █',
      '█ ████████ █',
      '█ ██    ██ █',
      ' █        █ ',
      '  ████████  '
    ],
    'の': [
      '  ████████  ',
      ' █        █ ',
      '█   ████   █',
      '█  █    █  █',
      '█  █ ██ █  █',
      '█  █ ██ █  █',
      '█   ████   █',
      '█          █',
      ' █        █ ',
      '  ████████  '
    ],
    'テ': [
      '  ████████  ',
      ' █        █ ',
      '█ ████████ █',
      '█    ██    █',
      '█    ██    █',
      '█    ██    █',
      '█    ██    █',
      '█    ██    █',
      ' █        █ ',
      '  ████████  '
    ],
    'ス': [
      '  ████████  ',
      ' █        █ ',
      '█  ██████  █',
      '█     ██   █',
      '█    ██    █',
      '█   ██     █',
      '█  ██      █',
      '█ ██████   █',
      ' █        █ ',
      '  ████████  '
    ],
    'ト': [
      '  ████████  ',
      ' █        █ ',
      '█   ████   █',
      '█    ██    █',
      '█    ██    █',
      '█    ██    █',
      '█    ██    █',
      '█   ████   █',
      ' █        █ ',
      '  ████████  '
    ]
  };
  
  // Return pattern if exists, otherwise create a generic block
  if (patterns[char]) {
    return patterns[char];
  }
  
  // Generic pattern for unknown characters
  return [
    '  ████████  ',
    ' █        █ ',
    '█   ████   █',
    '█  █    █  █',
    '█  █ ' + char + '  █  █',
    '█  █    █  █',
    '█   ████   █',
    '█          █',
    ' █        █ ',
    '  ████████  '
  ];
}

/**
 * Create realistic Japanese ASCII art using character patterns
 */
function createJapaneseArt(text: string): string[] {
  const chars = Array.from(text);
  const allPatterns = chars.map(char => getJapaneseCharPattern(char));
  
  // Combine patterns horizontally
  const height = allPatterns[0].length;
  const lines: string[] = [];
  
  for (let row = 0; row < height; row++) {
    let line = '';
    for (let i = 0; i < allPatterns.length; i++) {
      line += allPatterns[i][row];
      if (i < allPatterns.length - 1) {
        line += ' '; // Add spacing between characters
      }
    }
    lines.push(line);
  }
  
  return lines;
}

/**
 * Render Japanese text using JIS figlet font or fallback patterns
 */
function renderJapaneseWithJisFont(text: string): string | null {
  if (!jisFontData || jisCharacterMap.size === 0) {
    return null;
  }
  
  const chars = Array.from(text);
  const renderedChars: string[] = [];
  
  for (const char of chars) {
    const result = renderJisCharacter(char);
    if (result) {
      renderedChars.push(result);
    } else {
      // Fallback to pattern for unknown characters
      const pattern = getJapaneseCharPattern(char);
      renderedChars.push(pattern.join('\n'));
    }
  }
  
  if (renderedChars.length === 0) {
    return null;
  }
  
  // Combine multiple characters horizontally
  if (renderedChars.length === 1) {
    return renderedChars[0];
  }
  
  // Split each character into lines and combine horizontally
  const charLines = renderedChars.map(char => char.split('\n'));
  const maxHeight = Math.max(...charLines.map(lines => lines.length));
  
  const combinedLines: string[] = [];
  for (let row = 0; row < maxHeight; row++) {
    let line = '';
    for (let i = 0; i < charLines.length; i++) {
      const charLine = charLines[i][row] || '';
      line += charLine;
      if (i < charLines.length - 1) {
        line += ' '; // Add spacing between characters
      }
    }
    combinedLines.push(line);
  }
  
  return combinedLines.join('\n');
}

/**
 * Render Japanese text as large ASCII art
 */
export function renderJapaneseText(
  text: string,
  palette: string[],
  direction: string = 'vertical'
): string {
  // Try JIS figlet font first
  let asciiArt = renderJapaneseWithJisFont(text);
  
  if (!asciiArt) {
    // Fallback to custom patterns
    const artLines = createJapaneseArt(text);
    asciiArt = artLines.join('\n');
  }
  
  // Apply gradient coloring
  const gradientFn = gradient(palette);
  let coloredArt: string;
  
  switch (direction) {
    case 'horizontal':
      const lines = asciiArt.split('\n');
      const coloredLines = lines.map(line => {
        if (line.trim() === '') {
          return line;
        }
        return gradientFn(line);
      });
      coloredArt = coloredLines.join('\n');
      break;
      
    case 'diagonal':
      const diagonalLines = asciiArt.split('\n');
      const lineCount = diagonalLines.length;
      coloredArt = diagonalLines.map((line, index) => {
        if (line.trim() === '') {
          return line;
        }
        const shiftedPalette = palette.map((_, colorIndex) => {
          const shift = (index / lineCount) * palette.length;
          return palette[Math.floor(colorIndex + shift) % palette.length];
        });
        return gradient(shiftedPalette)(line);
      }).join('\n');
      break;
      
    case 'vertical':
    default:
      coloredArt = gradientFn.multiline(asciiArt);
      break;
  }
  
  return coloredArt;
}

/**
 * Check if text contains Japanese characters
 */
export function containsJapanese(text: string): boolean {
  return Array.from(text).some(char => {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x3040 && code <= 0x309F) ||   // Hiragana
      (code >= 0x30A0 && code <= 0x30FF) ||   // Katakana
      (code >= 0x4E00 && code <= 0x9FFF)      // CJK Unified Ideographs (Kanji)
    );
  });
}