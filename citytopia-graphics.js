(function () {
  "use strict";

  /* =========================================================
   * CITYTOPIA ULTRA GRAPHICS ENGINE (PBR TEXTURE ATLAS EDITION)
   * - Procedural Canvas Texture Atlas for High-Detail Facades
   * - Realistic Highway Crosswalks, Lanes, and Street Hardware
   * - Dynamic Skylines with Rooftop AC Units, Water Tanks & Antennas
   * - Realistic Vehicles with Chassis, Wheels, Headlights & Gloss
   * ========================================================= */

  let initialized = false;
  let animId = null;
  const activeVehicles = [];
  const sceneBadges = [];
  let highwayLoop = null;

  // --- PROCEDURAL TEXTURE GENERATORS ---
  function generateFacadeTexture(style) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Base Wall Tone
    ctx.fillStyle = style.wallColor;
    ctx.fillRect(0, 0, 512, 512);

    // Architectural Pillars
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let c = 0; c < 512; c += 64) {
      ctx.fillRect(c, 0, 10, 512);
    }

    // Windows with warm lights & blinds
    const rows = 12;
    const cols = 8;
    const padX = 14;
    const padY = 12;
    const winW = (512 - (cols + 1) * padX) / cols;
    const winH = (512 - (rows + 1) * padY) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padX + c * (winW + padX);
        const y = padY + r * (winH + padY);

        // Window Glass
        const lit = Math.random() > 0.45;
        ctx.fillStyle = lit ? style.windowLit : style.windowDark;
        ctx.fillRect(x, y, winW, winH);

        // Window Frame
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, winW, winH);

        // Interior Venetian Blinds
        if (Math.random() > 0.5) {
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.fillRect(x, y + 2, winW, winH * 0.35);
        }
      }
    }

    const tex = new window.EmpireWorld.THREE.CanvasTexture(canvas);
    tex.wrapS = window.EmpireWorld.THREE.RepeatWrapping;
    tex.wrapT = window.EmpireWorld.THREE.RepeatWrapping;
    return tex;
  }

  function generateRoadTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Smooth Dark Asphalt
    ctx.fillStyle = "#272a30";
    ctx.fillRect(0, 0, 512, 1024);

    // Sidewalk Curbs
    ctx.fillStyle = "#dfe4ea";
    ctx.fillRect(0, 0, 30, 1024);
    ctx.fillRect(482, 0, 30, 1024);

    // Yellow Outer Margins
    ctx.fillStyle = "#fbc531";
    ctx.fillRect(45, 0, 8, 1024);
    ctx.fillRect(459, 0, 8, 1024);

    // White Dashed Center Lanes
    ctx.fillStyle = "#ffffff";
    const dashH = 50;
    const gap = 40;
    for (let y = 10; y < 1024; y += dashH + gap) {
      ctx.fillRect(252, y, 8, dashH);
    }

    // Crosswalk at start
    for (let x = 60; x < 450; x += 38) {
      ctx.fillRect(x, 120, 22, 90);
    }

    const tex = new window.EmpireWorld.THREE.CanvasTexture(canvas);
    tex.wrapS = window.EmpireWorld.THREE.RepeatWrapping;
    tex.wrapT = window.EmpireWorld.THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }

  function purgeOldFlatBoxes(scene) {
    scene.traverse(function (node) {
      if (!node || !node.isMesh) return;
      if (
        node.name === "EmpireCityBuilding" ||
        node.name === "EmpireCentralPark" ||
        node.name === "EmpireCityGround" ||
        node.name === "EmpireCityRoad" ||
        node.name === "EmpireCitySidewalk"
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

  function initUltraCity() {
    if (initialized) return;
    if (!window.EmpireWorld || !window.EmpireWorld.scene || !window.EmpireWorld.THREE) {
      setTimeout(initUltraCity, 300);
      return;
    }

    const world = window.EmpireWorld;
    const scene = world.scene;
    const renderer = world.renderer;
    const THREE = world.THREE;

    initialized = true;
    purgeOldFlatBoxes(scene);

    // --- LIGHTING & TONE MAPPING ---
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene.background = new THREE.Color(0x70a1ff);
    scene.fog = new THREE.FogExp2(0xa1c4fd, 0.0025);

    const sun = new THREE.DirectionalLight(0xfffae8, 1.5);
    sun.position.set(130, 190, 110);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x55efc4, 0.65);
    scene.add(hemi);

    const rootGroup = new THREE.Group();
    rootGroup.name = "CitytopiaUltraRoot";
    scene.add(rootGroup);

    // --- TEXTURED MATERIALS ---
    const texOffice = generateFacadeTexture({
      wallColor: "#f1f2f6",
      windowLit: "#7ed6df",
      windowDark: "#222f3e"
    });

    const texCommercial = generateFacadeTexture({
      wallColor: "#ffbe76",
      windowLit: "#00d2d3",
      windowDark: "#1e272e"
    });

    const texGlassTower = generateFacadeTexture({
      wallColor: "#0984e3",
      windowLit: "#e0f7fa",
      windowDark: "#005b96"
    });

    const roadTex = generateRoadTexture();

    const mats = {
      asphaltTextured: new THREE.MeshLambertMaterial({ map: roadTex }),
      officeFacade: new THREE.MeshLambertMaterial({ map: texOffice }),
      commFacade: new THREE.MeshLambertMaterial({ map: texCommercial }),
      glassFacade: new THREE.MeshLambertMaterial({ map: texGlassTower }),
      concrete: new THREE.MeshLambertMaterial({ color: 0xdcdde1 }),
      roofMetal: new THREE.MeshLambertMaterial({ color: 0x2f3640 }),
      parkGrass: new THREE.MeshLambertMaterial({ color: 0x4cd137 }),
      ocean: new THREE.MeshLambertMaterial({ color: 0x00a8ff }),
      waterTankWood: new THREE.MeshLambertMaterial({ color: 0x8c7b75 }),
      glowHeadlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      glowTaillight: new THREE.MeshBasicMaterial({ color: 0xff3838 })
    };

    // --- GROUND & WATER ---
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), mats.parkGrass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    rootGroup.add(ground);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(100, 800), mats.ocean);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-200, -0.1, 0);
    rootGroup.add(river);

    // --- ARCHITECTURAL SKYSCRAPERS WITH HARDWARE ---
    function buildDetailedTower(x, z, w, d, h, facadeMat, hasHelipad) {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      // Concrete Base with Entrance Canopy
      const base = new THREE.Mesh(new THREE.BoxGeometry(w + 3, 3, d + 3), mats.concrete);
      base.position.y = 1.5;
      base.receiveShadow = true;
      tower.add(base);

      // Main Facade Structure (Textured)
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), facadeMat);
      mesh.position.y = 3 + h / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tower.add(mesh);

      // Roof Slab
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 1.8, d - 1), mats.roofMetal);
      roof.position.y = 3 + h + 0.9;
      roof.castShadow = true;
      tower.add(roof);

      // Rooftop Hardware (AC Chillers & Water Tanks)
      const acUnit = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 3), mats.concrete);
      acUnit.position.set(-w / 4, 3 + h + 2.5, -d / 4);
      tower.add(acUnit);

      const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 12), mats.waterTankWood);
      waterTank.position.set(w / 4, 3 + h + 3.2, d / 4);
      tower.add(waterTank);

      if (hasHelipad) {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.38, w * 0.38, 0.4, 16), mats.commFacade);
        pad.position.y = 3 + h + 1.8;
        tower.add(pad);
      } else {
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 10, 8), mats.roofMetal);
        spire.position.y = 3 + h + 6.5;
        tower.add(spire);
      }

      rootGroup.add(tower);
    }

    const cityLayout = [
      [-80, -90, 20, 20, 52, mats.commFacade, false],
      [-40, -100, 22, 20, 64, mats.glassFacade, true],
      [40, -100, 24, 20, 70, mats.glassFacade, true],
      [85, -85, 20, 20, 50, mats.officeFacade, false],
      [-85, 90, 22, 20, 58, mats.officeFacade, false],
      [-40, 100, 20, 20, 48, mats.commFacade, false],
      [40, 100, 24, 24, 75, mats.glassFacade, true],
      [90, 85, 20, 20, 60, mats.glassFacade, false],
      [-105, 0, 24, 24, 55, mats.officeFacade, false],
      [105, 0, 26, 24, 68, mats.glassFacade, true]
    ];
    cityLayout.forEach(b => buildDetailedTower(b[0], b[1], b[2], b[3], b[4], b[5], b[6]));

    // --- REALISTIC PERIMETER HIGHWAY OVERPASS ---
    highwayLoop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(80, 8, -170),
      new THREE.Vector3(90, 15, -60),
      new THREE.Vector3(85, 16, 60),
      new THREE.Vector3(55, 12, 150),
      new THREE.Vector3(15, 6, 190)
    ]);

    const shape = new THREE.Shape();
    shape.moveTo(-5, -0.6);
    shape.lineTo(5, -0.6);
    shape.lineTo(5.5, 0.6);
    shape.lineTo(-5.5, 0.6);
    shape.closePath();

    const overpassMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { steps: 100, bevelEnabled: false, extrudePath: highwayLoop }),
      mats.asphaltTextured
    );
    overpassMesh.castShadow = true;
    overpassMesh.receiveShadow = true;
    rootGroup.add(overpassMesh);

    // Overpass Pillars
    [0.1, 0.35, 0.65, 0.9].forEach(t => {
      const pt = highwayLoop.getPointAt(t);
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 17, 12), mats.concrete);
      pillar.position.set(pt.x, pt.y / 2, pt.z);
      pillar.castShadow = true;
      rootGroup.add(pillar);
    });

    // Outer Ground Avenue
    const groundAve = new THREE.Mesh(new THREE.PlaneGeometry(24, 450), mats.asphaltTextured);
    groundAve.rotation.x = -Math.PI / 2;
    groundAve.position.set(95, 0.05, 0);
    groundAve.receiveShadow = true;
    rootGroup.add(groundAve);

    // --- STYLIZED VEHICLES WITH WHEELS & LIGHTS ---
    const vehiclePalette = [0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71, 0xffffff, 0xe67e22];
    for (let i = 0; i < 18; i++) {
      const car = new THREE.Group();
      const col = vehiclePalette[i % vehiclePalette.length];
      const carMat = new THREE.MeshLambertMaterial({ color: col });

      // Body Chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 5), carMat);
      chassis.position.y = 0.85;
      chassis.castShadow = true;
      car.add(chassis);

      // Cabin Glass
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 2.6), mats.glassFacade);
      cabin.position.set(0, 1.7, -0.3);
      car.add(cabin);

      // Headlights & Tail Lights
      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), mats.glowHeadlight);
      headL.position.set(0.8, 0.85, 2.5);
      const headR = headL.clone();
      headR.position.x = -0.8;
      car.add(headL);
      car.add(headR);

      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.1), mats.glowTaillight);
      tailL.position.set(0.8, 0.9, -2.5);
      const tailR = tailL.clone();
      tailR.position.x = -0.8;
      car.add(tailL);
      car.add(tailR);

      const isFlyover = i % 2 === 0;
      car.userData = {
        isFlyover,
        progress: Math.random(),
        speed: 0.0011 + Math.random() * 0.0008,
        laneOffset: (Math.random() - 0.5) * 3
      };

      rootGroup.add(car);
      activeVehicles.push(car);
    }

    // --- REFINED FLOATING REWARD SPRITES ---
    function addFloatingBadge(txt, x, y, z, col) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "rgba(16, 22, 34, 0.92)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 236, 108, 54);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(58, 64, 32, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₹", 58, 66);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(txt, 145, 64);

      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(9, 4.5, 1);
      sprite.position.set(x, y, z);
      rootGroup.add(sprite);

      sceneBadges.push({ sprite, baseY: y, phase: Math.random() * Math.PI * 2 });
    }

    addFloatingBadge("+15K", 40, 78, -100, "#f1c40f");
    addFloatingBadge("Tier 2", 40, 82, 100, "#3498db");

    // --- ANIMATION TICK LOOP ---
    function onRenderTick() {
      if (Math.random() < 0.03) purgeOldFlatBoxes(scene);

      activeVehicles.forEach(c => {
        const u = c.userData;
        u.progress += u.speed;
        if (u.progress > 1) u.progress = 0;

        if (u.isFlyover && highwayLoop) {
          const pt = highwayLoop.getPointAt(u.progress);
          const tan = highwayLoop.getTangentAt(u.progress).normalize();
          c.position.copy(pt);
          c.position.y += 0.65;
          c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
        } else {
          const startZ = -200;
          const endZ = 200;
          c.position.set(95 + u.laneOffset, 0.55, startZ + u.progress * (endZ - startZ));
          c.rotation.set(0, 0, 0);
        }
      });

      const time = performance.now() * 0.003;
      sceneBadges.forEach(b => {
        b.sprite.position.y = b.baseY + Math.sin(time + b.phase) * 0.9;
      });

      animId = requestAnimationFrame(onRenderTick);
    }
    onRenderTick();

    console.log("🏙️ TEXTURED CITYTOPIA GRAPHICS ONLINE");
  }

  window.addEventListener("EmpireWorldReady", initUltraCity);
  setTimeout(initUltraCity, 1000);

  window.addEventListener("beforeunload", () => {
    if (animId) cancelAnimationFrame(animId);
  });
})();
