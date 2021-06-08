export function presets(name) {
  switch (name) {
    case "Grey":
      return {
        blockSize: 50,
        tilesInBlock: 3,
        wallColor: [0, 0, 0, 1],
        colorAmp: 1,
        grey: 220
      }
    case "GreyInvert":
        return {
          blockSize: 50,
          tilesInBlock: 3,
          wallColor: [1, 1, 1, 1],
          colorAmp: 1,
          greyInvert: 220
        }
    case "Medium":
        return {
          blockSize: 50,
          tilesInBlock: 3,
          wallColor: [0, 0, 0, 1],
          colorAmp: 3,
        }
    case "Big":
        return {
          blockSize: 100,
          tilesInBlock: 12,
          wallColor: [0, 0, 0, 1],
          colorAmp: 5
        }
    case "Basic":
    default:
      return {
        blockSize: 30,
        tilesInBlock: 1,
        wallColor: [0, 0, 0, 1],
        colorAmp: 10
      }
  }
}