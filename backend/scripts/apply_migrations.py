import os
import asyncio
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Convert to asyncpg URL format if needed
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

async def apply_migrations():
    # Create engine and session
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    try:
        # Read and execute the migration file
        migration_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'migrations', 
            '001_initial_auth_schema.sql'
        )
        
        with open(migration_path, 'r') as f:
            sql_commands = f.read()
        
        async with engine.begin() as conn:
            # Split the SQL file into individual commands
            for command in sql_commands.split(';'):
                command = command.strip()
                if command:
                    await conn.execute(command)
        
        print("✅ Database migrations applied successfully!")
        
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_migrations())
