"""
FastAPI wrapper — normalizer'ı HTTP endpoint olarak sunar.
POST /normalize  →  ham veri → TI-DS v1
GET  /schema     →  ortak model şemasını döndürür
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
from normalizer import normalize, VALID_DISASTER_TYPES, VALID_SEVERITIES, VALID_RESOURCES

app = FastAPI(title="TURK Interop Normalizer", version="1.0.0")


class NormalizeRequest(BaseModel):
    data:         dict[str, Any]
    country_hint: str | None = None


@app.post("/normalize")
def normalize_endpoint(req: NormalizeRequest):
    try:
        result = normalize(req.data, req.country_hint)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/schema")
def get_schema():
    return {
        "version": "TI-DS v1",
        "fields": {
            "id":               "UUID — sistem tarafından atanır",
            "country":          f"ISO 3166-1 alpha-2",
            "disaster_type":    f"Enum: {sorted(VALID_DISASTER_TYPES)}",
            "severity":         f"Enum: {sorted(VALID_SEVERITIES)}",
            "people_affected":  "integer >= 0",
            "resources_needed": f"Array of: {sorted(VALID_RESOURCES)}",
            "response_time":    "string (okunabilir süre)",
            "normalized_at":    "ISO 8601 timestamp",
            "source_format":    "Kaynak sistem adı"
        }
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "normalizer"}
