import json
import urllib.request
import urllib.error
import ssl
import socket
import concurrent.futures

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open("urls_inventory.json", "r", encoding="utf-8") as f:
    items = json.load(f)

# Filter down to URLs that are in project code/data/docs, skip evaluation benchmark URLs (like github.com/some/repo or pubmed unless relevant)
# Let's inspect which domains are present
def check_url(item):
    url = item["url"]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        # First try HEAD
        req.get_method = lambda: "HEAD"
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            item["status"] = resp.status
            return item
    except Exception as e_head:
        # Some servers reject HEAD, try GET with range or small stream
        try:
            req.get_method = lambda: "GET"
            with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
                item["status"] = resp.status
                return item
        except urllib.error.HTTPError as e:
            item["status"] = e.code
            item["error"] = str(e.reason)
        except urllib.error.URLError as e:
            item["status"] = 0
            item["error"] = str(e.reason)
        except Exception as e:
            item["status"] = 0
            item["error"] = str(e)
    return item

print(f"Checking {len(items)} URLs...")

# Prioritize URLs in frontend, backend/schemes, backend/data, backend/training, README
priority_items = []
other_items = []
for item in items:
    files = " ".join(item["files"])
    if any(k in files for k in ["frontend/src", "backend/schemes", "backend/data", "backend/training", "backend/rules", "README.md", "docs/"]):
        priority_items.append(item)
    else:
        other_items.append(item)

print(f"Priority project URLs: {len(priority_items)}, Other URLs: {len(other_items)}")

with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
    checked_priority = list(executor.map(check_url, priority_items))

with open("checked_priority_urls.json", "w", encoding="utf-8") as f:
    json.dump(checked_priority, f, indent=2)

broken = [x for x in checked_priority if x["status"] not in [200, 301, 302, 303, 307, 308]]
print(f"Priority check done. Working/Redirect: {len(checked_priority) - len(broken)}, Broken/Unreachable: {len(broken)}")
for b in broken:
    print(f"[{b['status']}] {b['url']} -> {b['error']} (in {b['files']})")
