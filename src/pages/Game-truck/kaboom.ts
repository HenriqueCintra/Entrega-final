import kaboom from "kaboom";

export const k = kaboom({
  width: 640,
  height: 480,
  canvas: document.createElement("canvas"), // será substituído depois!
  scale: 2,
  background: [0, 0, 0],
});