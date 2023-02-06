import Voyage from "./Voyage.wav";
import PunchOut from "./PunchOut.wav";
import SonicBoom from "./SonicBoom.wav";

const music = (): MusicWavs => {
  const Music: Partial<MusicWavs> = {
    loaded: false,
  };
  const AudioVoyage = new Audio();
  const AudioPunchOut = new Audio();
  const AudioSonicBoom = new Audio();
  AudioVoyage.src = Voyage;
  AudioPunchOut.src = PunchOut;
  AudioSonicBoom.src = SonicBoom;
  AudioVoyage.addEventListener("canplaythrough", () => {
    Music.Voyage = AudioVoyage;
    checkIfLoaded();
  });
  AudioVoyage.addEventListener("ended", () => {
    setTimeout(() => {
      AudioPunchOut.play();
    }, 5000);
  });
  AudioPunchOut.addEventListener("canplaythrough", () => {
    Music.PunchOut = AudioPunchOut;
    checkIfLoaded();
  });
  AudioPunchOut.addEventListener("ended", () => {
    setTimeout(() => {
      AudioSonicBoom.play();
    }, 5000);
  });
  AudioSonicBoom.addEventListener("canplaythrough", () => {
    Music.SonicBoom = AudioSonicBoom;
    checkIfLoaded();
  });
  AudioSonicBoom.addEventListener("ended", () => {
    setTimeout(() => {
      AudioVoyage.play();
    }, 5000);
  });
  function checkIfLoaded() {
    if (Music.PunchOut && Music.SonicBoom && Music.Voyage) {
      Music.loaded = true;
    }
  }
  return Music as MusicWavs;
};

export { music };
export default music;
