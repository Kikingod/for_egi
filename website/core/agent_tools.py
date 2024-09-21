from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.utils.function_calling import convert_to_openai_function
from langchain.tools.retriever import create_retriever_tool
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
from langchain_community.agent_toolkits import create_sql_agent
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
from langchain_openai import ChatOpenAI
import os

_ = load_dotenv()


# Assuming the database is located in 'docs/chroma' relative to the project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PERSIST_DIRECTORY = os.path.join(BASE_DIR, 'docs', 'chroma')
SQL_DATABASE_PATH = os.path.join(BASE_DIR, 'data', 'DB', 'keyboards.db')


# Load existing vector database
# persist_directory = "../docs/chroma"
embedding = OpenAIEmbeddings()
vectordb = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embedding)

# Create retriever tool
retriever = vectordb.as_retriever()
retriever_tool = create_retriever_tool(
    retriever,
    name='company_info_search',
    description='Search for info about Epomaker. For info like shipping and handling, about us, FAQ, accessories, you have to use this tool. NOTE: this tool does not provide info about specific keyboards'
)

# Connect to SQLite database
#engine = create_engine("sqlite:///../data/DB/keyboards.db")
engine = create_engine(f"sqlite:///{SQL_DATABASE_PATH}")
db = SQLDatabase(engine=engine)
llm_gpt4o = ChatOpenAI(model='gpt-4o', temperature=0, streaming=True)
sql_agent_executor = create_sql_agent(llm_gpt4o, db=db, agent_type="openai-tools", verbose=False)

@tool
def sql_query(query: str) -> str:
    '''Look up relevant information for SQL documents. These include specific keyboard information -  ProductID,ProductName,Price,Availability,SaleStatus,DiscountPercent,PriceAfterSale'''
    return sql_agent_executor.invoke({"input": query})


# Not implemented tools
@tool
def chat_handoff() -> str:
    ''' Transfer to human agent '''
    pass

@tool
def order_information() -> str:
    ''' Get information about user order status '''
    pass
