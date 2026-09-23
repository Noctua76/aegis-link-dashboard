const GPS_ACCURACY_CLASSES = {
  Unknown: "gps-accuracy-unknown",
  Excellent: "gps-accuracy-excellent",
  Good: "gps-accuracy-good",
  Fair: "gps-accuracy-fair",
  Poor: "gps-accuracy-poor",
};

export function gpsAccuracyLabel(accuracy) {
  if (
    accuracy === null
    || accuracy === undefined
    || (typeof accuracy === "string" && accuracy.trim() === "")
  ) {
    return {
      label: "Unknown",
      className: GPS_ACCURACY_CLASSES.Unknown,
    };
  }

  const value = Number(accuracy);

  if (!Number.isFinite(value) || value < 0) {
    return {
      label: "Unknown",
      className: GPS_ACCURACY_CLASSES.Unknown,
    };
  }

  if (value <= 20) {
    return {
      label: "Excellent",
      className: GPS_ACCURACY_CLASSES.Excellent,
    };
  }

  if (value <= 50) {
    return {
      label: "Good",
      className: GPS_ACCURACY_CLASSES.Good,
    };
  }

  if (value <= 100) {
    return {
      label: "Fair",
      className: GPS_ACCURACY_CLASSES.Fair,
    };
  }

  return {
    label: "Poor",
    className: GPS_ACCURACY_CLASSES.Poor,
  };
}
