"""merge request workflow and avatar migrations

Revision ID: 557ca4c48504
Revises: b2c3d4e5f6g7, a3b4c5d6e7f8
Create Date: 2026-09-07 23:04:58.718590

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '557ca4c48504'
down_revision = ('b2c3d4e5f6g7', 'a3b4c5d6e7f8')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
