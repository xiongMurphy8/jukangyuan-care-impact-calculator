"""Build the approved presentation without downgrading the newer live runtime."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
name = sys.argv[1] if len(sys.argv) > 1 else 'tencent-dist'
if name not in ('tencent-dist', 'github-pages-dist'):
    raise SystemExit('Output must be tencent-dist or github-pages-dist')
output = REPO / name
inputs = sorted(p for p in ROOT.rglob('*') if p.is_file() and p.parent.name != 'evidence' and '__pycache__' not in p.parts)
digest = hashlib.sha256(b''.join(p.relative_to(ROOT).as_posix().encode() + b'\0' + p.read_bytes() for p in inputs)).hexdigest()[:12]
asset_dir = f'assets/r-{digest}'
raw = (ROOT / 'baseline/original.js').read_text()
state = {'raw': raw}
exec(compile((ROOT / 'patch.py').read_text(), 'patch.py', 'exec'), state)
patched = state['patched'].replace('@@ASSETS@@', asset_dir)
if output.exists():
    shutil.rmtree(output)
assets = output / asset_dir
assets.mkdir(parents=True)
for source in (ROOT / 'baseline').iterdir():
    if source.name not in ('original.js', 'workplace.webp'):
        shutil.copy2(source, assets / source.name)
for source in (ROOT / 'photos').glob('*.webp'):
    shutil.copy2(source, assets / source.name)
(assets / 'index-StcOqFQT.js').write_text(patched)
for filename in ('redesign.css', 'production.js'):
    shutil.copy2(ROOT / filename, assets / filename)
(output / 'index.html').write_text((ROOT / 'index.html').read_text().replace('@@ASSETS@@', asset_dir))
manifest = {
    'release': digest,
    'source_url': 'https://canbaojin-d7gfb2yfg490fc759-1427274058.tcloudbaseapp.com/jukangyuan/',
    'baseline_sha256': hashlib.sha256(raw.encode()).hexdigest(),
    'assets': asset_dir,
    'calculation_logic': 'unchanged from captured live runtime',
    'contact_submission': 'original API handler; no preview blocking',
    'files': {p.relative_to(output).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(output.rglob('*')) if p.is_file()},
}
(output / 'release-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'output': str(output), 'release': digest, 'files': len(manifest['files'])}, ensure_ascii=False))
