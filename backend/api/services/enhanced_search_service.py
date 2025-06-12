from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import uuid
import json
from .database_service import DatabaseService
from .embedding_service import EmbeddingService
from .llm_service import LLMService

class EnhancedSearchService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.embedding_service = EmbeddingService()
        self.llm_service = LLMService()

    async def enhanced_search(
        self,
        query: str,
        source_types: Optional[List[str]] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        participant: Optional[str] = None,
        limit: int = 10,
        threshold: float = 0.7,
        search_type: str = "hybrid",
        user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Perform enhanced search with multiple filters"""
        
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                query_embedding = None
                if search_type in ["semantic", "hybrid"]:
                    query_embedding = await self.embedding_service.generate_embedding(query)
                
                query_text = query if search_type in ["text", "hybrid"] else None
                
                # Use the enhanced search function
                rows = await conn.fetch('''
                    SELECT * FROM enhanced_search_chunks($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ''', 
                query_text,
                query_embedding,
                user_id,
                source_types,
                date_from,
                date_to,
                participant,
                threshold,
                limit)
                
                results = []
                for row in rows:
                    result = {
                        "id": row["id"],
                        "text_chunk": row["text_chunk"],
                        "similarity": row["similarity"],
                        "text_rank": row["text_rank"],
                        "combined_score": row["combined_score"],
                        "source": {
                            "id": row["source_id"],
                            "title": row["source_title"],
                            "type": row["source_type"],
                            "created_at": row["timestamp"]
                        },
                        "participant_label": row["participant_label"],
                        "timestamp": row["timestamp"]
                    }
                    results.append(result)
                
                return results
                
            except Exception as e:
                print(f"Database error in enhanced search: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        # Fallback to basic search
        return []

    async def generate_contextual_response(self, query: str, search_results: List[Dict[str, Any]]) -> str:
        """Generate AI response with enhanced context"""
        if not search_results:
            return "I couldn't find any relevant information in your conversations."
        
        # Prepare enhanced context
        context_parts = []
        for i, result in enumerate(search_results):
            source_info = f"Source: {result['source']['title']} ({result['source']['type']})"
            if result.get('participant_label'):
                source_info += f" - {result['participant_label']}"
            
            score_info = f"Relevance: {result.get('combined_score', result.get('similarity', 0)):.2f}"
            
            context_parts.append(
                f"[Result {i+1}] {source_info} | {score_info}\n{result['text_chunk']}"
            )
        
        context = "\n\n".join(context_parts)
        
        # Enhanced prompt with search context
        prompt = f"""Based on the following search results from the user's AI conversations, 
        please provide a comprehensive answer to their question: "{query}"
        
        Search Results:
        {context}
        
        Instructions:
        1. Synthesize information from multiple results when relevant
        2. Reference specific sources when making claims
        3. If results contain conflicting information, acknowledge this
        4. Provide actionable insights when possible
        5. If the information is incomplete, suggest what additional context might be helpful
        
        Answer the question based on the search results above:"""
        
        response = await self.llm_service.route_to_llm(
            prompt=prompt,
            system_prompt="You are an expert at analyzing and synthesizing information from AI conversations. Provide clear, well-structured responses that help users understand and apply the information from their conversation history."
        )
        
        return response["responseText"]

    async def get_enhanced_suggestions(
        self, 
        partial_query: str, 
        limit: int = 5,
        include_history: bool = True,
        user_id: Optional[str] = None
    ) -> List[str]:
        """Get enhanced search suggestions"""
        suggestions = []
        
        conn = await self.db_service.get_connection()
        
        if conn and include_history:
            try:
                # Get suggestions from search history
                history_suggestions = await conn.fetch('''
                    SELECT DISTINCT query
                    FROM search_history
                    WHERE user_id = $1 AND query ILIKE $2
                    ORDER BY created_at DESC
                    LIMIT $3
                ''', user_id, f'%{partial_query}%', limit // 2)
                
                suggestions.extend([row['query'] for row in history_suggestions])
                
                # Get popular searches
                popular_suggestions = await conn.fetch('''
                    SELECT query, COUNT(*) as frequency
                    FROM search_history
                    WHERE query ILIKE $1
                    GROUP BY query
                    ORDER BY frequency DESC
                    LIMIT $2
                ''', f'%{partial_query}%', limit - len(suggestions))
                
                suggestions.extend([row['query'] for row in popular_suggestions if row['query'] not in suggestions])
                
            except Exception as e:
                print(f"Database error in suggestions: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        # Add static suggestions if we need more
        static_suggestions = [
            "What did I learn about React?",
            "Show me discussions about AI",
            "Find conversations about productivity",
            "What advice did I get about career?",
            "JavaScript best practices",
            "Machine learning concepts",
            "Database design patterns",
            "API development tips"
        ]
        
        for suggestion in static_suggestions:
            if partial_query.lower() in suggestion.lower() and suggestion not in suggestions:
                suggestions.append(suggestion)
                if len(suggestions) >= limit:
                    break
        
        return suggestions[:limit]

    async def get_available_filters(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get available filter options"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Get available source types
                source_types = await conn.fetch('''
                    SELECT DISTINCT type, COUNT(*) as count
                    FROM sources
                    WHERE user_id = $1
                    GROUP BY type
                    ORDER BY count DESC
                ''', user_id)
                
                # Get available participants
                participants = await conn.fetch('''
                    SELECT DISTINCT c.participant_label, COUNT(*) as count
                    FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE s.user_id = $1 AND c.participant_label IS NOT NULL
                    GROUP BY c.participant_label
                    ORDER BY count DESC
                    LIMIT 20
                ''', user_id)
                
                # Get date range
                date_range = await conn.fetchrow('''
                    SELECT MIN(c.timestamp) as earliest, MAX(c.timestamp) as latest
                    FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE s.user_id = $1
                ''', user_id)
                
                return {
                    "sourceTypes": [{"type": row["type"], "count": row["count"]} for row in source_types],
                    "participants": [{"name": row["participant_label"], "count": row["count"]} for row in participants],
                    "dateRange": {
                        "earliest": date_range["earliest"] if date_range else None,
                        "latest": date_range["latest"] if date_range else None
                    }
                }
                
            except Exception as e:
                print(f"Database error getting filters: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return {"sourceTypes": [], "participants": [], "dateRange": {"earliest": None, "latest": None}}

    async def log_search_query(self, query: str, filters: Dict[str, Any], user_id: Optional[str] = None):
        """Log search query for analytics"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                await conn.execute('''
                    INSERT INTO search_history (user_id, query, search_filters)
                    VALUES ($1, $2, $3)
                ''', user_id, query, json.dumps(filters))
                
            except Exception as e:
                print(f"Error logging search query: {e}")
            finally:
                await self.db_service.release_connection(conn)

    async def update_search_history(
        self, 
        query: str, 
        results_count: int, 
        response_time_ms: int,
        user_id: Optional[str] = None
    ):
        """Update search history with results"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Update the most recent search entry
                await conn.execute('''
                    UPDATE search_history
                    SET results_count = $1, response_time_ms = $2
                    WHERE user_id = $3 AND query = $4
                    AND id = (
                        SELECT id FROM search_history
                        WHERE user_id = $3 AND query = $4
                        ORDER BY created_at DESC
                        LIMIT 1
                    )
                ''', results_count, response_time_ms, user_id, query)
                
            except Exception as e:
                print(f"Error updating search history: {e}")
            finally:
                await self.db_service.release_connection(conn)

    async def save_search(
        self, 
        query: str, 
        filters: Dict[str, Any], 
        name: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> str:
        """Save a search for later use"""
        search_id = str(uuid.uuid4())
        
        # In a real implementation, you would save this to a saved_searches table
        # For now, we'll just return the ID
        
        return search_id

    async def get_saved_searches(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get user's saved searches"""
        # In a real implementation, you would fetch from a saved_searches table
        # For now, return empty list
        
        return []