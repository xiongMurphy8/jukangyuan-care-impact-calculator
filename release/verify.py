"""Verify deploy paths, chunk references, byte integrity and removal of preview guards."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

repo = Path(__file__).resolve().parent.parent
for target in ('tencent-dist', 'github-pages-dist'):
    subprocess.run([sys.executable, str(repo / 'release/build.py'), target], check=True)
    output = repo / target
    manifest = json.loads((output / 'release-manifest.json').read_text())
    for filename, expected in manifest['files'].items():
        assert hashlib.sha256((output / filename).read_bytes()).hexdigest() == expected
    html = (output / 'index.html').read_text()
    for path in re.findall(r'(?:src|href)="(\./[^"]+)"', html):
        assert (output / path).is_file(), path
    for forbidden in ('noindex', '本地视觉预览', 'preview.js', "connect-src 'none'", 'preview-status'):
        assert forbidden not in html, forbidden
    script = (output / manifest['assets'] / 'production.js').read_text()
    assert 'stopImmediatePropagation' not in script
    assert 'fetch(' not in script
    main = (output / manifest['assets'] / 'index-StcOqFQT.js').read_text()
    assert f"./{manifest['assets']}/work-team.webp" in main
    assert "AI生成的包容性办公场景" not in main
    assert main.count("className:`policy-grid`") == 1
    assert main.index("className:`policy-grid`") < main.index("id:`calculator`")
    for photo in re.findall(r'src:`\./([^`]+\.webp)`', main):
        assert (output / photo).is_file()
    for js in (output / manifest['assets']).glob('*.js'):
        for relative in re.findall(r'["`\']\./([^"`\']+\.js)["`\']', js.read_text()):
            assert (js.parent / relative).is_file(), relative
    baseline = (repo / 'release/baseline/original.js').read_text()
    # Logic before the rendered hero is identical apart from approved presentation literals.
    state = {'raw': baseline}
    exec(compile((repo / 'release/patch.py').read_text(), 'patch.py', 'exec'), state)
    assert main == state['patched'].replace('@@ASSETS@@', manifest['assets'])
    assert 'x-admin-token' in main and 'consent:' in main
assert (repo / 'tencent-dist/release-manifest.json').read_bytes() == (repo / 'github-pages-dist/release-manifest.json').read_bytes()
print('PASS: identical builds, asset integrity, PDF chunk resolution, baseline preservation, production submission enabled')
