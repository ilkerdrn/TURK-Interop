"""
TURK Interop — Modül 2: Ortak Veri Modeli (INTEROP CORE)
Farklı ülke formatlarındaki kriz verisini tek standart şemaya dönüştürür.
"""

from datetime import datetime, timezone
from typing import Any
import uuid


# ── Ortak Veri Modeli (TI-DS v1) ─────────────────────────────────────────────

VALID_DISASTER_TYPES = {
    "earthquake", "flood", "fire", "epidemic", "storm", "drought", "other"
}
VALID_SEVERITIES = {"low", "medium", "high", "critical"}
VALID_RESOURCES  = {"rescue", "medical", "shelter", "water", "food", "logistics", "other"}


def build_standard_model(
    country: str,
    disaster_type: str,
    severity: str,
    people_affected: int,
    resources_needed: list[str],
    response_time: str,
    source_format: str = "unknown",
    raw: dict | None = None
) -> dict:
    """Doğrulanmış ortak veri modeli oluşturur."""
    return {
        "id":               str(uuid.uuid4()),
        "country":          country.upper()[:2],
        "disaster_type":    disaster_type if disaster_type in VALID_DISASTER_TYPES else "other",
        "severity":         severity if severity in VALID_SEVERITIES else "medium",
        "people_affected":  max(0, int(people_affected)),
        "resources_needed": [r for r in resources_needed if r in VALID_RESOURCES],
        "response_time":    response_time,
        "normalized_at":    datetime.now(timezone.utc).isoformat(),
        "source_format":    source_format,
        "_raw":             raw or {}
    }


# ── Ülke Adaptörleri ──────────────────────────────────────────────────────────

def normalize_tr_afad(data: dict) -> dict:
    """
    Türkiye AFAD formatı → Ortak Model
    AFAD kendi alanlarını Türkçe ve farklı key isimleriyle gönderir.

    Örnek AFAD girdisi:
    {
        "ulke": "TR",
        "afet_turu": "deprem",
        "siddet": "kritik",
        "etkilenen_kisi": 125000,
        "ihtiyaclar": ["arama_kurtarma", "tibbi_yardim", "barinma"],
        "mudahale_suresi": "2 saat"
    }
    """
    TYPE_MAP = {
        "deprem": "earthquake", "sel": "flood", "yangin": "fire",
        "salgin": "epidemic", "firtina": "storm", "diger": "other"
    }
    SEVERITY_MAP = {
        "dusuk": "low", "orta": "medium", "yuksek": "high", "kritik": "critical"
    }
    RESOURCE_MAP = {
        "arama_kurtarma": "rescue",   "tibbi_yardim": "medical",
        "barinma": "shelter",         "su": "water",
        "gida": "food",               "lojistik": "logistics"
    }

    return build_standard_model(
        country         = data.get("ulke", "TR"),
        disaster_type   = TYPE_MAP.get(data.get("afet_turu", ""), "other"),
        severity        = SEVERITY_MAP.get(data.get("siddet", ""), "medium"),
        people_affected = data.get("etkilenen_kisi", 0),
        resources_needed= [RESOURCE_MAP.get(r, "other") for r in data.get("ihtiyaclar", [])],
        response_time   = data.get("mudahale_suresi", "unknown"),
        source_format   = "TR-AFAD-v2",
        raw             = data
    )


def normalize_az_fhn(data: dict) -> dict:
    """
    Azerbaycan FHN (Fövqəladə Hallar Nazirliyi) formatı → Ortak Model

    Örnek FHN girdisi:
    {
        "country_code": "AZ",
        "event": "flood",
        "level": 3,
        "affected": 34000,
        "needs": ["rescue", "shelter", "water"],
        "eta_hours": 4
    }
    """
    LEVEL_MAP = {1: "low", 2: "medium", 3: "high", 4: "critical"}

    return build_standard_model(
        country         = data.get("country_code", "AZ"),
        disaster_type   = data.get("event", "other"),
        severity        = LEVEL_MAP.get(data.get("level", 2), "medium"),
        people_affected = data.get("affected", 0),
        resources_needed= data.get("needs", []),
        response_time   = f"{data.get('eta_hours', '?')} saat",
        source_format   = "AZ-FHN-v1",
        raw             = data
    )


def normalize_kz_dsm(data: dict) -> dict:
    """
    Kazakistan DSM (Dağdaylar Situ Ministrligi) formatı → Ortak Model

    Örnek DSM girdisi:
    {
        "ISO": "KZ",
        "crisis_type": "epidemic",
        "risk_score": 78,
        "population_impacted": 520000,
        "required_resources": ["medical", "food"],
        "response_eta": "PT6H"   ← ISO 8601 duration
    }
    """
    def risk_to_severity(score: int) -> str:
        if score >= 80: return "critical"
        if score >= 60: return "high"
        if score >= 40: return "medium"
        return "low"

    def parse_iso_duration(duration: str) -> str:
        """PT6H → '6 saat', PT2D → '2 gün' gibi okunabilir formata çevirir."""
        if not duration.startswith("PT"):
            return duration
        d = duration[2:]
        if "H" in d:
            return f"{d.replace('H','')} saat"
        if "D" in d:
            return f"{d.replace('D','')} gün"
        return duration

    return build_standard_model(
        country         = data.get("ISO", "KZ"),
        disaster_type   = data.get("crisis_type", "other"),
        severity        = risk_to_severity(data.get("risk_score", 50)),
        people_affected = data.get("population_impacted", 0),
        resources_needed= data.get("required_resources", []),
        response_time   = parse_iso_duration(data.get("response_eta", "")),
        source_format   = "KZ-DSM-v3",
        raw             = data
    )


def normalize_generic(data: dict) -> dict:
    """
    Bilinmeyen / genel format için fallback adaptör.
    Ortak alan isimlerini tahmin ederek dönüştürür.
    """
    # Olası alan isimlerini sırayla dene
    def pick(d: dict, *keys: str, default: Any = None) -> Any:
        for k in keys:
            if k in d:
                return d[k]
        return default

    return build_standard_model(
        country         = pick(data, "country", "country_code", "ISO", "ulke", default="XX"),
        disaster_type   = pick(data, "disaster_type", "event_type", "event", "afet_turu", "crisis_type", default="other"),
        severity        = pick(data, "severity", "level", "siddet", default="medium"),
        people_affected = pick(data, "people_affected", "affected", "etkilenen_kisi", "population_impacted", default=0),
        resources_needed= pick(data, "resources_needed", "needs", "ihtiyaclar", "required_resources", default=[]),
        response_time   = str(pick(data, "response_time", "eta_hours", "mudahale_suresi", "response_eta", default="unknown")),
        source_format   = "generic",
        raw             = data
    )


# ── Ana Dispatcher ────────────────────────────────────────────────────────────

ADAPTERS = {
    "TR": normalize_tr_afad,
    "AZ": normalize_az_fhn,
    "KZ": normalize_kz_dsm,
}

def normalize(raw_data: dict, country_hint: str | None = None) -> dict:
    """
    Ham veriyi alır, ülkeye uygun adaptörü seçer, ortak modele dönüştürür.

    Args:
        raw_data:     Herhangi bir ülkeden gelen ham kriz verisi
        country_hint: Ülke kodu biliniyorsa hızlı adaptör seçimi için

    Returns:
        TI-DS v1 standardında normalize edilmiş dict
    """
    country = (
        country_hint
        or raw_data.get("country_code")
        or raw_data.get("ISO")
        or raw_data.get("ulke")
        or raw_data.get("country", "")
    ).upper()

    adapter = ADAPTERS.get(country, normalize_generic)
    return adapter(raw_data)


# ── Test / Demo ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    samples = [
        {
            "label": "Türkiye — AFAD formatı",
            "data": {
                "ulke": "TR",
                "afet_turu": "deprem",
                "siddet": "kritik",
                "etkilenen_kisi": 125000,
                "ihtiyaclar": ["arama_kurtarma", "tibbi_yardim", "barinma"],
                "mudahale_suresi": "2 saat"
            }
        },
        {
            "label": "Azerbaycan — FHN formatı",
            "data": {
                "country_code": "AZ",
                "event": "flood",
                "level": 3,
                "affected": 34000,
                "needs": ["rescue", "shelter", "water"],
                "eta_hours": 4
            }
        },
        {
            "label": "Kazakistan — DSM formatı",
            "data": {
                "ISO": "KZ",
                "crisis_type": "epidemic",
                "risk_score": 78,
                "population_impacted": 520000,
                "required_resources": ["medical", "food"],
                "response_eta": "PT6H"
            }
        }
    ]

    print("=" * 60)
    print("TURK Interop — Modül 2: Normalizasyon Demo")
    print("=" * 60)

    for sample in samples:
        print(f"\n📥 Girdi ({sample['label']}):")
        print(json.dumps(sample["data"], ensure_ascii=False, indent=2))
        result = normalize(sample["data"])
        # _raw alanını demo çıktısından gizle
        display = {k: v for k, v in result.items() if k != "_raw"}
        print(f"\n📤 Normalize Edilmiş Çıktı:")
        print(json.dumps(display, ensure_ascii=False, indent=2))
        print("-" * 60)
