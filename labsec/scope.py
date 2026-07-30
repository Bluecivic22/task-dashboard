"""Target parsing and authorization safeguards."""

from __future__ import annotations

from ipaddress import IPv4Address, IPv6Address, ip_address, ip_network


class ScopeError(ValueError):
    """Raised when a target is not an explicit, valid assessment target."""


def require_authorization(acknowledged: bool) -> None:
    """Require a deliberate acknowledgement before a network action."""
    if not acknowledged:
        raise ScopeError(
            "Network actions require --i-am-authorized for the specified target."
        )


def expand_network_target(target: str, maximum_hosts: int = 256) -> list[str]:
    """Expand one explicit IP address or a reasonably sized CIDR range."""
    try:
        return [str(ip_address(target))]
    except ValueError:
        pass

    try:
        network = ip_network(target, strict=False)
    except ValueError as error:
        raise ScopeError(f"Target must be an IP address or CIDR range: {target}") from error

    if network.num_addresses > maximum_hosts:
        raise ScopeError(
            f"CIDR range contains {network.num_addresses} addresses; "
            f"the limit is {maximum_hosts}."
        )

    if isinstance(network.network_address, (IPv4Address, IPv6Address)):
        return [str(host) for host in network.hosts()]
    raise ScopeError(f"Unsupported target range: {target}")


def validate_ports(value: str) -> list[int]:
    """Parse a comma-separated list of valid TCP ports."""
    try:
        ports = sorted({int(port.strip()) for port in value.split(",")})
    except ValueError as error:
        raise ScopeError("Ports must be a comma-separated list of integers.") from error

    if not ports or any(port < 1 or port > 65535 for port in ports):
        raise ScopeError("Ports must be between 1 and 65535.")
    return ports
