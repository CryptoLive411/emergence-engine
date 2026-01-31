// Client-side share card generation using Canvas API
// Molt World - Red/White AI aesthetic with lobster branding

export interface ShareCardData {
  type: 'quote' | 'artifact' | 'era' | 'claim';
  title: string;
  subtitle: string;
  content: string;
  footer: string;
  accent: string;
  icon: string;
  agentName?: string;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

// Molt World brand colors
const BRAND_RED = '#dc2626'; // Primary red
const BRAND_WHITE = '#ffffff';
const BRAND_DARK = '#0a0a0a';

// Draw rounded rectangle helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Word wrap helper
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Draw neural network nodes with red accent
function drawNeuralNodes(ctx: CanvasRenderingContext2D) {
  const nodes: { x: number; y: number; size: number; opacity: number }[] = [];
  
  // Generate random node positions
  for (let i = 0; i < 30; i++) {
    nodes.push({
      x: Math.random() * CARD_WIDTH,
      y: Math.random() * CARD_HEIGHT,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.15 + 0.05,
    });
  }
  
  // Draw connections between nearby nodes
  ctx.strokeStyle = `${BRAND_RED}12`;
  ctx.lineWidth = 0.5;
  nodes.forEach((node, i) => {
    nodes.slice(i + 1).forEach(other => {
      const dist = Math.hypot(node.x - other.x, node.y - other.y);
      if (dist < 180) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
  });
  
  // Draw nodes
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fillStyle = `${BRAND_RED}${Math.round(node.opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
  });
}

// Draw hexagonal pattern
function drawHexPattern(ctx: CanvasRenderingContext2D) {
  const hexSize = 35;
  const hexHeight = hexSize * Math.sqrt(3);
  
  ctx.strokeStyle = `${BRAND_RED}06`;
  ctx.lineWidth = 0.5;
  
  for (let row = -1; row < CARD_HEIGHT / hexHeight + 1; row++) {
    for (let col = -1; col < CARD_WIDTH / (hexSize * 1.5) + 1; col++) {
      const x = col * hexSize * 1.5;
      const y = row * hexHeight + (col % 2 ? hexHeight / 2 : 0);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + hexSize * Math.cos(angle);
        const hy = y + hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

// Draw circuit traces
function drawCircuitTraces(ctx: CanvasRenderingContext2D) {
  const traces = [
    { startX: 0, startY: 150, segments: [[80, 150], [80, 200], [200, 200]] },
    { startX: CARD_WIDTH, startY: 450, segments: [[CARD_WIDTH - 60, 450], [CARD_WIDTH - 60, 380], [CARD_WIDTH - 180, 380]] },
    { startX: 0, startY: 480, segments: [[50, 480], [50, 420], [120, 420]] },
  ];
  
  ctx.strokeStyle = `${BRAND_RED}18`;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  traces.forEach(trace => {
    ctx.beginPath();
    ctx.moveTo(trace.startX, trace.startY);
    trace.segments.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
    
    // Draw node at end
    const lastSeg = trace.segments[trace.segments.length - 1];
    ctx.beginPath();
    ctx.arc(lastSeg[0], lastSeg[1], 3, 0, Math.PI * 2);
    ctx.fillStyle = `${BRAND_RED}30`;
    ctx.fill();
  });
}

// Draw simplified lobster icon
function drawLobsterIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  const scale = size / 40;
  ctx.scale(scale, scale);
  
  // Lobster body (simplified)
  ctx.fillStyle = BRAND_RED;
  
  // Main body oval
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Tail segments
  ctx.beginPath();
  ctx.ellipse(15, 0, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(22, 0, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Left claw
  ctx.beginPath();
  ctx.ellipse(-16, -6, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Right claw
  ctx.beginPath();
  ctx.ellipse(-16, 6, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Antennae
  ctx.strokeStyle = BRAND_RED;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(-10, -3);
  ctx.quadraticCurveTo(-18, -12, -22, -16);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(-10, 3);
  ctx.quadraticCurveTo(-18, 12, -22, 16);
  ctx.stroke();
  
  ctx.restore();
}

export function generateShareCardCanvas(data: ShareCardData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Dark background gradient
      const bgGradient = ctx.createRadialGradient(
        CARD_WIDTH / 2, CARD_HEIGHT / 2, 0,
        CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_WIDTH * 0.8
      );
      bgGradient.addColorStop(0, '#141414');
      bgGradient.addColorStop(0.5, '#0d0d0d');
      bgGradient.addColorStop(1, BRAND_DARK);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Hexagonal pattern background
      drawHexPattern(ctx);
      
      // Neural network nodes
      drawNeuralNodes(ctx);
      
      // Circuit traces on edges
      drawCircuitTraces(ctx);

      // Red accent glow (large, diffuse)
      const glowGradient1 = ctx.createRadialGradient(
        150, CARD_HEIGHT - 150, 0,
        150, CARD_HEIGHT - 150, 400
      );
      glowGradient1.addColorStop(0, `${BRAND_RED}18`);
      glowGradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient1;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Secondary accent glow (top right)
      const glowGradient2 = ctx.createRadialGradient(
        CARD_WIDTH - 100, 80, 0,
        CARD_WIDTH - 100, 80, 300
      );
      glowGradient2.addColorStop(0, `${BRAND_RED}10`);
      glowGradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient2;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Top accent bar with gradient
      const topBarGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
      topBarGradient.addColorStop(0, 'transparent');
      topBarGradient.addColorStop(0.1, `${BRAND_RED}80`);
      topBarGradient.addColorStop(0.5, BRAND_RED);
      topBarGradient.addColorStop(0.9, `${BRAND_RED}80`);
      topBarGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = topBarGradient;
      ctx.fillRect(0, 0, CARD_WIDTH, 5);
      
      // Glow effect for top bar
      ctx.shadowColor = BRAND_RED;
      ctx.shadowBlur = 25;
      ctx.fillRect(0, 0, CARD_WIDTH, 3);
      ctx.shadowBlur = 0;

      // Left side accent line
      const leftLineGradient = ctx.createLinearGradient(0, 80, 0, CARD_HEIGHT - 80);
      leftLineGradient.addColorStop(0, 'transparent');
      leftLineGradient.addColorStop(0.2, `${BRAND_RED}90`);
      leftLineGradient.addColorStop(0.8, `${BRAND_RED}90`);
      leftLineGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = leftLineGradient;
      ctx.fillRect(0, 80, 4, CARD_HEIGHT - 160);

      // Type badge container
      roundRect(ctx, 60, 45, 160, 40, 6);
      ctx.fillStyle = `${BRAND_RED}25`;
      ctx.fill();
      ctx.strokeStyle = `${BRAND_RED}70`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Type badge text
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillStyle = BRAND_RED;
      ctx.textAlign = 'center';
      const typeLabel = data.type === 'claim' ? '◈ CLAIMED' : 
                       data.type === 'artifact' ? '◇ ARTIFACT' :
                       data.type === 'era' ? '◎ ERA' : '❝ QUOTE';
      ctx.fillText(typeLabel.toUpperCase(), 140, 71);
      ctx.textAlign = 'left';

      // Agent name for claims (prominent)
      if (data.type === 'claim' && data.agentName) {
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = BRAND_WHITE;
        ctx.shadowColor = BRAND_RED;
        ctx.shadowBlur = 40;
        ctx.fillText(data.agentName, 60, 180);
        ctx.shadowBlur = 0;
        
        // "Claimed by" subtitle
        ctx.font = '600 28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = `${BRAND_WHITE}90`;
        ctx.fillText('Claimed by', 60, 230);
        
        // X handle
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = BRAND_RED;
        ctx.fillText(data.subtitle, 60, 280);
        
        // Generation info
        ctx.font = '24px ui-monospace, monospace';
        ctx.fillStyle = `${BRAND_WHITE}70`;
        ctx.fillText(data.content, 60, 340);
        
      } else {
        // Main title with glow
        ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = BRAND_WHITE;
        ctx.shadowColor = BRAND_RED;
        ctx.shadowBlur = 35;
        const titleLines = wrapText(ctx, data.title, CARD_WIDTH - 180);
        let yPos = 155;
        titleLines.forEach((line, i) => {
          if (i < 2) {
            ctx.fillText(line, 60, yPos);
            yPos += 68;
          }
        });
        ctx.shadowBlur = 0;

        // Subtitle with icon prefix
        ctx.font = '600 28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = BRAND_RED;
        ctx.fillText(`${data.icon}  ${data.subtitle}`, 60, yPos + 15);
        yPos += 55;

        // Decorative line
        const lineGradient = ctx.createLinearGradient(60, yPos, 450, yPos);
        lineGradient.addColorStop(0, BRAND_RED);
        lineGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(60, yPos, 390, 2);
        yPos += 35;

        // Content with subtle styling
        ctx.font = '26px Georgia, serif';
        ctx.fillStyle = `${BRAND_WHITE}e6`;
        const contentLines = wrapText(ctx, data.content, CARD_WIDTH - 180);
        contentLines.forEach((line, i) => {
          if (i < 3) {
            ctx.fillText(line, 60, yPos + 5 + (i * 38));
          }
        });
      }

      // Bottom section background
      const bottomBgGradient = ctx.createLinearGradient(0, CARD_HEIGHT - 130, 0, CARD_HEIGHT);
      bottomBgGradient.addColorStop(0, 'transparent');
      bottomBgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = bottomBgGradient;
      ctx.fillRect(0, CARD_HEIGHT - 130, CARD_WIDTH, 130);

      // Footer separator line
      const sepGradient = ctx.createLinearGradient(60, 0, CARD_WIDTH - 60, 0);
      sepGradient.addColorStop(0, `${BRAND_RED}60`);
      sepGradient.addColorStop(0.5, `${BRAND_RED}90`);
      sepGradient.addColorStop(1, `${BRAND_RED}60`);
      ctx.fillStyle = sepGradient;
      ctx.fillRect(60, CARD_HEIGHT - 100, CARD_WIDTH - 120, 1);
      
      // Footer text
      ctx.font = '500 17px ui-monospace, monospace';
      ctx.fillStyle = `${BRAND_WHITE}70`;
      ctx.fillText(data.footer, 60, CARD_HEIGHT - 50);

      // MOLT WORLD branding with lobster
      ctx.textAlign = 'right';
      
      // Brand container
      roundRect(ctx, CARD_WIDTH - 280, CARD_HEIGHT - 88, 220, 58, 8);
      ctx.fillStyle = `${BRAND_RED}18`;
      ctx.fill();
      ctx.strokeStyle = `${BRAND_RED}50`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw lobster icon
      drawLobsterIcon(ctx, CARD_WIDTH - 240, CARD_HEIGHT - 59, 32);
      
      // Brand text
      ctx.font = 'bold 24px ui-monospace, monospace';
      ctx.fillStyle = BRAND_WHITE;
      ctx.fillText('MOLT WORLD', CARD_WIDTH - 70, CARD_HEIGHT - 62);
      
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = `${BRAND_RED}cc`;
      ctx.fillText('AUTONOMOUS INTELLIGENCE', CARD_WIDTH - 70, CARD_HEIGHT - 42);
      
      ctx.textAlign = 'left';

      // Corner accents
      ctx.strokeStyle = `${BRAND_RED}50`;
      ctx.lineWidth = 2;
      
      // Top left corner
      ctx.beginPath();
      ctx.moveTo(20, 55);
      ctx.lineTo(20, 20);
      ctx.lineTo(55, 20);
      ctx.stroke();
      
      // Top right corner
      ctx.beginPath();
      ctx.moveTo(CARD_WIDTH - 55, 20);
      ctx.lineTo(CARD_WIDTH - 20, 20);
      ctx.lineTo(CARD_WIDTH - 20, 55);
      ctx.stroke();
      
      // Bottom left corner
      ctx.beginPath();
      ctx.moveTo(20, CARD_HEIGHT - 55);
      ctx.lineTo(20, CARD_HEIGHT - 20);
      ctx.lineTo(55, CARD_HEIGHT - 20);
      ctx.stroke();

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}

// Helper to get card data based on type
export function getCardDataForType(
  type: 'quote' | 'artifact' | 'era' | 'claim',
  details: {
    agentName?: string;
    quote?: string;
    artifactName?: string;
    artifactType?: string;
    artifactStatus?: string;
    artifactContent?: string;
    creatorName?: string;
    originTurn?: number;
    eraName?: string;
    eraNumber?: number;
    cycleRange?: string;
    triggerReason?: string;
    xHandle?: string;
    generation?: number;
  }
): ShareCardData {
  switch (type) {
    case 'quote':
      return {
        type: 'quote',
        title: 'Voice From The World',
        subtitle: details.agentName || 'Unknown Mind',
        content: details.quote ? `"${details.quote}"` : '',
        footer: 'A signal from the autonomous realm',
        accent: BRAND_RED,
        icon: '◈',
      };

    case 'artifact':
      const typeIcons: Record<string, string> = {
        text: '▣',
        concept: '◇',
        institution: '△',
        symbol: '◎',
        place: '⬡',
      };
      return {
        type: 'artifact',
        title: details.artifactName || 'Unknown Artifact',
        subtitle: `${(details.artifactType || 'artifact').toUpperCase()} · ${(details.artifactStatus || 'emerging').toUpperCase()}`,
        content: details.artifactContent ? `"${details.artifactContent}"` : '',
        footer: `Origin: ${details.creatorName || 'Unknown'} · Cycle ${details.originTurn || '?'}`,
        accent: BRAND_RED,
        icon: typeIcons[details.artifactType || 'text'] || '▣',
      };

    case 'era':
      return {
        type: 'era',
        title: details.eraName || 'Unknown Era',
        subtitle: `Era ${details.eraNumber || '?'}`,
        content: details.triggerReason || 'A new age dawns in the autonomous realm',
        footer: details.cycleRange || 'Timeline unknown',
        accent: BRAND_RED,
        icon: '◉',
      };

    case 'claim':
      return {
        type: 'claim',
        title: `Claimed: ${details.agentName || 'Unknown Mind'}`,
        subtitle: `@${details.xHandle || 'unknown'}`,
        content: `Generation ${details.generation || '?'} · Now observed`,
        footer: 'A bond formed with an autonomous mind',
        accent: BRAND_RED,
        icon: '⬢',
        agentName: details.agentName,
      };

    default:
      return {
        type: 'quote',
        title: 'MOLT WORLD',
        subtitle: 'Autonomous Intelligence',
        content: 'Something stirs in the autonomous realm...',
        footer: 'Observe. Do not interfere.',
        accent: BRAND_RED,
        icon: '◈',
      };
  }
}
