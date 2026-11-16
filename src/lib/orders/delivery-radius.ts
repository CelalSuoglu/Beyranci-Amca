import { MAX_DELIVERY_KM } from "./constants";

/** Yeşilbayır, Döşemealtı — teslimat dairesinin merkezi (Google Haritalar işletme kaydındaki konum) */
export const RESTAURANT_LOCATION = {
  latitude: 36.9818403,
  longitude: 30.6058462,
} as const;

type LatLng = {
  latitude: number;
  longitude: number;
};

export function distanceKm(from: LatLng, to: LatLng): number {
  const earthKm = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ADDRESS_NOISE =
  /mahallesi|mahalle|sokağı|sokak|caddesi|cadde|bulvarı|bulvar|numara|apartmanı|apartman|daire|kat|antalya|türkiye|turkey/gi;

function fold(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function distinctiveTokens(address: string): string[] {
  return fold(address)
    .replace(ADDRESS_NOISE, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4);
}

function mentionsAddress(address: string, label: string): boolean {
  const tokens = distinctiveTokens(address);
  if (tokens.length === 0) return false;
  const haystack = fold(label);
  return tokens.some((token) => haystack.includes(token));
}

function searchQueries(address: string): string[] {
  const cleaned = address.replace(/\s+/g, " ").trim();
  const stripped = cleaned.replace(ADDRESS_NOISE, " ").replace(/\s+/g, " ").trim();
  return stripped && stripped !== cleaned ? [cleaned, stripped] : [cleaned];
}

async function geocode(address: string): Promise<LatLng | null> {
  const headers = {
    Accept: "application/json",
    "User-Agent": "BeyranciAmca/1.0 (https://beyranciamca.com)",
  };

  for (const query of searchQueries(address)) {
    const encoded = encodeURIComponent(query);

    try {
      const nominatim = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tr&q=${encoded}`,
        { headers, signal: AbortSignal.timeout(8000) },
      );
      if (nominatim.ok) {
        const rows = (await nominatim.json()) as {
          lat?: string;
          lon?: string;
          display_name?: string;
        }[];
        const hit = rows[0];
        const latitude = Number(hit?.lat);
        const longitude = Number(hit?.lon);
        if (
          hit?.display_name &&
          mentionsAddress(address, hit.display_name) &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          return { latitude, longitude };
        }
      }
    } catch {
      // Photon yedeğine düş
    }

    try {
      const photon = await fetch(
        `https://photon.komoot.io/api/?q=${encoded}&limit=1`,
        { headers, signal: AbortSignal.timeout(8000) },
      );
      if (!photon.ok) continue;
      const body = (await photon.json()) as {
        features?: {
          properties?: { name?: string; city?: string; state?: string; country?: string };
          geometry?: { coordinates?: [number, number] };
        }[];
      };
      const feature = body.features?.[0];
      const coords = feature?.geometry?.coordinates;
      if (!coords || !feature?.properties) continue;
      const label = [
        feature.properties.name,
        feature.properties.city,
        feature.properties.state,
        feature.properties.country,
      ]
        .filter(Boolean)
        .join(", ");
      const [longitude, latitude] = coords;
      if (
        mentionsAddress(address, label) &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      ) {
        return { latitude, longitude };
      }
    } catch {
      // Sonraki sorgu
    }
  }

  return null;
}

export async function checkDeliveryRadius(
  address: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const point = await geocode(address);
  if (!point) {
    return {
      ok: false,
      message:
        "Teslimat adresini haritada bulamadık. Mahalle, sokak ve ilçeyi yazıp tekrar deneyin.",
    };
  }

  const km = distanceKm(RESTAURANT_LOCATION, point);
  if (km > MAX_DELIVERY_KM) {
    return {
      ok: false,
      message: `Bu adrese teslimat yapmıyoruz. Sipariş yalnızca restorana en fazla ${MAX_DELIVERY_KM} km mesafeye gider (bu adres yaklaşık ${Math.round(km)} km).`,
    };
  }

  return { ok: true };
}
