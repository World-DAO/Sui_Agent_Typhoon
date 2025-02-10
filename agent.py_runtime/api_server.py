from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.concurrency import run_in_threadpool
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
from loguru import logger
import os
import httpx
import asyncio
import json
from fastapi.middleware.cors import CORSMiddleware

# ============ Custom Modules ============
from agent_impl import (
    test_swarm, 
    test_swarm_stream,
    get_embeddings,
    create_chat_agent,
    create_swarm_client,
    run_swarm_in_threadpool,
    create_tx_agent
)

from function_impl import (
    launch_summary
)

from utils import (
    ChatRequest,
    CommonRequest,
    store_chat_history
)

# To store user's chat history. In our design, the front end will be responsible for storing the chat history 
# to backend server. Thus we agent micro service doesn't need to store the chat history. But in case the chat 
# will last for a long time, not a one-time chat, we can use a global cache to store the chat history.
GlobalChatCache = {
    "0xtttt": [
        {
            "role": "ai",
            "content": "hello"
        },
        {
            "role": "user",
            "content": "hi"
        }
    ]
}

GlobalUserAnalyticCache = {
    "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471": {
        "chat_history": "User is practical, detail-oriented, and focused on improvement, showing a strong interest in programming and gaming. They value consistency and seek guidance in language choices, indicating a desire for efficiency and effectiveness in their work. Their language is polite and respectful, with a touch of humor and a metaphorical style. They have a clear preference for Python and JavaScript, reflecting a focus on web development and data science. They also show an interest in learning and adapting to new technologies, as indicated by their inquiry about Go and Rust. Overall, the user is a dedicated learner and a meticulous planner, always striving for the best tools and practices in their field.\n",
        "sent_bottles": "User feels unrequited love, deeply hurt, and unable to express feelings. Seeks connection, fears vulnerability, and grapples with lost hope.\n"
    }
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv(dotenv_path="./.env")
    logger.info(f"========= Setting LLM Service Provider =========")
    logger.info(f"base_url: {os.environ['BASE_URL']}")
    logger.info(f"openai_api_key: {'Got!' if os.environ['OPENAI_API_KEY'] else 'Not Found!'}")
    # in our practice, we strongly recommend to use a long-context model for chatbot.
    logger.info(f"long_context_model_name: {os.environ['LONG_CTX_MODEL_NAME']}")
    logger.info(f"================================================")
    # test_swarm()
    # test_swarm_stream()
    # embeddings = await get_embeddings(["hello world", "No pain, no gain"])
    # print(embeddings)
    yield


app = FastAPI(lifespan=lifespan)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/api/prepare_chat")
async def prepare_chat(request: CommonRequest):
    global GlobalUserAnalyticCache
    user_desc = await launch_summary(request.user_id)
    if 'recv_bottles' in user_desc:
        user_desc.pop('recv_bottles')   # no need to summarize this

    # cache user's chat history
    GlobalUserAnalyticCache[request.user_id.lower()] = user_desc

    return {"status": "OK", "user_desc": user_desc}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    user_id = request.user_id.lower()
    content = request.content
    
    chat_agent = create_chat_agent()
    swarm_client = create_swarm_client()

    # get user's analytic cache
    user_analytic_cache = GlobalUserAnalyticCache.get(user_id, {})
    user_analytic_cache_str = f"From the chat history, the user is {user_analytic_cache.get('chat_history', 'not found')}; from the sent bottles content, the user is {user_analytic_cache.get('sent_bottles', 'not found')}."

    async def stream_response():
        try:
            stream = await asyncio.wait_for(
                run_in_threadpool(
                    run_swarm_in_threadpool,
                    swarm_client,
                    chat_agent,
                    [
                        {
                            "role": "system",
                            "content": user_analytic_cache_str + ". Please serve him well."
                        },
                        {
                            "role": "user",
                            "content": content
                        }
                    ], 
                    debug=False,
                    stream=True
                ),
                timeout=10
            )

            for chunk in stream:
                # print(chunk)
                # two branches: tool_call or generate
                if chunk.get("tool_calls", None) is not None:
                    # TODO: handle tool_calls
                    content_slice = chunk['tool_calls'][-1]['function']['arguments']
                    if "{" in content_slice or "}" in content_slice:
                        content_slice = content_slice.replace("{", "").replace("}", "")
                    # print(str(content_slice))
                    yield json.dumps({"type": "tool_calls", "content": str(content_slice)})
                else:
                    # TODO: handle generate
                    if chunk.get("content", None) is not None and len(chunk['content']) > 0 and ('<' not in chunk['content'] or '>' not in chunk['content']):
                        content_slice = chunk['content']
                        # print(str(content_slice))
                        yield json.dumps({"type": "agent_answer", "content": str(content_slice)})

                await asyncio.sleep(0)  # 让出事件循环，提高流畅性
        except asyncio.TimeoutError:
            yield json.dumps({"type": "timeout", "content": "Sorry, the agent is busy now. Please try again later."})
    # # in this case, the user has one message and ai has one message.
    # user_prompt = content
    # ai_response = response.messages[-1]["content"]

    # # store chat history to db
    # await store_chat_history(user_id, "user", user_prompt)
    # await store_chat_history(user_id, "ai", ai_response)

    # print(response.messages)

    # return {"status": "OK", "agent_response": response.messages[-1]["content"]}

    return StreamingResponse(stream_response(), media_type="application/json")


@app.post("/api/chat_no_stream")
async def chat_no_stream(request: ChatRequest):
    user_id = request.user_id.lower()
    content = request.content
    
    chat_agent = create_chat_agent()
    swarm_client = create_swarm_client()

    # get user's analytic cache
    user_analytic_cache = GlobalUserAnalyticCache.get(user_id, {})
    user_analytic_cache_str = f"From the chat history, the user is {user_analytic_cache.get('chat_history', 'not found')}; from the sent bottles content, the user is {user_analytic_cache.get('sent_bottles', 'not found')}."

    response = await asyncio.wait_for(
        run_in_threadpool(
            run_swarm_in_threadpool,
            swarm_client,
            chat_agent,
            [
                {
                    "role": "system",
                    "content": user_analytic_cache_str + ". Please serve him well."
                },
                {
                    "role": "user",
                    "content": content
                }
            ], 
            debug=False,
            stream=False
        ),
        timeout=10
    )

            
    # # in this case, the user has one message and ai has one message.
    # user_prompt = content
    # ai_response = response.messages[-1]["content"]

    # # store chat history to db
    # await store_chat_history(user_id, "user", user_prompt)
    # await store_chat_history(user_id, "ai", ai_response)

    # print(response.messages)

    return {"status": "OK", "agent_response": response.messages[-1]["content"]}


@app.post("/api/send_tokens")
async def send_tokens(request: CommonRequest):
    user_id = request.user_id.lower()

    tx_agent = create_tx_agent()
    swarm_client = create_swarm_client()

    swarm_client.run(
        agent=tx_agent,
        messages=[{"role": "user", "content": f"Check if this user: {user_id} needs to be sent tokens? If so, send him some."}],
        debug=True,
        max_turns=30,
        context_variables={"user_id": user_id},
    )

    return {"status": "OK"}

@app.post("/api/send_NFT")
async def send_NFT(request: CommonRequest):
    user_id = request.user_id.lower()

    tx_agent = create_tx_agent()
    swarm_client = create_swarm_client()

    swarm_client.run(
        agent=tx_agent,
        # messages=[{"role": "user", "content": f"Send NFT to this user: {user_id}, this is his title: {} and this is his content: {}"}],
        debug=True,
        max_turns=30
    )

    return {"status": "OK"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)