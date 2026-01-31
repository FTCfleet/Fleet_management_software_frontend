import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FaPrint, FaTimes, FaSync } from 'react-icons/fa';

/**
 * Thermal Receipt Preview Component
 * Renders ESC/POS commands as they would appear on 78mm thermal paper
 * Note: This component always uses light theme (white paper) regardless of app theme
 */
const ThermalReceiptPreview = ({ escPosData, onClose, onPrint, onReload }) => {
  /**
   * Parse ESC/POS commands and convert to styled HTML
   */
  const parseESCPOS = (escPosString) => {
    const lines = [];
    let currentLine = '';
    let currentStyle = {
      bold: false,
      doubleHeight: false,
      align: 'left',
    };
    
    let i = 0;
    while (i < escPosString.length) {
      const char = escPosString[i];
      
      // ESC commands
      if (char === '\x1B') {
        const nextChar = escPosString[i + 1];
        
        // ESC @ - Initialize (reset)
        if (nextChar === '@') {
          if (currentLine) {
            lines.push({ text: currentLine, style: { ...currentStyle } });
            currentLine = '';
          }
          currentStyle = { bold: false, doubleHeight: false, align: 'left' };
          i += 2;
          continue;
        }
        
        // ESC ! - Font style
        if (nextChar === '!') {
          const styleCode = escPosString.charCodeAt(i + 2);
          // Don't push current line - keep building it with new style
          // This allows inline style changes without line breaks
          
          // 0x00 = normal, 0x10 = bold, 0x30 = double height + bold
          currentStyle.bold = (styleCode & 0x10) !== 0 || (styleCode & 0x30) !== 0;
          currentStyle.doubleHeight = (styleCode & 0x30) === 0x30;
          i += 3;
          continue;
        }
        
        // ESC E - Emphasized (bold) mode
        if (nextChar === 'E') {
          const emphasisCode = escPosString.charCodeAt(i + 2);
          // Don't push current line - keep building it with new style
          
          // 0x00 = turn off, non-zero = turn on
          currentStyle.bold = emphasisCode !== 0x00;
          i += 3;
          continue;
        }
        
        // ESC a - Alignment
        if (nextChar === 'a') {
          const alignCode = escPosString.charCodeAt(i + 2);
          if (currentLine) {
            lines.push({ text: currentLine, style: { ...currentStyle } });
            currentLine = '';
          }
          
          // 0x00 = left, 0x01 = center, 0x02 = right
          currentStyle.align = alignCode === 0x01 ? 'center' : alignCode === 0x02 ? 'right' : 'left';
          i += 3;
          continue;
        }
        
        // ESC M - Font selection (ignore for preview, just skip)
        if (nextChar === 'M') {
          // Font A, B, or C - we'll use same font for all in preview
          i += 3;
          continue;
        }
        
        i++;
        continue;
      }
      
      // GS commands (cut, etc.)
      if (char === '\x1D') {
        const nextChar = escPosString[i + 1];
        
        // GS ! - Character size
        if (nextChar === '!') {
          const sizeCode = escPosString.charCodeAt(i + 2);
          // Don't push current line - keep building it with new style
          
          // Lower nibble = width, upper nibble = height
          // 0x00 = 1x1 (normal)
          // 0x10 = 2x1 (double width)
          // 0x01 = 1x2 (double height)
          // 0x11 = 2x2 (double both)
          const widthMultiplier = (sizeCode & 0xF0) >> 4;
          const heightMultiplier = sizeCode & 0x0F;
          
          currentStyle.doubleHeight = heightMultiplier > 0;
          // Note: We can't easily show double width in preview, so we'll just use doubleHeight
          
          i += 3;
          continue;
        }
        
        // GS V - Cut paper
        if (nextChar === 'V') {
          if (currentLine) {
            lines.push({ text: currentLine, style: { ...currentStyle } });
            currentLine = '';
          }
          lines.push({ text: '✂️ ─────────────────────────────', style: { align: 'center', bold: false, doubleHeight: false, isCut: true } });
          i += 4; // Skip GS V A 0
          continue;
        }
        
        i++;
        continue;
      }
      
      // Line feed
      if (char === '\n') {
        lines.push({ text: currentLine || ' ', style: { ...currentStyle } });
        currentLine = '';
        i++;
        continue;
      }
      
      // Regular character
      currentLine += char;
      i++;
    }
    
    // Add remaining line
    if (currentLine) {
      lines.push({ text: currentLine, style: { ...currentStyle } });
    }
    
    return lines;
  };

  const lines = parseESCPOS(escPosData);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 2,
        overflow: 'auto',
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          maxWidth: '420px',
          width: '100%',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2,
            backgroundColor: '#ffffff !important',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d47a1 !important' }}>
            Thermal Receipt Preview
          </Typography>
          <Button
            size="small"
            onClick={onClose}
            sx={{ 
              minWidth: 'auto', 
              p: 1,
              color: '#666 !important',
              '&:hover': {
                backgroundColor: '#f5f5f5 !important',
              }
            }}
          >
            <FaTimes />
          </Button>
        </Box>

        {/* Receipt Paper Container */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            p: 3,
            backgroundColor: '#f5f5f5 !important',
          }}
        >
          {/* Receipt Paper - Interpreted ESC/POS commands */}
          <Box
            sx={{
              width: '78mm', // Actual thermal paper width
              maxWidth: '100%',
              backgroundColor: '#ffffff !important',
              padding: '8mm 4mm',
              overflow: 'visible',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            {lines.map((line, index) => (
              <div
                key={index}
                style={{
                  fontFamily: 'monospace',
                  fontSize: line.style.doubleHeight ? '20px' : '12px',
                  fontWeight: line.style.bold ? 'bold' : 'normal',
                  textAlign: line.style.align,
                  lineHeight: line.style.doubleHeight ? '1.3' : '1.2',
                  margin: 0,
                  padding: 0,
                  color: line.style.isCut ? '#999' : '#000',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {line.text}
              </div>
            ))}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            px: 3,
            py: 2,
            backgroundColor: '#ffffff !important',
            borderTop: '1px solid #e0e0e0',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={onReload}
            sx={{
              borderColor: '#1E3A5F !important',
              color: '#1E3A5F !important',
              backgroundColor: '#ffffff !important',
              fontWeight: 600,
              minWidth: 'auto',
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: '#2d5a87 !important',
                backgroundColor: 'rgba(30, 58, 95, 0.04) !important',
              },
            }}
          >
            <FaSync style={{ fontSize: '0.9rem' }} />
          </Button>
          <Button
            variant="contained"
            startIcon={<FaPrint />}
            onClick={onPrint}
            sx={{
              backgroundColor: '#FFB74D !important',
              color: '#0a1628 !important',
              fontWeight: 600,
              px: 3,
              py: 0.75,
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': {
                backgroundColor: '#FFA726 !important',
              },
            }}
          >
            Print with QZ Tray
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            sx={{
              borderColor: '#1E3A5F !important',
              color: '#1E3A5F !important',
              backgroundColor: '#ffffff !important',
              fontWeight: 600,
              minWidth: 'auto',
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: '#2d5a87 !important',
                backgroundColor: 'rgba(30, 58, 95, 0.04) !important',
              },
            }}
          >
            <FaTimes style={{ fontSize: '0.9rem' }} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ThermalReceiptPreview;
