"""
Custom Supabase client wrapper to replace the incompatible supabase package.
This simplified implementation uses postgrest-py directly to handle database operations.
"""
import os
import logging
import httpx
import json
from typing import Dict, Any, Optional, List
from postgrest import AsyncPostgrestClient
from pathlib import Path
from dotenv import load_dotenv

# Set up logging
logger = logging.getLogger(__name__)

class SupabaseClient:
    """Custom Supabase client to handle database operations without the supabase package"""
    
    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        """Initialize the Supabase client with URL and key from env or parameters"""
        # Load environment variables from .env file at project root
        project_root = Path(__file__).parent.parent.parent
        env_file = project_root / ".env"
        load_dotenv(dotenv_path=env_file)
        
        # Use provided values or get from environment
        self.supabase_url = supabase_url or os.getenv("SUPABASE_URL")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("Missing Supabase URL or key. Please check your .env file.")
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables")
        
        # Initialize HTTP client for auth operations
        self.http_client = httpx.AsyncClient(
            base_url=self.supabase_url,
            headers={
                "Authorization": f"Bearer {self.supabase_key}",
                "apikey": self.supabase_key,
                "Content-Type": "application/json"
            }
        )
        
        # REST API endpoint
        rest_url = f"{self.supabase_url}/rest/v1"
        
        # Initialize PostgrestClient for database operations
        self.postgrest_client = AsyncPostgrestClient(
            rest_url, 
            headers={
                "Authorization": f"Bearer {self.supabase_key}",
                "apikey": self.supabase_key
            }
        )
        
        # logger.info(f"Initialized custom Supabase client with URL: {self.supabase_url}")
    
    def table(self, table_name: str):
        """Get a table reference for operations"""
        return TableReference(self.postgrest_client, table_name)
    
    async def verify_token(self, token: str) -> dict:
        """Verify a JWT token and get user info"""
        try:
            response = await self.http_client.get(
                "/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error during token verification: {str(e)}")
            return None

class TableReference:
    """Class to handle table operations similar to the original Supabase client"""
    
    def __init__(self, postgrest_client: AsyncPostgrestClient, table_name: str):
        self.client = postgrest_client
        self.table_name = table_name
        self.query = self.client.from_(table_name)
        self.filters = []
        self.selections = None
        self.ordering = None
        self.range_params = None
        self.count_exact = False
    
    def select(self, *fields, count=None):
        """Select fields from the table"""
        self.selections = fields if fields else "*"
        self.count_exact = count == 'exact'
        return self
    
    def eq(self, column: str, value: Any):
        """Equal filter"""
        self.filters.append(("eq", column, value))
        return self
    
    def neq(self, column: str, value: Any):
        """Not equal filter"""
        self.filters.append(("neq", column, value))
        return self
    
    def gt(self, column: str, value: Any):
        """Greater than filter"""
        self.filters.append(("gt", column, value))
        return self
    
    def gte(self, column: str, value: Any):
        """Greater than or equal filter"""
        self.filters.append(("gte", column, value))
        return self
    
    def lt(self, column: str, value: Any):
        """Less than filter"""
        self.filters.append(("lt", column, value))
        return self
    
    def lte(self, column: str, value: Any):
        """Less than or equal filter"""
        self.filters.append(("lte", column, value))
        return self
    
    def or_(self, conditions: str):
        """OR filter with multiple conditions"""
        self.filters.append(("or", conditions))
        return self
    
    def order(self, column: str, desc: bool = False):
        """Order results by column"""
        self.ordering = {"column": column, "desc": desc}
        return self
    
    def range(self, start: int, end: int):
        """Pagination range"""
        self.range_params = (start, end)
        return self
    
    def insert(self, data: Dict[str, Any]):
        """Insert data into the table"""
        if isinstance(data, list):
            return self.client.from_(self.table_name).insert(data)
        else:
            return self.client.from_(self.table_name).insert(data)
    
    def update(self, data: Dict[str, Any]):
        """Update data in the table based on filters"""
        query = self.client.from_(self.table_name)
        
        # Apply filters
        for filter_op in self.filters:
            if filter_op[0] == "eq":
                query = query.eq(filter_op[1], filter_op[2])
            elif filter_op[0] == "neq":
                query = query.neq(filter_op[1], filter_op[2])
            elif filter_op[0] == "gt":
                query = query.gt(filter_op[1], filter_op[2])
            elif filter_op[0] == "gte":
                query = query.gte(filter_op[1], filter_op[2])
            elif filter_op[0] == "lt":
                query = query.lt(filter_op[1], filter_op[2])
            elif filter_op[0] == "lte":
                query = query.lte(filter_op[1], filter_op[2])
            elif filter_op[0] == "or":
                query = query.or_(filter_op[1])
        
        # Execute update
        return query.update(data)
    
    def delete(self):
        """Delete data from the table based on filters"""
        query = self.client.from_(self.table_name)
        
        # Apply filters
        for filter_op in self.filters:
            if filter_op[0] == "eq":
                query = query.eq(filter_op[1], filter_op[2])
            elif filter_op[0] == "neq":
                query = query.neq(filter_op[1], filter_op[2])
            elif filter_op[0] == "gt":
                query = query.gt(filter_op[1], filter_op[2])
            elif filter_op[0] == "gte":
                query = query.gte(filter_op[1], filter_op[2])
            elif filter_op[0] == "lt":
                query = query.lt(filter_op[1], filter_op[2])
            elif filter_op[0] == "lte":
                query = query.lte(filter_op[1], filter_op[2])
            elif filter_op[0] == "or":
                query = query.or_(filter_op[1])
        
        # Execute delete
        return query.delete()
    
    def single(self):
        """Expect a single result"""
        return self
    
    async def execute(self):
        """Execute the query and return results"""
        query = self.client.from_(self.table_name)
        
        # Apply selections
        if self.selections:
            if isinstance(self.selections, tuple):
                query = query.select(",".join(self.selections))
            else:
                query = query.select(self.selections)
        
        # Apply filters
        for filter_op in self.filters:
            if filter_op[0] == "eq":
                query = query.eq(filter_op[1], filter_op[2])
            elif filter_op[0] == "neq":
                query = query.neq(filter_op[1], filter_op[2])
            elif filter_op[0] == "gt":
                query = query.gt(filter_op[1], filter_op[2])
            elif filter_op[0] == "gte":
                query = query.gte(filter_op[1], filter_op[2])
            elif filter_op[0] == "lt":
                query = query.lt(filter_op[1], filter_op[2])
            elif filter_op[0] == "lte":
                query = query.lte(filter_op[1], filter_op[2])
            elif filter_op[0] == "or":
                query = query.or_(filter_op[1])
        
        # Apply ordering
        if self.ordering:
            query = query.order(self.ordering["column"], desc=self.ordering["desc"])
        
        # Apply range if specified
        if self.range_params:
            query = query.range(self.range_params[0], self.range_params[1])
        
        try:
            # Execute the query
            response = await query.execute()
            
            # Normalize the response format to match original supabase client
            result = ExecutionResult(response)
            return result
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            # Return empty result on error
            return ExecutionResult({"data": []})

class ExecutionResult:
    """Class to normalize response format to match supabase client"""
    
    def __init__(self, response):
        self.response = response
        
        if isinstance(response, dict):
            self.data = response.get("data", [])
            self.count = response.get("count", 0)
        else:
            # Handle response from postgrest_py
            try:
                self.data = response.data if hasattr(response, "data") else []
                self.count = len(self.data)
            except:
                self.data = []
                self.count = 0

# Create a singleton instance for global use
def create_client(supabase_url=None, supabase_key=None):
    """Create a new Supabase client instance"""
    return SupabaseClient(supabase_url, supabase_key)
