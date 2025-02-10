from swarm import Agent, Swarm
import os
from openai import OpenAI

from prompt_hub import (
    instructions_for_chat_agent
)

from function_impl import search_web


def create_chat_agent() -> Agent:
    agent_name = "The Knowledgeable and Loyal Bartender"
    # long_ctx_model_name = os.environ['LONG_CTX_MODEL_NAME']

    model_name = os.environ['MODEL_NAME']

    chat_agent_instance = Agent(
        name=agent_name,
        instructions=instructions_for_chat_agent(),
        model=model_name,
        functions=[search_web],       # now we are in test phase, just test the output for streaming.
    )

    return chat_agent_instance