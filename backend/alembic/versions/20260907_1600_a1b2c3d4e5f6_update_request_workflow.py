"""update request workflow

Revision ID: a1b2c3d4e5f6
Revises: 1e337eeb078c
Create Date: 2026-09-07 16:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "1e337eeb078c"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()

    # ============================================================
    # 1. Add new columns
    # ============================================================

    op.add_column(
        "stock_requests",
        sa.Column(
            "issued_by",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.add_column(
        "stock_requests",
        sa.Column(
            "issued_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    # ============================================================
    # 2. Foreign key for issued_by
    # ============================================================

    op.create_foreign_key(
        "fk_stock_requests_issued_by_users",
        "stock_requests",
        "users",
        ["issued_by"],
        ["id"],
    )

    # ============================================================
    # 3. Replace PostgreSQL ENUM safely
    # ============================================================
    #
    # Existing ENUM:
    #
    # DRAFT
    # SUBMITTED
    # PENDING_APPROVAL
    # APPROVED
    # REJECTED
    # PREPARING
    # READY
    # ISSUED
    # CANCELLED
    #
    # New ENUM:
    #
    # DRAFT
    # SUBMITTED
    # PENDING_APPROVAL
    # APPROVED
    # REJECTED
    # READY_FOR_ISSUE
    # PARTIALLY_FULFILLED
    # FULFILLED
    # CANCELLED
    #
    # We cannot modify the existing ENUM by simply creating another
    # ENUM with the same name.
    #
    # So:
    # old ENUM -> requeststatus_old
    # new ENUM -> requeststatus
    # convert column
    # delete old ENUM
    #

    # Rename existing enum
    op.execute(
        "ALTER TYPE requeststatus RENAME TO requeststatus_old"
    )

    # Create the new enum
    op.execute(
        """
        CREATE TYPE requeststatus AS ENUM (
            'DRAFT',
            'SUBMITTED',
            'PENDING_APPROVAL',
            'APPROVED',
            'REJECTED',
            'READY_FOR_ISSUE',
            'PARTIALLY_FULFILLED',
            'FULFILLED',
            'CANCELLED'
        )
        """
    )

    # Remove default temporarily if one exists.
    #
    # This avoids PostgreSQL trying to cast an old enum default
    # to the new enum automatically.
    op.execute(
        """
        ALTER TABLE stock_requests
        ALTER COLUMN status DROP DEFAULT
        """
    )

    # Convert existing values to the new workflow.
    #
    # APPROVED -> READY_FOR_ISSUE
    # PREPARING -> FULFILLED
    # READY -> FULFILLED
    # ISSUED -> FULFILLED
    # Everything else keeps its value.
    op.execute(
        """
        ALTER TABLE stock_requests
        ALTER COLUMN status TYPE requeststatus
        USING (
            CASE status::text
                WHEN 'APPROVED'
                    THEN 'READY_FOR_ISSUE'
                WHEN 'PREPARING'
                    THEN 'FULFILLED'
                WHEN 'READY'
                    THEN 'FULFILLED'
                WHEN 'ISSUED'
                    THEN 'FULFILLED'
                ELSE status::text
            END
        )::requeststatus
        """
    )

    # Restore the default if the application expects DRAFT
    op.execute(
        """
        ALTER TABLE stock_requests
        ALTER COLUMN status SET DEFAULT 'DRAFT'::requeststatus
        """
    )

    # Remove old enum
    op.execute(
        "DROP TYPE requeststatus_old"
    )


def downgrade():
    # ============================================================
    # 1. Replace new ENUM with old ENUM
    # ============================================================

    op.execute(
        "ALTER TYPE requeststatus RENAME TO requeststatus_new"
    )

    op.execute(
        """
        CREATE TYPE requeststatus AS ENUM (
            'DRAFT',
            'SUBMITTED',
            'PENDING_APPROVAL',
            'APPROVED',
            'REJECTED',
            'PREPARING',
            'READY',
            'ISSUED',
            'CANCELLED'
        )
        """
    )

    # Remove default temporarily
    op.execute(
        """
        ALTER TABLE stock_requests
        ALTER COLUMN status DROP DEFAULT
        """
    )

    # Convert new workflow back to old workflow
    #
    # READY_FOR_ISSUE -> APPROVED
    # PARTIALLY_FULFILLED -> PREPARING
    # FULFILLED -> ISSUED
    op.execute(
        """
        ALTER TABLE stock_requests
        ALTER COLUMN status TYPE requeststatus
        USING (
            CASE status::text
                WHEN 'READY_FOR_ISSUE'
                    THEN 'APPROVED'
                WHEN 'PARTIALLY_FULFILLED'
                    THEN 'PREPARING'
                WHEN 'FULFILLED'
                    THEN 'ISSUED'
                ELSE status::text
            END
        )::requeststatus
        """
    )

    # Restore default
    op.execute(
        """
        ALTER TABLE stock_requests
        ALTER COLUMN status SET DEFAULT 'DRAFT'::requeststatus
        """
    )

    # Delete new enum
    op.execute(
        "DROP TYPE requeststatus_new"
    )

    # ============================================================
    # 2. Remove foreign key
    # ============================================================

    op.drop_constraint(
        "fk_stock_requests_issued_by_users",
        "stock_requests",
        type_="foreignkey",
    )

    # ============================================================
    # 3. Remove new columns
    # ============================================================

    op.drop_column(
        "stock_requests",
        "issued_at",
    )

    op.drop_column(
        "stock_requests",
        "issued_by",
    )