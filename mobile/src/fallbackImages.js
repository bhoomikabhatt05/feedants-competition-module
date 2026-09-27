// Bundled photo fallbacks (same freely-licensed Commons photos the backend seeds).
// Remote backend URLs stay primary; these guarantee real photography is shown even
// when the remote fetch fails, the backend is stale, or the phone is offline.
// require() assets can never fail at runtime, so no teal placeholder can appear.
export const COVERS = {
  Dance: require("../assets/dance-cover.jpg"),
  Photography: require("../assets/photo-cover.jpg"),
  Music: require("../assets/music-cover.jpg"),
  Art: require("../assets/art-cover.jpg"),
  Writing: require("../assets/writing-cover.jpg"),
};

export const DEFAULT_COVER = require("../assets/dance-cover.jpg");
export const JUDGE_PHOTO = require("../assets/judge.jpg");

export const WINNER_PHOTOS = [
  require("../assets/winner1.jpg"),
  require("../assets/winner2.jpg"),
  require("../assets/winner3.jpg"),
  require("../assets/winner4.jpg"),
];

export function coverFor(category) {
  return COVERS[category] || DEFAULT_COVER;
}
