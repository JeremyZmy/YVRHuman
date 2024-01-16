const scene = spaceDocument.scene as BABYLON.Scene;

spatialDocument.addEventListener('spaceReady', function () {
  const animationGroups = scene.animationGroups
    .filter((ag) => ag.name.startsWith('model.'));
  if (animationGroups.length >= 1) {
    animationGroups.forEach(element => {
      element.stop();
    });
  }
});