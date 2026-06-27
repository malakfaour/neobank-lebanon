"""create beneficiaries table

Revision ID: 20260628_0002
Revises: 20260628_0001
Create Date: 2026-06-28
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "20260628_0002"
down_revision: Union[str, None] = "20260628_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


beneficiary_type_enum = sa.Enum(
    "mobile",
    "iban",
    "bank_account",
    name="beneficiary_type",
)


def upgrade() -> None:
    beneficiary_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "beneficiaries",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("nickname", sa.String(length=100), nullable=False),
        sa.Column("type", beneficiary_type_enum, nullable=False),
        sa.Column("value", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
    )


def downgrade() -> None:
    op.drop_table("beneficiaries")
    beneficiary_type_enum.drop(op.get_bind(), checkfirst=True)