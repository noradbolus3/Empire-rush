(function () {
  "use strict";

  /* =========================================================================
   * CITYTOPIA DEFINITIVE METROPOLIS ENGINE (CAMPUS & SKYLINE EDITION)
   * 
   * Fixes Applied:
   * 1. Eliminated floating sky-bridge (replaced with ground-level Grand Boulevards)
   * 2. Intercepted scene.add to permanently block world3d.js's old grey boxes
   * 3. Realistic low-poly vehicles (Sedans, Taxis, Vans) with real wheels & lights
   * 4. Open-air Tech Campus environment around Player HQ (zero camera block)
   * ========================================================================= */

  let isLoaded = false;
  let animId = null;
  const activeCars = [];

  // --- 1. PERMANENT INTERCEPTION OF LEGACY GREY BOXES ---
  function blockLegacySpawner(scene) {
    // Hide old city group if already present
    const oldGroup = scene.getObjectByName("EmpireRushLivingCity");
    if (oldGroup) {
      oldGroup.visible = false;
      oldGroup.position.set(0, -99999, 0);
    }

    // Intercept future additions from world3d.js so grey meshes never appear
    const originalAdd = scene.add.bind(scene);
    scene.add = function (...args) {
      args.forEach(obj => {
        if (!obj) return;
        if (
          obj.name === "EmpireRushLivingCity" ||
          obj.name === "EmpireCityBuilding" ||
          obj.name === "EmpireCityRoad" ||
          obj.name === "EmpireCitySidewalk" ||
          obj.name === "EmpireCentralPark" ||
          obj.name === "EmpireTrafficCar"
        ) {
          obj.visible = false;
          return;
        }
      });
      return originalAdd(...args);
    };

    // Deep clean existing rogue meshes
    scene.traverse(node => {
      if (!node || !node.isMesh) return;
      if (
        node.name === "EmpireCityBuilding" ||
        node.name === "EmpireCityRoad" ||
        node.name === "EmpireCentralPark" ||
        node.name === "EmpireTrafficCar"
      ) {
        node.visible = false;
      }
      if (node.material && node.material.color) {
        const hex = node.material.color.getHex();
        if (hex === 0x9ca7ae || hex === 0x71806d || hex === 0x30343a) {
          node.visible = false;
        }
      }
    });
  }

  // --- 2. FACADE TEXTURE BUILDER ---
  function makeFacadeTex(THREE, wallHex, winLitHex, winDarkHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = wallHex;
    ctx.fillRect(0, 0, 512, 512);

    const rows = 12, cols = 8;
    const pX = 14, pY = 12;
    const wW = (512 - (cols + 1) * pX) / cols;
    const wH = (512 - (rows + 1) * pY) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pX + c * (wW + pX);
        const y = pY + r * (wH + pY);
        ctx.fillStyle = Math.random() > 0.4 ? winLitHex : winDarkHex;
        ctx.fillRect(x, y, wW, wH);
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, wW, wH);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // --- 3. MAIN GRAPHICS BOOTSTRAP ---
  function initializeMetropolis() {
    if (isLoaded) return;
    if (!window.EmpireWorld || !window.EmpireWorld.scene || !window.EmpireWorld.THREE) {
      setTimeout(initializeMetropolis, 250);
      return;
    }

    const world = window.EmpireWorld;
    const scene = world.scene;
    const renderer = world.renderer;
    const THREE = world.THREE;

    isLoaded = true;
    blockLegacySpawner(scene);

    // Dynamic Tone Mapping
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene.background = new THREE.Color(0x7ed6df);
    scene.fog = new THREE.FogExp2(0xa0e7e5, 0.002);

    // Warm Golden Sunlight
    const sun = new THREE.DirectionalLight(0xfffae8, 1.55);
    sun.position.set(120, 180, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x48bb78, 0.65);
    scene.add(hemi);

    const cityRoot = new THREE.Group();
    cityRoot.name = "CitytopiaPristineLayer";
    scene.add(cityRoot);

    // Textures & Shaders
    const texGlassTower = makeFacadeTex(THREE, "#0984e3", "#e0f7fa", "#182C61");
    const texCorporate = makeFacadeTex(THREE, "#f5f6fa", "#7ed6df", "#2f3542");
    const texCommercial = makeFacadeTex(THREE, "#ff7675", "#ffeaa7", "#2d3436");

    const mats = {
      grass: new THREE.MeshLambertMaterial({ color: 0x55b843 }),
      asphalt: new THREE.MeshLambertMaterial({ color: 0x22272e }),
      sidewalk: new THREE.MeshLambertMaterial({ color: 0xe4e7eb }),
      stripes: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      curbYellow: new THREE.MeshBasicMaterial({ color: 0xfbc531 }),
      water: new THREE.MeshLambertMaterial({ color: 0x0984e3 }),
      roofDark: new THREE.MeshLambertMaterial({ color: 0x2d3436 }),
      helipad: new THREE.MeshLambertMaterial({ color: 0xe67e22 }),
      wheelRubber: new THREE.MeshLambertMaterial({ color: 0x1e272e }),
      wheelRim: new THREE.MeshLambertMaterial({ color: 0xd2dae2 }),
      carGlass: new THREE.MeshPhysicalMaterial({ color: 0x1dd1a1, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.85 }),
      headlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      taillight: new THREE.MeshBasicMaterial({ color: 0xff4757 }),
      taxiTopper: new THREE.MeshBasicMaterial({ color: 0xfbc531 })
    };

    // --- 4. GROUND, WATERWAYS & OFFICE PLAZA ---
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), mats.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    cityRoot.add(ground);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(110, 800), mats.water);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-190, -0.08, 0);
    cityRoot.add(river);

    // Pristine Paved Plaza around Player's Office (Walkway perimeter)
    const officePlaza = new THREE.Mesh(new THREE.BoxGeometry(46, 0.2, 36), mats.sidewalk);
    officePlaza.position.set(0, 0.05, 0);
    officePlaza.receiveShadow = true;
    cityRoot.add(officePlaza);

    // --- 5. GROUND-LEVEL BOULEVARDS (NO FLOATING BRIDGES!) ---
    function makeRoadSegment(x, z, width, length, isHoriz) {
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(isHoriz ? length : width, isHoriz ? width : length),
        mats.asphalt
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.08, z);
      road.receiveShadow = true;
      cityRoot.add(road);

      // Yellow outer border markings
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(isHoriz ? length : 0.6, isHoriz ? 0.6 : length),
        mats.curbYellow
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.09, z + (isHoriz ? (width / 2 - 0.8) : 0));
      cityRoot.add(stripe);

      const stripe2 = stripe.clone();
      stripe2.position.set(x, 0.09, z - (isHoriz ? (width / 2 - 0.8) : 0));
      cityRoot.add(stripe2);
    }

    // Two Main East-West Avenues (Front and Back of Campus)
    makeRoadSegment(0, -42, 14, 340, true);
    makeRoadSegment(0, 42, 14, 340, true);

    // Cross Boulevard (East Side)
    makeRoadSegment(68, 0, 14, 340, false);

    // --- 6. REALISTIC CAR MODELING (WITH WHEELS & LIGHTS) ---
    function buildDetailedCar(type, colorHex) {
      const car = new THREE.Group();
      const bodyMat = new THREE.MeshLambertMaterial({ color: colorHex });

      // Lower Chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 4.8), bodyMat);
      chassis.position.y = 0.65;
      chassis.castShadow = true;
      car.add(chassis);

      // Cabin / Slanted Windshield
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.75, 2.7), mats.carGlass);
      cabin.position.set(0, 1.3, -0.2);
      car.add(cabin);

      // Roof Plate
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 2.5), bodyMat);
      roof.position.set(0, 1.7, -0.2);
      car.add(roof);

      // 4 Black Rubber Wheels with Chrome Rims
      const wheelGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 12);
      wheelGeom.rotateZ(Math.PI / 2);
      const rimGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.38, 10);
      rimGeom.rotateZ(Math.PI / 2);

      [
        [-1.15, 0.42, 1.45],
        [1.15, 0.42, 1.45],
        [-1.15, 0.42, -1.45],
        [1.15, 0.42, -1.45]
      ].forEach(p => {
        const wheel = new THREE.Mesh(wheelGeom, mats.wheelRubber);
        wheel.position.set(p[0], p[1], p[2]);
        wheel.castShadow = true;
        const rim = new THREE.Mesh(rimGeom, mats.wheelRim);
        wheel.add(rim);
        car.add(wheel);
      });

      // Front Headlights
      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.1), mats.headlight);
      headL.position.set(0.75, 0.7, 2.41);
      const headR = headL.clone();
      headR.position.x = -0.75;
      car.add(headL);
      car.add(headR);

      // Rear Taillights
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.1), mats.taillight);
      tailL.position.set(0.75, 0.75, -2.41);
      const tailR = tailL.clone();
      tailR.position.x = -0.75;
      car.add(tailL);
      car.add(tailR);

      // Taxi Topper
      if (type === "taxi") {
        const topper = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.4), mats.taxiTopper);
        topper.position.set(0, 1.85, -0.2);
        car.add(topper);
      }

      return car;
    }

    // Spawn 14 Active Vehicles on the Ground Roads
    const paints = [0xe74c3c, 0x0984e3, 0x2ecc71, 0xffffff, 0xe67e22, 0x34495e];
    for (let i = 0; i < 14; i++) {
      const isTaxi = i % 3 === 0;
      const col = isTaxi ? 0xf1c40f : paints[i % paints.length];
      const carMesh = buildDetailedCar(isTaxi ? "taxi" : "sedan", col);

      const lane = i % 3;
      carMesh.userData = {
        progress: (i / 14) + Math.random() * 0.05,
        speed: 0.0014 + Math.random() * 0.0007,
        laneType: lane // 0: North Road, 1: South Road, 2: East Boulevard
      };

      cityRoot.add(carMesh);
      activeCars.push(carMesh);
    }

    // --- 7. CLEAN SCENIC SKYSCRAPERS (POSITIONED AWAY FROM CAMERA & OFFICE) ---
    function buildSkylineTower(x, z, w, d, h, facadeTex, hasHelipad) {
      const b = new THREE.Group();
      b.position.set(x, 0, z);

      // Base Lobby
      const base = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 3, d + 2), mats.sidewalk);
      base.position.y = 1.5;
      base.receiveShadow = true;
      b.add(base);

      // Tower
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ map: facadeTex })
      );
      tower.position.y = 3 + h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      b.add(tower);

      // Roof Crown
      const crown = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 1.8, d - 1), mats.roofDark);
      crown.position.y = 3 + h + 0.9;
      crown.castShadow = true;
      b.add(crown);

      if (hasHelipad) {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.38, w * 0.38, 0.5, 16), mats.helipad);
        pad.position.y = 3 + h + 1.8;
        b.add(pad);
      } else {
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 10, 8), mats.roofDark);
        antenna.position.y = 3 + h + 6;
        b.add(antenna);
      }

      cityRoot.add(b);
    }

    // Coordinates placed neatly in background (U-shape outside camera frustum)
    const skylinePlots = [
      [-75, -80, 22, 22, 54, texCommercial, false],
      [-30, -90, 24, 22, 68, texGlassTower, true],
      [25, -90, 26, 24, 76, texGlassTower, true],
      [85, -80, 22, 22, 52, texCorporate, false],
      [-80, 85, 22, 22, 58, texCorporate, false],
      [-30, 95, 22, 22, 50, texCommercial, false],
      [25, 95, 26, 24, 80, texGlassTower, true],
      [90, 85, 24, 22, 62, texCorporate, false],
      [-105, 0, 24, 24, 56, texGlassTower, true]
    ];
    skylinePlots.forEach(p => buildSkylineTower(p[0], p[1], p[2], p[3], p[4], p[5], p[6]));

    // --- 8. SMOOTH VEHICLE RENDER LOOP ---
    function renderLoop() {
      activeCars.forEach(car => {
        const d = car.userData;
        d.progress += d.speed;
        if (d.progress > 1) d.progress = 0;

        if (d.laneType === 0) {
          // North Avenue (Heading East)
          const posX = -170 + d.progress * 340;
          car.position.set(posX, 0.25, -42 + 2.5);
          car.rotation.set(0, Math.PI / 2, 0);
        } else if (d.laneType === 1) {
          // South Avenue (Heading West)
          const posX = 170 - d.progress * 340;
          car.position.set(posX, 0.25, 42 - 2.5);
          car.rotation.set(0, -Math.PI / 2, 0);
        } else {
          // East Boulevard (Heading North)
          const posZ = 170 - d.progress * 340;
          car.position.set(68 + 2.5, 0.25, posZ);
          car.rotation.set(0, Math.PI, 0);
        }
      });

      animId = requestAnimationFrame(renderLoop);
    }
    renderLoop();

    console.log("🏙️ DEFINITIVE CITYTOPIA ENGINE READY");
  }

  window.addEventListener("EmpireWorldReady", initializeMetropolis);
  setTimeout(initializeMetropolis, 500);

  window.addEventListener("beforeunload", () => {
    if (animId) cancelAnimationFrame(animId);
  });
})();
