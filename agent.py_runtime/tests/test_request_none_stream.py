import requests

response = requests.post("http://localhost:8080/api/chat_no_stream", json={
    "user_id": "0xff",
    "content": "What is the language of the year in 2024 according to TIOBE?"
})

res = response.json()
print(res)