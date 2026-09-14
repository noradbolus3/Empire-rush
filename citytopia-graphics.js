(function () {
  "use strict";

  /* =========================================================
   * CITYTOPIA GRAPHICS OVERLAY V2 (CLEANER & POLISHER)
   * - Hides old flat grey buildings automatically
   * - Keeps office, employees & gameplay logic 100% intact
   * - Places compact floating badges away from camera
   * - Adds vibrant skyscrapers, overpass, and highway traffic
   * ========================================================= */

  let initialized = false;
  let animId = null;
  const overlayCars = [];
  const floatingBadges = [];
  let flyoverCurve = null;

  function cleanupOldGreyBuildings(scene) {
    // Old world3d.js creates plain grey boxes named EmpireCityBuilding & EmpireCityRoad
    scene.traverse(function (obj) {
      if (!obj || !obj.name) return;
      if (
        obj.name === "EmpireCityBuilding" ||
        obj.name === "EmpireCentralPark" ||
        obj.name === "EmpireCityGround"
      ) {
        obj.visible = false;
      }
    });
  }

  function injectCitytopiaVisuals() {
    if (initialized) return;
    if (!window.EmpireWorld || !window.EmpireWorld.scene || !window.EmpireWorld.THREE) {
      setTimeout(injectCitytopiaVisuals, 300);
      return;
    }

    const world = window.EmpireWorld;
    const scene = world.scene;
    const renderer = world.renderer;
    const THREE = world.THREE;

    initialized = true;

    // 1. Clean old grey backdrop
    cleanupOldGreyBuildings(scene);

    // 2. Lighting & Tonemapping (Vibrant mobile game style)
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene.background = new THREE.Color(0x7ed6df);
    scene.fog = new THREE.FogExp2(0xa0e7e5, 0.003);

    const sun = new THREE.DirectionalLight(0xfffae0, 1.4);
    sun.position.set(120, 160, 90);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x48bb78, 0.65);
    scene.add(hemi);

    // 3. Materials
    const palette = {
      asphalt: new THREE.MeshLambertMaterial({ color: 0x2c3437 }),
      concrete: new THREE.MeshLambertMaterial({ color: 0xecf0f1 }),
      glassCyan: new THREE.MeshPhysicalMaterial({ color: 0x00cec9, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.85 }),
      towerBlue: new THREE.MeshPhysicalMaterial({ color: 0x0984e3, roughness: 0.2, metalness: 0.35 }),
      towerWhite: new THREE.MeshLambertMaterial({ color: 0xffffff }),
      towerOrange: new THREE.MeshLambertMaterial({ color: 0xff7675 }),
      towerYellow: new THREE.MeshLambertMaterial({ color: 0xfdcb6e }),
      roofDark: new THREE.MeshLambertMaterial({ color: 0x2d3436 }),
      grass: new THREE.MeshLambertMaterial({ color: 0x55b843 }),
      water: new THREE.MeshLambertMaterial({ color: 0x0984e3 })
    };

    const visualRoot = new THREE.Group();
    visualRoot.name = "CitytopiaEnhancedLayer";
    scene.add(visualRoot);

    // 4. Ground Turf & Water Bay
    const baseGround = new THREE.Mesh(new THREE.PlaneGeometry(650, 650), palette.grass);
    baseGround.rotation.x = -Math.PI / 2;
    baseGround.position.y = -0.15;
    baseGround.receiveShadow = true;
    visualRoot.add(baseGround);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(80, 650), palette.water);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-160, -0.05, 0);
    visualRoot.add(river);

    // 5. Stylized High-Rise Skylines (Arranged outside the office footprint)
    function addSkyscraper(x, z, w, d, h, wallMat, helipad) {
      const b = new THREE.Group();
      b.position.set(x, 0, z);

      const base = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 2.5, d + 2), palette.concrete);
      base.position.y = 1.25;
      base.receiveShadow = true;
      b.add(base);

      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      tower.position.y = 2.5 + h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      b.add(tower);

      const floors = Math.floor(h / 4.5);
      for (let i = 1; i < floors; i++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 1.2, d + 0.2), palette.glassCyan);
        stripe.position.y = 2.5 + i * 4.5;
        b.add(stripe);
      }

      const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 1.5, d - 1), palette.roofDark);
      roof.position.y = 2.5 + h + 0.75;
      b.add(roof);

      if (helipad) {
        const heli = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.35, 0.4, 16), palette.towerOrange);
        heli.position.y = 2.5 + h + 1.6;
        b.add(heli);
      } else {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 8, 8), palette.roofDark);
        mast.position.y = 2.5 + h + 4.5;
        b.add(mast);
      }

      visualRoot.add(b);
    }

    // Outer City Skyline Coordinates
    const skyscrapers = [
      [-70, -75, 18, 18, 42, palette.towerYellow, false],
      [-35, -80, 20, 18, 54, palette.towerWhite, true],
      [35, -80, 22, 18, 58, palette.towerBlue, true],
      [75, -70, 18, 18, 45, palette.towerOrange, false],
      [-75, 75, 20, 18, 48, palette.towerWhite, false],
      [-35, 80, 18, 18, 38, palette.towerYellow, false],
      [35, 80, 22, 22, 62, palette.towerBlue, true],
      [78, 70, 18, 18, 50, palette.towerWhite, false],
      [-85, 0, 20, 20, 44, palette.towerOrange, false],
      [85, 0, 24, 22, 56, palette.towerWhite, true]
    ];
    skyscrapers.forEach(s => addSkyscraper(s[0], s[1], s[2], s[3], s[4], s[5], s[6]));

    // 6. Overpass Highway (Smooth curved flyover outside the office)
    flyoverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(55, 7, -130),
      new THREE.Vector3(55, 13, -50),
      new THREE.Vector3(20, 14, 0),
      new THREE.Vector3(-32, 11, 60),
      new THREE.Vector3(-32, 6, 130)
    ]);

    const bridgeShape = new THREE.Shape();
    bridgeShape.moveTo(-4.5, -0.6);
    bridgeShape.lineTo(4.5, -0.6);
    bridgeShape.lineTo(5, 0.6);
    bridgeShape.lineTo(-5, 0.6);
    bridgeShape.closePath();

    const bridgeGeom = new THREE.ExtrudeGeometry(bridgeShape, { steps: 80, bevelEnabled: false, extrudePath: flyoverCurve });
    const bridgeMesh = new THREE.Mesh(bridgeGeom, palette.asphalt);
    bridgeMesh.castShadow = true;
    bridgeMesh.receiveShadow = true;
    visualRoot.add(bridgeMesh);

    // Support Pillars
    const pilGeom = new THREE.CylinderGeometry(1.2, 1.2, 14, 12);
    [-80, -20, 25, 85].forEach(pos => {
      const u = (pos + 130) / 260;
      const pt = flyoverCurve.getPointAt(Math.max(0, Math.min(1, u)));
      const pil = new THREE.Mesh(pilGeom, palette.concrete);
      pil.position.set(pt.x, pt.y / 2, pt.z);
      pil.castShadow = true;
      visualRoot.add(pil);
    });

    // 7. Dynamic Moving Vehicles
    const carColors = [0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71, 0xffffff, 0xe67e22];
    for (let i = 0; i < 18; i++) {
      const car = new THREE.Group();
      const col = carColors[i % carColors.length];
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1, 4.4), new THREE.MeshLambertMaterial({ color: col }));
      body.position.y = 0.75;
      body.castShadow = true;
      car.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 2.2), palette.glassCyan);
      cabin.position.set(0, 1.5, -0.2);
      car.add(cabin);

      const isFlyover = i % 2 === 0;
      car.userData = {
        isFlyover,
        progress: Math.random(),
        speed: 0.0013 + Math.random() * 0.0008,
        laneZ: i % 4 === 0 ? -42 : 42,
        laneOffset: (Math.random() - 0.5) * 4
      };

      visualRoot.add(car);
      overlayCars.push(car);
    }

    // 8. Compact Floating Badges (Properly scaled & positioned)
    function createCompactBadge(txt, x, y, z, bgCol) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "rgba(18, 24, 38, 0.88)";
      ctx.beginPath();
      ctx.roundRect(12, 12, 232, 104, 52);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(58, 64, 32, 0, Math.PI * 2);
      ctx.fillStyle = bgCol;
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₹", 58, 66);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px -apple-system, Arial, sans-serif";
      ctx.fillText(txt, 142, 64);

      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true }));
      // Scaled down from 16 to 8 so it looks neat
      sprite.scale.set(8.5, 4.25, 1);
      sprite.position.set(x, y, z);
      visualRoot.add(sprite);

      floatingBadges.push({ sprite, baseY: y, phase: Math.random() * Math.PI * 2 });
    }

    // Placed higher up and outside the center camera line
    createCompactBadge("+2.8K", 0, 16, 0, "#2ecc71");
    createCompactBadge("+15K", 35, 38, -80, "#f1c40f");
    createCompactBadge("Tier 2", 35, 42, 80, "#3498db");

    // 9. Frame Animation Loop
    function onVisualTick() {
      // Periodic sweep to ensure old grey buildings stay hidden
      if (Math.random() < 0.02) cleanupOldGreyBuildings(scene);

      overlayCars.forEach(c => {
        const u = c.userData;
        u.progress += u.speed;
        if (u.progress > 1) u.progress = 0;

        if (u.isFlyover && flyoverCurve) {
          const pt = flyoverCurve.getPointAt(u.progress);
          const tan = flyoverCurve.getTangentAt(u.progress).normalize();
          c.position.copy(pt);
          c.position.y += 0.6;
          c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
        } else {
          const startX = -140;
          const endX = 140;
          c.position.set(startX + u.progress * (endX - startX), 0.5, u.laneZ + u.laneOffset);
          c.rotation.set(0, Math.PI / 2, 0);
        }
      });

      const time = performance.now() * 0.003;
      floatingBadges.forEach(b => {
        b.sprite.position.y = b.baseY + Math.sin(time + b.phase) * 0.8;
      });

      animId = requestAnimationFrame(onVisualTick);
    }
    onVisualTick();

    console.log("🏙️ CITYTOPIA ENHANCED VISUAL LAYER ACTIVE");
  }

  window.addEventListener("EmpireWorldReady", injectCitytopiaVisuals);
  setTimeout(injectCitytopiaVisuals, 1000);

  window.addEventListener("beforeunload", () => {
    if (animId) cancelAnimationFrame(animId);
  });
})();
