// Utility functions for calculating joint angles from pose landmarks

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate angle between three points (in degrees)
 * @param a First point (e.g., hip)
 * @param b Middle point (e.g., knee) - the vertex of the angle
 * @param c Third point (e.g., ankle)
 * @returns Angle in degrees
 */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  // Vector from b to a
  const ba = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };

  // Vector from b to c
  const bc = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: c.z - b.z
  };

  // Dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;

  // Magnitudes
  const magnitudeBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magnitudeBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  // Calculate angle in radians
  const angleRad = Math.acos(dotProduct / (magnitudeBA * magnitudeBC));

  // Convert to degrees
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}

/**
 * Calculate knee angle
 * @param hip Hip landmark
 * @param knee Knee landmark
 * @param ankle Ankle landmark
 * @returns Knee angle in degrees
 */
export function calculateKneeAngle(hip: Point3D, knee: Point3D, ankle: Point3D): number {
  return calculateAngle(hip, knee, ankle);
}

/**
 * Calculate ankle angle (dorsiflexion/plantarflexion)
 * @param knee Knee landmark
 * @param ankle Ankle landmark
 * @param foot Foot landmark (toe or heel)
 * @returns Ankle angle in degrees
 */
export function calculateAnkleAngle(knee: Point3D, ankle: Point3D, foot: Point3D): number {
  return calculateAngle(knee, ankle, foot);
}

/**
 * Calculate 2D angle (ignoring z-axis, useful for side-view exercises)
 */
export function calculate2DAngle(a: Point3D, b: Point3D, c: Point3D): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  
  if (angle > 180) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * MediaPipe Pose Landmark indices
 */
export const PoseLandmarks = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
} as const;
