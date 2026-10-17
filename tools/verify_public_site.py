"""Publication boundary for the GitHub Pages portfolio in docs/.

check : every file under docs/ is listed in tools/PUBLISH_ALLOWLIST.txt (exact paths,
        no wildcards), no private/secret patterns appear, and every local asset that
        index.html references exists.
live  : every allowlisted file is served from the Pages URL with identical bytes,
        and a path outside the allowlist returns 404.

Usage: python tools/verify_public_site.py check
       python tools/verify_public_site.py live https://choiyhunn.github.io/choiYhunn/
"""
import hashlib
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'docs'
ALLOWLIST = ROOT / 'tools' / 'PUBLISH_ALLOWLIST.txt'

FORBIDDEN = [
    (r'gh[pousr]_[A-Za-z0-9]{20,}', 'GitHub token'),
    (r'github_pat_[A-Za-z0-9_]{20,}', 'GitHub token'),
    (r'sk-[A-Za-z0-9]{20,}', 'API key'),
    (r'AKIA[0-9A-Z]{16}', 'AWS key'),
    (r'BEGIN [A-Z ]*PRIVATE KEY', 'private key'),
    (r'(?i)(app_?key|app_?secret|api_?key|access_?token)\s*[:=]\s*["\']?[A-Za-z0-9/+_-]{12,}', 'credential assignment'),
    (r'01[016789]-?\d{3,4}-?\d{4}', 'phone number'),
    (r'\d{6}-[1-4]\d{6}', 'resident registration number'),
    (r'계좌번호|account number', 'bank account'),
    (r'brain/private/', 'private Shared Brain path'),
    (r'(?i)C:\\\\Users\\\\|C:/Users/', 'local Windows path'),
    (r'/home/physicar', 'vehicle workspace path'),
    (r'강의 ?대본|강의 ?교안|족보', 'course source material'),
    (r'신재호|곽효건|구민수|전재욱|LeeTaeHyeon', 'teammate or co-author name'),
    (r'amet-2026-sqracing', 'private team repository'),
    (r'(?i)\b(knox|mysingle|sec\.samsung)\b', 'Samsung internal system'),
]
TEXT_EXT = {'.html', '.js', '.css', '.svg', '.txt', '.md', '.json'}


def site_files():
    return sorted(p.relative_to(SITE).as_posix() for p in SITE.rglob('*') if p.is_file())


def allowlist():
    lines = [l.strip() for l in ALLOWLIST.read_text(encoding='utf-8').splitlines()]
    entries = [l for l in lines if l and not l.startswith('#')]
    bad = [e for e in entries if any(c in e for c in '*?[]') or e.startswith('/') or '..' in e]
    if bad:
        sys.exit(f'allowlist must hold exact relative paths: {bad}')
    return entries


def check():
    failures = []
    files, allowed = site_files(), allowlist()
    failures += [f'not in allowlist: {f}' for f in files if f not in allowed]
    failures += [f'allowlisted but missing: {f}' for f in allowed if f not in files]
    for rel in files:
        path = SITE / rel
        if path.suffix not in TEXT_EXT or rel.startswith('assets/vendor/'):
            continue
        text = path.read_text(encoding='utf-8', errors='replace')
        for pattern, label in FORBIDDEN:
            for m in re.finditer(pattern, text):
                failures.append(f'{rel}: {label}: {text[max(0, m.start() - 30):m.end() + 30]!r}')
    index = (SITE / 'index.html').read_text(encoding='utf-8')
    for ref in re.findall(r'(?:src|href)="([^"#:]+)"', index):
        if not (SITE / ref).is_file():
            failures.append(f'index.html references missing file: {ref}')
    if failures:
        print('\n'.join(failures))
        sys.exit(f'{len(failures)} publication check failure(s)')
    print(f'check ok: {len(files)} files, all allowlisted, no forbidden patterns, index assets resolve')


def fetch(url):
    req = urllib.request.Request(url, headers={'Cache-Control': 'no-cache'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b''


def live(base):
    base = base.rstrip('/') + '/'
    failures = []
    for attempt in range(10):
        failures = []
        for rel in allowlist():
            status, body = fetch(base + rel + f'?v={int(time.time())}')
            local = (SITE / rel).read_bytes()
            if status != 200:
                failures.append(f'{rel}: HTTP {status}')
            elif hashlib.sha256(body).digest() != hashlib.sha256(local).digest():
                failures.append(f'{rel}: served bytes differ from repository')
        status, _ = fetch(base + 'index.html')
        root_status, root = fetch(base)
        if root_status != 200 or b'Yonghun Portfolio' not in root:
            failures.append(f'site root: HTTP {root_status} or unexpected page')
        for probe in ('data.json', 'server.py', 'tools/PUBLISH_ALLOWLIST.txt', 'this-path-is-not-published.html'):
            status, _ = fetch(base + probe)
            if status != 404:
                failures.append(f'{probe}: expected 404, got {status}')
        if not failures:
            print(f'live ok: {len(allowlist())} files byte-identical at {base}; unpublished paths return 404')
            return
        print(f'attempt {attempt + 1}: {len(failures)} mismatch(es), retrying in 30s')
        time.sleep(30)
    print('\n'.join(failures))
    sys.exit('live verification failed')


if __name__ == '__main__':
    if len(sys.argv) >= 2 and sys.argv[1] == 'check':
        check()
    elif len(sys.argv) == 3 and sys.argv[1] == 'live':
        live(sys.argv[2])
    else:
        sys.exit(__doc__)
