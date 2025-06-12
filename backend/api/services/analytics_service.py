from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import uuid
import json
from .database_service import DatabaseService

class AnalyticsService:
    def __init__(self):
        self.db_service = DatabaseService()

    async def get_dashboard_analytics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive dashboard analytics"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Get basic analytics using the database function
                analytics_row = await conn.fetchrow('''
                    SELECT * FROM get_conversation_analytics($1)
                ''', user_id)
                
                if analytics_row:
                    analytics = dict(analytics_row)
                    
                    # Add recent activity
                    recent_activity = await conn.fetch('''
                        SELECT s.id, s.title, s.type, s.created_at,
                               COUNT(c.id) as chunk_count
                        FROM sources s
                        LEFT JOIN chunks c ON s.id = c.source_id
                        WHERE s.user_id = $1
                        GROUP BY s.id, s.title, s.type, s.created_at
                        ORDER BY s.created_at DESC
                        LIMIT 10
                    ''', user_id)
                    
                    analytics['recent_activity'] = [dict(row) for row in recent_activity]
                    
                    # Add search trends
                    search_trends = await conn.fetch('''
                        SELECT DATE(created_at) as date, COUNT(*) as searches
                        FROM search_history
                        WHERE user_id = $1 AND created_at > now() - interval '30 days'
                        GROUP BY DATE(created_at)
                        ORDER BY date DESC
                    ''', user_id)
                    
                    analytics['search_trends'] = [dict(row) for row in search_trends]
                    
                    return analytics
                
            except Exception as e:
                print(f"Database error in analytics: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        # Fallback to mock data
        return {
            'total_sources': 0,
            'total_chunks': 0,
            'total_threads': 0,
            'total_micro_threads': 0,
            'avg_chunks_per_source': 0,
            'most_active_day': 'Monday',
            'top_participants': [],
            'conversation_growth': {'last_30_days': 0, 'last_7_days': 0, 'today': 0},
            'recent_activity': [],
            'search_trends': []
        }

    async def get_conversation_trends(self, user_id: Optional[str], days: int = 30) -> Dict[str, Any]:
        """Get conversation trends over time"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Daily conversation activity
                daily_activity = await conn.fetch('''
                    SELECT DATE(c.timestamp) as date,
                           COUNT(c.id) as chunks_created,
                           COUNT(DISTINCT c.source_id) as sources_active,
                           COUNT(DISTINCT c.participant_label) as participants_active
                    FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE s.user_id = $1 AND c.timestamp > now() - interval '%s days'
                    GROUP BY DATE(c.timestamp)
                    ORDER BY date DESC
                ''', user_id, days)
                
                # Source type distribution
                source_distribution = await conn.fetch('''
                    SELECT s.type, COUNT(*) as count
                    FROM sources s
                    WHERE s.user_id = $1 AND s.created_at > now() - interval '%s days'
                    GROUP BY s.type
                ''', user_id, days)
                
                return {
                    'daily_activity': [dict(row) for row in daily_activity],
                    'source_distribution': [dict(row) for row in source_distribution],
                    'period_days': days
                }
                
            except Exception as e:
                print(f"Database error in conversation trends: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return {'daily_activity': [], 'source_distribution': [], 'period_days': days}

    async def get_search_insights(self, user_id: Optional[str]) -> Dict[str, Any]:
        """Get insights from user search patterns"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Most common search terms
                common_searches = await conn.fetch('''
                    SELECT query, COUNT(*) as frequency,
                           AVG(results_count) as avg_results,
                           AVG(response_time_ms) as avg_response_time
                    FROM search_history
                    WHERE user_id = $1
                    GROUP BY query
                    ORDER BY frequency DESC
                    LIMIT 10
                ''', user_id)
                
                # Search success rate
                search_stats = await conn.fetchrow('''
                    SELECT COUNT(*) as total_searches,
                           AVG(results_count) as avg_results_per_search,
                           AVG(response_time_ms) as avg_response_time,
                           COUNT(*) FILTER (WHERE results_count > 0) as successful_searches
                    FROM search_history
                    WHERE user_id = $1
                ''', user_id)
                
                return {
                    'common_searches': [dict(row) for row in common_searches],
                    'search_stats': dict(search_stats) if search_stats else {},
                    'success_rate': (search_stats['successful_searches'] / search_stats['total_searches'] * 100) if search_stats and search_stats['total_searches'] > 0 else 0
                }
                
            except Exception as e:
                print(f"Database error in search insights: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return {'common_searches': [], 'search_stats': {}, 'success_rate': 0}

    async def get_model_usage_stats(self, user_id: Optional[str], days: int = 30) -> Dict[str, Any]:
        """Get AI model usage statistics"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Model usage distribution
                model_usage = await conn.fetch('''
                    SELECT model_used,
                           COUNT(*) as requests,
                           SUM(total_tokens) as total_tokens,
                           AVG(latency_ms) as avg_latency,
                           COUNT(*) FILTER (WHERE success = true) as successful_requests
                    FROM usage_logs
                    WHERE user_id = $1 AND timestamp > now() - interval '%s days'
                    GROUP BY model_used
                    ORDER BY requests DESC
                ''', user_id, days)
                
                # Daily token usage
                daily_tokens = await conn.fetch('''
                    SELECT DATE(timestamp) as date,
                           SUM(total_tokens) as tokens_used,
                           COUNT(*) as requests
                    FROM usage_logs
                    WHERE user_id = $1 AND timestamp > now() - interval '%s days'
                    GROUP BY DATE(timestamp)
                    ORDER BY date DESC
                ''', user_id, days)
                
                return {
                    'model_usage': [dict(row) for row in model_usage],
                    'daily_tokens': [dict(row) for row in daily_tokens],
                    'period_days': days
                }
                
            except Exception as e:
                print(f"Database error in model usage stats: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return {'model_usage': [], 'daily_tokens': [], 'period_days': days}

    async def get_thread_insights(self, thread_id: str) -> Dict[str, Any]:
        """Get detailed insights for a specific thread"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Thread basic info
                thread_info = await conn.fetchrow('''
                    SELECT t.*, COUNT(c.id) as chunk_count,
                           MIN(c.timestamp) as first_message,
                           MAX(c.timestamp) as last_message
                    FROM threads t
                    LEFT JOIN chunks c ON t.id = c.thread_id
                    WHERE t.id = $1
                    GROUP BY t.id
                ''', thread_id)
                
                # Participant analysis
                participants = await conn.fetch('''
                    SELECT participant_label,
                           COUNT(*) as message_count,
                           AVG(LENGTH(text_chunk)) as avg_message_length
                    FROM chunks
                    WHERE thread_id = $1 AND participant_label IS NOT NULL
                    GROUP BY participant_label
                    ORDER BY message_count DESC
                ''', thread_id)
                
                # Suggested tags
                suggested_tags = await conn.fetch('''
                    SELECT * FROM suggest_thread_tags($1)
                ''', thread_id)
                
                # Existing tags
                existing_tags = await conn.fetch('''
                    SELECT tag_name, tag_color, auto_generated
                    FROM thread_tags
                    WHERE thread_id = $1
                ''', thread_id)
                
                return {
                    'thread_info': dict(thread_info) if thread_info else {},
                    'participants': [dict(row) for row in participants],
                    'suggested_tags': [dict(row) for row in suggested_tags],
                    'existing_tags': [dict(row) for row in existing_tags]
                }
                
            except Exception as e:
                print(f"Database error in thread insights: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return {'thread_info': {}, 'participants': [], 'suggested_tags': [], 'existing_tags': []}

    async def create_export_job(
        self, 
        user_id: Optional[str], 
        export_type: str, 
        date_range: Optional[Dict[str, str]] = None
    ) -> str:
        """Create an export job"""
        job_id = str(uuid.uuid4())
        
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                await conn.execute('''
                    INSERT INTO export_jobs (id, user_id, export_type, status, metadata)
                    VALUES ($1, $2, $3, 'pending', $4)
                ''', job_id, user_id, export_type, json.dumps(date_range or {}))
                
                # In a real implementation, you would trigger background processing here
                
            except Exception as e:
                print(f"Database error creating export job: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return job_id

    async def get_export_status(self, job_id: str) -> Dict[str, Any]:
        """Get export job status"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                job = await conn.fetchrow('''
                    SELECT * FROM export_jobs WHERE id = $1
                ''', job_id)
                
                if job:
                    return dict(job)
                
            except Exception as e:
                print(f"Database error getting export status: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return {'status': 'not_found'}