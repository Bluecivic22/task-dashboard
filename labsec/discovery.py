"""Minimal TCP service discovery for explicit lab targets."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import socket


def probe_tcp(host: str, port: int, timeout: float) -> tuple[str, int, bool]:
    """Return whether a TCP connection can be established."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return host, port, True
    except OSError:
        return host, port, False


def discover(hosts: list[str], ports: list[int], timeout: float, workers: int) -> list[tuple[str, int]]:
    """Probe the requested host-port pairs and return reachable services."""
    pairs = [(host, port) for host in hosts for port in ports]
    with ThreadPoolExecutor(max_workers=workers) as executor:
        results = executor.map(
            lambda pair: probe_tcp(pair[0], pair[1], timeout),
            pairs,
        )
        return [(host, port) for host, port, is_open in results if is_open]
