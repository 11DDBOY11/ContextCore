from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
import os, uuid

load_dotenv()

app = FastAPI(title="ContextCore AI Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma = chromadb.Client()
collection = chroma.get_or_create_collection("contextcore")

CODE_KEYWORDS = ['code', 'css', 'html', 'js', 'javascript', 'cursor', 'style',
                 'function', 'class', 'component', 'hook', 'scss', 'sass',
                 'animation', 'color', 'font', 'layout', 'flex', 'grid',
                 'variable', 'const', 'let', 'var', 'import', 'export',
                 'method', 'api', 'route', 'endpoint', 'model', 'schema']

class Chunk(BaseModel):
    text: str
    source: str
    type: Optional[str] = "meta"   # 'code' or 'meta'

class EmbedRequest(BaseModel):
    chunks: List[Chunk]
    source: str

class AskRequest(BaseModel):
    question: str

def get_embedding(text: str):
    res = client.embeddings.create(model="text-embedding-3-small", input=text)
    return res.data[0].embedding

def is_code_question(question: str) -> bool:
    q = question.lower()
    return any(k in q for k in CODE_KEYWORDS)

@app.get("/health")
def health():
    return {"status": "ok", "docs_count": collection.count()}

@app.post("/embed")
async def embed(req: EmbedRequest):
    for chunk in req.chunks:
        embedding = get_embedding(chunk.text)
        collection.add(
            ids=[str(uuid.uuid4())],
            embeddings=[embedding],
            documents=[chunk.text],
            metadatas=[{"source": chunk.source, "type": chunk.type}]
        )
    return {"embedded": len(req.chunks), "total": collection.count()}

@app.post("/ask")
async def ask(req: AskRequest):
    if collection.count() == 0:
        return {"answer": "No data ingested yet. Please ingest a GitHub repo first.", "sources": []}

    q_embedding = get_embedding(req.question)

    if is_code_question(req.question):
        # First: try fetching code chunks only
        code_results = collection.query(
            query_embeddings=[q_embedding],
            n_results=6,
            where={"type": "code"}
        )
        code_docs = code_results["documents"][0]
        code_sources = [m["source"] for m in code_results["metadatas"][0]]

        # Also fetch 2 meta chunks for general context
        meta_results = collection.query(
            query_embeddings=[q_embedding],
            n_results=2,
            where={"type": "meta"}
        )
        meta_docs = meta_results["documents"][0]
        meta_sources = [m["source"] for m in meta_results["metadatas"][0]]

        docs = code_docs + meta_docs
        sources = code_sources + meta_sources
    else:
        # General question — use all chunks
        results = collection.query(query_embeddings=[q_embedding], n_results=6)
        docs = results["documents"][0]
        sources = [m["source"] for m in results["metadatas"][0]]

    context = "\n\n".join([f"[{sources[i]}]: {docs[i]}" for i in range(len(docs))])

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are ContextCore, a project intelligence assistant. "
                    "Answer ONLY using the provided context below. "
                    "Always cite your source using the format [source-name]. "
                    "If the answer is not in the context, respond with: "
                    "'This information was not found in the project data.'"
                )
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {req.question}"
            }
        ],
        temperature=0.2
    )

    return {
        "answer": response.choices[0].message.content,
        "sources": list(set(sources))
    }

@app.post("/reset")
async def reset():
    global collection
    chroma.delete_collection("contextcore")
    collection = chroma.get_or_create_collection("contextcore")
    return {"message": "Knowledge base cleared"}