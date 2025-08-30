import os
import json
# import faiss
import logging
import tempfile
import whisper
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
# from crewai import Agent, Task, Crew

# ------------------------ ConstructionKnowledgeBase ------------------------
class ConstructionKnowledgeBase:
    def __init__(self, persist_dir: str = "./knowledge_base/construction"):
        self.persist_dir = persist_dir
        openai_api_key = "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"
        self.embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
        # if os.path.exists(persist_dir) and self._faiss_index_exists():
        #     self._load_vector_store()
        # else:
        #     self._create_new_vector_store()

    def _faiss_index_exists(self) -> bool:
        index_path = os.path.join(self.persist_dir, "faiss_index.bin")
        return os.path.isfile(index_path)

    def _create_new_vector_store(self):
        embedding_dim = 1536
        # index = faiss.IndexFlatL2(embedding_dim)
        docstore = InMemoryDocstore({})
        index_to_docstore_id = {}
        # self.vector_store = FAISS(
        #     index=index,
        #     docstore=docstore,
        #     index_to_docstore_id=index_to_docstore_id,
        #     embedding_function=self.embeddings
        # )
        os.makedirs(self.persist_dir, exist_ok=True)

    def _load_vector_store(self):
        index_path = os.path.join(self.persist_dir, "faiss_index.bin")
        docstore_path = os.path.join(self.persist_dir, "docstore.json")
        mapping_path = os.path.join(self.persist_dir, "index_to_docstore_id.json")
        # index = faiss.read_index(index_path)
        with open(docstore_path, "r", encoding="utf-8") as f:
            docstore_data = json.load(f)
        with open(mapping_path, "r", encoding="utf-8") as f:
            index_to_docstore_id = json.load(f)
        docstore = InMemoryDocstore(docstore_data)
        # self.vector_store = FAISS(
        #     # index=index,
        #     docstore=docstore,
        #     index_to_docstore_id=index_to_docstore_id,
        #     embedding_function=self.embeddings
        # )

    def save_vector_store(self):
        index_path = os.path.join(self.persist_dir, "faiss_index.bin")
        docstore_path = os.path.join(self.persist_dir, "docstore.json")
        mapping_path = os.path.join(self.persist_dir, "index_to_docstore_id.json")
        # faiss.write_index(self.vector_store.index, index_path)
        with open(docstore_path, "w", encoding="utf-8") as f:
            json.dump(self.vector_store.docstore._dict, f, indent=4)
        with open(mapping_path, "w", encoding="utf-8") as f:
            json.dump(self.vector_store.index_to_docstore_id, f, indent=4)

    def add_documents(self, docs: List[str], doc_ids: List[str] = None):
        if doc_ids is None:
            doc_ids = [str(i) for i in range(len(docs))]
        for doc_id, doc_text in zip(doc_ids, docs):
            self.vector_store.docstore._dict[doc_id] = doc_text
        vectors = self.embeddings.embed_documents(docs)
        start_idx = len(self.vector_store.index_to_docstore_id)
        for i, vec in enumerate(vectors):
            self.vector_store.index.add(vec.reshape(1, -1))
            self.vector_store.index_to_docstore_id[start_idx + i] = doc_ids[i]
        self.save_vector_store()

# ------------------------ MultiModalTrainingPipeline ------------------------
class MultiModalTrainingPipeline:
    def __init__(self):
        self.whisper_model = whisper.load_model("base")
        self.vision_model = self._initialize_vision_model()
        self.document_processor = self._initialize_document_processor()
        self.knowledge_extractor = self._initialize_knowledge_extractor()

    def _initialize_vision_model(self):
        return None  # Replace with real model if needed

    def _initialize_document_processor(self):
        return None  # Replace with real document parser if needed

    def _initialize_knowledge_extractor(self):
        return None  # Replace with real implementation if needed

    async def process_file(self, file: Any) -> Dict[str, Any]:
        if hasattr(file, "content_type") and file.content_type.startswith('audio/'):
            return await self._process_audio_file(file)
        elif hasattr(file, "content_type") and file.content_type.startswith('video/'):
            return await self._process_video_file(file)
        elif hasattr(file, "content_type") and file.content_type.startswith('application/pdf'):
            return await self._process_pdf_file(file)
        elif hasattr(file, "content_type") and file.content_type.startswith('image/'):
            return await self._process_image_file(file)
        else:
            return await self._process_text_file(file)

    async def _process_audio_file(self, file: Any) -> Dict[str, Any]:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file.flush()
            result = self.whisper_model.transcribe(
                tmp_file.name,
                language="en",
                task="transcribe",
                verbose=True
            )
            construction_knowledge = await self._extract_construction_knowledge(result['text'])
            os.unlink(tmp_file.name)
            return {
                'content_type': 'audio',
                'transcription': result['text'],
                'segments': result.get('segments', []),
                'construction_knowledge': construction_knowledge,
                'confidence_score': None,
                'filename': file.filename if hasattr(file, 'filename') else ""
            }

    async def _process_video_file(self, file: Any) -> Dict[str, Any]:
        return {"content_type": "video", "filename": getattr(file, 'filename', '')}

    async def _process_pdf_file(self, file: Any) -> Dict[str, Any]:
        return {"content_type": "pdf", "filename": getattr(file, 'filename', '')}

    async def _process_image_file(self, file: Any) -> Dict[str, Any]:
        return {"content_type": "image", "filename": getattr(file, 'filename', '')}

    async def _process_text_file(self, file: Any) -> Dict[str, Any]:
        content = await file.read()
        return {
            'content_type': 'text',
            'text': content.decode() if isinstance(content, bytes) else str(content),
            'filename': getattr(file, 'filename', '')
        }

    async def _extract_construction_knowledge(self, text: str) -> Dict[str, Any]:
        return {'extracted_knowledge': text, 'categories': [], 'actionable_insights': []}

# ------------------------ BrickBangAgenticSystem ------------------------
class BrickBangAgenticSystem:
    def __init__(self):
        api_key = "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"
        self.master_llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.1, openai_api_key=api_key)
        self.specialized_llm = ChatOpenAI(model="gpt-4", temperature=0.2, openai_api_key=api_key)
        self.knowledge_base = ConstructionKnowledgeBase()
        # self.agents = self._initialize_all_agents()
        # self.crews = self._initialize_crews()
        # self.monitoring_systems = self._initialize_monitoring()
        self.training_pipeline = MultiModalTrainingPipeline()
        self.active_projects = {}
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    # def _initialize_all_agents(self) -> Dict[str, Agent]:
    #     agents = {}
    #     def agent_stub(role, goal, backstory, allow_delegation, llm, tools):
    #         return Agent(role=role, goal=goal, backstory=backstory, allow_delegation=allow_delegation, llm=llm, tools=tools, verbose=True)
    #     agents['customer_consultation'] = agent_stub(
    #         'Customer Consultation Specialist',
    #         'Understand customer requirements and generate optimal construction plans',
    #         "You are an expert customer consultation specialist...",
    #         True, self.specialized_llm, self._get_customer_tools())
    #     agents['master'] = agent_stub(
    #         'Master Construction Manager',
    #         'Oversee all construction operations and ensure project success',
    #         "You are a Master Constructor...",
    #         True, self.master_llm, self._get_master_tools())
    #     agents['engineering'] = agent_stub(
    #         'Chief Engineering Officer', 'Ensure structural integrity and technical excellence',
    #         "You are a senior structural engineer...", False, self.specialized_llm, self._get_engineering_tools())
    #     agents['planning'] = agent_stub(
    #         'Project Planning Specialist', 'Optimize project schedules and resource allocation',
    #         "You are a project planning expert...", False, self.specialized_llm, self._get_planning_tools())
    #     agents['hr_workforce'] = agent_stub(
    #         'Human Resources Director', 'Optimize workforce productivity and management',
    #         "You are an HR specialist...", False, self.specialized_llm, self._get_hr_tools())
    #     agents['supply_procurement'] = agent_stub(
    #         'Supply Chain Director', 'Ensure optimal material flow and cost efficiency',
    #         "You are a supply chain expert...", False, self.specialized_llm, self._get_supply_tools())
    #     agents['finance'] = agent_stub(
    #         'Chief Financial Officer', 'Maximize profitability and financial efficiency',
    #         "You are a financial expert...", False, self.specialized_llm, self._get_finance_tools())
    #     agents['monitoring'] = agent_stub(
    #         'Site Monitoring Specialist', 'Provide real-time monitoring and control',
    #         "You are a monitoring expert...", False, self.specialized_llm, self._get_monitoring_tools())
    #     agents['quality'] = agent_stub(
    #         'Quality Assurance Director', 'Ensure highest quality standards and compliance',
    #         "You are a quality assurance expert...", False, self.specialized_llm, self._get_quality_tools())
    #     agents['safety'] = agent_stub(
    #         'Safety Director', 'Ensure maximum safety and risk mitigation',
    #         "You are a safety expert...", False, self.specialized_llm, self._get_safety_tools())
    #     return agents

    # def _get_customer_tools(self): return []
    # def _get_master_tools(self): return []
    # def _get_engineering_tools(self): return []
    # def _get_planning_tools(self): return []
    # def _get_hr_tools(self): return []
    # def _get_supply_tools(self): return []
    # def _get_finance_tools(self): return []
    # def _get_monitoring_tools(self): return []
    # def _get_quality_tools(self): return []
    # def _get_safety_tools(self): return []

    # def _initialize_crews(self): return {}
    # def _initialize_monitoring(self):
    #     class DummyMonitoring:
    #         async def gather_all_data(self): return {}
    #     return DummyMonitoring()
    # async def _update_agent_knowledge(self, agent, content): return "updated"
    # async def customer_consultation_flow(self):
    #     return "Hello"
    # You can now expand async flows (customer_consultation_flow, analyze_contract_and_plan, etc.)
    # ... Paste or implement those as per your original code! ...

# Instantiate the agentic system singleton for use throughout your app
# agentic_system = BrickBangAgenticSystem()
