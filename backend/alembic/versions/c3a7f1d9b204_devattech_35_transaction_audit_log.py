"""DEVATTECH-35 transaction audit log table

Revision ID: c3a7f1d9b204
Revises: 8f1c2a7b9e3d
Create Date: 2026-07-01 00:00:00.000000

Append-only table: a BEFORE UPDATE OR DELETE trigger blocks any
mutation/removal of existing rows at the database level, regardless of
which app layer or role issues the statement.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c3a7f1d9b204'
down_revision: Union[str, Sequence[str], None] = '8f1c2a7b9e3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('transaction_audit_logs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('transaction_id', sa.Integer(), nullable=False),
    sa.Column('action', sa.String(length=50), nullable=False),
    sa.Column('actor_id', sa.Integer(), nullable=True),
    sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transaction_audit_logs_id'), 'transaction_audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_transaction_audit_logs_transaction_id'), 'transaction_audit_logs', ['transaction_id'], unique=False)
    op.create_index(op.f('ix_transaction_audit_logs_actor_id'), 'transaction_audit_logs', ['actor_id'], unique=False)

    # Enforce append-only: block UPDATE and DELETE at the DB level.
    op.execute(
        """
        CREATE OR REPLACE FUNCTION prevent_transaction_audit_logs_mutation()
        RETURNS TRIGGER AS $$
        BEGIN
            RAISE EXCEPTION 'transaction_audit_logs is append-only: % not allowed', TG_OP;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_transaction_audit_logs_no_update
        BEFORE UPDATE ON transaction_audit_logs
        FOR EACH ROW EXECUTE FUNCTION prevent_transaction_audit_logs_mutation();
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_transaction_audit_logs_no_delete
        BEFORE DELETE ON transaction_audit_logs
        FOR EACH ROW EXECUTE FUNCTION prevent_transaction_audit_logs_mutation();
        """
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS trg_transaction_audit_logs_no_delete ON transaction_audit_logs;")
    op.execute("DROP TRIGGER IF EXISTS trg_transaction_audit_logs_no_update ON transaction_audit_logs;")
    op.execute("DROP FUNCTION IF EXISTS prevent_transaction_audit_logs_mutation();")

    op.drop_index(op.f('ix_transaction_audit_logs_actor_id'), table_name='transaction_audit_logs')
    op.drop_index(op.f('ix_transaction_audit_logs_transaction_id'), table_name='transaction_audit_logs')
    op.drop_index(op.f('ix_transaction_audit_logs_id'), table_name='transaction_audit_logs')
    op.drop_table('transaction_audit_logs')
    # ### end Alembic commands ###
