from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    CLOUDFLARE_IMAGE_BASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"


settings = Settings()
