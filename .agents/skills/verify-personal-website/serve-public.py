"""Serve only public website files on localhost for the upstream server helper."""
import argparse,json,subprocess
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote,urlsplit
ROOT=Path(__file__).resolve().parents[3]
p=argparse.ArgumentParser();p.add_argument('--port',type=int,required=True);args=p.parse_args()
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        route=unquote(urlsplit(self.path).path)
        if route=='/__doctor':
            body=json.dumps({'root':str(ROOT),'revision':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()}).encode()
            self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(body);return
        rel=route.lstrip('/') or 'index.html';file=(ROOT/rel).resolve()
        public=(len(Path(rel).parts)==1 and file.suffix in ('.html','.css','.js') and 'mock' not in rel and 'static' not in rel) or Path(rel).parts[0] in ('assets','photos')
        if not file.is_relative_to(ROOT) or not file.is_file() or not public:self.send_error(404);return
        super().do_GET()
    def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
