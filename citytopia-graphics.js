(function () {
  "use strict";

  /* =========================================================
   * CITYTOPIA GRAPHICS INJECTOR (MODULAR OVERLAY)
   * Injects:
   * - ACES Filmic Tone Mapping & High Vibrancy Lighting
   * - Elevated Overpass Flyover Bridge & Curving Ramps
   * - Procedural Vibrant Skyscrapers with Helipads & Glass Strips
   * - Dynamic Highway Traffic (Cars, Taxis, Vans)
   * - Floating 3D Reward Badges
   * Does NOT overwrite any existing employee or business logic.
   * ========================================================= */

  let graphicsInitialized = false;
  let animId = null;
  const overlayCars = [];
  const floatingBadges = [];
  let flyoverPath = null;

  function injectVisualEngine() {
    if (graphicsInitialized) return;
    if (!window.EmpireWorld || !window.EmpireWorld.scene || !window.EmpireWorld.THREE) {
      setTimeout(injectVisualEngine, 400);
      return;
    }

    const world = window.EmpireWorld;
    const scene = world.scene;
    const renderer = world.renderer;
    const THREE = world.THREE;

    graphicsInitialized = true;

    // --- 1. LIGHTING & TONE MAPPING UPGRADE ---
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene.background = new THREE.Color(0x68c9f2);
    scene.fog = new THREE.FogExp2(0x8ae4e0, 0.0032);

    const sun = new THREE.DirectionalLight(0xfffae0, 1.4);
    sun.position.set(110, 160, 90);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 400;
    const d = 130;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x3d7045, 0.7);
    scene.add(ambient);

    // --- 2. MATERIAL PALETTE ---
    const mats = {
      asphalt: new THREE.MeshLambertMaterial({ color: 0x2c3437 }),
      concrete: new THREE.MeshLambertMaterial({ color: 0xdfe6e9 }),
      glassCyan: new THREE.MeshPhysicalMaterial({ color: 0x00cec9, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.85 }),
      towerBlue: new THREE.MeshPhysicalMaterial({ color: 0x0984e3, roughness: 0.2, metalness: 0.4 }),
      towerWhite: new THREE.MeshLambertMaterial({ color: 0xf5f6fa }),
      towerOrange: new THREE.MeshLambertMaterial({ color: 0xff6b4a }),
      towerYellow: new THREE.MeshLambertMaterial({ color: 0xfeca57 }),
      roofDark: new THREE.MeshLambertMaterial({ color: 0x222f3e }),
      grass: new THREE.MeshLambertMaterial({ color: 0x44bd32 }),
      water: new THREE.MeshLambertMaterial({ color: 0x0097e6 }),
      treeWood: new THREE.MeshLambertMaterial({ color: 0x795548 }),
      treeFoliage: new THREE.MeshLambertMaterial({ color: 0x26de81 })
    };

    const visualRoot = new THREE.Group();
    visualRoot.name = "CitytopiaVisualRoot";
    scene.add(visualRoot);

    // --- 3. GROUND EXPANSION & RIVER ---
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mats.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    visualRoot.add(ground);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(70, 600), mats.water);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-145, -0.1, 0);
    visualRoot.add(river);

    // --- 4. PROCEDURAL HIGH-RISE BUILDINGS ---
    function buildSkyscraper(x, z, w, d, h, wallMat, helipad) {
      const b = new THREE.Group();
      b.position.set(x, 0, z);

      const base = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 2.5, d + 2), mats.concrete);
      base.position.y = 1.25;
      base.receiveShadow = true;
      b.add(base);

      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      tower.position.y = 2.5 + h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      b.add(tower);

      const floors = Math.floor(h / 4);
      for (let i = 1; i < floors; i++) {
        const ribbon = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 1.2, d + 0.2), mats.glassCyan);
        ribbon.position.y = 2.5 + i * 4;
        b.add(ribbon);
      }

      const roof = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 1.5, d - 1), mats.roofDark);
      roof.position.y = 2.5 + h + 0.75;
      b.add(roof);

      if (helipad) {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.35, 0.4, 16), mats.towerOrange);
        pad.position.y = 2.5 + h + 1.6;
        b.add(pad);
      } else {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 9, 8), mats.roofDark);
        mast.position.y = 2.5 + h + 5;
        b.add(mast);
      }

      visualRoot.add(b);
    }

    const towers = [
      [-65, -60, 16, 16, 36, mats.towerYellow, false],
      [-35, -65, 18, 18, 50, mats.towerWhite, true],
      [32, -65, 20, 16, 54, mats.towerBlue, true],
      [68, -55, 16, 16, 40, mats.towerOrange, false],
      [-65, 60, 18, 16, 42, mats.towerWhite, false],
      [-30, 65, 16, 16, 35, mats.towerYellow, false],
      [30, 65, 20, 20, 58, mats.towerBlue, true],
      [70, 60, 18, 18, 46, mats.towerWhite, false],
      [-80, 0, 18, 18, 38, mats.towerOrange, false],
      [80, 0, 22, 20, 52, mats.towerWhite, true]
    ];
    towers.forEach(t => buildSkyscraper(t[0], t[1], t[2], t[3], t[4], t[5], t[6]));

    // --- 5. ELEVATED FLYOVER HIGHWAY ---
    flyoverPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(50, 6, -130),
      new THREE.Vector3(50, 12, -45),
      new THREE.Vector3(18, 13, 0),
      new THREE.Vector3(-28, 10, 55),
      new THREE.Vector3(-28, 5, 130)
    ]);

    const shape = new THREE.Shape();
    shape.moveTo(-4.5, -0.6);
    shape.lineTo(4.5, -0.6);
    shape.lineTo(5, 0.6);
    shape.lineTo(-5, 0.6);
    shape.closePath();

    const bridgeGeom = new THREE.ExtrudeGeometry(shape, { steps: 80, bevelEnabled: false, extrudePath: flyoverPath });
    const bridge = new THREE.Mesh(bridgeGeom, mats.asphalt);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    visualRoot.add(bridge);

    const pillarGeom = new THREE.CylinderGeometry(1.2, 1.2, 14, 12);
    [-80, -20, 25, 85].forEach(pos => {
      const u = (pos + 130) / 260;
      const pt = flyoverPath.getPointAt(Math.max(0, Math.min(1, u)));
      const pil = new THREE.Mesh(pillarGeom, mats.concrete);
      pil.position.set(pt.x, pt.y / 2, pt.z);
      pil.castShadow = true;
      visualRoot.add(pil);
    });

    // Ground High-Speed Arterial Roads
    [-34, 34].forEach(z => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(300, 14), mats.asphalt);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.04, z);
      road.receiveShadow = true;
      visualRoot.add(road);
    });

    // --- 6. DYNAMIC TRAFFIC ---
    const colors = [0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71, 0xffffff, 0xe67e22];
    for (let i = 0; i < 20; i++) {
      const car = new THREE.Group();
      const bodyMat = new THREE.MeshLambertMaterial({ color: colors[i % colors.length] });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1, 4.4), bodyMat);
      body.position.y = 0.75;
      body.castShadow = true;
      car.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 2.2), mats.glassCyan);
      cabin.position.set(0, 1.5, -0.2);
      car.add(cabin);

      const isFlyover = i % 2 === 0;
      car.userData = {
        isFlyover,
        progress: Math.random(),
        speed: 0.0012 + Math.random() * 0.0009,
        laneZ: i % 4 === 0 ? -34 : 34,
        laneOffset: (Math.random() - 0.5) * 4
      };

      visualRoot.add(car);
      overlayCars.push(car);
    }

    // --- 7. FLOATING REWARD BADGES ---
    function createBadge(txt, x, y, z, col) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "rgba(18, 24, 38, 0.9)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 236, 108, 54);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(58, 64, 34, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₹", 58, 66);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(txt, 145, 64);

      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(15, 7.5, 1);
      sprite.position.set(x, y, z);
      visualRoot.add(sprite);

      floatingBadges.push({ sprite, baseY: y, phase: Math.random() * Math.PI * 2 });
    }

    createBadge("+2.8K", 0, 20, 0, "#2ecc71");
    createBadge("+15K", 32, 52, -65, "#f1c40f");
    createBadge("Tier 2", 30, 56, 65, "#3498db");

    // --- 8. ANIMATION LOOP ---
    function renderVisuals() {
      overlayCars.forEach(c => {
        const u = c.userData;
        u.progress += u.speed;
        if (u.progress > 1) u.progress = 0;

        if (u.isFlyover && flyoverPath) {
          const pt = flyoverPath.getPointAt(u.progress);
          const tan = flyoverPath.getTangentAt(u.progress).normalize();
          c.position.copy(pt);
          c.position.y += 0.6;
          c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
        } else {
          const startX = -130;
          const endX = 130;
          c.position.set(startX + u.progress * (endX - startX), 0.5, u.laneZ + u.laneOffset);
          c.rotation.set(0, Math.PI / 2, 0);
        }
      });

      const time = performance.now() * 0.003;
      floatingBadges.forEach(b => {
        b.sprite.position.y = b.baseY + Math.sin(time + b.phase) * 1.4;
      });

      animId = requestAnimationFrame(renderVisuals);
    }
    renderVisuals();

    console.log("🏙️ CITYTOPIA GRAPHICS MODULE INJECTED SUCCESSFULLY");
  }

  window.addEventListener("EmpireWorldReady", injectVisualEngine);
  setTimeout(injectVisualEngine, 1000);

  window.addEventListener("beforeunload", () => {
    if (animId) cancelAnimationFrame(animId);
  });
})();
