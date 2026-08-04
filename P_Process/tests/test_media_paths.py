import unittest


class WritingMediaPathTest(unittest.TestCase):
    def test_rewrites_only_root_local_assets_and_is_idempotent(self) -> None:
        from I_Input.jekyll.media_paths import rewrite_writing_asset_urls

        source = """![hero](/assets/images/a/hero.png)
<img src="/assets/images/a/hero.png">
<a href='/assets/images/a/full.png'>full</a>
![external](https://example.com/x.png)
<img src="/writing/assets/images/kept.png">
"""

        rendered = rewrite_writing_asset_urls(source)

        self.assertEqual(4, rendered.count("/writing/assets/"))
        self.assertIn("https://example.com/x.png", rendered)
        self.assertNotIn("/writing/writing/", rendered)
        self.assertEqual(rendered, rewrite_writing_asset_urls(rendered))

    def test_supports_a_normalized_custom_mount(self) -> None:
        from I_Input.jekyll.media_paths import rewrite_writing_asset_urls

        self.assertEqual(
            "![hero](/library/assets/images/a.png)",
            rewrite_writing_asset_urls("![hero](/assets/images/a.png)", "/library/"),
        )


if __name__ == "__main__":
    unittest.main()
