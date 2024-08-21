const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let angle = 0; // Angle of attack in radians
let velocity = 100; // Air velocity in pixels per second
let plateLength = 100; // Length of the flat plate
const plateWidth = 10; // Width of the flat plate

// Air density (not to scale, arbitrary units)
const airDensity = 1.225;

function calculateLiftCoefficient(angleOfAttack) {
    // Approximation for thin airfoil / flat plate
    angleOfAttack = angleOfAttack % (Math.PI);
    
    if ((0 < angleOfAttack && angleOfAttack < Math.PI / 8) || ((7 * Math.PI) / 8 < angleOfAttack && angleOfAttack < Math.PI)) {
        return Math.sin(6 * angleOfAttack);
    } else if (Math.PI / 8 < angleOfAttack && angleOfAttack < (7 * Math.PI) / 8) {
        return Math.sin(2 * angleOfAttack);
    }
}

function calculateDragCoefficient(angleOfAttack) {
    // Approximation for thin airfoil / flat plate
    const cMin = 0.01, cMax = 2.0;
    return cMin + Math.sin(angleOfAttack) ** 2 * (cMax - cMin);
}

function calculateLift(angle, velocity) {
    const liftCoefficient = calculateLiftCoefficient(angle);
    const area = plateLength * plateWidth;
    return 0.5 * airDensity * velocity ** 2 * area * liftCoefficient;
}

function calculateDrag(angle, velocity) {
    const dragCoefficient = calculateDragCoefficient(angle);
    const area = plateLength * plateWidth;
    return 0.5 * airDensity * velocity ** 2 * area * dragCoefficient;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate forces
    const lift = calculateLift(angle, velocity);
    const drag = calculateDrag(angle, velocity);

    // Draw the plate
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.fillStyle = "blue";
    ctx.fillRect(-plateLength / 2, -plateWidth / 2, plateLength, plateWidth);
    ctx.restore();

    // Draw lift force vector
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - lift / 20000);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw drag force vector
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - drag / 20000, centerY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Update angle for animation
    angle += 0.005;
    angle = angle % (2 * Math.PI);

    requestAnimationFrame(draw);
}

draw();
