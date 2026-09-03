"""
Seed script to create initial data for PIMS.
Run this after setting up DATABASE_URL in .env
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models import *
from app.core.security import get_password_hash
import uuid

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create permissions
        permissions_data = [
            {"name": "USERS_READ", "description": "Read users"},
            {"name": "USERS_CREATE", "description": "Create users"},
            {"name": "USERS_UPDATE", "description": "Update users"},
            {"name": "ARTICLES_READ", "description": "Read articles"},
            {"name": "ARTICLES_CREATE", "description": "Create articles"},
            {"name": "ARTICLES_UPDATE", "description": "Update articles"},
            {"name": "CATEGORIES_READ", "description": "Read categories"},
            {"name": "CATEGORIES_CREATE", "description": "Create categories"},
            {"name": "CATEGORIES_UPDATE", "description": "Update categories"},
            {"name": "SUPPLIERS_READ", "description": "Read suppliers"},
            {"name": "SUPPLIERS_CREATE", "description": "Create suppliers"},
            {"name": "SUPPLIERS_UPDATE", "description": "Update suppliers"},
            {"name": "STOCK_READ", "description": "Read stock"},
            {"name": "STOCK_RECEIVE", "description": "Receive stock"},
            {"name": "STOCK_ISSUE", "description": "Issue stock"},
            {"name": "STOCK_TRANSFER", "description": "Transfer stock"},
            {"name": "STOCK_ADJUST", "description": "Adjust stock"},
        ]
        
        permissions = []
        for perm_data in permissions_data:
            perm = db.query(Permission).filter(Permission.name == perm_data["name"]).first()
            if not perm:
                perm = Permission(**perm_data)
                db.add(perm)
                db.flush()
            permissions.append(perm)
        
        # Create roles
        admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
        if not admin_role:
            admin_role = Role(name="ADMIN", description="Administrator with full access")
            admin_role.permissions = permissions
            db.add(admin_role)
            db.flush()
        
        manager_role = db.query(Role).filter(Role.name == "MANAGER").first()
        if not manager_role:
            manager_permissions = [p for p in permissions if "USERS" not in p.name]
            manager_role = Role(name="MANAGER", description="Stock manager")
            manager_role.permissions = manager_permissions
            db.add(manager_role)
            db.flush()
        
        # Create admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@phosboucraa.com",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role_id=admin_role.id,
                status=UserStatus.ACTIVE
            )
            db.add(admin_user)
            db.flush()
        
        # Create sample categories
        categories_data = [
            {"code": "CAT001", "name": "Mechanical", "description": "Mechanical equipment and parts"},
            {"code": "CAT002", "name": "Electrical", "description": "Electrical components"},
            {"code": "CAT003", "name": "Hydraulic", "description": "Hydraulic systems"},
            {"code": "CAT004", "name": "Pneumatic", "description": "Pneumatic equipment"},
            {"code": "CAT005", "name": "EPI", "description": "Personal Protective Equipment"},
        ]
        
        for cat_data in categories_data:
            cat = db.query(Category).filter(Category.code == cat_data["code"]).first()
            if not cat:
                cat = Category(**cat_data)
                db.add(cat)
        
        # Create sample supplier
        supplier = db.query(Supplier).filter(Supplier.code == "SUP001").first()
        if not supplier:
            supplier = Supplier(
                code="SUP001",
                name="SKF Morocco",
                contact_person="Ahmed Benali",
                email="contact@skf-ma.com",
                phone="+212-522-123456",
                address="Casablanca, Morocco",
                status=SupplierStatus.ACTIVE
            )
            db.add(supplier)
        
        db.commit()
        print("✅ Database seeded successfully!")
        print("👤 Admin user created:")
        print("   Username: admin")
        print("   Password: admin123")
        print("⚠️  Please change the admin password after first login!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
