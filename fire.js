class Fire {
    constructor() {
        this.canvas = document.getElementById('fireCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.time = 0;
        this.flames = [];
        this.numFlames = 25;
        this.fireAmount = 0; // Starting at 0
        this.floatingTexts = []; // Array to store floating +1 effects
        this.upgradeVisible = false;
        this.upgradeFading = false;
        this.upgradeAlpha = 0;
        this.upgradePurchased = false; // New flag to track if upgrade was purchased
        
        // Kindler properties
        this.kindlers = 0;
        this.kindlerProgress = 0;
        this.kindlerCost = 100;
        this.lastKindlerTime = Date.now();
        this.kindlerButtonWidth = 200; // Width of clickable area
        this.firePerSecond = 0; // Track fire generation rate
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initFlames();
        this.setupClickHandler();
        this.animate();
    }

    setupClickHandler() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (this.isClickInFireArea(x, y)) {
                this.fireAmount++;
                this.addFloatingText(x, y);
            }
            
            // Check for upgrade click
            if (this.upgradeVisible && !this.upgradeFading && this.isClickInUpgradeArea(x, y)) {
                if (this.fireAmount >= 20) {
                    this.fireAmount -= 20;
                    this.upgradeFading = true;
                    this.kindlers = 1;
                }
            }

            // Check for buy kindler click
            if (this.upgradePurchased && this.isClickInBuyKindlerArea(x, y)) {
                if (this.fireAmount >= this.kindlerCost) {
                    this.fireAmount -= this.kindlerCost;
                    this.kindlers++;
                    this.kindlerCost += 15;
                }
            }
        });
    }

    isClickInFireArea(x, y) {
        // Fire is at the bottom 15% of the screen
        const fireHeight = this.canvas.height * 0.15;
        const fireTop = this.canvas.height - fireHeight;
        
        // Check if click is within fire height and width
        return y > fireTop && y <= this.canvas.height;
    }

    isClickInUpgradeArea(x, y) {
        const upgradeX = this.canvas.width - 320;
        const upgradeY = 60;
        return x >= upgradeX && x <= upgradeX + 250 && 
               y >= upgradeY && y <= upgradeY + 100;
    }

    isClickInBuyKindlerArea(x, y) {
        const margin = 20;
        const rightMargin = 340;
        const boxX = margin;
        const boxY = 60;
        const boxWidth = this.canvas.width - rightMargin - margin;
        const boxHeight = 100;

        // Check if click is anywhere in the kindler box
        return x >= boxX && x <= boxX + boxWidth && 
               y >= boxY && y <= boxY + boxHeight;
    }

    addFloatingText(x, y) {
        this.floatingTexts.push({
            x: x,
            y: y,
            alpha: 1,
            life: 1 // Will decrease over time
        });
    }

    drawFloatingTexts() {
        this.ctx.save();
        
        this.floatingTexts.forEach((text, index) => {
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${text.alpha})`;
            this.ctx.shadowColor = '#ff6600';
            this.ctx.shadowBlur = 10;
            
            this.ctx.fillText('+1', text.x, text.y);
            
            // Update position and life
            text.y -= 2; // Move up
            text.alpha = text.life; // Fade based on life
            text.life -= 0.02; // Decrease life
        });
        
        // Remove dead texts
        this.floatingTexts = this.floatingTexts.filter(text => text.life > 0);
        
        this.ctx.restore();
    }

    drawCounter() {
        this.ctx.save();
        
        // Set up text style
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#FFF';
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 10;
        
        // Position the counter above the fire (slightly lower than before)
        const text = `Fire: ${this.fireAmount}`;
        const textMetrics = this.ctx.measureText(text);
        const x = (this.canvas.width - textMetrics.width) / 2;
        const y = this.canvas.height - (this.canvas.height * 0.15) - 40; // Adjusted from -60 to -40
        
        // Add a subtle glow effect
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Draw text
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }

    drawElementsTitle() {
        this.ctx.save();
        
        // Set up text style
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#FFF';
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Position the text - moved more to the left
        const text = 'Elements';
        const textMetrics = this.ctx.measureText(text);
        const x = this.canvas.width - textMetrics.width - 120; // Increased from 40 to 120
        const y = 40;
        
        // Draw text
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }

    drawUpgrade() {
        // Only show upgrade if we have enough fire and haven't purchased it
        if (!this.upgradeVisible && this.fireAmount >= 20 && !this.upgradePurchased) {
            this.upgradeVisible = true;
        }

        if (!this.upgradeVisible) return;

        this.ctx.save();
        
        // Handle fade animation
        if (this.upgradeFading) {
            this.upgradeAlpha = Math.max(0, this.upgradeAlpha - 0.1);
            if (this.upgradeAlpha <= 0) {
                this.upgradeVisible = false;
                this.upgradeFading = false;
                this.upgradePurchased = true; // Move this here to ensure fade completes
                return;
            }
        } else {
            this.upgradeAlpha = Math.min(1, this.upgradeAlpha + 0.1);
        }
        
        this.ctx.globalAlpha = this.upgradeAlpha;

        // Draw upgrade box
        const x = this.canvas.width - 320;
        const y = 60;
        const width = 250;
        const height = 100;

        // Glowing orange border
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, height);

        // Draw text
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#FFFFFF';
        
        // Title
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Kindler', x + 10, y + 25);
        
        // Description
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Have a kindler give you 1 fire', x + 10, y + 50);
        this.ctx.fillText('per second', x + 10, y + 70);
        
        // Cost
        this.ctx.fillText('Cost: 20', x + 10, y + 90);

        this.ctx.restore();
    }

    updateKindlerProgress() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastKindlerTime;
        const interval = 1000 / this.kindlers; // Interval gets shorter with more kindlers
        
        if (deltaTime >= interval) {
            this.fireAmount += 1; // Add 1 fire at each interval
            this.kindlerProgress = 0;
            this.lastKindlerTime = currentTime;
            this.firePerSecond = this.kindlers; // Update fire per second rate
        } else {
            this.kindlerProgress = deltaTime / interval;
        }
    }

    drawKindlerBox() {
        if (!this.upgradePurchased) return;

        this.ctx.save();

        const margin = 20;
        const rightMargin = 340;
        const x = margin;
        const y = 60;
        const width = this.canvas.width - rightMargin - margin;
        const height = 100;

        // Glowing orange border
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, height);

        // Draw text
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#FFFFFF';
        
        // Kindler count with fire per second
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(
            `${this.kindlers} ${this.kindlers === 1 ? 'kindler' : 'kindlers'} (${this.firePerSecond} fire/sec)`, 
            x + 10, 
            y + 25
        );

        // Progress bar background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x + 10, y + 35, width - 20, 10);

        // Progress bar fill
        this.ctx.fillStyle = '#ff6600';
        this.ctx.fillRect(x + 10, y + 35, (width - 20) * this.kindlerProgress, 10);

        // Buy button with clearer clickable styling
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        const buyText = `Buy kindler (${this.kindlerCost} fire)`;
        this.ctx.fillText(buyText, x + 10, y + 70);

        this.ctx.restore();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update kindler progress
        if (this.upgradePurchased) {
            this.updateKindlerProgress();
        }

        // Draw the base glow first
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);

        let points = [];
        
        this.flames.forEach((flame, i) => {
            const time = this.time * flame.speedMultiplier;
            const sideMovement = Math.sin(time * 0.1 + flame.offset) * (flame.width * 0.3);
            const flick = Math.max(0, Math.sin(time * 0.3 + flame.offset) * flame.baseHeight * 0.2);
            const height = flame.baseHeight + flick;
            
            points.push({
                x: flame.x + sideMovement,
                y: this.canvas.height - height,
                isTop: true
            });
            
            if (i < this.flames.length - 1) {
                const nextFlame = this.flames[i + 1];
                const midX = (flame.x + nextFlame.x) / 2;
                const midHeight = Math.min(height, nextFlame.baseHeight) * 0.65;
                
                points.push({
                    x: midX + sideMovement * 0.5,
                    y: this.canvas.height - midHeight,
                    isTop: false
                });
            }
        });

        // Draw glow effect first
        this.ctx.save();
        this.ctx.shadowColor = '#ff6600';
        this.ctx.shadowBlur = 30;
        this.ctx.globalAlpha = 0.5;

        this.ctx.moveTo(0, this.canvas.height);
        points.forEach((point, i) => {
            if (point.isTop) {
                const prevX = i === 0 ? 0 : points[i - 1].x;
                const prevY = i === 0 ? this.canvas.height : points[i - 1].y;
                
                const cp1x = prevX + (point.x - prevX) * 0.6;
                const cp1y = prevY;
                const cp2x = point.x - (point.x - prevX) * 0.3;
                const cp2y = point.y + (prevY - point.y) * 0.15;
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        
        // Glow gradient
        const glowGradient = this.ctx.createLinearGradient(
            this.canvas.width/2, this.canvas.height,
            this.canvas.width/2, this.canvas.height - this.canvas.height * 0.15
        );
        glowGradient.addColorStop(0, '#ff6600');
        glowGradient.addColorStop(1, '#ffcc00');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();
        this.ctx.restore();

        // Draw main fire
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        points.forEach((point, i) => {
            if (point.isTop) {
                const prevX = i === 0 ? 0 : points[i - 1].x;
                const prevY = i === 0 ? this.canvas.height : points[i - 1].y;
                
                const cp1x = prevX + (point.x - prevX) * 0.6;
                const cp1y = prevY;
                const cp2x = point.x - (point.x - prevX) * 0.3;
                const cp2y = point.y + (prevY - point.y) * 0.15;
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        
        // Main fire gradient
        const gradient = this.ctx.createLinearGradient(
            this.canvas.width/2, this.canvas.height,
            this.canvas.width/2, this.canvas.height - this.canvas.height * 0.15
        );
        gradient.addColorStop(0, '#ff3300');
        gradient.addColorStop(0.4, '#ff6600');
        gradient.addColorStop(0.7, '#ff9900');
        gradient.addColorStop(1, '#ffcc00');

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Draw UI elements last
        this.drawElementsTitle();
        this.drawCounter();
        if (!this.upgradePurchased) {
            this.drawUpgrade();
        } else {
            this.drawKindlerBox();
        }
        this.drawFloatingTexts();

        this.time += 0.1;
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    // Add method to update fire amount
    setFireAmount(amount) {
        this.fireAmount = amount;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initFlames();
    }

    initFlames() {
        this.flames = [];
        const baseWidth = this.canvas.width * 1.2;
        const startX = -this.canvas.width * 0.1;
        
        for (let i = 0; i < this.numFlames; i++) {
            const x = startX + (baseWidth * (i / (this.numFlames - 1)));
            const heightVariation = Math.random() * 0.2 + 0.8;
            
            this.flames.push({
                x,
                baseHeight: this.canvas.height * 0.15 * heightVariation,
                width: baseWidth / this.numFlames * 1.2,
                offset: i * 0.3,
                speedMultiplier: Math.random() * 0.2 + 0.9
            });
        }
    }
}

new Fire();
