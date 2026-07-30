import unittest

from labsec.scope import ScopeError, expand_network_target, require_authorization, validate_ports


class ScopeTests(unittest.TestCase):
    def test_expands_small_cidr_range(self):
        self.assertEqual(
            expand_network_target("192.0.2.0/30"),
            ["192.0.2.1", "192.0.2.2"],
        )

    def test_rejects_large_cidr_range(self):
        with self.assertRaisesRegex(ScopeError, "limit"):
            expand_network_target("192.0.2.0/23")

    def test_requires_authorization(self):
        with self.assertRaisesRegex(ScopeError, "i-am-authorized"):
            require_authorization(False)

    def test_validates_and_deduplicates_ports(self):
        self.assertEqual(validate_ports("443,80,443"), [80, 443])

    def test_rejects_invalid_ports(self):
        for value in ("0", "65536", "http"):
            with self.subTest(value=value):
                with self.assertRaises(ScopeError):
                    validate_ports(value)
