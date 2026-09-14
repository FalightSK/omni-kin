"""
generate_cert.py
Generates a self-signed SSL certificate (cert.pem and key.pem) with Subject
Alternative Names (SAN) for localhost, 127.0.0.1, and all local LAN IPs.

Mobile browsers (Android Chrome, iOS Safari) strictly require HTTPS to allow
camera access (navigator.mediaDevices.getUserMedia) and motion sensors (DeviceMotionEvent).

Usage:
    python generate_cert.py
    python generate_cert.py --ip 192.168.1.52
"""

import os
import sys
import socket
import datetime
import ipaddress
import argparse

def get_all_local_ips():
    """Finds all non-loopback IPv4 addresses on this machine."""
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ips.add(s.getsockname()[0])
        s.close()
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = info[4][0]
            if not ip.startswith("127."):
                ips.add(ip)
    except Exception:
        pass

    return sorted(list(ips))

def generate_ssl_certificate(cert_path="cert.pem", key_path="key.pem", extra_ips=None):
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization
    except ImportError:
        print("[!] The 'cryptography' library is required to generate certificates.")
        print("    Please install it using: pip install cryptography")
        sys.exit(1)

    print("[*] Generating 2048-bit RSA private key...")
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "OmniKin Dataset Collector"),
        x509.NameAttribute(NameOID.COMMON_NAME, "OmniKin Local Server"),
    ])

    san_list = [
        x509.DNSName("localhost"),
        x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
    ]

    detected_ips = get_all_local_ips()
    if extra_ips:
        for ip in extra_ips:
            if ip not in detected_ips:
                detected_ips.append(ip)

    for ip_str in detected_ips:
        try:
            san_list.append(x509.IPAddress(ipaddress.IPv4Address(ip_str)))
        except ValueError:
            san_list.append(x509.DNSName(ip_str))

    print(f"[*] Adding Subject Alternative Names (SAN):")
    for san in san_list:
        print(f"    - {san.value}")

    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1))
        .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3650))
        .add_extension(x509.SubjectAlternativeName(san_list), critical=False)
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .sign(key, hashes.SHA256())
    )

    base_dir = os.path.dirname(os.path.abspath(__file__))
    full_cert_path = os.path.join(base_dir, cert_path)
    full_key_path = os.path.join(base_dir, key_path)

    with open(full_key_path, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    with open(full_cert_path, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print(f"\n[+] Success! Certificate generated successfully:")
    print(f"    - Certificate: {full_cert_path}")
    print(f"    - Private Key: {full_key_path}")
    print("\nNext steps:")
    print("1. Start the server: python server.py --ssl")
    print("2. Open the mobile logger on your phone at: https://<LAN_IP>:8443/mobile")
    print("3. Accept the self-signed SSL warning in your mobile browser:")
    print("   - Android Chrome: Tap 'Advanced' -> 'Proceed to <IP> (unsafe)'")
    print("   - iOS Safari:     Tap 'Show Details' -> 'visit this website' -> 'Visit Website'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate self-signed SSL certificates for OmniKin")
    parser.add_argument("--ip", nargs="*", help="Extra IP addresses or hostnames to include in SAN")
    parser.add_argument("--cert", default="cert.pem", help="Certificate output path (default: cert.pem)")
    parser.add_argument("--key", default="key.pem", help="Private key output path (default: key.pem)")
    args = parser.parse_args()

    generate_ssl_certificate(cert_path=args.cert, key_path=args.key, extra_ips=args.ip)
