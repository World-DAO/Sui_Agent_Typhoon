import httpx
import os
from openai import AsyncOpenAI
from typing import List, Dict, Union

# =================================================
from prompt_hub import (
    instructions_for_summary_agent_base,
    instructions_for_summary_agent,
)

BACKEND_BASE_URL = "http://47.236.128.7:3000"

async def fetch_chat_history(user_id: str, previous_count: int=100) -> Union[List[Dict], None]:
    """This function fetches chat history for a given user.
        If the user has a very long history, we cut it to the previous 
        100 messages.

        returns:
            "data": [
                {
                    "user_id": "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471",
                    "role": "user",
                    "content": "Hi, I'm noob",
                    "created_at": "2025-02-06T14:19:37.000Z"
                },]
    """
    backend_chat_api = '/api/chat_history'
    async with httpx.AsyncClient() as client:
        response = await client.get(BACKEND_BASE_URL + backend_chat_api, params={'user_id': user_id, 'prev_cnt': previous_count})
        if response.status_code == 200:
            chat_history = response.json()
            if 'success' in chat_history and chat_history['success']:
                return chat_history['data']
        else:
            return None


async def fetch_sent_bottles(user_id: str) -> Union[List[Dict], None]:
    """This function fetches the contents of bottles sent by a given user.
    
        returns:
            "data": [
                {
                    "id": 11,
                    "author_address": "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471",
                    "title": "When a Dream Ends",
                    "story_content": "I thought it wouldn’t hurt this much.",
                    "whiskey_points": 1,
                    "created_at": "2025-02-06T15:01:55.000Z"
                },]
    """
    backend_sent_api = '/api/sent_bottle_msg'
    async with httpx.AsyncClient() as client:
        response = await client.get(BACKEND_BASE_URL + backend_sent_api, params={'user_id': user_id})
        if response.status_code == 200:
            sent_bottles = response.json()  
            if 'success' in sent_bottles and sent_bottles['success']:
                return sent_bottles['data']
        else:
            return None


async def fetch_recv_bottles(user_id: str) -> Union[List[Dict], None]:
    """This function fetches the contents of bottles received by a given user.
    
        returns:
            "data": [
                {
                    "id": 12,
                    "author_address": "0xCA67f533ACEeBd68946cDcfF047121eeE124EACA",
                    "title": "When a Friend Becomes a Memory",
                    "story_content": "I still can’t believe he’s gone. It feels",
                    "whiskey_points": 1,
                    "created_at": "2025-02-06T15:02:57.000Z"
                },]
    """
    backend_recv_api = '/api/recv_bottle_msg'
    async with httpx.AsyncClient() as client:
        response = await client.get(BACKEND_BASE_URL + backend_recv_api, params={'user_id': user_id})
        if response.status_code == 200:
            recv_bottles = response.json()
            if 'success' in recv_bottles and recv_bottles['success']:
                return recv_bottles['data']
        else:
            return None


async def agent_understand_user(user_id: str) -> Dict[str, str]:
    """This function is a wrapper function that calls the appropriate fetch function 
       based on the user_id. This function will be called by the API entry point. 
       Because we need to provide a simple context about the user to agent, so that
       the agent can generate better responses.

        params:
            user_id: str, the wallet address of the user.
    """
    chat_history: List[dict] = await fetch_chat_history(user_id)
    sent_bottles: List[dict] = await fetch_sent_bottles(user_id)

    chat_history_str = ""
    for item in chat_history:
        chat_history_str += item['role'] + ": " + item['content'] + "\n"

    sent_bottles_str = ""
    for item in sent_bottles:
        sent_bottles_str += item['title'] + "\n\n" + item['bottle_content'] + "\n====================\n"

    return {
        "chat_history": chat_history_str,
        "sent_bottles": sent_bottles_str,
    }


async def summarize_mannually(aspect: str, user_info: str):
    match aspect:
        case 'chat_history':
            llm_instructions = instructions_for_summary_agent_base() + instructions_for_summary_agent('chat_history')
            this_llm_messages = [
                {
                    "role": "system",
                    "content": llm_instructions
                },
                {
                    "role": "user",
                    "content": f"Please summarize the following chat history: {user_info}"
                }
            ]
        case'sent_bottles':
            llm_instructions = instructions_for_summary_agent_base() + instructions_for_summary_agent('sent_bottles')
            this_llm_messages = [
                {
                    "role": "system",
                    "content": llm_instructions
                },
                {
                    "role": "user",
                    "content": f"Please summarize the following phrases: {user_info}"
                }
            ]
        # case'recv_bottles':
        #     llm_instructions = instructions_for_summary_agent_base() + instructions_for_summary_agent('recv_bottles')
        #     this_llm_messages = [
        #         {
        #             "role": "system",
        #             "content": llm_instructions
        #         },
        #         {
        #             "role": "user",
        #             "content": f"Please summarize the following phrases: {user_info}"
        #         }
        #     ]
        case _:
            raise ValueError(f"Invalid aspect for summarize_mannually: {aspect}")


    
    base_url = os.environ['BASE_URL']
    api_key = os.environ['OPENAI_API_KEY']
    long_model_name = os.environ['LONG_CTX_MODEL_NAME']

    aclient = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url
    )

    try:
        response = await aclient.chat.completions.create(
            messages=this_llm_messages,
            model=long_model_name,
            temperature=0.01
        )
    except Exception as e:
        print(e)
        return f"Sorry, I couldn't summarize. The error message is: {e}"

    return response.choices[0].message.content


async def launch_summary(user_id: str) -> Dict[str, Union[str, None]]:
    user_info_collections: Dict[str, str] = await agent_understand_user(user_id)
    summaries = {}
    for aspect, user_info in user_info_collections.items():
        if user_info is None:
            summaries[aspect] = None
            continue
        elif aspect == "recv_bottles":
            summaries[aspect] = None
            continue

        summary = await summarize_mannually(aspect, user_info)
        summaries[aspect] = summary
    return summaries