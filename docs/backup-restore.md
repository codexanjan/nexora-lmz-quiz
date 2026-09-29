# Nexora Learn - Database Backup, Restore & Disaster Recovery

## 1. Backup Strategies

Nexora Learn persists critical academic records (user progress, immutable question snapshots, quiz attempts, and manual grade revisions).

### Production PostgreSQL Backups:
1. **Automated Nightly Snapshot (Logical Dump)**:
   ```bash
   pg_dump --clean --if-exists --no-owner --format=c -h $DB_HOST -U $DB_USER -d $DB_NAME > /backups/nexora_$(date +%Y%m%d_%H%M%S).dump
   ```
2. **Point-In-Time Recovery (PITR)**:
   - Enable Continuous WAL (Write-Ahead Logging) archiving to cloud storage (e.g. AWS S3 Glacier or GCP Cloud Storage).
   - Retain 30 days of continuous WAL logs to enable restoration to any exact second preceding an operational incident.

### Development SQLite Backup:
```bash
sqlite3 dev.db ".backup 'dev_backup.db'"
```

## 2. Restore Procedures

### Restoring PostgreSQL Logical Dump:
```bash
# 1. Terminate active application connections
pm2 stop all

# 2. Restore schema and data
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME --clean --if-exists /backups/nexora_target.dump

# 3. Verify data integrity
npx prisma db pull

# 4. Restart services
pm2 start all
```

## 3. Migration Rollback Strategy

1. **Before Running Migrations**:
   - Always trigger an on-demand database backup before running `prisma migrate deploy`.
2. **Backward-Compatible Schema Changes**:
   - Follow the **Expand / Contract pattern**:
     - Phase 1 (Expand): Add nullable columns or new tables.
     - Phase 2: Deploy application code utilizing new fields.
     - Phase 3 (Contract): Safely deprecate or drop old columns in subsequent release.
3. **Emergency Rollback**:
   - If an unexpected error occurs during migration, restore the preceding database snapshot and revert the Git commit to the last stable deployment tag.
