"""Passive HTTP response checks for lab web applications."""

from __future__ import annotations

from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


RECOMMENDED_HEADERS = (
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
)


@dataclass(frozen=True)
class WebCheckResult:
    url: str
    status: int
    server: str | None
    missing_headers: tuple[str, ...]


def inspect_url(url: str, timeout: float) -> WebCheckResult:
    """Fetch a URL once and report non-invasive response metadata."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("URL must include an http:// or https:// scheme and host.")

    request = Request(url, headers={"User-Agent": "labsec/0.1"}, method="GET")
    try:
        response = urlopen(request, timeout=timeout)
    except HTTPError as error:
        response = error
    except URLError as error:
        raise ConnectionError(f"Could not reach {url}: {error.reason}") from error

    with response:
        headers = {name.lower() for name in response.headers.keys()}
        missing = tuple(header for header in RECOMMENDED_HEADERS if header not in headers)
        return WebCheckResult(
            url=url,
            status=response.status,
            server=response.headers.get("Server"),
            missing_headers=missing,
        )
