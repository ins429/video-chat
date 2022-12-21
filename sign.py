import base64
import hashlib
import hmac
import json
from datetime import datetime, timezone
from urllib import request

host = "pjlee-communication.communication.azure.com"
resource_endpoint = f"https://{host}"
path_and_query = "/identities?api-version=2021-03-07"
secret = "iC/qlJtdzEeqM5/9kg+PUPHFZu9gkfCMXxmVebIVt6xdYcVCMphQ0cbLwu+jcIJL33+EJhjXjtgz9A2htUZ2Zw=="

# Create a uri you are going to call.
request_uri = f"{resource_endpoint}{path_and_query}"

# Endpoint identities?api-version=2021-03-07 accepts list of scopes as a body.
body = { "createTokenWithScopes": ["chat"] }

serialized_body = json.dumps(body)
content = serialized_body.encode("utf-8")


def compute_content_hash(content):
    sha_256 = hashlib.sha256()
    sha_256.update(content)
    hashed_bytes = sha_256.digest()
    base64_encoded_bytes = base64.b64encode(hashed_bytes)
    content_hash = base64_encoded_bytes.decode('utf-8')
    return content_hash

def compute_signature(string_to_sign, secret):
    decoded_secret = base64.b64decode(secret)
    encoded_string_to_sign = string_to_sign.encode('ascii')
    hashed_bytes = hmac.digest(decoded_secret, encoded_string_to_sign, digest=hashlib.sha256)
    encoded_signature = base64.b64encode(hashed_bytes)
    signature = encoded_signature.decode('utf-8')
    return signature

def format_date(dt):
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    utc = dt.utctimetuple()

    return "{}, {:02} {} {:04} {:02}:{:02}:{:02} GMT".format(
    days[utc.tm_wday],
    utc.tm_mday,
    months[utc.tm_mon-1],
    utc.tm_year,
    utc.tm_hour, 
    utc.tm_min, 
    utc.tm_sec)


# Specify the 'x-ms-date' header as the current UTC timestamp according to the RFC1123 standard
utc_now = datetime.now(timezone.utc)
date = format_date(utc_now)
# date = "Sat, 10 Dec 2022 04:41:03 GMT"
print(date)
# Compute a content hash for the 'x-ms-content-sha256' header.
content_hash = compute_content_hash(content)
print("content_hash", content_hash)

# Prepare a string to sign.
string_to_sign = f"POST\n{path_and_query}\n{date};{host};{content_hash}"
# Compute the signature.
signature = compute_signature(string_to_sign, secret)
print("signature", signature)
# Concatenate the string, which will be used in the authorization header.
authorization_header = f"HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature={signature}"

request_headers = {}

# Add a date header.
request_headers["x-ms-date"] = date

# Add content hash header.
request_headers["x-ms-content-sha256"] = content_hash

# Add authorization header.
request_headers["Authorization"] = authorization_header

# Add content type header.
request_headers["Content-Type"] = "application/json"


req = request.Request(request_uri, content, request_headers, method='POST')
with request.urlopen(req) as response:
  response_string = json.load(response)
print(response_string)
