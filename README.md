# Lab Security Toolkit

A dependency-free Python toolkit for **authorized, controlled environments only**:

- TCP service discovery on explicit lab hosts or CIDR ranges
- Passive web response and security-header checks
- CTF/lab command orchestration with captured output

It does not deliver exploits, brute-force credentials, modify targets, or include destructive scanning modes.

## Requirements

Python 3.11 or later. No third-party packages are required.

## Usage

All network actions require an explicit acknowledgement:

```powershell
python -m labsec discover 192.0.2.10 --ports 22,80,443 --i-am-authorized
python -m labsec discover 192.0.2.0/30 --ports 80,443 --workers 4 --i-am-authorized
python -m labsec webcheck https://lab.example.test --i-am-authorized
python -m labsec ctf --name "Web lab" --command "python solver.py" --i-am-authorized
```

`discover` only attempts a TCP connect to the supplied ports. `webcheck` only issues an HTTP `GET` request and reports response metadata and recommended security headers. `ctf` runs a command locally and saves its combined output under `.labsec-runs`.

Use documentation-only address ranges (such as `192.0.2.0/24`) or systems for which you have written authorization.
