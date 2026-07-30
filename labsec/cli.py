"""Command-line entry point for authorized lab tooling."""

from __future__ import annotations

import argparse
from pathlib import Path

from .ctf import run_command
from .discovery import discover
from .scope import ScopeError, expand_network_target, require_authorization, validate_ports
from .webcheck import inspect_url


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Constrained helpers for authorized labs.")
    commands = parser.add_subparsers(dest="action", required=True)

    discover_parser = commands.add_parser("discover", help="Probe explicit TCP lab services.")
    discover_parser.add_argument("target", help="One IP address or a CIDR range of up to 256 addresses.")
    discover_parser.add_argument("--ports", required=True, help="Comma-separated TCP port list.")
    discover_parser.add_argument("--timeout", type=float, default=1.0)
    discover_parser.add_argument("--workers", type=int, default=8)
    discover_parser.add_argument("--i-am-authorized", action="store_true")

    web_parser = commands.add_parser("webcheck", help="Perform passive HTTP response checks.")
    web_parser.add_argument("url")
    web_parser.add_argument("--timeout", type=float, default=5.0)
    web_parser.add_argument("--i-am-authorized", action="store_true")

    ctf_parser = commands.add_parser("ctf", help="Run a local CTF or lab command.")
    ctf_parser.add_argument("--name", required=True)
    ctf_parser.add_argument("--command", dest="lab_command", required=True)
    ctf_parser.add_argument("--output-dir", type=Path, default=Path(".labsec-runs"))
    ctf_parser.add_argument("--i-am-authorized", action="store_true")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        require_authorization(args.i_am_authorized)
        if args.action == "discover":
            if args.timeout <= 0 or not 1 <= args.workers <= 64:
                raise ScopeError("Timeout must be positive and workers must be between 1 and 64.")
            services = discover(
                expand_network_target(args.target),
                validate_ports(args.ports),
                args.timeout,
                args.workers,
            )
            for host, port in services:
                print(f"{host}:{port} open")
            return 0
        if args.action == "webcheck":
            if args.timeout <= 0:
                raise ScopeError("Timeout must be positive.")
            result = inspect_url(args.url, args.timeout)
            print(f"{result.url}: HTTP {result.status}")
            print(f"Server: {result.server or 'not disclosed'}")
            print("Missing recommended headers: " + ", ".join(result.missing_headers or ("none",)))
            return 0

        return_code, output_path = run_command(args.name, args.lab_command, args.output_dir)
        print(f"Command exited with {return_code}; output: {output_path}")
        return return_code
    except (ScopeError, ValueError, ConnectionError) as error:
        parser.error(str(error))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
