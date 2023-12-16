const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const OlympicBlue   = "rgb(0, 129, 200)";
const OlympicYellow = "rgb(252, 177, 49)";
const OlympicBlack  = "rgb(0, 0, 0)";
const OlympicGreen  = "rgb(0, 166, 81)";
const OlympicRed    = "rgb(238, 51, 78)";

const AxonGray      = "rgb(128, 128, 128)";
const AxonLineWidth = 6;

const OlympicRingRadius = 40;
const OlympicRingLineWidth = 10;

const OlympicRingPositions = [
    [110, 105],
    [200, 105],
    [290, 105],
    [155, 190],
    [245, 190]
];

draw();

function draw() {
    
    // Head
    roundedRect(50, 50, 300, 300, OlympicRingRadius);

    // Axons
    drawLine(OlympicRingPositions[0][0], OlympicRingPositions[0][1], 
             OlympicRingPositions[3][0], OlympicRingPositions[3][1], AxonLineWidth, AxonGray);
    drawLine(OlympicRingPositions[0][0], OlympicRingPositions[0][1], 
             OlympicRingPositions[4][0], OlympicRingPositions[4][1], AxonLineWidth, AxonGray);
    
    drawLine(OlympicRingPositions[1][0], OlympicRingPositions[1][1], 
             OlympicRingPositions[3][0], OlympicRingPositions[3][1], AxonLineWidth, AxonGray);
    drawLine(OlympicRingPositions[1][0], OlympicRingPositions[1][1], 
             OlympicRingPositions[4][0], OlympicRingPositions[4][1], AxonLineWidth, AxonGray);
    
    drawLine(OlympicRingPositions[2][0], OlympicRingPositions[2][1], 
             OlympicRingPositions[3][0], OlympicRingPositions[3][1], AxonLineWidth, AxonGray);
    drawLine(OlympicRingPositions[2][0], OlympicRingPositions[2][1], 
             OlympicRingPositions[4][0], OlympicRingPositions[4][1], AxonLineWidth, AxonGray);
    
    // Olympic rings
    drawRing(OlympicRingPositions[0][0], OlympicRingPositions[0][1], OlympicRingRadius, OlympicRingLineWidth, OlympicBlue);
    drawRing(OlympicRingPositions[1][0], OlympicRingPositions[1][1], OlympicRingRadius, OlympicRingLineWidth, OlympicBlack);
    drawRing(OlympicRingPositions[2][0], OlympicRingPositions[2][1], OlympicRingRadius, OlympicRingLineWidth, OlympicRed);
    drawRing(OlympicRingPositions[3][0], OlympicRingPositions[3][1], OlympicRingRadius, OlympicRingLineWidth, OlympicYellow);
    drawRing(OlympicRingPositions[4][0], OlympicRingPositions[4][1], OlympicRingRadius, OlympicRingLineWidth, OlympicGreen);
    
    // Eyes
    rect(OlympicRingPositions[3][0] - OlympicRingRadius*0.25, OlympicRingPositions[3][1] - OlympicRingRadius*0.25, 20, 20, 8, "black");
    rect(OlympicRingPositions[4][0] - OlympicRingRadius*0.25, OlympicRingPositions[4][1] - OlympicRingRadius*0.25, 20, 20, 8, "black");
    
    // Mouth
    roundedRect(100, 260, 200, 40, 10);
    roundedRect(150, 260, 50, 40, 0);
    roundedRect(200, 260, 50, 40, 0);
}

function drawLine(x1, y1, x2, y2, lineWidth, color) {
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}
   

function drawRing(posx, posy, radius, lineWidth, color) {
    
    ctx.beginPath();
    ctx.arc(posx, posy, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    //ctx.lineWidth = lineWidth;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(posx, posy, radius-lineWidth, 0, Math.PI * 2, false);
    ctx.fillStyle = "white";
    //ctx.lineWidth = lineWidth;
    ctx.fill();
}

function rect(x, y, width, height, lineWidth, color) {
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();
    }
   
function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.stroke();
}