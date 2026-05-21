from pathlib import Path

BASE = Path(__file__).parent
TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
}


def load_file(path):
    target = (BASE / path).resolve()
    if BASE.resolve() not in target.parents and target != BASE.resolve():
        return None, 'text/plain; charset=utf-8'
    if not target.exists() or not target.is_file():
        return None, 'text/plain; charset=utf-8'
    return target.read_bytes(), TYPES.get(target.suffix, 'application/octet-stream')


def app(environ, start_response):
    raw_path = environ.get('PATH_INFO') or '/'
    path = raw_path.lstrip('/')
    if not path or path.endswith('/'):
        path = 'index.html'
    body, content_type = load_file(path)
    if body is None:
        body, content_type = load_file('index.html')
    start_response('200 OK', [('Content-Type', content_type), ('Cache-Control', 'public, max-age=0, must-revalidate')])
    return [body or b'']

application = app
