import * as THREE from "three";

// ---------- data ----------
export const LV = [
  null,
  { n: "Ringan", c: "#ffc21a" },
  { n: "Sedang", c: "#ff8a1f" },
  { n: "Berat", c: "#ff3d1f" },
];
const LIMB = { sh: "Bahu", uarm: "Lengan atas", elbow: "Siku", farm: "Lengan bawah", hand: "Tangan", thigh: "Paha", knee: "Lutut", shin: "Betis", foot: "Kaki" };
export const NAMES = { head: "Kepala", neck: "Leher", chest: "Dada & jantung", abdomen: "Perut", pelvis: "Pinggul" };
Object.keys(LIMB).forEach((k) => ["l", "r"].forEach((s) => (NAMES[k + "_" + s] = LIMB[k] + (s === "l" ? " kiri" : " kanan"))));
export const SZ = { head: 0.3, neck: 0.15, chest: 0.42, abdomen: 0.34, pelvis: 0.3, sh: 0.2, uarm: 0.22, elbow: 0.16, farm: 0.2, hand: 0.15, thigh: 0.3, knee: 0.18, shin: 0.26, foot: 0.18 };

// Landmarks measured on the model after fitModel(): height 1.78, faces +z, figure's left = +x.
// If you swap in a different .glb, adjust these points.
export const ARM = [[0.27, 1.37, -0.06], [0.324, 1.22, -0.06], [0.447, 1.1, -0.025], [0.527, 1.02, 0.011], [0.587, 0.94, 0.054], [0.635, 0.86, 0.073]];
export const LEG = [[0.09, 0.86, -0.015], [0.105, 0.74, -0.01], [0.107, 0.62, -0.011], [0.107, 0.47, -0.02], [0.115, 0.32, -0.044], [0.12, 0.2, -0.054], [0.12, 0.1, -0.05], [0.125, 0.04, 0.03]];
export const at = (poly, t, s) => {
  const f = t * (poly.length - 1), i = Math.min(Math.floor(f), poly.length - 2), u = f - i, a = poly[i], b = poly[i + 1];
  return [s * (a[0] + (b[0] - a[0]) * u), a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
};
const shift = (p, dx, dz) => [p[0] + dx, p[1], p[2] + dz];
export const A = { head: [0, 1.67, 0], neck: [0, 1.54, 0], chest: [0.05, 1.3, 0.03], abdomen: [0, 1.05, 0.03], pelvis: [0, 0.9, 0] };
[1, -1].forEach((s) => {
  const k = s > 0 ? "_l" : "_r";
  A["sh" + k] = at(ARM, 0, s); A["uarm" + k] = at(ARM, 0.2, s); A["elbow" + k] = at(ARM, 0.4, s); A["farm" + k] = at(ARM, 0.65, s); A["hand" + k] = at(ARM, 1, s);
  A["thigh" + k] = at(LEG, 0.2, s); A["knee" + k] = at(LEG, 0.43, s); A["shin" + k] = at(LEG, 0.7, s); A["foot" + k] = at(LEG, 1, s);
});

// ---------- model helpers ----------
// Scale the loaded model to 1.78 tall, centre it on x, put its feet on y = 0.
export function fitModel(model) {
  model.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(model);
  const g = new THREE.Group();
  g.add(model);
  g.scale.setScalar(1.78 / (box.max.y - box.min.y));
  g.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(g);
  g.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, 0);
  return g;
}

// Glass-like fresnel material for the body shell.
export function makeShellMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uCore: { value: new THREE.Color("#86b0cc") }, uEdge: { value: new THREE.Color("#f4faff") } },
    vertexShader: "varying vec3 vN,vV;void main(){vec4 m=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-m.xyz);gl_Position=projectionMatrix*m;}",
    fragmentShader: "uniform vec3 uCore,uEdge;varying vec3 vN,vV;void main(){float f=pow(1.-abs(dot(vN,vV)),2.0);vec3 L=normalize(vec3(.4,.8,.6));vec3 H=normalize(L+vV);float sp=pow(abs(dot(vN,H)),60.);vec3 c=mix(uCore,uEdge,f)+sp*.7;float a=clamp(.1+f*.5+sp*.45,0.,.85);gl_FragColor=vec4(c,a);}",
  });
}

// Simple procedural bones, organs and main vessels that sit inside the shell.
export function buildInternals() {
  const std = (col, op = 1, em = 0.3) => new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: em, roughness: 0.5, transparent: op < 1, opacity: op });
  const tube = (pts, r, col, op) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), Math.max(6, pts.length * 6), r, 5, false), std(col, op));
  const sph = (r) => new THREE.SphereGeometry(r, 32, 24);
  const bones = new THREE.Group(), vessels = new THREE.Group(), organs = new THREE.Group();
  const bone = "#eef2f4";

  [0.07, 0.105, 0.13, 0.145, 0.155, 0.16, 0.158, 0.15, 0.138, 0.12].forEach((w, i) => {
    const y = 1.45 - i * 0.03;
    [1, -1].forEach((s) => bones.add(tube([[0, y, -0.115], [s * w * 0.55, y - 0.003, -0.11], [s * w, y - 0.012, -0.03], [s * w * 0.75, y - 0.03, 0.05], [s * 0.02, y - 0.05, 0.082]], 0.0045, bone, 0.85)));
  });
  bones.add(tube([[0, 1.46, 0.085], [0, 1.27, 0.092]], 0.012, bone, 0.85));
  for (let i = 0; i < 27; i++) {
    const y = 0.86 + i * 0.024, z = y < 1.3 ? -0.07 - ((y - 0.86) / 0.44) * 0.045 : -0.115 + ((y - 1.3) / 0.2) * 0.025;
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.015, 0.026), std(bone, 0.85, 0.2)); v.position.set(0, y, z); bones.add(v);
  }
  [1, -1].forEach((s) => {
    bones.add(tube([[0, 1.465, 0.045], [s * 0.1, 1.475, 0.03], [s * 0.22, 1.44, -0.045]], 0.007, bone, 0.85));
    const p = new THREE.Mesh(sph(0.07), std(bone, 0.5, 0.2)); p.position.set(s * 0.1, 0.88, -0.01); p.scale.set(1, 1.1, 0.55); bones.add(p);
  });

  const heart = new THREE.Mesh(sph(0.045), std("#d63a2f", 0.95, 0.6)); heart.position.set(0.05, 1.31, 0.02); heart.scale.set(1, 1.2, 0.9); organs.add(heart);
  const lungs = new THREE.Group(); organs.add(lungs);
  [1, -1].forEach((s) => { const l = new THREE.Mesh(sph(0.085), std("#ffb4a8", 0.3, 0.2)); l.position.set(s * 0.085, 1.33, -0.03); l.scale.set(0.8, 1.6, 0.95); lungs.add(l); });

  const RED = "#e0392e", BLUE = "#2c63d6";
  vessels.add(tube([[0.03, 1.33, 0], [0.035, 1.42, -0.01], [0, 1.46, -0.04], [-0.03, 1.4, -0.09], [-0.025, 1.2, -0.085], [-0.02, 1.0, -0.06], [0, 0.88, -0.035]], 0.011, RED));
  vessels.add(tube([[0.07, 1.31, 0.02], [0.065, 1.44, 0], [0.04, 1.5, -0.01]], 0.01, BLUE));
  vessels.add(tube([[0, 0.88, -0.04], [0.03, 1.0, -0.065], [0.04, 1.2, -0.09], [0.05, 1.4, -0.06]], 0.009, BLUE));
  [1, -1].forEach((s) => {
    [[RED, 0], [BLUE, 0.014]].forEach(([c, o]) => {
      vessels.add(tube([[0, 0.88, -0.04 + o], [s * 0.05, 0.84, -0.03 + o], ...[0.1, 0.4, 0.7, 1].map((t) => shift(at(LEG, t, s), -s * 0.03, o))], 0.0065, c));
      vessels.add(tube([[0, 1.45, -0.04 + o], [s * 0.12, 1.46, -0.03 + o], [s * 0.22, 1.42, -0.05 + o], ...[0.08, 0.3, 0.6, 0.95].map((t) => shift(at(ARM, t, s), 0, o))], 0.0055, c));
      vessels.add(tube([[0, 1.46, -0.03 + o], [s * 0.03, 1.54, -0.01 + o], [s * 0.045, 1.63, o], [s * 0.03, 1.72, o]], 0.005, c));
    });
  });
  return { bones, vessels, organs, heart, lungs };
}

export function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
