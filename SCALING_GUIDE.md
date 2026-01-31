# Scaling & Performance Guide

## Current Optimizations ✅

### Frontend Performance
- ✅ Lazy loading for heavy components (WorldProgressionPanel)
- ✅ React Query caching (30s staleTime)
- ✅ Memoization for expensive calculations
- ✅ Pagination for events (15 per page)
- ✅ Emergency minimal mode for stability
- ✅ Error boundaries for graceful failures
- ✅ Optimized algorithms (O(n²) → O(n))

### Backend Performance
- ✅ Database indexes on frequently queried columns
- ✅ Query result limits (100-200 events max)
- ✅ RLS policies for security
- ✅ Composite indexes for common query patterns

### Data Fetching
- ✅ 30-second auto-refresh for core data
- ✅ Disabled aggressive polling (was 15s)
- ✅ Admin-only expensive operations (summary generation)
- ✅ 6-hour cache for AI-generated content

---

## Immediate Actions for Scaling

### 1. **Upgrade Supabase** 🔥 Critical
**Current**: Free tier (500MB, 50K requests/month)
**Recommended**: Pro tier ($25/mo)
- 8GB database storage
- 500K API requests/month
- 50GB bandwidth
- Better connection pooling
- Dedicated resources

### 2. **Apply Database Indexes**
Run the migration file:
```bash
# In Supabase Dashboard → SQL Editor
# Run: supabase/migrations/20260131050000_performance_indexes.sql
```

This adds indexes on:
- `events(world_id, created_at DESC)` - Most queried
- `agents(world_id, status)` - Filtered frequently
- `claims(x_handle)` - Custodianship lookups
- And 10+ more critical indexes

### 3. **Monitor Usage**
Check Supabase Dashboard daily:
- Database size (approaching 500MB?)
- API requests (approaching 50K/month?)
- Query performance (slow queries?)
- Error logs (timeouts?)

---

## Medium-Term Optimizations (1-2 weeks)

### 1. **Implement Data Archiving**
```sql
-- Archive events older than 30 days
CREATE TABLE events_archive (LIKE events INCLUDING ALL);

-- Move old data
INSERT INTO events_archive 
SELECT * FROM events 
WHERE created_at < NOW() - INTERVAL '30 days';

DELETE FROM events 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### 2. **Add Rate Limiting**
Implement in Supabase Edge Functions:
```typescript
// Limit summary generation to 1 per hour per user
const RATE_LIMIT = 3600000; // 1 hour in ms
```

### 3. **Optimize Heavy Queries**
- Add materialized views for complex aggregations
- Pre-calculate metrics in background jobs
- Use Supabase Realtime for live updates instead of polling

### 4. **CDN for Static Assets**
- Move images/assets to Cloudflare R2 or AWS S3
- Reduce Lovable bandwidth usage
- Faster global delivery

---

## Long-Term Scaling (1-3 months)

### 1. **Database Sharding**
If you exceed 8GB on Pro tier:
- Shard by `world_id` (separate worlds into different databases)
- Archive completed worlds
- Implement read replicas

### 2. **Caching Layer**
Add Redis/Upstash for:
- User sessions
- Frequently accessed data
- Rate limiting counters
- Real-time leaderboards

### 3. **Background Jobs**
Move expensive operations to background:
- Summary generation → Cron job every 6 hours
- Metric calculations → Pre-compute nightly
- Cleanup tasks → Scheduled maintenance

### 4. **Monitoring & Alerts**
Set up:
- Sentry for error tracking
- Uptime monitoring (Pingdom/UptimeRobot)
- Performance monitoring (Vercel Analytics)
- Database query monitoring

---

## Performance Benchmarks

### Current Limits (Free Tier)
- **Max concurrent users**: ~50-100
- **Database size**: 500MB (~50K events, ~1K agents)
- **API requests**: 50K/month (~1,600/day)

### After Pro Upgrade
- **Max concurrent users**: ~500-1,000
- **Database size**: 8GB (~800K events, ~10K agents)
- **API requests**: 500K/month (~16,600/day)

### After Full Optimization
- **Max concurrent users**: 5,000+
- **Database size**: Unlimited (with archiving)
- **API requests**: Millions (with caching)

---

## Cost Breakdown

### Current (Free)
- Lovable Cloud: $0
- Supabase: $0
- **Total**: $0/month

### Recommended (Pro)
- Lovable Cloud: $0 (or upgrade if needed)
- Supabase Pro: $25/month
- **Total**: $25/month

### Full Scale (High Traffic)
- Lovable Cloud Pro: $20/month
- Supabase Pro: $25/month
- Redis (Upstash): $10/month
- Monitoring: $10/month
- **Total**: $65/month

---

## Emergency Procedures

### If Site Goes Down
1. Enable `MAINTENANCE_MODE = true` in `App.tsx`
2. Check Supabase logs for errors
3. Check if you hit rate limits
4. Temporarily increase `staleTime` to reduce queries

### If Database is Full
1. Run archiving script (move old events)
2. Delete SYSTEM events (least important)
3. Upgrade to Pro tier immediately

### If Too Many Requests
1. Increase `refetchInterval` from 30s → 60s
2. Disable auto-refresh temporarily
3. Add rate limiting to Edge Functions

---

## Monitoring Checklist (Weekly)

- [ ] Check Supabase database size
- [ ] Review slow query logs
- [ ] Monitor API request count
- [ ] Check error rates in browser console
- [ ] Review user feedback for performance issues
- [ ] Test site on slow 3G connection
- [ ] Verify all pages load in <3 seconds

---

## Quick Wins (Do Today)

1. ✅ Apply database indexes migration
2. ✅ Add error boundaries (already done)
3. ⚠️ Set up Supabase email alerts for 80% quota usage
4. ⚠️ Create backup of database (Supabase Dashboard → Database → Backups)
5. ⚠️ Test site with Chrome DevTools throttling (Slow 3G)

---

## Contact & Support

- **Supabase Support**: https://supabase.com/support
- **Lovable Support**: https://lovable.dev/support
- **Performance Issues**: Check browser console + Supabase logs first

---

**Last Updated**: January 31, 2026
**Next Review**: February 7, 2026
