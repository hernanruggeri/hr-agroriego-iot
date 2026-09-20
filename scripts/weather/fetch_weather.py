"""Obtiene y normaliza precipitación sin exponer la fuente en el código público."""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


OUTPUT = Path(__file__).resolve().parents[2] / "public" / "data" / "weather.json"
TIMEZONE = ZoneInfo("America/Argentina/Buenos_Aires")


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        cleaned = " ".join(data.split())
        if cleaned:
            self.parts.append(cleaned)


def numeric_after(text: str, labels: list[str]) -> float | None:
    for label in labels:
        match = re.search(rf"{label}[^0-9-]*(-?\d+(?:[.,]\d+)?)", text, flags=re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", "."))
    return None


def write_result(payload: dict) -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    queried_at = datetime.now(TIMEZONE).isoformat(timespec="seconds")
    source_url = os.getenv("WEATHER_SOURCE_URL", "").strip()
    if not source_url:
        write_result({
            "stationDateTime": None,
            "queriedAt": queried_at,
            "dailyMm": None,
            "intensityMmH": None,
            "origin": "externo",
            "publicSource": "Estación meteorológica cercana",
            "quality": "no_disponible",
            "message": "Falta configurar WEATHER_SOURCE_URL en el entorno local.",
        })
        return 2

    try:
        request = Request(source_url, headers={"User-Agent": "HR-AgroRiego/0.1"})
        with urlopen(request, timeout=20) as response:
            raw = response.read()
            declared = response.headers.get_content_charset()
        decoded = raw.decode(declared or "cp1252", errors="replace")
        parser = TextExtractor()
        parser.feed(decoded)
        text = " | ".join(parser.parts)
        daily = numeric_after(text, [r"lluvia\s+diaria(?:\s+acumulada)?", r"precipitaci[oó]n\s+diaria"])
        intensity = numeric_after(text, [r"intensidad\s+de\s+lluvia", r"intensidad"])
        quality = "valido" if daily is not None and intensity is not None else "invalido"
        write_result({
            "stationDateTime": None,
            "queriedAt": queried_at,
            "dailyMm": daily,
            "intensityMmH": intensity,
            "origin": "externo",
            "publicSource": "Estación meteorológica cercana",
            "quality": quality,
            "message": None if quality == "valido" else "La respuesta no contiene valores numéricos reconocibles.",
        })
        return 0 if quality == "valido" else 3
    except Exception as exc:
        write_result({
            "stationDateTime": None,
            "queriedAt": queried_at,
            "dailyMm": None,
            "intensityMmH": None,
            "origin": "externo",
            "publicSource": "Estación meteorológica cercana",
            "quality": "no_disponible",
            "message": f"Consulta fallida: {type(exc).__name__}",
        })
        return 1


if __name__ == "__main__":
    sys.exit(main())
