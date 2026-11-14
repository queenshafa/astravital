"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { A, LV, NAMES, SZ, buildInternals, fitModel, glowTexture, makeShellMaterial } from "@/lib/anatomy";

const MODEL_URL = "/models/human.glb";

export default function BodyViewer({ pain, sel, layers, auto, onPick, viewReq }) {
  const mount = useRef(null), tip = useRef(null), live = useRef({});
  const [loading, setLoading] = useState(true);
  Object.assign(live.current, { pain, sel, layers, auto, onPick });
  useEffect(() => { if (viewReq) live.current.target = viewReq.a; }, [viewReq]);

  useEffect(() => {
    const el = mount.current;
    let disposed = false, raf;
    THREE.ColorManagement.enabled = false; // keep colours exactly as written

    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    const rd = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rd.outputColorSpace = THREE.LinearSRGBColorSpace;
    rd.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(rd.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2.5));
    const dl = new THREE.DirectionalLight(0xffffff, 2.4); dl.position.set(2, 4, 4); scene.add(dl);

    const I = buildInternals(); scene.add(I.bones, I.vessels, I.organs);
    const holder = new THREE.Group(); scene.add(holder);
    const hit = [];
    new GLTFLoader().load(MODEL_URL, (gltf) => {
      if (disposed) return;
      const shell = makeShellMaterial();
      gltf.scene.traverse((o) => { if (o.isMesh) { o.material = shell; o.renderOrder = 5; hit.push(o); } });
      holder.add(fitModel(gltf.scene));
      setLoading(false);
    }, undefined, (err) => { console.error(err); setLoading(false); });

    // soft floor shadow
    const sc = document.createElement("canvas"); sc.width = sc.height = 128;
    const sx = sc.getContext("2d"), sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sg.addColorStop(0, "rgba(0,0,0,.35)"); sg.addColorStop(1, "rgba(0,0,0,0)"); sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.002; scene.add(floor);

    const tex = glowTexture(), glows = {};
    const mkGlow = (col) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: col, transparent: true, depthTest: false, depthWrite: false })); s.renderOrder = 20; scene.add(s); return s; };
    const hov = mkGlow("#2f9bff");

    let rotY = 0.35, rotX = 0.05, dist = 4.5, drag = false, lx = 0, ly = 0, mv = 0, hover = null;
    const cv = rd.domElement, ray = new THREE.Raycaster(), p = new THREE.Vector2();
    const region = (pt) => { let b = null, bd = 9; Object.keys(A).forEach((id) => { const a = A[id], d = Math.hypot(a[0] - pt.x, (a[1] - pt.y) * 0.9, (a[2] - pt.z) * 0.5); if (d < bd) { bd = d; b = id; } }); return b; };
    const pick = (e) => { const r = cv.getBoundingClientRect(); p.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(p, cam); const h = ray.intersectObjects(hit, false); return h.length ? region(h[0].point) : null; };
    const down = (e) => { drag = true; mv = 0; lx = e.clientX; ly = e.clientY; live.current.target = null; cv.setPointerCapture(e.pointerId); };
    const move = (e) => {
      if (drag) { rotY -= (e.clientX - lx) * 0.01; rotX = Math.max(-0.4, Math.min(0.8, rotX + (e.clientY - ly) * 0.004)); mv += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly); lx = e.clientX; ly = e.clientY; }
      else {
        const now = performance.now();
        if (now - (live.current.lt || 0) > 50) { live.current.lt = now; hover = pick(e); }
        cv.style.cursor = hover ? "pointer" : "grab";
        const r = el.getBoundingClientRect(), t = tip.current;
        if (hover) { t.style.display = "block"; t.textContent = NAMES[hover]; t.style.left = e.clientX - r.left + "px"; t.style.top = e.clientY - r.top + "px"; } else t.style.display = "none";
      }
    };
    const up = (e) => { drag = false; if (mv < 6) { const id = pick(e); if (id) live.current.onPick(id); } };
    const wheel = (e) => { e.preventDefault(); dist = Math.max(1.8, Math.min(7, dist + e.deltaY * 0.004)); };
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up);
    cv.addEventListener("wheel", wheel, { passive: false });
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; rd.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);

    const clk = new THREE.Clock(); let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = clk.getDelta(); t += dt;
      const { pain, sel, layers, auto, target } = live.current;
      if (target != null) { const d = Math.atan2(Math.sin(target - rotY), Math.cos(target - rotY)); rotY += d * 0.12; if (Math.abs(d) < 0.01) live.current.target = null; }
      else if (auto && !drag && !hover) rotY += dt * 0.18;
      holder.visible = layers.skin; I.bones.visible = layers.bones; I.vessels.visible = layers.vessels; I.organs.visible = layers.organs;
      const beat = Math.pow(Math.max(0, Math.sin(t * 5)), 6) * 0.1; I.heart.scale.set(1 + beat, 1.2 + beat, 0.9 + beat);
      const br = 1 + Math.sin(t * 1.5) * 0.02; I.lungs.scale.set(br, br, br);
      Object.keys(glows).forEach((id) => { if (!pain[id]) { scene.remove(glows[id]); glows[id].material.dispose(); delete glows[id]; } });
      Object.keys(pain).forEach((id) => {
        if (!glows[id]) { glows[id] = mkGlow("#ff8a1f"); glows[id].position.set(...A[id]); }
        const g = glows[id], k = id.split("_")[0], pulse = 0.5 + 0.5 * Math.sin(t * (sel === id ? 6 : 3));
        g.material.color.set(LV[pain[id]].c);
        g.scale.setScalar((SZ[k] || 0.25) * (0.9 + 0.2 * pulse) * (sel === id ? 1.2 : 1));
        g.material.opacity = 0.65 + 0.3 * pulse;
      });
      hov.visible = !!hover && !pain[hover];
      if (hover) { hov.position.set(...A[hover]); hov.scale.setScalar((SZ[hover.split("_")[0]] || 0.25) * 0.9); hov.material.opacity = 0.45; }
      cam.position.set(Math.sin(rotY) * Math.cos(rotX) * dist, 0.95 + Math.sin(rotX) * dist, Math.cos(rotY) * Math.cos(rotX) * dist);
      cam.lookAt(0, 0.92, 0);
      rd.render(scene, cam);
    };
    loop();

    return () => {
      disposed = true; cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cv.removeEventListener("wheel", wheel);
      if (cv.parentNode === el) el.removeChild(cv);
      rd.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div ref={mount} className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:touch-none" />
      <div
        ref={tip}
        style={{ display: "none" }}
        className="pointer-events-none absolute z-[3] -translate-y-[30px] translate-x-[14px] whitespace-nowrap rounded-lg border border-line bg-base/90 px-2.5 py-1 text-xs"
      />
      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-white/50">Loading 3D model…</div>
      )}
    </div>
  );
}
