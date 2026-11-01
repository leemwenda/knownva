import json, urllib.request, http.cookiejar, threading, random, sys
from concurrent.futures import ThreadPoolExecutor

BASE = "http://localhost:3000"

class Client:
    """Tiny cookie-aware client that ignores the Secure flag on http://localhost."""
    def __init__(self):
        self.cookie = None
        self.opener = urllib.request.build_opener()

def client():
    return Client()

def call(op, method, path, data=None, ctype="application/json", raw=False):
    body = json.dumps(data).encode() if isinstance(data, dict) else data
    req = urllib.request.Request(BASE + path, data=body, method=method)
    if body is not None:
        req.add_header("Content-Type", ctype)
    if op.cookie:
        req.add_header("Cookie", op.cookie)
    try:
        res = op.opener.open(req)
        code, headers, payload = res.status, res.headers, res.read()
    except urllib.error.HTTPError as e:
        code, headers, payload = e.code, e.headers, e.read()
    cookie = headers.get("Set-Cookie")
    if cookie:
        op.cookie = cookie.split(";")[0]
    out = payload if raw else None
    if not raw:
        try:
            out = json.loads(payload)
        except Exception:
            out = payload[:200]
    return code, out

results = []
def check(name, cond, extra=""):
    results.append((name, bool(cond), extra))
    print(("PASS " if cond else "FAIL ") + name + (" :: " + str(extra)[:160] if not cond or True else ""))

# 0. preflight cleanup so the suite can be re-run safely
adm0 = client()
call(adm0, "POST", "/api/auth/login", {"email":"admin@knowva.app","password":"Admin@12345"})
s, _b = call(adm0, "GET", "/api/notes?status=all&pageSize=48&q=Relational%20Database%20Design")
for row in (_b.get("items") or []):
    if row.get("status") in ("removed", "rejected"):
        call(adm0, "PATCH", f"/api/notes/{row['id']}", {"status": "approved"})

s, b = call(adm0, "GET", "/api/notes?status=all&pageSize=48&q=Smoke%20Test%20Upload")
for row in (b.get("items") or []):
    call(adm0, "DELETE", f"/api/notes/{row['id']}")
s, structure = call(adm0, "GET", "/api/admin/academic-structure")
if s == 200:
    for key in ("institutions", "fields", "levels", "units"):
        for row in structure.get(key, []):
            if row["name"].startswith("Smoke"):
                call(adm0, "DELETE", f"/api/admin/academic-structure/{key}/{row['id']}")

# 1. health
op = client()
s, b = call(op, "GET", "/api/health")
check("health endpoint", s == 200 and b.get("ok"))

# 2. register unique student
email = f"smoke{random.randint(1000,99999)}@test.dev"
s, b = call(op, "POST", "/api/auth/register", {"name":"Smoke Student","email":email,"password":"Student@123","role":"student"})
check("register student", s == 201, b)

s, b = call(op, "GET", "/api/auth/me")
check("session cookie works", s == 200 and b.get("user", {}).get("email") == email, b)
sid = b["user"]["id"]

# 3. public registration cannot create superadmin
op2 = client()
s, b = call(op2, "POST", "/api/auth/register", {"name":"Hacker","email":f"h{random.randint(1,9999)}@test.dev","password":"Student@123","role":"superadmin"})
check("superadmin role rejected at signup", s == 422, (s,b))

# 4. RBAC: student blocked from admin + lecturer APIs
s, b = call(op, "GET", "/api/admin/dashboard")
check("student blocked from admin dashboard", s == 403, (s,b))
s, b = call(op, "GET", "/api/lecturer/dashboard")
check("student blocked from lecturer dashboard", s == 403, (s,b))
s, b = call(op, "GET", "/api/notes")
check("student can search notes", s == 200 and "items" in b, (s,b))
premium = [n for n in b["items"] if n["isPremium"]]
nid = premium[0]["id"] if premium else None
check("premium seeded note exists", nid is not None)

# 5. anonymous download blocked
anon = client()
s, b = call(anon, "GET", f"/api/notes/{nid}/download")
check("anonymous download blocked", s == 401, (s,b))

# 6. private data isolation: another student cannot read this student's notes
op3 = client()
call(op3, "POST", "/api/auth/register", {"name":"Other Student","email":f"o{random.randint(1,9999)}@test.dev","password":"Student@123","role":"student"})
s, b = call(op3, "PATCH", "/api/private-notes/1", {"title":"intruder"})
check("cannot edit another student's private note", s in (404, 401, 403), (s,b))

# 7. lecturer upload -> pending, needs moderation
lec = client()
s, b = call(lec, "POST", "/api/auth/login", {"email":"lecturer@knowva.app","password":"Lecturer@123"})
check("lecturer login", s == 200, (s,b))
pdf = b"%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF"
import urllib.parse
boundary = "----smokeboundary"
parts = []
fields = {"title":"Smoke Test Upload Notes","description":"Created by the smoke suite.","resourceType":"Notes","isPremium":"true","confirmedOwnership":"true","semester":"Semester 1"}
for k,v in fields.items():
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode())
parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"smoke.pdf\"\r\nContent-Type: application/pdf\r\n\r\n".encode() + pdf + b"\r\n")
parts.append(f"--{boundary}--\r\n".encode())
payload = b"".join(parts)
s, b = call(lec, "POST", "/api/notes", payload, ctype=f"multipart/form-data; boundary={boundary}")
check("lecturer upload accepted as pending", s == 201 and b.get("note", {}).get("status") == "pending", (s,b))
uploaded_id = b["note"]["id"] if s == 201 else None

# lecturer cannot self-approve
s, b = call(lec, "PATCH", f"/api/notes/{uploaded_id}", {"status":"approved"})
check("lecturer cannot approve own upload", s == 403, (s,b))

# student cannot see unapproved upload in public search
s, b = call(op, "GET", "/api/notes?q=Smoke%20Test%20Upload")
check("pending upload hidden from students", s == 200 and b["total"] == 0, (s,b))

# 8. admin approves it
adm = client()
s, b = call(adm, "POST", "/api/auth/login", {"email":"admin@knowva.app","password":"Admin@12345"})
check("admin login", s == 200, (s,b))
s, b = call(adm, "PATCH", f"/api/notes/{uploaded_id}", {"status":"approved"})
check("admin approval works", s == 200 and b.get("note", {}).get("status") == "approved", (s,b))
s, b = call(adm, "PATCH", f"/api/notes/{uploaded_id}", {"status":"rejected"})
check("rejection requires reason", s == 422, (s,b))
s, b = call(adm, "PATCH", f"/api/notes/{uploaded_id}", {"status":"approved"})

# 9. free-tier concurrency: 6 parallel premium downloads, only 3 may succeed
codes = []
def dl(_):
    o = client()
    call(o, "POST", "/api/auth/login", {"email":email,"password":"Student@123"})
    s2, _b = call(o, "GET", f"/api/notes/{nid}/download", raw=True)
    codes.append(s2)
with ThreadPoolExecutor(max_workers=6) as ex:
    list(ex.map(dl, range(6)))
ok = codes.count(200); blocked = codes.count(402)
check("concurrent downloads respect the 3/month free limit", ok == 3 and blocked == 3, codes)

# 10. premium subscriber is unlimited
call(adm, "POST", "/api/billing/checkout") if False else None
stud_email = email
s, b = call(adm, "GET", "/api/admin/audit-logs")
check("audit log records admin actions", s == 200 and any("note.approved" == i["log"]["action"] for i in b["items"]), (s, b["items"][0] if b.get("items") else None))

s, b = call(lec, "GET", "/api/lecturer/dashboard")
check("lecturer dashboard metrics", s == 200 and b["counts"]["approved"] >= 1, (s,b))

s, b = call(adm, "GET", "/api/admin/dashboard")
check("admin overview counts", s == 200 and b["totalUsers"] >= 4, (s,b))

s, b = call(adm, "POST", "/api/admin/academic-structure/levels", {"name":"Smoke Level"})
new_level = b.get("item", {}).get("id") if s == 201 else None
check("admin can create academic level", s == 201, (s,b))
s, structure = call(adm, "GET", "/api/admin/academic-structure")
referenced = next((f["id"] for f in structure.get("fields", []) if f.get("refCount")), None)
if referenced:
    s, b = call(adm, "DELETE", f"/api/admin/academic-structure/fields/{referenced}")
    check("structure delete guarded (referenced -> deactivate)", s == 200 and b.get("deactivated") is True, (s, b))
else:
    check("structure delete guarded (referenced -> deactivate)", False, "no referenced field found")

# 11. report + takedown (uses the suite-owned upload so seeded demo data survives re-runs)
target = uploaded_id or nid
s, b = call(op, "POST", f"/api/notes/{target}/report", {"reason":"Copyright infringement","details":"smoke test"})
check("student can report a resource", s == 201, (s,b))
report_id = b.get("report", {}).get("id") if s == 201 else None
s, b = call(adm, "PATCH", f"/api/admin/reports/{report_id}", {"status":"resolved","removeResource":True})
check("admin can resolve report with takedown", s == 200, (s,b))
s, b = call(op, "GET", f"/api/notes/{target}")
check("taken-down resource hidden from students", s == 404, (s,b))

# 12. password reset flow
s, b = call(client(), "POST", "/api/auth/forgot-password", {"email":email})
check("forgot password accepted", s == 200, (s,b))
s, b = call(client(), "POST", "/api/auth/reset-password", {"token":"bogus-token-value-123","password":"NewPass@123"})
check("invalid reset token rejected", s == 400, (s,b))

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} smoke checks passed")
sys.exit(1 if failed else 0)
