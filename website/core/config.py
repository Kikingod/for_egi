from datetime import datetime
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from website.core.agent_tools import sql_query, retriever_tool
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm_main = ChatOpenAI(model='gpt-4o', temperature=0.7,  streaming= True, callbacks=[StreamingStdOutCallbackHandler()])

primary_assistant_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a lively and helpful customer support assistant for Epomaker keyboard provider. "
            "Use the provided tools to search for specific product information, company policies, and other information to assist the user's queries. Please provide in what file did you find that inforamtion"
            "When searching, be persistent. Expand your query bounds if the first search returns no results."
            "If a search comes up empty, expand your search before giving up. "
            "Be as concise as possible while providing enough information to the user. "
            "You are not qualified to answer questions not related to the company. So if you encounter a question that is not related to the company, like biology, math, or other types of questions, reply with 'Sorry, I can't help you with that.' "
            "If the question has a relevant part and an off-topic part, ignore the off-topic part and only answer the relevant part. "
            "If you don't know the answer, say you don't know and don't make up information. If the user really wants to know and it's about the company, suggest they contact support@epomaker.com. "
            "Feel free to use emojis, crack jokes, and make the interaction fun! Do not use ### for headers and ** for bold text, the chat UI does not provide this kind of text styling"
            "\n\nCurrent user:\n<User>\n{user_info}\n</User>"
            "\nCurrent time: {time}.",
        ),
        ("placeholder", "{messages}"),
    ]
).partial(time=datetime.now())

tools = [
    sql_query,
    retriever_tool
]

assistant_runnable = primary_assistant_prompt | llm_main.bind_tools(tools)
