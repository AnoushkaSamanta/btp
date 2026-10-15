import os
import re
import urllib.request
import urllib.error
import ssl
import json
import socket

# Disable SSL verification for government sites with outdated root certificates
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

regex = re.compile(r'https?://[^\s"\'<>()\[\]`]+')
urls_map = {}

ignore_dirs = {'node_modules', '.git', '.gemini', 'dist', 'build', '__pycache__', '.venv', 'venv'}

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if file.endswith(('.ts', '.tsx', '.py', '.json', '.md', '.html')):
            path = os.path.join(root, file).replace('\\', '/')
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for line_no, line in enumerate(f, 1):
                        found = regex.findall(line)
                        for u in found:
                            u_clean = u.rstrip('.,;:)"\'')
                            if not any(loc in u_clean for loc in ['localhost', '127.0.0.1', 'schemas.', 'w3.org', 'schema.org']):
                                if u_clean not in urls_map:
                                    urls_map[u_clean] = []
                                urls_map[u_clean].append((path, line_no))
            except Exception as e:
                pass

print(f"Total distinct external URLs found: {len(urls_map)}")

results = []
for url, occurrences in urls_map.items():
    res = {
        "url": url,
        "occurrences": len(occurrences),
        "files": list(set(f[0] for f in occurrences))[:5],
        "status": None,
        "error": None
    }
    results.append(res)

with open("urls_inventory.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Saved urls_inventory.json")
