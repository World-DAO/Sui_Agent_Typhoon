# The evaluator agent will store the relevant information of user to Nillion's
# SecretVault.

from typing import List, Dict, Union
import requests
import json
import os
from openai import OpenAI
from datetime import datetime, timedelta
from prompt_hub import (
    instructions_for_evaluate_agent
)

BACKEND_BASE_URL = "http://47.236.128.7:3000"
GRADE_TIME_GAP = 7 # in days

def fetch_chat_history_sync(user_id: str, previous_count: int=100) -> Union[List[Dict], None]:
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
    if '/' in user_id:
        user_id = user_id.replace('/', 'x')
    response = requests.get(BACKEND_BASE_URL + backend_chat_api, params={'user_id': user_id, 'prev_cnt': previous_count})
    if response.status_code == 200:
        chat_history = response.json()
        if 'success' in chat_history and chat_history['success']:
            return chat_history['data']
    else:
        return None


def fetch_sent_bottles_sync(user_id: str) -> Union[List[Dict], None]:
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
    if '/' in user_id:
        user_id = user_id.replace('/', 'x')
    response = requests.get(BACKEND_BASE_URL + backend_sent_api, params={'user_id': user_id})
    if response.status_code == 200:
        sent_bottles = response.json()  
        if 'success' in sent_bottles and sent_bottles['success']:
            return sent_bottles['data']
    else:
        return None


def grade_chat_history(context_variables: dict, user_id: str) -> str:
    """Grade the chat history of the user from 0 to 100. This function will first fetch the chat history from
        backend and then use another omniscient llm to grade the chat history. After that, agent should reflect on
        the grades to make sure it is fair and accurate.
        
    Args:
        context_variables (dict): The context variables of the user.
        user_id (str): The user id of the user.

    Returns:
        str: The grade of the chat history of the user.
    """
    if '/' in user_id:
        user_id = user_id.replace('/', 'x')
    chat_history = fetch_chat_history_sync(user_id)

    if chat_history is None:
        return "Sorry, I couldn't fetch the chat history. Please try again later."

    # clean the chat history
    filtered_data = [
        item for item in chat_history
        if item["role"] == "user"
    ]
    if len(filtered_data) > 100:
        filtered_data = filtered_data[-100:]
    result_str = "\n".join(f"{item['role']}: {item['content']}" for item in filtered_data)

    base_url = os.environ['BASE_URL']
    api_key = os.environ['OPENAI_API_KEY']
    long_model_name = os.environ['LONG_CTX_MODEL_NAME']

    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    this_llm_messages = [
        {
            "role": "system",
            "content": instructions_for_evaluate_agent()
        },
        {
            "role": "user",
            "content": f"Grade this for me: {result_str}"
        }
    ]

    try:
        response = client.chat.completions.create(
            messages=this_llm_messages,
            model=long_model_name,
            temperature=0.01
        )
    except Exception as e:
        print(e)
        return f"Sorry, I couldn't summarize. The error message is: {e}"

    return response.choices[0].message.content



def grade_sent_bottles(context_variables: dict, user_id: str) -> str:
    """Grade the bottles sent from the user from 0 to 100. This function will first fetch the bottles sent by user, from
        backend and then use another omniscient llm to grade the secret content of the bottles. After that, agent should reflect on
        the grades to make sure it is fair and accurate.
        
    Args:
        context_variables (dict): The context variables of the user.
        user_id (str): The user id of the user.

    Returns:
        str: The grade of the bottles content sent from the user.
    """
    bottles_data = fetch_sent_bottles_sync(user_id)

    if bottles_data is None:
        return "Sorry, I couldn't fetch the bottles sent. Please try again later."

    filtered_data = [
        item for item in bottles_data
    ]
    result_str = "\n===========\n".join(f"{item['title']}: {item['story_content']}" for item in filtered_data)

    base_url = os.environ['BASE_URL']
    api_key = os.environ['OPENAI_API_KEY']
    long_model_name = os.environ['LONG_CTX_MODEL_NAME']

    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    this_llm_messages = [
        {
            "role": "system",
            "content": instructions_for_evaluate_agent()
        },
        {
            "role": "user",
            "content": f"Grade this for me: {result_str}"
        }
    ]

    try:
        response = client.chat.completions.create(
            messages=this_llm_messages,
            model=long_model_name,
            temperature=0.01
        )
    except Exception as e:
        print(e)
        return f"Sorry, I couldn't summarize. The error message is: {e}"

    return response.choices[0].message.content


def compute_new_intimacy(context_variables: dict, mark_of_chat_history: int, mark_of_bottles_content: int) -> str:
    """Compute the new intimacy of the user based on the grades of chat history and bottles content.
        This function is a mathematical function so make sure the parameters are in the correct datatype.
        
    Args:
        context_variables (dict): The context variables of the user.
        mark_of_chat_history (int): The grade of the chat history of the user.
        mark_of_bottles_content (int): The grade of the bottles content sent from the user.

    Returns:
        str: The new intimacy of the user.
    """
    original_intimacy = -1
    bottle_conn = 0

    user_id = context_variables['user_id']

    backend_intimacy_api = '/api/get_intimacy'
    response = requests.get(BACKEND_BASE_URL + backend_intimacy_api, params={'user_id': user_id})
    if response.status_code == 200:
        inti_data = response.json()
        if 'success' in inti_data and inti_data['success']:
            original_intimacy = inti_data['intimacy']
    
    backend_conn_api = "/api/get_reply_num/"
    bottles_data = fetch_sent_bottles_sync(user_id)
    
    for item in bottles_data:
        storyId = item['id']
        response = requests.get(BACKEND_BASE_URL + backend_conn_api + str(storyId))
        if response.status_code == 200:
            conn_data = response.json()
            if 'success' in conn_data and conn_data['success']:
                bottle_conn = conn_data['reply_num'] if conn_data['reply_num'] > bottle_conn else bottle_conn

    new_intimacy = original_intimacy + (mark_of_chat_history / 100) * 2 + (mark_of_bottles_content / 100) + bottle_conn * 2
    if new_intimacy >= original_intimacy * 1.5:
        new_intimacy = original_intimacy * 1.5
    return new_intimacy