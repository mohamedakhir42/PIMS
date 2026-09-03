from fastapi import APIRouter
from app.api import auth, articles, categories, suppliers, stock

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(articles.router, prefix="/articles", tags=["Articles"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(stock.router, prefix="/stock", tags=["Stock"])
