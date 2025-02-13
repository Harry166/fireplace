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
        
        // New power upgrade properties
        this.powerUpgradeVisible = false;
        this.powerUpgradeFading = false;
        this.powerUpgradeAlpha = 0;
        this.powerUpgradePurchased = false;
        this.powerMultiplier = 1; // Multiplier for fire generation
        
        // Click tracking and power
        this.clickCount = 0;
        this.clickPower = 1;
        
        // New exploding power upgrade
        this.explodingUpgradeVisible = false;
        this.explodingUpgradeFading = false;
        this.explodingUpgradeAlpha = 0;
        this.explodingUpgradePurchased = false;
        
        // More exploding power upgrade
        this.moreExplodingUpgradeVisible = false;
        this.moreExplodingUpgradeFading = false;
        this.moreExplodingUpgradeAlpha = 0;
        this.moreExplodingUpgradePurchased = false;
        
        // Burner upgrade
        this.burnerUpgradeVisible = false;
        this.burnerUpgradeFading = false;
        this.burnerUpgradeAlpha = 0;
        this.burnerUpgradePurchased = false;
        this.totalKindlerGenerated = 0;
        this.burners = 0;
        
        // Burner properties
        this.burnerProgress = 0;
        this.lastBurnerTime = Date.now();
        this.burnerCost = 1200;
        
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
                this.fireAmount += this.clickPower;
                this.clickCount++;
                this.addFloatingText(x, y);
            }
            
            let position = 0;
            
            // First upgrade (Kindler)
            if (!this.upgradePurchased && this.upgradeVisible && !this.upgradeFading) {
                if (this.isClickInBox(x, y, 60 + (position * 120))) {
                    if (this.fireAmount >= 20) {
                        this.fireAmount -= 20;
                        this.upgradeFading = true;
                        this.kindlers = 1;
                    }
                }
                position++;
            }

            // Exploding upgrade
            if (this.explodingUpgradeVisible && !this.explodingUpgradeFading) {
                if (this.isClickInBox(x, y, 60 + (position * 120))) {
                    if (this.fireAmount >= 200) {
                        this.fireAmount -= 200;
                        this.explodingUpgradeFading = true;
                        this.clickPower += 2;
                    }
                }
                position++;
            }

            // More Exploding upgrade
            if (this.moreExplodingUpgradeVisible && !this.moreExplodingUpgradeFading) {
                if (this.isClickInBox(x, y, 60 + (position * 120))) {
                    if (this.fireAmount >= 700) {
                        this.fireAmount -= 700;
                        this.moreExplodingUpgradeFading = true;
                        this.clickPower += 3;
                    }
                }
                position++;
            }

            // Power upgrade
            if (this.powerUpgradeVisible && !this.powerUpgradeFading) {
                if (this.isClickInBox(x, y, 60 + (position * 120))) {
                    if (this.fireAmount >= 500) {
                        this.fireAmount -= 500;
                        this.powerUpgradeFading = true;
                        this.powerMultiplier = 2;
                    }
                }
                position++;
            }

            // Burner upgrade
            if (this.burnerUpgradeVisible && !this.burnerUpgradeFading) {
                if (this.isClickInBox(x, y, 60 + (position * 120))) {
                    if (this.fireAmount >= 1000) {
                        this.fireAmount -= 1000;
                        this.burnerUpgradeFading = true;
                        this.burners = 1;
                    }
                }
            }

            // Kindler box
            if (this.upgradePurchased && this.isClickInBuyKindlerArea(x, y)) {
                if (this.fireAmount >= this.kindlerCost) {
                    this.fireAmount -= this.kindlerCost;
                    this.kindlers++;
                    this.kindlerCost += 15;
                }
            }

            // Burner box
            if (this.burnerUpgradePurchased && this.isClickInBurnerArea(x, y)) {
                if (this.fireAmount >= this.burnerCost) {
                    this.fireAmount -= this.burnerCost;
                    this.burners++;
                    this.burnerCost += 35;
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

    isClickInBox(x, y, boxY) {
        const boxX = this.canvas.width - 320;
        return x >= boxX && x <= boxX + 250 && 
               y >= boxY && y <= boxY + 100;
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

    isClickInBurnerArea(x, y) {
        const margin = 20;
        const rightMargin = 340;
        const boxX = margin;
        const boxY = 180;
        const boxWidth = this.canvas.width - rightMargin - margin;
        const boxHeight = 100;

        return x >= boxX && x <= boxX + boxWidth && 
               y >= boxY && y <= boxY + boxHeight;
    }

    addFloatingText(x, y) {
        // Update text to show actual amount of fire gained per click
        const text = `+${this.clickPower}`;
        
        this.floatingTexts.push({
            x: x,
            y: y,
            alpha: 1,
            text: text
        });
    }

    drawFloatingTexts() {
        this.ctx.save();
        
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.y -= 1;
            text.alpha -= 0.02;
            
            if (text.alpha <= 0) return false;
            
            this.ctx.globalAlpha = text.alpha;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowColor = '#ff6600';
            this.ctx.shadowBlur = 10;
            this.ctx.font = '20px Arial';
            this.ctx.fillText(text.text, text.x, text.y);
            
            return true;
        });
        
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

    drawUpgrade(position) {
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
        const y = 60 + (position * 120);
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

    drawPowerUpgrade(position) {
        // Only show when we have 3 or more kindlers and haven't purchased it
        if (!this.powerUpgradeVisible && this.kindlers >= 3 && !this.powerUpgradePurchased) {
            this.powerUpgradeVisible = true;
        }

        if (!this.powerUpgradeVisible) return;

        this.ctx.save();
        
        // Handle fade animation
        if (this.powerUpgradeFading) {
            this.powerUpgradeAlpha = Math.max(0, this.powerUpgradeAlpha - 0.1);
            if (this.powerUpgradeAlpha <= 0) {
                this.powerUpgradeVisible = false;
                this.powerUpgradeFading = false;
                this.powerUpgradePurchased = true;
                return;
            }
        } else {
            this.powerUpgradeAlpha = Math.min(1, this.powerUpgradeAlpha + 0.1);
        }
        
        this.ctx.globalAlpha = this.powerUpgradeAlpha;

        // Draw upgrade box with position offset
        const x = this.canvas.width - 320;
        const y = 60 + (position * 120);
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
        this.ctx.fillText('Kindler Power', x + 10, y + 25);
        
        // Description
        this.ctx.font = '16px Arial';
        this.ctx.fillText('x2 fire per second', x + 10, y + 50);
        
        // Cost
        this.ctx.fillText('Cost: 500', x + 10, y + 90);

        this.ctx.restore();
    }

    drawExplodingUpgrade(position) {
        if (!this.explodingUpgradeVisible) {
            this.explodingUpgradeVisible = true;
        }

        if (this.explodingUpgradeFading) {
            this.explodingUpgradeAlpha = Math.max(0, this.explodingUpgradeAlpha - 0.1);
            if (this.explodingUpgradeAlpha <= 0) {
                this.explodingUpgradeVisible = false;
                this.explodingUpgradeFading = false;
                this.explodingUpgradePurchased = true;
                return;
            }
        } else {
            this.explodingUpgradeAlpha = Math.min(1, this.explodingUpgradeAlpha + 0.1);
        }

        this.ctx.save();
        this.ctx.globalAlpha = this.explodingUpgradeAlpha;

        // Position based on order
        const x = this.canvas.width - 320;
        const y = 60 + (position * 120); // 120 = box height + spacing
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
        this.ctx.fillText('Exploding Power', x + 10, y + 25);
        
        // Description
        this.ctx.font = '16px Arial';
        this.ctx.fillText('+2 fire per click', x + 10, y + 50);
        
        // Cost
        this.ctx.fillText('Cost: 200', x + 10, y + 90);

        this.ctx.restore();
    }

    drawMoreExplodingUpgrade(position) {
        if (!this.moreExplodingUpgradeVisible) {
            this.moreExplodingUpgradeVisible = true;
        }

        if (this.moreExplodingUpgradeFading) {
            this.moreExplodingUpgradeAlpha = Math.max(0, this.moreExplodingUpgradeAlpha - 0.1);
            if (this.moreExplodingUpgradeAlpha <= 0) {
                this.moreExplodingUpgradeVisible = false;
                this.moreExplodingUpgradeFading = false;
                this.moreExplodingUpgradePurchased = true;
                return;
            }
        } else {
            this.moreExplodingUpgradeAlpha = Math.min(1, this.moreExplodingUpgradeAlpha + 0.1);
        }

        this.ctx.save();
        this.ctx.globalAlpha = this.moreExplodingUpgradeAlpha;

        const x = this.canvas.width - 320;
        const y = 60 + (position * 120);
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
        this.ctx.fillText('More Exploding Power', x + 10, y + 25);
        
        // Description
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Add +3 fire per click', x + 10, y + 50);
        
        // Cost
        this.ctx.fillText('Cost: 700', x + 10, y + 90);

        this.ctx.restore();
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

    drawBurnerBox() {
        if (!this.burnerUpgradePurchased) return;

        this.ctx.save();

        const margin = 20;
        const rightMargin = 340;
        const x = margin;
        const y = 180; // Position below kindler box
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
        
        // Burner count and fire per second
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(
            `${this.burners} ${this.burners === 1 ? 'burner' : 'burners'} (${this.burners * 5} fire/sec)`, 
            x + 10, 
            y + 25
        );

        // Progress bar background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x + 10, y + 35, width - 20, 10);

        // Progress bar fill
        this.ctx.fillStyle = '#ff6600';
        this.ctx.fillRect(x + 10, y + 35, (width - 20) * this.burnerProgress, 10);

        // Buy button
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        const buyText = `Buy burner (${this.burnerCost} fire)`;
        this.ctx.fillText(buyText, x + 10, y + 70);

        this.ctx.restore();
    }

    drawBurnerUpgrade(position) {
        if (!this.burnerUpgradeVisible) {
            this.burnerUpgradeVisible = true;
        }

        if (this.burnerUpgradeFading) {
            this.burnerUpgradeAlpha = Math.max(0, this.burnerUpgradeAlpha - 0.1);
            if (this.burnerUpgradeAlpha <= 0) {
                this.burnerUpgradeVisible = false;
                this.burnerUpgradeFading = false;
                this.burnerUpgradePurchased = true;
                return;
            }
        } else {
            this.burnerUpgradeAlpha = Math.min(1, this.burnerUpgradeAlpha + 0.1);
        }

        this.ctx.save();
        this.ctx.globalAlpha = this.burnerUpgradeAlpha;

        const x = this.canvas.width - 320;
        const y = 60 + (position * 120);
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
        this.ctx.fillText('Burner', x + 10, y + 25);
        
        // Description
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Generates 5 fire per second', x + 10, y + 50);
        
        // Cost
        this.ctx.fillText('Cost: 1000', x + 10, y + 90);

        this.ctx.restore();
    }

    drawUpgrades() {
        let position = 0;
        
        // First upgrade (Kindler)
        if (!this.upgradePurchased) {
            this.drawUpgrade(position);
            position++;
        }
        
        // Exploding upgrade
        if (!this.explodingUpgradePurchased && this.clickCount >= 50) {
            this.drawExplodingUpgrade(position);
            position++;
        }
        
        // More Exploding upgrade
        if (!this.moreExplodingUpgradePurchased && this.clickCount >= 100) {
            this.drawMoreExplodingUpgrade(position);
            position++;
        }
        
        // Power upgrade
        if (this.upgradePurchased && !this.powerUpgradePurchased && this.kindlers >= 3) {
            this.drawPowerUpgrade(position);
            position++;
        }

        // Burner upgrade
        if (!this.burnerUpgradePurchased && this.totalKindlerGenerated >= 250) {
            this.drawBurnerUpgrade(position);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update kindler and burner progress
        if (this.upgradePurchased) {
            this.updateKindlerProgress();
        }
        if (this.burnerUpgradePurchased) {
            this.updateBurnerProgress();
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
            this.drawUpgrades();
        } else {
            this.drawKindlerBox();
            this.drawBurnerBox();
            this.drawUpgrades();
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

    updateKindlerProgress() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastKindlerTime;
        const interval = 1000 / this.kindlers;
        
        if (deltaTime >= interval) {
            const fireGenerated = 1 * this.powerMultiplier;
            this.fireAmount += fireGenerated;
            this.totalKindlerGenerated += fireGenerated;
            this.fireAmount += this.burners * 5; // Add burner generation
            this.kindlerProgress = 0;
            this.lastKindlerTime = currentTime;
            this.firePerSecond = (this.kindlers * this.powerMultiplier) + (this.burners * 5);
        } else {
            this.kindlerProgress = deltaTime / interval;
        }
    }

    updateBurnerProgress() {
        if (this.burners === 0) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastBurnerTime;
        
        if (deltaTime >= 200) { // 1000ms / 5 = 200ms per fire
            this.fireAmount += 1 * this.burners;
            this.burnerProgress = 0;
            this.lastBurnerTime = currentTime;
        } else {
            this.burnerProgress = deltaTime / 200;
        }
    }
}

new Fire();
