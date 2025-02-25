// ==UserScript==
// @name         Local Video Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enhance local video playback with keyboard controls
// @author       Jim Chen
// @match        file:///*
// @grant        none
// ==/UserScript==

(function () {
  document.addEventListener("keydown", function (event) {
    const video = document.querySelector("video");
    if (!video) return;

    switch (event.key.toLowerCase()) {
      case "f":
      case "а": // Russian 'f'
        event.preventDefault();
        document.fullscreenElement ? document.exitFullscreen() : video.requestFullscreen();
        break;
      case "<":
      case "Б": // Russian 'b'
        event.preventDefault();
        video.playbackRate = Math.max(0.25, video.playbackRate - 0.25);
        break;
      case ">":
      case "Ю": // Russian 'yu'
        event.preventDefault();
        video.playbackRate = Math.min(2, video.playbackRate + 0.25);
        break;
      case "j":
      case "о": // Russian 'o'
        event.preventDefault();
        video.currentTime -= 10;
        break;
      case "k":
      case "л": // Russian 'l'
        event.preventDefault();
        video.paused ? video.play() : video.pause();
        break;
      case "l":
      case "д": // Russian 'd'
        event.preventDefault();
        video.currentTime += 10;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        event.preventDefault();
        video.currentTime = (video.duration * parseInt(event.key)) / 10;
        break;
    }
  });
})();
