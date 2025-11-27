mod model;

use crate::EventTrend;
use anyhow::{Error, Ok, Result};
use chrono::{DateTime, Duration, NaiveDate, NaiveDateTime, Utc};
pub use model::EventDTO;
use serde_json::Value as JsonValue;
use sqlx::{Pool, Postgres, Row, postgres::PgRow, query_builder::QueryBuilder};

pub struct Store {
    pub pool: Pool<Postgres>,
}

impl Store {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    pub async fn insert_events(&self, events: &[EventDTO]) -> Result<u64> {
        if events.is_empty() {
            return Ok(0);
        }
        let mut qb = QueryBuilder::new(
            "INSERT INTO public.events (company_id, app_id, user_id, event_name, payload, event_ts) ",
        );

        qb.push_values(events.iter(), |mut b, event| {
            let payload_json: Option<JsonValue> = serde_json::from_str(&event.payload_json).ok();
            let event_ts: DateTime<Utc> = {
                let ms: i64 = event.timestamp;
                let secs = ms / 1000;
                let nsecs = ((ms % 1000) * 1_000_000) as u32;
                let utc_time =
                    DateTime::from_timestamp(secs, nsecs).unwrap_or_else(|| chrono::Utc::now());

                utc_time
            };

            b.push_bind(&event.company_id)
                .push_bind(&event.app_id)
                .push_bind(&event.user_id)
                .push_bind(&event.event_name)
                .push_bind(payload_json)
                .push_bind(event_ts);
        });

        let result = qb.build().execute(&self.pool).await?;
        Ok(result.rows_affected())
    }

    pub async fn get_event_count(
        &self,
        company_id: String,
        app_id: String,
        user_id: Option<String>,
    ) -> Result<u64> {
        // 1️⃣ Start with the base query text
        let mut builder = QueryBuilder::new("SELECT COUNT(*) FROM events WHERE company_id = ");

        // 2️⃣ Add the first bound parameter
        builder.push_bind(company_id);

        // 3️⃣ Add the next SQL fragment and binding
        builder.push(" AND app_id = ");
        builder.push_bind(app_id);

        if let Some(user) = user_id {
            builder.push(" AND user_id = ");
            builder.push_bind(user);
        }

        // 5️⃣ Build the final query
        let query: sqlx::query::QueryAs<'_, Postgres, (i64,), sqlx::postgres::PgArguments> =
            builder.build_query_as::<(i64,)>();
        let (count,): (i64,) = query.fetch_one(&self.pool).await?;
        Ok(count as u64)
    }

    pub async fn get_daily_active_users(
        &self,
        company_id: String,
        app_id: String,
        days: i64,
    ) -> Result<Vec<(NaiveDate, i32)>> {
        // from_date as NaiveDateTime
        let from_date: NaiveDateTime = (Utc::now() - Duration::days(days)).naive_utc();

        // Start building the query
        let mut builder = QueryBuilder::<Postgres>::new(
            "SELECT DATE(event_ts) AS date, COUNT(DISTINCT user_id)::INT AS count \
         FROM events WHERE company_id = ",
        );

        // bind company_id
        builder.push_bind(company_id);

        builder.push(" AND app_id = ");
        builder.push_bind(app_id);

        builder.push(" AND event_ts >= ");
        builder.push_bind(from_date);

        // group/order

        builder.push(" GROUP BY DATE(event_ts) ORDER BY DATE(event_ts)");

        //build and execute
        // Build and execute
        let query = builder.build(); // returns a sqlx::Query with bound args
        let rows: Vec<PgRow> = query.fetch_all(&self.pool).await?;

        let results: Vec<(_, _)> = rows
            .into_iter()
            .map(|row| {
                let date = row.get("date");
                let count = row.get("count");
                (date, count)
            })
            .collect::<Vec<_>>();

        Ok(results)
    }

    pub async fn get_event_trends(
        &self,
        company_id: String,
        app_id: String,
        days: i32,
    ) -> Result<Vec<EventTrend>> {
        let from_date: NaiveDateTime = (Utc::now() - Duration::days(days as i64)).naive_utc();

        // 1. Start building the query
        let mut builder = QueryBuilder::<Postgres>::new(
            "SELECT DATE(event_ts) AS date, event_name, COUNT(*)::BIGINT AS count FROM events WHERE company_id = ",
        );

        builder
            .push_bind(company_id)
            .push(" AND app_id = ")
            .push_bind(app_id)
            .push(" AND event_ts >= ")
            .push_bind(from_date)
            .push(" GROUP BY DATE(event_ts), event_name ORDER BY DATE(event_ts);");

        // 4️⃣ Build and execute
        let query = builder.build();
        let rows = query.fetch_all(&self.pool).await?;

        // 5️⃣ Map rows manually into our struct
        let trends = rows
            .into_iter()
            .map(|row| EventTrend {
                date: row.get::<NaiveDate, _>("date").to_string(),
                event_name: row.get::<String, _>("event_name"),
                count: row.get::<i64, _>("count"),
            })
            .collect();

        Ok(trends)
    }

    pub async fn get_user_summary(
        &self,
        company_id: &str,
        app_id: &str,
        user_id: &str,
    ) -> Result<(i64, Option<DateTime<Utc>>, Option<DateTime<Utc>>), Error> {
        let mut query_builder: QueryBuilder<'_, Postgres> = QueryBuilder::<Postgres>::new(
            "SELECT 
                 COUNT(*)::BIGINT AS total_events,
                 MIN(event_ts) AS first_ts,
                 MAX(event_ts) AS last_ts
              FROM events
              WHERE",
        );

        query_builder
            .push(" company_id = ")
            .push_bind(company_id)
            .push(" AND app_id = ")
            .push_bind(app_id)
            .push(" AND user_id = ")
            .push_bind(user_id);

        let query = query_builder
            .build_query_as::<(Option<i64>, Option<DateTime<Utc>>, Option<DateTime<Utc>>)>();
        let row = query.fetch_one(&self.pool).await?;
        Ok((row.0.unwrap_or(0), row.1, row.2))
    }

    pub async fn get_user_activity_timeline(
        &self,
        company_id: &str,
        app_id: &str,
        user_id: &str,
        days: i32,
    ) -> Result<Vec<(NaiveDate, i64)>, Error> {
        // <-- 3. Corrected return type syntax
        let from: NaiveDateTime = (Utc::now() - Duration::days(days as i64)).naive_utc();

        let mut qb = QueryBuilder::<Postgres>::new(
            "
            Select DATE (event_ts) AS day, COUNT(*)::BIGINT AS count 
            FROM events
            WHERE
        ",
        );

        qb.push(" company_id = ")
            .push_bind(company_id)
            .push(" AND app_id = ")
            .push_bind(app_id)
            .push(" AND user_id = ")
            .push_bind(user_id)
            .push(" AND event_ts >= ")
            .push_bind(from)
            .push(
                " GROUP BY DATE(event_ts)
                     ORDER BY DATE(event_ts)",
            );

        let rows: Vec<PgRow> = qb
            .build() // <-- CORRECT: Use .build() to finalize the query
            .fetch_all(&self.pool)
            .await?;

        let result: Vec<(NaiveDate, i64)> = rows
            .into_iter()
            .map(|row: PgRow| {
                // Note: row.get() infers the type from context,
                // but explicitly returning the tuple is key.
                let day: NaiveDate = row.get("day");
                let count: i64 = row.get("count");
                (day, count) // <-- 1 & 2. Returns the expected tuple
            })
            .collect();

        Ok(result)
    }

    pub async fn get_user_event_breakdown(
        &self,
        company_id: &str,
        app_id: &str,
        user_id: &str,
        days: i32,
    ) -> Result<Vec<(String, i64)>, Error> {
        let from: NaiveDateTime = (Utc::now() - Duration::days(days as i64)).naive_utc();
        let mut qb = QueryBuilder::<Postgres>::new(
            "
            SELECT event_name, COUNT(*)::BIGINT AS count
            FROM events
            WHERE
        ",
        );

        qb.push(" company_id = ")
            .push_bind(company_id)
            .push(" AND app_id = ")
            .push_bind(app_id)
            .push(" AND user_id = ")
            .push_bind(user_id)
            .push(" AND event_ts >= ")
            .push_bind(from);

        qb.push(
            " GROUP BY event_name
              ORDER BY count DESC
            ",
        );

        let rows = qb.build().fetch_all(&self.pool).await?;

        let result = rows
            .into_iter()
            .map(|row: PgRow| {
                let event_name: String = row.get("event_name");
                let count: i64 = row.get("count");
                (event_name, count)
            })
            .collect();
        Ok(result)
    }

    pub async fn get_user_recent_events(
        &self,
        company_id: &str,
        app_id: &str,
        user_id: &str,
        limit: i64,
    ) -> Result<Vec<(String, i64, String)>, Error> {
        let mut qb = QueryBuilder::<Postgres>::new(
            "
                SELECT event_name, (EXTRACT(EPOCH FROM event_ts)*1000)::BIGINT AS ts_ms, payload::TEXT AS payload_json
                FROM events
                WHERE
            "
        );

        qb.push(" company_id = ")
            .push_bind(company_id)
            .push(" AND app_id = ")
            .push_bind(app_id)
            .push(" AND user_id = ")
            .push_bind(user_id);
        qb.push(" ORDER BY event_ts DESC LIMIT ").push_bind(limit);

        let rows = qb.build().fetch_all(&self.pool).await?;

        let result = rows
            .into_iter()
            .map(|row: PgRow| {
                // event_name is a simple String
                let event_name: String = row.get("event_name");
                // EXTRACT(EPOCH) returns f64 (double precision), so we retrieve as f64 and cast to i64
                // we rely on event_ts being NOT NULL
                let ts_ms: i64 = row.get::<_, _>("ts_ms");
                let payload_json: String = row
                    .get::<Option<String>, _>("payload_json")
                    .unwrap_or_else(|| "{}".to_string());

                (event_name, ts_ms, payload_json)
            })
            .collect();
        Ok(result)
    }


}
