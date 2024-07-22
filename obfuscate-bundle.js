const fs = require('fs');
const { get } = require('http');
const path = require('path');

// Array to store generated strings
const generatedStrings = [];

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  do {
    result = '';
    // Ensure the first character is a letter
    result += chars.charAt(Math.floor(Math.random() * 52)); // Only letters
    for (let i = 1; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (generatedStrings.includes(result));

  generatedStrings.push(result);
  return result;
}

function replaceWords(content, words) {
  words.forEach(word => {
    const randomString = generateRandomString(8);
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    content = content.replace(regex, randomString);
  });
  return content;
}

function obfuscateBundle() {
  const bundlePath = path.join(__dirname, 'dist-webpack', 'bundle.js');
  const wordsToReplace = [

    // Reserved keywords that can't be replaced
    // 'length', 'abs', 'width', 'height', 'add', 'div', 'clear', 'key', 'object',
    // 'color', 'type', 'row', 'settings'
    //'fullscreen', 'landscape', 'type', 'Rope', 'Knobby', 
    //'Off', 'Down', 'Sensor',
    //'acceleration', 
    //'accelerationIncludingGravity',
    //'interval', 
    // 'y', 'x', 
    //'canvas', 'context', 
    // 'pointerId', 
    
    // Vector2
    'setThis', 'addThis', 'subThis', 'mulThis', 'divThis', 'normalizeThis', 'absThis', 'perpThis', 
    'rotateThis', 'sub', 'mul', 'rotate', 'normalize', 'component', 'dot', 'lengthSquared', 
    'distance', 'distanceSquared', 'perp', 'perpDot', 'project', 'randomizeCircle', 'randomizeSquare', 
    'rotate', 'rotateRight', 'rotateLeft', 'unit', 'unitVectorFromAngle',

    // Toolbox
    'map', 'randomAsciiLetter',

    // Physics engine

    // Base/AngularState
    'angle', 'angleVector', 'angularVelocity', 'angularVelocityVector', 'angularImpulse',
    'inertia', 'inverseInertia', 
    'addAngle', 'addAngleVector', 'addAngularImpulse', 'addAngularVelocity',
    'applyImpulseAtPoint', 'getLinearVelocityAtPoint', 'computeAngle', 'computeAngleVector', 
    'computeAngularVelocityVector', 'computeData', 'computeInverseInertia', 'computeNewState',

    // Base/LineSegment
    'pointA', 'pointB', 'radius', 'objectId',
    
    // Base/LinearLink
    'lengthVector', 'angleVector', 'angularVelocity', 'angularImpulse', 'inertia', 'inverseInertia',
    'mass', 'reducedMass', 'addImpulse', 'addVelocity', 'addPosition', 'computeAngleVector',
    'computeAngularImpulse', 'computeAngularVelocity', 'computeData', 'computeInertia', 
    'computeInverseInertia', 'computeLength', 'computeLengthVector', 'computeMass', 
    'computeReducedMass', 'isValid', 'impulse', 'velocity', 'k',

    // Base/LinearState
    'position', 'velocity', 'impulse', 'mass', 'inverseMass', 'computeInverseMass',
    'addImpulse', 'addVelocity', 'addPosition', 'computeNewState', 'isValid',

    // Base/Point
    'objectId', 'position',

    // Collision/Intersection
    'closestPointOnLineSegment', 'isPointInsidePolygon', 'findNearestEdge',
    'areLineSegmentsIntersecting', 'areLinesIntersecting', 'shortestDistanceBetweenLines',

    // Collision/ParticleParticleCollision
    'stiffness', 'damping', 'warmStart', 'correctionFactor', 'buffer', 'particleA', 'particleB', 
    'distance', 'normalX', 'normalY', 'reducedMass', 'restImpulse', 'accumulatedImpulseX', 
    'accumulatedImpulseY', 'objectId', 'isActive', 

    // Collision/SpatialHashGrid
    'world', 'defaultCellSize', 'cellSize', 'invCellSize', 'buckets',
    'hash', 'col', 'insertParticle', 'bbox', 'startCol', 'endCol',
    'startRow', 'endRow', 'insertLineSegment', 'x0', 'y0', 'x1', 'y1', 'dx', 'dy',
    'sx', 'sy', 'err', 'e2', 'insertObjectAtCoordinate', 'bucket', 
    'createCollisions', 'objectA', 'objectB', 'sumRadii', 'dx', 'dy', 
    'distanceSquared', 'removeInactiveCollisions', 'createDeformableConstraint',
    'createFluidConstraint', 'createParticleParticleCollision', 
    'createCollisionObjectId', 'isCollisionActive', 'isFluidConstraintActive',
    'isDeformableConstraintActive', 'getObjectIdsFromCollisionObjectId',


    // Constraints/AngularSpring
    'angleVector', 'restAngleVector', 'accumulatedImpulse', 'reducedInertia',
    'restImpulse', 'stiffness', 'damping', 'warmStart', 'correctionFactor',
    'distanceA', 'distanceB', 'linearLinkA', 'linearLinkB', 'objectId',
    'applyCorrectiveImpulse', 'impulseA', 'impulseB', 'localImpulseA',
    'localImpulseB', 'angularImpulseA', 'angularImpulseB', 'deltaImpulse',
    'impulseError', 'correctiveImpulse', 'correctiveAngularImpulseA',
    'correctiveAngularImpulseB', 'correctiveImpulseA', 'correctiveImpulseB',
    'applyWarmStart', 'warmstartImpulse', 'warmstartAngularImpulseA',
    'warmstartAngularImpulseB', 'warmstartImpulseA', 'warmstartImpulseB',
    'computeAngle', 'angleError', 'velocityError',
    'computeData',
    'computeReducedInertia',
    'computeRestImpulse',
    'isValid',
    'setRestAngleVector',
    
    // Constraints/DeformableSpring
    'linearStateA', 'linearStateB', 'stiffness', 'damping', 'warmStart', 
    'deformationThreshold', 'deformationFactor', 'correctionFactor', 'restLength',
    'minLength', 'maxLength', 'restImpulse', 'accumulatedImpulse', 'isActive',
    'applyCorrectiveImpulse', 'deltaImpulseX', 'deltaImpulseY', 'projectedImpulse',
    'impulseError', 'correctiveImpulseX', 'correctiveImpulseY',
    'applyWarmStart', 'projectedImpulse', 'warmstartImpulseX', 'warmstartImpulseY',
    'computeRestImpulse', 'deltaPositionX', 'deltaPositionY', 'deltaVelocityX',
    'deltaVelocityY', 'positionError', 'velocityError', 'distanceCorrection',
    'computeData', 

    // Constraints/FixedSpring
    'linearStateA', 'linearStateB', 'stiffness', 'damping', 'warmStart', 
    'correctionFactor', 'restImpulse', 'accumulatedImpulse', 'restLength',
    'applyCorrectiveImpulse', 'deltaImpulse', 'impulseError', 'correctiveImpulse',
    'applyWarmStart', 'warmstartImpulse', 'computeData', 'computeRestImpulse', 
    'deltaPosition', 'deltaVelocity', 'positionError', 'velocityError', 'isValid',

    // Constraints/FluidConstraint
    'pointA', 'pointB', 'warmStart', 'correctionFactor', 'density', 'lengthVectorX', 
    'lengthVectorY', 'unitOverDistanceX', 'unitOverDistanceY', 'reducedMass', 
    'restImpulse', 'buffer', 'isActive',
    'computeReducedMass', 'k',
    'applyCorrectiveImpulse', 'distanceSquared', 'radiiSquared', 'deltaImpulseX',
    'deltaImpulseY', 'projectedImpulse', 'impulseError', 'correctiveImpulseX',
    'correctiveImpulseY',
    'applyWarmStart', 
    'computeRestImpulse', 'deltaVelocityX', 'deltaVelocityY', 'local_velocity',
    'global_pressure', 'local_pressure', 'local_damping', 
    'computeData', 'distanceSquared', 'radiiSquaredBuffer', 'radiiSquared',
    'distanceKernel', 'density', 

    // Constraints/GearConstraint
    'angularStateA', 'angularStateB', 'gearRatio', 'radiusA', 'radiusB', 'stiffness',
    'damping', 'warmStart', 'correctionFactor', 'reducedInertia', 'restImpulse',
    'accumulatedImpulse', 'restDeltaAngle', 'applyCorrectiveImpulse', 'impulseA',
    'impulseB', 'impulseError', 'correctiveImpulse', 'applyWarmStart', 'warmstartImpulse',
    'computeData', 'computeReducedInertia', 'inverseInertia', 'computeRestDeltaAngle', 
    'computeRestImpulse', 'distanceA', 'distanceB', 'velocityA', 'velocityB', 
    'distanceError', 'velocityError', 'setGearRatio', 'setRadii',

    // Constraints/LinearMotorConstraint
    'linearStateA', 'linearStateB', 'stiffness', 'damping', 'warmStart', 
    'correctionFactor', 'restImpulse', 'accumulatedImpulse', 'restVelocity',
    'applyCorrectiveImpulse', 'deltaImpulse', 'projectedImpulse', 'impulseError',
    'correctiveImpulse', 'applyWarmStart', 'projectedImpulse', 'warmstartImpulse',
    'computeData', 'computeRestImpulse', 'deltaVelocity', 'velocityError',

    // Constraints/LinearSpring
    'linearStateA', 'linearStateB', 'stiffness', 'damping', 'warmStart',
    'correctionFactor', 'restLength', 'restImpulse', 'accumulatedImpulse',
    'applyCorrectiveImpulse', 'deltaImpulseX', 'deltaImpulseY', 'projectedImpulse',
    'impulseError', 'correctiveImpulseX', 'correctiveImpulseY',
    'applyWarmStart', 'projectedImpulse', 'warmstartImpulseX', 'warmstartImpulseY',
    'computeRestImpulse', 'deltaPositionX', 'deltaPositionY', 'deltaVelocityX',
    'deltaVelocityY', 'positionError', 'velocityError',
    'computeData',

    // Constraints/MotorConstraint
    'angularStateA', 'angularStateB', 'restVelocity', 'stiffness', 'damping', 'warmStart',
    'correctionFactor', 'reducedInertia', 'restImpulse', 'accumulatedImpulse',
    'computeReducedInertia', 'applyCorrectiveImpulse', 'impulseA', 'impulseB',
    'impulseError', 'correctiveImpulse', 'applyWarmStart', 'warmstartImpulse',
    'computeData', 'computeReducedInertia', 'inverseInertia', 'computeRestImpulse',
    'velocityA', 'velocityB', 'velocityError', 'setRestVelocity',

    // Constraints/ParticleBoundingBoxConstraint
    'particle', 'boundingBox', 'stiffness', 'damping', 'friction', 'warmStart', 
    'correctionFactor', 'distance', 'restImpulseX', 'restImpulseY', 'collides',
    'applyCorrectiveImpulse',
    'computeRestImpulse',

    // Constraints/VolumeConstraint
    'none', 'left', 'right',
    'stiffness', 'damping', 'warmStart', 'correctionFactor', 'linearStateA', 'linearStateB',
    'parent', 'direction', 'mass', 'reducedMass', 'unitVector', 'restImpulse',
    'accumulatedImpulse', 
    'applyCorrectiveImpulse', 'applyWarmStart', 'computeData', 'computeMass',
    'computeReducedMass', 'computeRestImpulse', 
    'linearStates', 'volumeLinks', 'correctionFactor', 'circumference', 'scaleFactor',
    'area', 'restArea', 'sqrtRestArea', 'objectId', 'mass',
    'applyCorrectiveImpulse', 'applyCorrectiveImpulseReverse', 'applyWarmStart',
    'computeMass', 'calculateArea', 'calculateScaleFactor', 'computeData',
    'computeRestImpulse',

    // Constraints/WorldBorderConstraint
    'objectArray', 'minX', 'maxX', 'minY', 'maxY', 'stiffness', 'damping', 'friction',
    'applyCorrectiveImpulse',

    // Objects/Body

    // Objects/DeformableParticle
    'position', 'density', 'radius', 'computeNewState', 'getBoundingBox',

    // Objects/FluidParticle
    'position', 'density', 'radius', 'computeNewState', 'getBoundingBox',
    'projectedVel',

    // Objects/Particle
    'position', 'mass', 'radius', 'calculateDensity', 'calculateRadius',
    'getBoundingBox',

    // Objects/ShapeMatchingBody

    // Objects/SoftBody
    'stiffness', 'position', 'velocity', 'mass', 'inverseMass', 'area', 'restArea',
    'sqrtRestArea', 'restImpulse', 'isPressurized', 'particles', 'linearSprings',
    'nonPressurizedLinearSprings', 'angularSprings', 'init', 'computeMass', 'addParticle',
    'addLinearSpring', 'addNonPressurizedLinearSpring', 'addAngularSpring', 'removeParticle',
    'removeLinearSpring', 'removeNonPressurizedLinearSpring', 'removeAngularSpring',
    'applyCorrectiveImpulse', 'applyCorrectiveImpulseReverse',
    'perp', 'projectedImpulseA', 'projectedImpulseB', 'impulseErrorA', 'impulseErrorB',
    'correctiveImpulseXA', 'correctiveImpulseYA', 'correctiveImpulseXB', 'correctiveImpulseYB',
    'applyWarmStart', 'computeRestImpulse', 'scaleFactor', 'positionError', 'computeData',
    'PmassI', 'PmassJ', 'local_position', 'local_velocity',

    // Objects/Wheel

    // Constants
    'DT', 'INV_DT', 'FPS', 'NUM_ITERATIONS', 'GRAVITY','PARTICLE_RADIUS', 
    'INVERSE_PARTICLE_RADIUS', 'PARTICLE_RADIUS_SQUARED', 'INVERSE_PARTICLE_RADIUS_SQUARED',
    'LOCAL_PRESSURE_COEFF', 'GLOBAL_PRESSURE_COEFF', 'LOCAL_DAMPING_COEFF', 
    'GLOBAL_DAMPING_COEFF', 'REST_DENSITY',

    // ObjectType
    'POINTER', 'PARTICLE', 'FLUID_PARTICLE', 'DEFORMABLE_PARTICLE', 'OBSTACLE',

    // World
    'params', 'boundaries', 'minX', 'maxX', 'minY', 'maxY',
    'points', 'lineSegments', 'linearStates', 'angularStates', 'linearLinks', 'fixedSprings',
    'linearSprings', 'deformableSprings', 'angularSprings', 'volumeConstraints',
    'gearConstraints', 'motorConstraints', 'linearMotorConstraints', 
    'particleBoundingBoxConstraints', 'worldBorderConstraints',
    'particles', 'fluidParticles', 'deformableParticles', 'wheels', 'bodys', 'softBodys',
    'shapeMatchingBodys', 
    'collisions', 'fluidConstraints', 'deformableConstraints', 'objectIdCounter', 
    'spatialHashGrid',
    'reset', 'applyImpulses', 'applyWarmStart', 'computeData', 'computeNewState',
    'computeRestImpulse', 'handleCollisions', 'update', 

    // World factory methods
    'createParticleBoundingBoxConstraint', 'deleteParticleBoundingBoxConstraint',
    'createSoftBody', 'deleteSoftBody',

    // App engine

    // App
    //'factory', 
    'world', 'renderer', 'webglRenderer', 'ui', 'mouse', 'touch', 'pointer', 'sensor',
    'system', 'level', 'setIntervalId', 'requestAnimationFrameId', 'boundHandleMotion', 
    'version', 'lastUpdated',
    'init', 
    'addEventListeners',
    'removeEventListeners',
    'handleMotion', 'gravityFactor', 'accelerationFactor',
    'createTouchPoint', 'position', 'particle',
    'deleteTouchPoint', 'touchPoint', 
    'handleProdStart', 'touchPoint', 'distanceX', 'distanceY', 'distanceSquared',
    'handleProdMove', 'touchPoint', 'touchPointMovedDistanceX','touchPointMovedDistanceY',
    'handleProdEnd',
    'handleSliceStart', 'touchPoint', 'grabbedObstacle', 'minDistance', 
    'handleSliceMove', 'touchPoint', 'linearSpring', 
    'handleSliceEnd',
    'explodeConstraint', 'particleA', 'particleB', 'normal', 'explosionImpulse',
    'update',
    'reset',
    

    // Extruder
    'baseColors', 'app', 'particleRadius', 'rowWidth', 'extrusionVelocity', 'offset', 
    'staticParticles', 'lastDynamicParticles', 'dynamicParticles', 'linearMotorConstraints',
    'particleColors', 'init', 'particleRadius', 'rowWidthPixels', 'center', 
    'update', 
    'createLinearSprings', 'particle1', 'particle2', 'distance', 'linearSpring', 'particle3',
    'particle4', 
    'createMotorConstraints', 'staticParticle', 'dynamicParticle', 'linearMotorConstraint',
    'createDynamicParticles', 'mass', 'particle',
    'createStaticParticles', 
    'deleteLinearSprings', 
    'deleteParticles', 
    'convertRgbFloatToHex',
    'convertRgbHexToFloat',

    // Factory
    'createSquishyFactoryLevel',
    'createSquishyLevel',
    'createFluidLevel',
    'createPlaydoughLevel',
    'createSlicingLevel',
    'createSandLevel',
    'createJellyLevel',
    'createJelly',

    // Level
    'app', 'obstacleCircles', 'extruders', 'update', 'createObstacleCircle', 
    'removeObstacleCircle', 'addExtruder', 'removeExtruder',

    // (ModuleBundler)

    // (Mouse)

    // ObstacleCircle
    'particle', 'isLocked', 'toggleLock',

    // Pointer
    'touchPoints',

    // Renderer
    'app', 'setCanvas', 'init', 'draw', 'webGlColorToRGB',
    'drawCircle', 

    // Sensor

    'orientation', 'gyroscope', 
    'isRunning', 'isIOS', 
    'handleOrientation', 
    'handleMotion', 
    'start', 
    'stop',
    'getOrientation', 'getAcceleration', 
    'getAccelerationIncludingGravity', 'getGyroscope', 'getInterval',

    // Settings
    'None', 'Balloon', 'MeshBall',
    'pressure', 'elasticity', 'viscosity', 'shape', 'hue',
    'touchCircleSize', 'gravity', 'sensorGravity', 'sensorAcceleration',

    // System
    //'Browser',
    'OperatingSystem', 
    'init', 'os', 'browser', 'screenSizePixels', 'screenSizeMm',
    'getOSInfo', 'getBrowserInfo', 'getScreenSizeInPixels', 'getScreenSizeInMm',

    // (Touch)

    // TouchPoint
    'particle', 'grabbedObject', 'maxPreviousPositions', 'previousPositionDist',
    'previousPositions',
    'storePosition', 

    // Ui
    //'navbar', 'squishy-type',
    'app', 'content',
    'init', 'reset', 'createButton', 'createSlider', 'createToggle', 'createCanvas', 
    'loadFullscreenRequestPage', 'loadSystemInfoPage', 'loadSettingsPage', 'loadMainMenuPage',
    'createRock', 'createRockWebGL', 'loadSquishyFactoryCustomizationPage', 
    'loadSquishyFactoryActivity', 'loadSquishyActivity', 'loadFluidActivity', 'loadSandActivity',
    'loadPlaydoughActivity', 'loadSlicingActivity', 'loadJellyActivity', 
    'requestFullScreen', 'exitFullScreen', 'lockOrientationToLandscape', 
    'lockOrientationToPortrait', 'unlockOrientation',
    

    // WebGlRenderer
    'gl', 'app', 'shaderProgram', 'circleVerticesBuffer', 'lineVerticesBuffer', 'programInfo',
    'setCanvas',
    'init',
    'initShaderProgram',
    'loadShader',
    'draw',
    'drawCircle',
    'drawLine',

    //
    'computeInverseMass', 
    'applyImpulses', 'addAngularVelocity', 'angleVector', 'computeAngularVelocityVector',
    'createPlaydoughLevel', 'createSandLevel', 'createSlicingLevel', 
    'createStressballLevel','createJellyLevel', 'createFluidLevel',
    'linearStateA', 'linearStateB','pointA', 'pointB', 'linearLinkA', 'linearLinkB',
    'createFluidConstraint', 'createParticleParticleCollision', 'createCollisionObjectId',
    'createParticleBoundingBoxConstraint', 'createLinearState', 'createLinearSpring',
    'createAngularSpring', 'createVolumeConstraint', 'createLinearMotorConstraint',
    'createParticle', 'createWorldBorderConstraint', 'createButton', 'createToggle',
    'createSlider', 'createRock', 'createRockWebGL', 'createDynamicParticles', 'createLinearSprings',
    'createDeformableParticle', 'createTouchPoint', 'createMotorConstraints', 
    'createLineSegment', 'createDeformableConstraint', 'createCollisions', 'createLinearLink',
    'createFixedSpring', 'createMotorConstraint', 'createWheel', 'createAngularState', 'createPoint',
    'createFluidParticle', 'createCanvas', 'createSoftBody', 'createStaticParticles', 'createJelly',
    'createObstacleCircle', 'createShapeMatchingBody', 'createGearConstraint', 'gearConstraints',
    'restImpulse', 'calculateDensity', 
    // 'pointerId',
    'deleteLinearSprings', 'deleteLinearSpring', 'deleteParticleBoundingBoxConstraint', 
    'deleteDeformableParticle', 'deleteSoftBody', 'deleteShapeMatchingBody', 'deleteAngularSpring',
    'deleteLinearLink', 'deleteLinearState', 'deleteFixedSpring', 'deletePoint', 'deleteTouchPoint',
    'deleteFluidConstraint', 'deleteFluidParticle', 'deleteWorldBorderConstraint', 'deleteParticles',
    'deleteLineSegment', 'deleteVolumeConstraint', 'deleteAngularState', 'deleteGearConstraint',
    'deleteMotorConstraint', 'deleteWheel', 'deleteParticle', 'deleteLinearMotorConstraint',
    'setIntervalId', 'computeRestImpulse', 'computeArea', 'computeCircumference', 
    'computeAngleVector', 'computeData', 'computeReducedMass', 'computeInertia', 'computeLength',
    'computeAngle', 'computeReducedInertia', 'computeInverseInertia', 'computeNewState',
    'computeMass', 'computeLengthVector', 'computeRestDeltaAngle', 'computeAngularVelocity',
    'computeAngularImpulse', 'inverseMass', 'getScreenSizeInMm', 'getScreenSizeInPixels', 
    'velocity', 'isActive', 'restArea', 'particleA', 'particleB', 'restImpulseY', 'restImpulseX',
    'sqrtRestArea', 'density', 'distanceA', 'distanceB', 'particleRadius', 
    'unitOverDistanceY', 'unitOverDistanceX', 'rotateRight', 'addParticle', 'stiffness', 
    'spatialHashGrid', 'wheels', 'warmStart', 'damping', 'angularStateA', 'angularStateB',
    'collision', 'circumference', 'perpDot', 'normalize',
    //'sub', 'add', 'mul', 'div', 'dot',
    'particles', 'addFixedSpring', 'explodeConstraint', 'grabbedObject', 'restVelocity',
    'calculateRadius', 'calculateScaleFactor', 'motorConstraints', 'linearSprings', 
    'worldBorderConstraints', 'isFluidConstraintActive', 'fluidParticles', 'findNearestEdge',
    'rotateThis', 'impulse_prev', 'applyWarmStart', 'applyCorrectiveImpulse',
    'removeParticle', 'removeInactiveCollisions', 'removeAngularSpring', 'removeFixedSpring',
    'removeExtruder', 'removeLinearSpring', 'distanceSquared', 'fluidConstraints', 
    'deformableConstraints', 
    'loadMainMenuPage', 'loadSettingsPage', 'loadJellyActivity', 'loadSlicingActivity',
    'loadSystemInfoPage', 'loadFluidActivity', 'loadSandActivity', 'loadFullscreenRequestPage',
    'loadPlaydoughActivity', 'loadStressballActivity', 
    'previousPositions', 'position', 'maxPreviousPositions', 'storePosition',
    'previousPositionDist', 'scaledPosition', 'inverseInertia', 'addAngularSpring',
    'getAcceleration', 'linearStates', 'lastDynamicParticles', 'particle', 'areLinesIntersecting',
    'getBoundingBox', 'angularImpulse', 'addPosition', 'defaultCellSize', 'removeObstacleCircle',
    'addAngularImpulse', 'angleFromUnitVector', 'getObjectIdsFromCollisionObjectId', 
    'isCollisionActive', 'isDeformableConstraintActive', 'setRestVelocity', 'angularStates',
    'setGearRatio', 'calculateInertia', 'bodyParticleInteraction', 'collisions', 
    'particleBoundingBoxConstraints', 'touchCircleSize', 'cellSize', 'invCellSize',
    'screenSizePixels', 'screenSizeMm', 
    'unitVector', 'restAngleVector', 'directionVector', 'lengthVectorX', 'lengthVectorY', 
    'angularVelocityVector', 'lengthVector', 'setRestAngleVector', 'addAngleVector', 
    'lengthVectorX', 'lengthVectorY', 'unitVectorFromAngle', 
    'accumulatedImpulse', 'accumulatedImpulseX', 'accumulatedImpulseY', 
    'applyCorrectiveImpulse', 'applyCorrectiveImpulseReverse', 'addImpulse', 'angularImpulse_prev',
    'impulse', 'applyImpulseAtPoint', 'applyInternalImpulses', 
  ];

  // Check if the bundle.js file exists
  if (!fs.existsSync(bundlePath)) {
    console.error('Error: bundle.js does not exist at the expected path:', bundlePath);
    return;
  }

  console.log('Reading bundle.js from:', bundlePath);

  // Read the bundle.js file
  fs.readFile(bundlePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading bundle.js:', err);
      return;
    }

    console.log('Original bundle.js size:', data.length);

    // Replace specified words with random strings
    const obfuscatedContent = replaceWords(data, wordsToReplace);

    console.log('Obfuscated bundle.js size:', obfuscatedContent.length);

    // Write the modified content back to a new file
    const outputFilePath = path.join(__dirname, 'dist-webpack', 'bundle.obfuscated.js');
    fs.writeFile(outputFilePath, obfuscatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing obfuscated bundle.js:', err);
      } else {
        console.log('Obfuscation complete. Saved to:', outputFilePath);
      }
    });
  });
}

obfuscateBundle();