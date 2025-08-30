import asyncio
import requests
from typing import Dict, List, Any, Optional
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain.document_loaders import PyPDFLoader, WebBaseLoader, CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter, CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain_openai import ChatOpenAI
import whisper
import cv2
from moviepy.editor import VideoFileClip
import tempfile
import os
import json
from datetime import datetime
import logging
import faiss
from langchain.docstore import InMemoryDocstore


router = APIRouter()


class AdvancedKnowledgeImporter:
    """
    Comprehensive knowledge import system for construction domain expertise
    """

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.1)
        self.embeddings = OpenAIEmbeddings()
        self.whisper_model = whisper.load_model("base")

        # Specialized vector stores for different knowledge domains
        self.knowledge_stores = {
            'building_codes': self._init_vector_store('building_codes'),
            'construction_methods': self._init_vector_store('construction_methods'),
            'materials': self._init_vector_store('materials'),
            'project_management': self._init_vector_store('project_management'),
            'safety_protocols': self._init_vector_store('safety_protocols'),
            'cost_data': self._init_vector_store('cost_data'),
            'equipment_specs': self._init_vector_store('equipment_specs'),
            'case_studies': self._init_vector_store('case_studies'),
            'expert_insights': self._init_vector_store('expert_insights'),
            'regulatory_compliance': self._init_vector_store('regulatory_compliance')
        }

        # Knowledge extraction prompts for different domains
        self.extraction_prompts = self._load_extraction_prompts()

        # Quality assessment system
        self.quality_assessor = KnowledgeQualityAssessor()

        self.logger = logging.getLogger(__name__)

    def _init_vector_store(self, domain: str):
        embedding_dim = 1536
        embeddings = self.embeddings

        index = faiss.IndexFlatL2(embedding_dim)
        docstore = InMemoryDocstore({})
        index_to_docstore_id = {}

        vectorstore = FAISS(
            embedding_function=embeddings,
            index=index,
            docstore=docstore,
            index_to_docstore_id=index_to_docstore_id
        )

        return vectorstore

    def _load_extraction_prompts(self):
        return {
            "building_codes": "Extract building codes with sections, exceptions, formulas, tables, and enforcement details.",
            "construction_methods": "Extract construction methods, best practices, tools, and safety info.",
            "materials": "Extract details about construction materials, specifications, usage, and quality standards.",
            "project_management": "Extract project management knowledge including planning, scheduling, and risk mitigation.",
            "safety_protocols": "Extract safety protocols, regulations, standards and practical safety practices.",
            "cost_data": "Extract cost data including labor rates, material costs, equipment rental, and productivity factors.",
            "equipment_specs": "Extract equipment specifications, operation guidelines, and maintenance best practices.",
            "case_studies": "Extract insights from construction case studies, lessons learned, and outcomes.",
            "expert_insights": "Extract expert knowledge, advice, innovations, and emerging trends.",
            "regulatory_compliance": "Extract regulatory compliance requirements, inspection procedures, and legal guidelines."
        }

    async def import_building_codes(self, sources: List[Dict[str, str]]) -> Dict[str, Any]:
        """Import comprehensive building codes and standards"""

        results = []

        for source in sources:
            try:
                if source['type'] == 'pdf':
                    content = await self._process_pdf_document(source['path'])
                elif source['type'] == 'web':
                    content = await self._scrape_web_content(source['url'])
                elif source['type'] == 'api':
                    content = await self._fetch_api_data(source['endpoint'])

                # Extract building code specific knowledge
                extracted_knowledge = await self._extract_building_code_knowledge(content)

                # Store in building codes vector store
                storage_result = await self._store_knowledge(
                    'building_codes',
                    extracted_knowledge,
                    source
                )

                results.append({
                    'source': source['name'],
                    'status': 'success',
                    'chunks_stored': storage_result['chunks'],
                    'quality_score': storage_result['quality_score']
                })

            except Exception as e:
                self.logger.error(f"Failed to import {source['name']}: {e}")
                results.append({
                    'source': source['name'],
                    'status': 'failed',
                    'error': str(e)
                })

        return {
            'total_sources': len(sources),
            'successful': len([r for r in results if r['status'] == 'success']),
            'failed': len([r for r in results if r['status'] == 'failed']),
            'results': results
        }

    async def _extract_building_code_knowledge(self, content: str) -> Dict[str, Any]:
        """Extract structured building code knowledge"""

        extraction_prompt = f"""
        Analyze this building code content and extract structured knowledge:

        Content: {content[:8000]}  # Limit for token constraints

        Extract and structure:
        1. **Code Sections**: Identify major code sections and subsections
        2. **Requirements**: Specific requirements and their contexts
        3. **Exceptions**: Any exceptions or special conditions
        4. **Calculations**: Formulas, factors, and calculation methods
        5. **Tables**: Data tables and reference values
        6. **Cross-References**: References to other codes or standards
        7. **Application Scope**: When and where this code applies
        8. **Enforcement**: Inspection and compliance requirements
        9. **Updates**: Version information and effective dates
        10. **Practical Examples**: Real-world application examples

        Format as structured JSON with clear categories and actionable information.
        """

        response = await self.llm.ainvoke(extraction_prompt)

        try:
            structured_knowledge = json.loads(response.content)
        except:
            # Fallback to text-based structure
            structured_knowledge = {
                'raw_extraction': response.content,
                'domain': 'building_codes',
                'extraction_date': datetime.now().isoformat()
            }

        return structured_knowledge

    async def import_construction_methods(self, sources: List[Dict[str, str]]) -> Dict[str, Any]:
        """Import construction methods and best practices"""

        results = []

        for source in sources:
            try:
                # Process different source types
                if source['type'] == 'video':
                    content = await self._process_construction_video(source['path'])
                elif source['type'] == 'technical_manual':
                    content = await self._process_technical_manual(source['path'])
                elif source['type'] == 'case_study':
                    content = await self._process_case_study(source['path'])

                # Extract construction method knowledge
                extracted_knowledge = await self._extract_construction_method_knowledge(content)

                # Store in construction methods vector store
                storage_result = await self._store_knowledge(
                    'construction_methods',
                    extracted_knowledge,
                    source
                )

                results.append({
                    'source': source['name'],
                    'status': 'success',
                    'knowledge_type': source['type'],
                    'chunks_stored': storage_result['chunks'],
                    'quality_score': storage_result['quality_score']
                })

            except Exception as e:
                self.logger.error(f"Failed to import {source['name']}: {e}")
                results.append({
                    'source': source['name'],
                    'status': 'failed',
                    'error': str(e)
                })

        return {
            'construction_methods_imported': len([r for r in results if r['status'] == 'success']),
            'results': results
        }

    async def _process_construction_video(self, video_path: str) -> Dict[str, Any]:
        """Process construction technique videos"""

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            # Copy video to temp file
            with open(video_path, 'rb') as source:
                tmp_file.write(source.read())
            tmp_file.flush()

            # Extract audio and transcribe
            video = VideoFileClip(tmp_file.name)
            audio_path = tmp_file.name.replace('.mp4', '.wav')
            video.audio.write_audiofile(audio_path, verbose=False, logger=None)

            # Transcribe with Whisper
            transcription = self.whisper_model.transcribe(audio_path, language="en")

            # Extract key frames for visual analysis
            frames = self._extract_construction_frames(tmp_file.name)

            # Analyze frames for construction techniques
            visual_analysis = await self._analyze_construction_techniques(frames)

            # Clean up temp files
            os.unlink(tmp_file.name)
            os.unlink(audio_path)

            return {
                'transcription': transcription['text'],
                'segments': transcription.get('segments', []),
                'visual_techniques': visual_analysis,
                'video_duration': video.duration,
                'frame_count': len(frames)
            }

    async def _analyze_construction_techniques(self, frames: List[Any]) -> Dict[str, Any]:
        """Analyze construction techniques from video frames"""

        # This would integrate with computer vision models
        # For now, providing structured analysis framework

        analysis = {
            'techniques_identified': [
                'concrete_pouring_technique',
                'rebar_placement_method',
                'formwork_installation',
                'joint_sealing_procedure'
            ],
            'tools_equipment': [
                'concrete_mixer',
                'vibrating_screed',
                'hand_tools',
                'safety_equipment'
            ],
            'quality_indicators': [
                'proper_consolidation',
                'correct_joint_spacing',
                'adequate_curing_protection'
            ],
            'safety_practices': [
                'proper_ppe_usage',
                'safe_lifting_techniques',
                'hazard_awareness'
            ],
            'common_mistakes': [
                'inadequate_vibration',
                'improper_joint_timing',
                'insufficient_curing_protection'
            ]
        }

        return analysis


class KnowledgeQualityAssessor:
    """Assess the quality and relevance of imported knowledge"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.1)

    async def assess_knowledge_quality(self, content: str, domain: str) -> Dict[str, Any]:
        """Assess the quality of knowledge content"""

        quality_prompt = f"""
        Assess the quality of this {domain} knowledge content:

        Content: {content[:4000]}

        Evaluate on a scale of 1-10:
        1. **Accuracy**: How accurate and factual is the information?
        2. **Completeness**: How comprehensive is the coverage?
        3. **Relevance**: How relevant is it to construction management?
        4. **Practicality**: How actionable and practical is the information?
        5. **Currency**: How up-to-date is the information?
        6. **Clarity**: How clear and understandable is the content?
        7. **Authority**: How authoritative is the source?
        8. **Specificity**: How specific and detailed is the information?

        Provide scores and brief explanations for each criterion.
        Also identify any gaps or areas for improvement.
        """

        assessment = await self.llm.ainvoke(quality_prompt)

        return {
            'quality_assessment': assessment.content,
            'domain': domain,
            'assessed_at': datetime.now(),
            'overall_score': self._calculate_overall_score(assessment.content)
        }

    def _calculate_overall_score(self, assessment: str) -> float:
        """Calculate overall quality score from assessment"""
        # This would parse the assessment and calculate an average
        # For now, returning a placeholder
        return 8.5


# FastAPI router endpoints using AdvancedKnowledgeImporter

advanced_importer = AdvancedKnowledgeImporter()

@router.post("/import/building-codes")
async def import_building_codes(sources: List[Dict[str, str]]):
    try:
        result = await advanced_importer.import_building_codes(sources)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import/construction-methods")
async def import_construction_methods(sources: List[Dict[str, str]]):
    try:
        result = await advanced_importer.import_construction_methods(sources)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
