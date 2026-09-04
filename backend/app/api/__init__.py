from fastapi import APIRouter
from app.api import auth, articles, categories, suppliers, stock, users, roles, requests, inventories, notifications, reports, audit_logs

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(articles.router, prefix="/articles", tags=["Articles"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(stock.router, prefix="/stock", tags=["Stock"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(requests.router, prefix="/requests", tags=["Requests"])
api_router.include_router(inventories.router, prefix="/inventories", tags=["Inventories"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Audit Logs"])
