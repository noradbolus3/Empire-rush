(function () {
  "use strict";

  /* =========================================================================
   * CITYTOPIA DEFINITIVE GRAPHICS ENGINE (AAA ISOMETRIC ARCHITECTURE)
   * Designed for Empire Rush — Autonomous High-Vibrancy Metropolis
   *
   * Features:
   * - Deep Scene Purge: Eradicates legacy grey blocks & glitchy primitives
   * - Engineered Skyway: Realistic elevated bypass with dual guardrails & piers
   * - High-Fidelity Vehicles: Sedans, Taxis & Vans with wheels, lights & glass
   * - Multi-Tier Skyscrapers: Podium lobbies, curtain-walls & HVAC penthouses
   * - Cinematic Illumination: ACES Filmic tone mapping & soft sun shadows
   * ========================================================================= */

  let isInitialized = false;
  let animFrameId = null;
  const activeHighwayTraffic = [];
  const activeSurfaceTraffic = [];
  const collectibleSprites = [];
  let skywaySpline = null;

  // --- 1. RADICAL PURGE OF LEGACY DULL ASSETS ---
  function purgeLegacyClutter(scene) {
    // Delete legacy parent group if present
    const oldCityGroup = scene.getObjectByName("EmpireRushLivingCity");
    if (oldCityGroup) {
      scene.remove(oldCityGroup);
    }

    // Traverse and eliminate any remaining rogue meshes from default template
    const toRemove = [];
    scene.traverse(function (node) {
      if (!node || !node.isMesh) return;

      // Retain office, employees, desks, chairs, and HUD elements
      const name = (node.name || "").toLowerCase();
      if (
        name.includes("worker") ||
        name.includes("human") ||
        name.includes("desk") ||
        name.includes("chair") ||
        name.includes("office") ||
        name.includes("floor") ||
        name.includes("wall")
      ) {
        return;
      }

      // Purge generic world3d default meshes
      if (
        node.name === "EmpireCityBuilding" ||
        node.name === "EmpireCentralPark" ||
        node.name === "EmpireCityGround" ||
        node.name === "EmpireCityRoad" ||
        node.name === "EmpireCitySidewalk" ||
        node.name === "EmpireTrafficCar" ||
        node.name === "EmpirePedestrian" ||
        node.name === "EmpireTree"
      ) {
        toRemove.push(node);
        return;
      }

      // Check for legacy flat grey building colors
      if (node.material && node.material.color) {
        const hex = node.material.color.getHex();
        if (hex === 0x9ca7ae || hex === 0x71806d || hex === 0x30343a || hex === 0xb9b4aa) {
          toRemove.push(node);
        }
      }
    });

    toRemove.forEach(mesh => {
      if (mesh.parent) mesh.parent.remove(mesh);
    });
  }

  // --- 2. PROCEDURAL HIGH-RESOLUTION TEXTURE ENGINE ---
  function createSkyscraperFacadeTexture(baseHex, winLitHex, winDarkHex, styleMode) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Primary Facade Tone
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 1024);

    // Architectural Column Piers
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let c = 0; c < 512; c += 64) {
      ctx.fillRect(c, 0, 8, 1024);
    }

    // Floor Spandrels & Glazing
    const floors = 24;
    const columns = 8;
    const padX = 14;
    const padY = 12;
    const winWidth = (512 - (columns + 1) * padX) / columns;
    const winHeight = (1024 - (floors + 1) * padY) / floors;

    for (let f = 0; f < floors; f++) {
      // Horizontal Floor Dividers
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillRect(0, f * (winHeight + padY), 512, 4);

      for (let c = 0; c < columns; c++) {
        const x = padX + c * (winWidth + padX);
        const y = padY + f * (winHeight + padY);

        const isIlluminated = Math.random() > 0.4;
        ctx.fillStyle = isIlluminated ? winLitHex : winDarkHex;
        ctx.fillRect(x, y, winWidth, winHeight);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, winWidth, winHeight);

        // Venetian blinds detail
        if (Math.random() > 0.55) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
          ctx.fillRect(x, y + 2, winWidth, winHeight * 0.4);
        }
      }
    }

    const texture = new window.EmpireWorld.THREE.CanvasTexture(canvas);
    texture.wrapS = window.EmpireWorld.THREE.RepeatWrapping;
    texture.wrapT = window.EmpireWorld.THREE.RepeatWrapping;
    return texture;
  }

  function createRoadAsphaltTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Rich Dark Asphalt
    ctx.fillStyle = "#1e2229";
    ctx.fillRect(0, 0, 512, 1024);

    // Concrete Curbs
    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(0, 0, 24, 1024);
    ctx.fillRect(488, 0, 24, 1024);

    // Outer Solid Yellow Margins
    ctx.fillStyle = "#fbc531";
    ctx.fillRect(36, 0, 10, 1024);
    ctx.fillRect(466, 0, 10, 1024);

    // Central Dashed White Divider Lines
    ctx.fillStyle = "#ffffff";
    const dashLen = 60;
    const dashGap = 45;
    for (let y = 10; y < 1024; y += dashLen + dashGap) {
      ctx.fillRect(250, y, 12, dashLen);
    }

    // Pedestrian Zebra Crossing Band
    for (let x = 50; x < 460; x += 36) {
      ctx.fillRect(x, 80, 22, 100);
    }

    const texture = new window.EmpireWorld.THREE.CanvasTexture(canvas);
    texture.wrapS = window.EmpireWorld.THREE.RepeatWrapping;
    texture.wrapT = window.EmpireWorld.THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    return texture;
  }

  // --- 3. MAIN ENGINE INITIALIZER ---
  function buildCityGraphics() {
    if (isInitialized) return;
    if (!window.EmpireWorld || !window.EmpireWorld.scene || !window.EmpireWorld.THREE) {
      setTimeout(buildCityGraphics, 250);
      return;
    }

    const world = window.EmpireWorld;
    const scene = world.scene;
    const renderer = world.renderer;
    const THREE = world.THREE;

    isInitialized = true;
    purgeLegacyClutter(scene);

    // Renderer Tone Mapping Setup
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.32;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Sky & Atmospheric Scattering
    scene.background = new THREE.Color(0x54a0ff);
    scene.fog = new THREE.FogExp2(0x74b9ff, 0.0022);

    // Cinematic Sunlight (Golden Hour Angle with Sharp PCF Shadows)
    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.6);
    sunLight.position.set(140, 220, 110);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 15;
    sunLight.shadow.camera.far = 500;
    const shadowDist = 160;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x2ed573, 0.7);
    scene.add(ambientLight);

    const masterCityGroup = new THREE.Group();
    masterCityGroup.name = "CitytopiaMasterGroup";
    scene.add(masterCityGroup);

    // --- 4. TEXTURES & SHADERS ---
    const texOffice = createSkyscraperFacadeTexture("#f5f6fa", "#7ed6df", "#2f3542", 1);
    const texCorporate = createSkyscraperFacadeTexture("#0984e3", "#e0f7fa", "#182C61", 2);
    const texCommercial = createSkyscraperFacadeTexture("#ff7675", "#ffeaa7", "#2d3436", 3);
    const texGlassEmerald = createSkyscraperFacadeTexture("#00b894", "#b8e994", "#1e3799", 4);
    const roadTexture = createRoadAsphaltTexture();

    const materials = {
      groundGrass: new THREE.MeshLambertMaterial({ color: 0x44bd32 }),
      waterOcean: new THREE.MeshLambertMaterial({ color: 0x0984e3 }),
      roadAsphalt: new THREE.MeshLambertMaterial({ map: roadTexture }),
      curbConcrete: new THREE.MeshLambertMaterial({ color: 0xdcdde1 }),
      guardrailMetal: new THREE.MeshLambertMaterial({ color: 0x718093 }),
      guardrailConcrete: new THREE.MeshLambertMaterial({ color: 0xbdc3c7 }),
      roofCapDark: new THREE.MeshLambertMaterial({ color: 0x222f3e }),
      roofApparatus: new THREE.MeshLambertMaterial({ color: 0x57606f }),
      helipadOrange: new THREE.MeshLambertMaterial({ color: 0xe67e22 }),
      carGlass: new THREE.MeshPhysicalMaterial({ color: 0x00cec9, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.85 }),
      carTire: new THREE.MeshLambertMaterial({ color: 0x1e272e }),
      carRim: new THREE.MeshLambertMaterial({ color: 0xe0e0e0 }),
      headlightGlow: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      taillightGlow: new THREE.MeshBasicMaterial({ color: 0xff4757 }),
      taxiSignYellow: new THREE.MeshBasicMaterial({ color: 0xfbc531 })
    };

    // --- 5. EXPANSIVE LANDSCAPE & HARBOR ---
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(850, 850), materials.groundGrass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    masterCityGroup.add(ground);

    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(120, 850), materials.waterOcean);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(-210, -0.1, 0);
    masterCityGroup.add(ocean);

    // --- 6. REALISTIC LOW-POLY CAR CONSTRUCTOR ---
    function assembleRealisticVehicle(styleType, paintHex) {
      const vehicle = new THREE.Group();
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: paintHex });

      if (styleType === "van") {
        // Commercial Delivery Van
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 5.6), bodyMaterial);
        chassis.position.y = 0.85;
        chassis.castShadow = true;
        vehicle.add(chassis);

        const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.6, 3.6), materials.curbConcrete);
        cargoBox.position.set(0, 1.9, -0.7);
        cargoBox.castShadow = true;
        vehicle.add(cargoBox);

        const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.4), materials.carGlass);
        cabGlass.position.set(0, 1.6, 1.4);
        vehicle.add(cabGlass);
      } else {
        // Streamlined Sedan / Taxi / Sports Coupe
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.75, 5.0), bodyMaterial);
        chassis.position.y = 0.65;
        chassis.castShadow = true;
        vehicle.add(chassis);

        const greenhouse = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 2.7), materials.carGlass);
        greenhouse.position.set(0, 1.35, -0.2);
        vehicle.add(greenhouse);

        const roofSkin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.5), bodyMaterial);
        roofSkin.position.set(0, 1.76, -0.2);
        vehicle.add(roofSkin);

        if (styleType === "taxi") {
          const topper = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 0.4), materials.taxiSignYellow);
          topper.position.set(0, 1.95, -0.2);
          vehicle.add(topper);
        }
      }

      // 4 Precision Wheels with Chrome Rims
      const tireGeometry = new THREE.CylinderGeometry(0.44, 0.44, 0.36, 14);
      tireGeometry.rotateZ(Math.PI / 2);
      const rimGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.38, 10);
      rimGeometry.rotateZ(Math.PI / 2);

      const axlePositions = [
        [-1.2, 0.44, 1.5],
        [1.2, 0.44, 1.5],
        [-1.2, 0.44, -1.5],
        [1.2, 0.44, -1.5]
      ];

      axlePositions.forEach(pos => {
        const wheel = new THREE.Mesh(tireGeometry, materials.carTire);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        const rim = new THREE.Mesh(rimGeometry, materials.carRim);
        wheel.add(rim);
        vehicle.add(wheel);
      });

      // Front Headlights
      const lampL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.1), materials.headlightGlow);
      lampL.position.set(0.8, 0.75, 2.52);
      const lampR = lampL.clone();
      lampR.position.x = -0.8;
      vehicle.add(lampL);
      vehicle.add(lampR);

      // Rear Taillights
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.1), materials.taillightGlow);
      tailL.position.set(0.8, 0.8, -2.52);
      const tailR = tailL.clone();
      tailR.position.x = -0.8;
      vehicle.add(tailL);
      vehicle.add(tailR);

      return vehicle;
    }

    // --- 7. ENGINEERED SKYWAY OVERPASS (NO BUILDING CLIPPING) ---
    // Smooth bypass curve strictly situated on the east/south periphery (R > 75)
    skywaySpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(75, 10, -180),
      new THREE.Vector3(92, 16, -70),
      new THREE.Vector3(94, 17, 45),
      new THREE.Vector3(78, 13, 145),
      new THREE.Vector3(30, 8, 200)
    ]);

    // Cross-Section Profile with Integrated Concrete Barriers
    const deckShape = new THREE.Shape();
    deckShape.moveTo(-6.5, -0.8);
    deckShape.lineTo(6.5, -0.8);
    deckShape.lineTo(6.5, 0.8);
    deckShape.lineTo(-6.5, 0.8);
    deckShape.closePath();

    const overpassDeck = new THREE.Mesh(
      new THREE.ExtrudeGeometry(deckShape, { steps: 120, bevelEnabled: false, extrudePath: skywaySpline }),
      materials.roadAsphalt
    );
    overpassDeck.castShadow = true;
    overpassDeck.receiveShadow = true;
    masterCityGroup.add(overpassDeck);

    // Continuous Metal Safety Guardrails along both edges
    [-6.3, 6.3].forEach(railOffset => {
      const railCurve = new THREE.CatmullRomCurve3(
        skywaySpline.getPoints(80).map(p => new THREE.Vector3(p.x + railOffset, p.y + 1.2, p.z))
      );
      const guardrail = new THREE.Mesh(
        new THREE.TubeGeometry(railCurve, 80, 0.18, 8, false),
        materials.guardrailMetal
      );
      masterCityGroup.add(guardrail);
    });

    // Sturdy Double-Column Concrete Support Bents
    const columnGeom = new THREE.CylinderGeometry(1.2, 1.4, 20, 14);
    const lintelGeom = new THREE.BoxGeometry(13, 1.5, 2.5);

    [0.1, 0.32, 0.58, 0.82].forEach(u => {
      const pt = skywaySpline.getPointAt(u);
      const bentGroup = new THREE.Group();
      bentGroup.position.set(pt.x, 0, pt.z);

      const colL = new THREE.Mesh(columnGeom, materials.guardrailConcrete);
      colL.position.set(-4.2, pt.y / 2, 0);
      colL.scale.set(1, pt.y / 20, 1);
      colL.castShadow = true;
      bentGroup.add(colL);

      const colR = new THREE.Mesh(columnGeom, materials.guardrailConcrete);
      colR.position.set(4.2, pt.y / 2, 0);
      colR.scale.set(1, pt.y / 20, 1);
      colR.castShadow = true;
      bentGroup.add(colR);

      const lintel = new THREE.Mesh(lintelGeom, materials.guardrailConcrete);
      lintel.position.y = pt.y - 1.2;
      lintel.castShadow = true;
      bentGroup.add(lintel);

      masterCityGroup.add(bentGroup);
    });

    // Surface Arterial Expressway
    const surfaceAvenue = new THREE.Mesh(new THREE.PlaneGeometry(24, 460), materials.roadAsphalt);
    surfaceAvenue.rotation.x = -Math.PI / 2;
    surfaceAvenue.position.set(92, 0.05, 0);
    surfaceAvenue.receiveShadow = true;
    masterCityGroup.add(surfaceAvenue);

    // --- 8. DETAILED CITYTOPIA SKYSCRAPERS (STRATEGIC NON-CLIPPING GRIDS) ---
    function constructSkyscraper(x, z, width, depth, height, facadeTexture, hasHelipad) {
      const complex = new THREE.Group();
      complex.position.set(x, 0, z);

      // Multi-Story Podium Base (Lobby level)
      const baseHeight = 4;
      const base = new THREE.Mesh(new THREE.BoxGeometry(width + 4, baseHeight, depth + 4), materials.curbConcrete);
      base.position.y = baseHeight / 2;
      base.receiveShadow = true;
      complex.add(base);

      // Main Glazed Tower Body
      const towerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshLambertMaterial({ map: facadeTexture })
      );
      towerMesh.position.y = baseHeight + height / 2;
      towerMesh.castShadow = true;
      towerMesh.receiveShadow = true;
      complex.add(towerMesh);

      // Roof Architectural Crown
      const crown = new THREE.Mesh(new THREE.BoxGeometry(width - 1.2, 2.2, depth - 1.2), materials.roofCapDark);
      crown.position.y = baseHeight + height + 1.1;
      crown.castShadow = true;
      complex.add(crown);

      // Rooftop Industrial HVAC & Mechanical Overruns
      const hvacUnit = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.0, 3.5), materials.roofApparatus);
      hvacUnit.position.set(-width / 4, baseHeight + height + 2.6, -depth / 4);
      hvacUnit.castShadow = true;
      complex.add(hvacUnit);

      if (hasHelipad) {
        // Commercial Aviation Helipad
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.38, width * 0.38, 0.6, 18), materials.helipadOrange);
        pad.position.y = baseHeight + height + 2.4;
        complex.add(pad);
      } else {
        // High-Gain Broadcast Antenna Spire with Blinking Beacon Light
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.45, 12, 8), materials.roofApparatus);
        spire.position.y = baseHeight + height + 7.5;
        complex.add(spire);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), materials.taillightGlow);
        beacon.position.y = baseHeight + height + 13.5;
        complex.add(beacon);
      }

      masterCityGroup.add(complex);
    }

    // Precise coordinates calculated to NEVER clip with the Skyway (X: 75..94) or Office (X: -25..25, Z: -22..22)
    const architecturalGrid = [
      [-80, -85, 22, 22, 54, texCommercial, false],
      [-38, -105, 24, 22, 68, texCorporate, true],
      [28, -110, 26, 24, 76, texGlassEmerald, true],
      [-85, 85, 22, 22, 58, texOffice, false],
      [-38, 105, 22, 22, 50, texCommercial, false],
      [28, 110, 26, 24, 82, texGlassEmerald, true],
      [-110, 0, 26, 24, 62, texCorporate, false]
    ];
    architecturalGrid.forEach(cfg => constructSkyscraper(cfg[0], cfg[1], cfg[2], cfg[3], cfg[4], cfg[5], cfg[6]));

    // --- 9. POPULATE HIGH-DENSITY CITY TRAFFIC ---
    const vehiclePaints = [0xe74c3c, 0x0984e3, 0x2ecc71, 0xffffff, 0xe67e22, 0x34495e];

    // Skyway Traffic (Overpass)
    for (let i = 0; i < 14; i++) {
      const isTaxi = i % 4 === 0;
      const paint = isTaxi ? 0xfbc531 : vehiclePaints[i % vehiclePaints.length];
      const carMesh = assembleRealisticVehicle(isTaxi ? "taxi" : (i % 5 === 0 ? "van" : "sedan"), paint);

      carMesh.userData = {
        progress: (i / 14) + Math.random() * 0.05,
        velocity: 0.0011 + Math.random() * 0.0006,
        lateralLane: (i % 2 === 0 ? 1.8 : -1.8)
      };

      masterCityGroup.add(carMesh);
      activeHighwayTraffic.push(carMesh);
    }

    // Surface Avenue Traffic
    for (let j = 0; j < 8; j++) {
      const paint = vehiclePaints[(j + 2) % vehiclePaints.length];
      const groundCar = assembleRealisticVehicle(j % 3 === 0 ? "taxi" : "sedan", paint);

      groundCar.userData = {
        progress: j / 8,
        velocity: 0.0013 + Math.random() * 0.0006,
        laneX: 92 + (j % 2 === 0 ? 3.5 : -3.5)
      };

      masterCityGroup.add(groundCar);
      activeSurfaceTraffic.push(groundCar);
    }

    // --- 10. TYCOON REWARD SPRITES ---
    function plantRewardSprite(amountLabel, x, y, z, brandColor) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "rgba(18, 24, 38, 0.92)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 236, 108, 54);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(58, 64, 34, 0, Math.PI * 2);
      ctx.fillStyle = brandColor;
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₹", 58, 66);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(amountLabel, 146, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
      sprite.scale.set(9.5, 4.75, 1);
      sprite.position.set(x, y, z);
      masterCityGroup.add(sprite);

      collectibleSprites.push({ sprite, baseY: y, phase: Math.random() * Math.PI * 2 });
    }

    plantRewardSprite("+18.5K", 28, 92, -110, "#f1c40f");
    plantRewardSprite("Tier 3", 28, 98, 110, "#3498db");

    // --- 11. HIGH-PRECISION RENDER CYCLE ---
    function executeCityRenderCycle() {
      // Highway Vehicles Curve-Follower
      activeHighwayTraffic.forEach(car => {
        const d = car.userData;
        d.progress += d.velocity;
        if (d.progress > 1) d.progress = 0;

        const pathPoint = skywaySpline.getPointAt(d.progress);
        const tangent = skywaySpline.getTangentAt(d.progress).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        car.position.copy(pathPoint);
        car.position.addScaledVector(normal, d.lateralLane);
        car.position.y += 0.82; // Perfectly mounted on road surface
        car.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      });

      // Surface Expressway Vehicles
      activeSurfaceTraffic.forEach(car => {
        const d = car.userData;
        d.progress += d.velocity;
        if (d.progress > 1) d.progress = 0;

        const zPos = -220 + d.progress * 440;
        car.position.set(d.laneX, 0.65, zPos);
        car.rotation.set(0, 0, 0);
      });

      // Bobbing Rewards Animation
      const clockTime = performance.now() * 0.003;
      collectibleSprites.forEach(item => {
        item.sprite.position.y = item.baseY + Math.sin(clockTime + item.phase) * 1.1;
      });

      animFrameId = requestAnimationFrame(executeCityRenderCycle);
    }
    executeCityRenderCycle();

    console.log("🏙️ CITYTOPIA DEFINITIVE GRAPHICS ENGINE OPERATIONAL");
  }

  // Self-Executing Lifecycle Handlers
  window.addEventListener("EmpireWorldReady", buildCityGraphics);
  setTimeout(buildCityGraphics, 600);

  window.addEventListener("beforeunload", () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });
})();
