// ============================================================================
// BLOODLINK 8 — LOCATION & GEOFENCE TELEMETRY SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeofenceMatchResult {
  distanceKm: number;
  isWithinRadius: boolean;
  estimatedEtaMinutes: number;
  bearingDegrees: number;
}

class LocationService {
  private watchId: number | null = null;
  private heartbeatInterval: any = null;

  /**
   * Haversine formula: returns exact geographic distance in km
   */
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Calculate initial compass bearing from point A to point B
   */
  public calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
    return Math.round(bearing);
  }

  /**
   * Comprehensive Geofence & ETA check
   */
  public checkGeofence(
    donorCoords: Coordinates,
    hospitalCoords: Coordinates,
    radiusKm: number,
    vehicleType: 'Car' | 'Bike' | 'Metro/Walk' = 'Bike'
  ): GeofenceMatchResult {
    const distanceKm = this.calculateDistance(
      donorCoords.latitude,
      donorCoords.longitude,
      hospitalCoords.latitude,
      hospitalCoords.longitude
    );

    const speed = vehicleType === 'Bike' ? 32 : vehicleType === 'Car' ? 24 : 14;
    const travelTime = (distanceKm / speed) * 60;
    const estimatedEtaMinutes = Math.max(3, Math.round(travelTime + 2)); // 2 mins prep time

    const bearingDegrees = this.calculateBearing(
      donorCoords.latitude,
      donorCoords.longitude,
      hospitalCoords.latitude,
      hospitalCoords.longitude
    );

    return {
      distanceKm,
      isWithinRadius: distanceKm <= radiusKm,
      estimatedEtaMinutes,
      bearingDegrees
    };
  }

  /**
   * Linear coordinate interpolation for animated route movement
   */
  public interpolateCoordinate(
    start: Coordinates,
    end: Coordinates,
    fraction: number
  ): Coordinates {
    const clamped = Math.max(0, Math.min(1, fraction));
    return {
      latitude: start.latitude + (end.latitude - start.latitude) * clamped,
      longitude: start.longitude + (end.longitude - start.longitude) * clamped
    };
  }

  /**
   * Start 15-second donor GPS heartbeat tracking
   */
  public startHeartbeat(
    onLocationUpdate: (coords: Coordinates) => void,
    onErrorFallback: () => void
  ): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      onErrorFallback();
      return;
    }

    const pushCurrent = () => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          onLocationUpdate({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {
          onErrorFallback();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
      );
    };

    pushCurrent();
    this.heartbeatInterval = setInterval(pushCurrent, 15000); // 15s standard heartbeat
  }

  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const locationService = new LocationService();
