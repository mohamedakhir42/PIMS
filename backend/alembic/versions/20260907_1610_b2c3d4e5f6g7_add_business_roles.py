"""add business roles and permissions

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-09-07 16:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6g7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def insert_role_permission(conn, role_id, permission_id):
    """
    Insert a role/permission association.

    role_permissions.id is a required UUID primary key,
    so we must explicitly provide it because this is a raw SQL insert.
    """
    conn.execute(
        sa.text("""
            INSERT INTO role_permissions (id, role_id, permission_id)
            VALUES (:id, :role_id, :permission_id)
            ON CONFLICT DO NOTHING
        """),
        {
            "id": str(uuid.uuid4()),
            "role_id": str(role_id),
            "permission_id": str(permission_id),
        },
    )


def upgrade():
    conn = op.get_bind()

    # ============================================================
    # 1. BUSINESS ROLES
    # ============================================================

    roles = [
        {
            "id": uuid.uuid4(),
            "name": "ADMIN",
            "description": "Full system administration with access to all modules",
        },
        {
            "id": uuid.uuid4(),
            "name": "WAREHOUSE_MANAGER",
            "description": "Supervises warehouses, monitors stock levels and movements",
        },
        {
            "id": uuid.uuid4(),
            "name": "MAINTENANCE_MANAGER",
            "description": "Reviews and approves/rejects material requests",
        },
        {
            "id": uuid.uuid4(),
            "name": "WAREHOUSE_OPERATOR",
            "description": "Performs physical warehouse operations (receipt, issue, transfer)",
        },
        {
            "id": uuid.uuid4(),
            "name": "TECHNICIAN",
            "description": "Creates material requests for maintenance interventions",
        },
        {
            "id": uuid.uuid4(),
            "name": "VIEWER",
            "description": "Read-only access to dashboards and reports",
        },
    ]

    # ============================================================
    # 2. INSERT ROLES
    # ============================================================

    for role in roles:
        conn.execute(
            sa.text("""
                INSERT INTO roles (
                    id,
                    name,
                    description,
                    created_at,
                    updated_at
                )
                VALUES (
                    :id,
                    :name,
                    :description,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (name) DO NOTHING
            """),
            {
                "id": str(role["id"]),
                "name": role["name"],
                "description": role["description"],
            },
        )

    # IMPORTANT:
    # If a role already existed, its generated UUID above may not
    # correspond to the UUID actually stored in the database.
    # Therefore, retrieve the real IDs from PostgreSQL.

    result = conn.execute(
        sa.text("""
            SELECT id, name
            FROM roles
            WHERE name IN (
                'ADMIN',
                'WAREHOUSE_MANAGER',
                'MAINTENANCE_MANAGER',
                'WAREHOUSE_OPERATOR',
                'TECHNICIAN',
                'VIEWER'
            )
        """)
    )

    role_ids = {
        row.name: row.id
        for row in result
    }

    # ============================================================
    # 3. GET PERMISSIONS
    # ============================================================

    result = conn.execute(
        sa.text("""
            SELECT id, name
            FROM permissions
        """)
    )

    permissions = {
        row.name: row.id
        for row in result
    }

    # ============================================================
    # 4. ADMIN
    # ============================================================

    admin_permissions = list(permissions.values())

    for permission_id in admin_permissions:
        insert_role_permission(
            conn,
            role_ids["ADMIN"],
            permission_id,
        )

    # ============================================================
    # 5. WAREHOUSE MANAGER
    # ============================================================

    warehouse_manager_permissions = [
        "STOCK_READ",
        "STOCK_RECEIVE",
        "STOCK_ISSUE",
        "STOCK_TRANSFER",
        "ARTICLES_READ",
        "CATEGORIES_READ",
        "SUPPLIERS_READ",
        "LOCATIONS_READ",
        "WAREHOUSES_READ",
        "SITES_READ",
        "ZONES_READ",
        "REQUEST_READ",
        "INVENTORY_READ",
        "INVENTORY_VALIDATE",
        "AUDIT_READ",
        "ATTACHMENT_READ",
    ]

    for permission_name in warehouse_manager_permissions:
        if permission_name in permissions:
            insert_role_permission(
                conn,
                role_ids["WAREHOUSE_MANAGER"],
                permissions[permission_name],
            )

    # ============================================================
    # 6. MAINTENANCE MANAGER
    # ============================================================

    maintenance_manager_permissions = [
        "REQUEST_READ",
        "REQUEST_APPROVE",
        "REQUEST_REJECT",
        "ARTICLES_READ",
        "CATEGORIES_READ",
        "SUPPLIERS_READ",
        "AUDIT_READ",
    ]

    for permission_name in maintenance_manager_permissions:
        if permission_name in permissions:
            insert_role_permission(
                conn,
                role_ids["MAINTENANCE_MANAGER"],
                permissions[permission_name],
            )

    # ============================================================
    # 7. WAREHOUSE OPERATOR
    # ============================================================

    warehouse_operator_permissions = [
        "STOCK_READ",
        "STOCK_RECEIVE",
        "STOCK_ISSUE",
        "STOCK_TRANSFER",
        "REQUEST_READ",
        "INVENTORY_READ",
        "INVENTORY_CREATE",
        "ARTICLES_READ",
        "CATEGORIES_READ",
        "SUPPLIERS_READ",
        "LOCATIONS_READ",
        "ATTACHMENT_READ",
    ]

    for permission_name in warehouse_operator_permissions:
        if permission_name in permissions:
            insert_role_permission(
                conn,
                role_ids["WAREHOUSE_OPERATOR"],
                permissions[permission_name],
            )

    # ============================================================
    # 8. TECHNICIAN
    # ============================================================

    technician_permissions = [
        "REQUEST_READ",
        "REQUEST_CREATE",
        "ARTICLES_READ",
        "CATEGORIES_READ",
        "SUPPLIERS_READ",
    ]

    for permission_name in technician_permissions:
        if permission_name in permissions:
            insert_role_permission(
                conn,
                role_ids["TECHNICIAN"],
                permissions[permission_name],
            )

    # ============================================================
    # 9. VIEWER
    # ============================================================

    viewer_permissions = [
        "STOCK_READ",
        "ARTICLES_READ",
        "CATEGORIES_READ",
        "SUPPLIERS_READ",
        "LOCATIONS_READ",
        "WAREHOUSES_READ",
        "SITES_READ",
        "ZONES_READ",
        "REQUEST_READ",
        "INVENTORY_READ",
        "AUDIT_READ",
        "ATTACHMENT_READ",
    ]

    for permission_name in viewer_permissions:
        if permission_name in permissions:
            insert_role_permission(
                conn,
                role_ids["VIEWER"],
                permissions[permission_name],
            )


def downgrade():
    conn = op.get_bind()

    # Delete role permissions for business roles
    conn.execute(
        sa.text("""
            DELETE FROM role_permissions
            WHERE role_id IN (
                SELECT id
                FROM roles
                WHERE name IN (
                    'ADMIN',
                    'WAREHOUSE_MANAGER',
                    'MAINTENANCE_MANAGER',
                    'WAREHOUSE_OPERATOR',
                    'TECHNICIAN',
                    'VIEWER'
                )
            )
        """)
    )

    # Delete business roles
    conn.execute(
        sa.text("""
            DELETE FROM roles
            WHERE name IN (
                'ADMIN',
                'WAREHOUSE_MANAGER',
                'MAINTENANCE_MANAGER',
                'WAREHOUSE_OPERATOR',
                'TECHNICIAN',
                'VIEWER'
            )
        """)
    )