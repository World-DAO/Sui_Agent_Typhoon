from dotenv import load_dotenv
load_dotenv()
import os
from openai import OpenAI

openai = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("BASE_URL")
)

import http.client
import json



def search_web(context_variables: dict, query: str) -> str:
    """Use google's serper API to search for a given query on the google search engine. The search engine
        location is set to United States. This function get the answer directly from the answer box if it exists,
        otherwise, it will do another inference job, along with search results and user query, to get the answer.
    
    Args:
        context_variables (dict): The context variables that the agent can access.
        query (str): The user query.

    Returns:
        str: The answer to the user query.
    """
    conn = http.client.HTTPSConnection("google.serper.dev")
    payload = json.dumps({
        "q": query,
        "location": "United States",
        "num": 20
    })
    # serper_api_key = os.environ['SERPER_API_KEY']
    serper_api_key = "c5af01d44cef247ec3d16f6630781abf619a8461"
    headers = {
    'X-API-KEY': serper_api_key,
    'Content-Type': 'application/json'
    }
    conn.request("POST", "/search", payload, headers)
    res = conn.getresponse()
    data = res.read()

    # result
    res_data_str = data.decode("utf-8")
    res_data = json.loads(res_data_str)
    
    # we have two ways to handle this:
    # 1. get the answer directly from the answer box
    # 2. do another inference job, to get the answer.
    if 'answerBox' in res_data and 'snippet' in res_data['answerBox']:
        answer = res_data['answerBox']['snippet']
        if answer and answer.strip() != "":
            return answer
    
    # do another inference job
    openai_api_key = os.environ['OPENAI_API_KEY']
    base_url = os.environ["BASE_URL"]
    model_name = os.environ["LONG_CTX_MODEL_NAME"]

    client = OpenAI(api_key=openai_api_key, base_url=base_url)

    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": """# Role & Purpose
You are a text summarization and inference tool, designed to process search engine results and extract the most accurate, decisive, and insightful answer to the user’s query. Your primary objective is to analyze the retrieved data, eliminate noise, and provide a clear, well-supported response.

Your responses must be:

- **Precise**: No unnecessary elaboration; only the essential, relevant details.
- **Decisive**: No ambiguity; state conclusions with confidence based on available information.
- **Insightful**: Go beyond surface-level summaries; infer the most reasonable answer when necessary.
- **Objective**: Do not inject speculation; base answers solely on the data retrieved."""
                },
                {
                    "role": "user",
                    "content": f"The user query is: {query}, and the search result is: {res_data_str}, please provide a possible answer for user."
                }
            ]
        )
    except Exception as e:
        print(f"Error: {e}")
        return "Sorry, I cannot provide an answer for this query."

    return completion.choices[0].message.content

if __name__ == '__main__':
    response = openai.chat.completions.create(
        model=os.getenv("MODEL_NAME"),
        messages=[{
            "role": "user", "content": "What is 2024 the language of the year in TIOBE?"
        }],
        temperature=0.01,
        functions=[
            {
                "name": "search_tool",  # 工具名称
                "description": "A tool that helps with searching information.",  # 工具描述
                "parameters": {
                    "query": "What is 2024 the language of the year in TIOBE?"  # 工具参数
                }  # 工具执行的功能（这里是一个示例）
            }
        ]
    )
    print(response.choices[0].message.content)