import unittest

from labsec.webcheck import inspect_url


class WebCheckTests(unittest.TestCase):
    def test_rejects_url_without_scheme(self):
        with self.assertRaisesRegex(ValueError, "scheme"):
            inspect_url("lab.example.test", 1)
