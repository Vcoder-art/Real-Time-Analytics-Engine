mod model;

use anyhow::{Ok, Result};
use chrono::{DateTime, Duration, NaiveDate, NaiveDateTime, Utc};
pub use model::EventDTO;
use serde_json::Value as JsonValue;
use sqlx::{Pool, Postgres, Row, postgres::PgRow, query_builder::QueryBuilder};
use crate::EventTrend;

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
}
