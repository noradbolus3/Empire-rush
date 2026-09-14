(function () {
  "use strict";

  /* =========================================================
   * CITYTOPIA REALISTIC URBAN ENGINE (PERIMETER BYPASS EDITION)
   * - Flyover moved to distant outer ring (Zero building clipping)
   * - Hides old flat grey buildings completely
   * - Office HQ remains 100% open & unobstructed
   * - Realistic skyline with vibrant towers & distant flowing traffic
   * ========================================================= */

  let initialized = false;
  let animId = null;
  const highwayCars = [];
  const skyBadges = [];
  let outerFlyoverCurve = null;

  function purgeOldGreyBackdrop(scene) {
    scene.traverse(function (obj) {
      if (!obj || !obj.isMesh) return;
      // Target the dull grey procedural boxes from original generator
      if (
        obj.name === "EmpireCityBuilding" ||
        obj.name === "EmpireCentralPark" ||
        obj.name === "EmpireCityGround"
      ) {
        obj.visible = false;
      }
      // If any mesh has the old washed-out grey material color (0x9ca7ae)
      if (obj.material && obj.material.color) {
        const hex = obj.material.color.getHex();
        if (hex === 0x9ca7ae || hex === 0x71806d) {
          obj.visible = false;
        }
      }
    });
  }

  function initCityVisuals() {
    if (initialized) return;
    if (!window.EmpireWorld || !window.EmpireWorld.scene || !window.EmpireWorld.THREE) {
      setTimeout(initCityVisuals, 300);
      return;
    }

    const world = window.EmpireWorld;
    const scene = world.scene;
    const renderer = world.renderer;
    const THREE = world.THREE;

    initialized = true;

    // 1. Clean existing dull elements
    purgeOldGreyBackdrop(scene);

    // 2. High-Saturation Lighting Setup
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene.background = new THREE.Color(0x7ed6df);
    scene.fog = new THREE.FogExp2(0xa0e7e5, 0.0028);

    const sun = new THREE.DirectionalLight(0xfffae0, 1.45);
    sun.position.set(130, 180, 110);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x48bb78, 0.65);
    scene.add(ambient);

    // 3. Vibrant Citytopia Materials Palette
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
    visualRoot.name = "CitytopiaOuterLayer";
    scene.add(visualRoot);

    // 4. Ground Turf & Distant Coastline
    const grassPlate = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), palette.grass);
    grassPlate.rotation.x = -Math.PI / 2;
    grassPlate.position.y = -0.15;
    grassPlate.receiveShadow = true;
    visualRoot.add(grassPlate);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(90, 700), palette.water);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-180, -0.05, 0);
    visualRoot.add(river);

    // 5. Stylized Skylines (Only in far background; office radius > 55)
    function buildSkyscraper(x, z, w, d, h, wallMat, helipad) {
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

    // Positions placed strictly outside the central playable zone
    const skyscrapers = [
      [-75, -85, 18, 18, 45, palette.towerYellow, false],
      [-35, -95, 20, 18, 56, palette.towerWhite, true],
      [35, -95, 22, 18, 60, palette.towerBlue, true],
      [80, -80, 18, 18, 48, palette.towerOrange, false],
      [-80, 85, 20, 18, 50, palette.towerWhite, false],
      [-35, 95, 18, 18, 42, palette.towerYellow, false],
      [35, 95, 22, 22, 65, palette.towerBlue, true],
      [85, 80, 18, 18, 52, palette.towerWhite, false],
      [-95, 0, 22, 22, 48, palette.towerOrange, false],
      [95, 0, 24, 22, 58, palette.towerWhite, true]
    ];
    skyscrapers.forEach(s => buildSkyscraper(s[0], s[1], s[2], s[3], s[4], s[5], s[6]));

    // 6. Realistic Outer Flyover Ring (Far behind the office, not on top)
    outerFlyoverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(75, 8, -160),
      new THREE.Vector3(80, 14, -60),
      new THREE.Vector3(75, 15, 60),
      new THREE.Vector3(50, 11, 140),
      new THREE.Vector3(10, 6, 180)
    ]);

    const bridgeShape = new THREE.Shape();
    bridgeShape.moveTo(-4.5, -0.6);
    bridgeShape.lineTo(4.5, -0.6);
    bridgeShape.lineTo(5, 0.6);
    bridgeShape.lineTo(-5, 0.6);
    bridgeShape.closePath();

    const bridgeGeom = new THREE.ExtrudeGeometry(bridgeShape, { steps: 90, bevelEnabled: false, extrudePath: outerFlyoverCurve });
    const bridgeMesh = new THREE.Mesh(bridgeGeom, palette.asphalt);
    bridgeMesh.castShadow = true;
    bridgeMesh.receiveShadow = true;
    visualRoot.add(bridgeMesh);

    // Support Pillars for outer flyover
    const pilGeom = new THREE.CylinderGeometry(1.2, 1.2, 16, 12);
    [0.1, 0.35, 0.65, 0.9].forEach(t => {
      const pt = outerFlyoverCurve.getPointAt(t);
      const pil = new THREE.Mesh(pilGeom, palette.concrete);
      pil.position.set(pt.x, pt.y / 2, pt.z);
      pil.castShadow = true;
      visualRoot.add(pil);
    });

    // Distant Ground Highway Avenue
    const groundHighway = new THREE.Mesh(new THREE.PlaneGeometry(16, 400), palette.asphalt);
    groundHighway.rotation.x = -Math.PI / 2;
    groundHighway.position.set(85, 0.05, 0);
    groundHighway.receiveShadow = true;
    visualRoot.add(groundHighway);

    // 7. Dynamic Moving Highway Vehicles
    const carColors = [0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71, 0xffffff, 0xe67e22];
    for (let i = 0; i < 16; i++) {
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
        speed: 0.0012 + Math.random() * 0.0008,
        laneOffset: (Math.random() - 0.5) * 3
      };

      visualRoot.add(car);
      highwayCars.push(car);
    }

    // 8. Distant Bobbing Tycoon Sprites (Placed on skyline towers)
    function addSkylineBadge(txt, x, y, z, bgCol) {
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
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(10, 5, 1);
      sprite.position.set(x, y, z);
      visualRoot.add(sprite);

      skyBadges.push({ sprite, baseY: y, phase: Math.random() * Math.PI * 2 });
    }

    // Placed high atop distant skyscrapers
    addSkylineBadge("+15K", 35, 66, -95, "#f1c40f");
    addSkylineBadge("Tier 2", 35, 72, 95, "#3498db");

    // 9. Render Loop
    function onTick() {
      // Periodically remove old dull meshes if dynamically recreated
      if (Math.random() < 0.03) purgeOldGreyBackdrop(scene);

      highwayCars.forEach(c => {
        const u = c.userData;
        u.progress += u.speed;
        if (u.progress > 1) u.progress = 0;

        if (u.isFlyover && outerFlyoverCurve) {
          const pt = outerFlyoverCurve.getPointAt(u.progress);
          const tan = outerFlyoverCurve.getTangentAt(u.progress).normalize();
          c.position.copy(pt);
          c.position.y += 0.6;
          c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
        } else {
          // Distant Highway Straight Lane
          const startZ = -180;
          const endZ = 180;
          c.position.set(85 + u.laneOffset, 0.5, startZ + u.progress * (endZ - startZ));
          c.rotation.set(0, 0, 0);
        }
      });

      const time = performance.now() * 0.003;
      skyBadges.forEach(b => {
        b.sprite.position.y = b.baseY + Math.sin(time + b.phase) * 0.8;
      });

      animId = requestAnimationFrame(onTick);
    }
    onTick();

    console.log("🏙️ REALISTIC OUTER CITYTOPIA GRID ENGAGED");
  }

  window.addEventListener("EmpireWorldReady", initCityVisuals);
  setTimeout(initCityVisuals, 1000);

  window.addEventListener("beforeunload", () => {
    if (animId) cancelAnimationFrame(animId);
  });
})();
