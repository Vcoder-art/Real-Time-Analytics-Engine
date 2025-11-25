use std::net::SocketAddr;
use std::sync::Arc;
use tonic::{Request, Response, Status, transport::Server};
use tracing::{error, info};
use tracing_subscriber::{FmtSubscriber, filter::EnvFilter};

mod redis_helper;
mod store;

use redis_helper::RedisPublisher;
use store::{EventDTO, Store};

mod analytics {
    tonic::include_proto!("analytics"); // path = "package name" from proto
}

use analytics::{
    DailyActiveUsersRequest, DailyActiveUsersResponse, DayCount, EventBatch, EventCount,
    EventTrend, EventTrendRequest, EventTrendResponse, GetCountRequest, GetCountResponse,
    GetUserInitialAnalyticsRequest, GetUserInitialAnalyticsResponse, SaveEventResponse,
    TopEventsRequest, TopEventsResponse,
    analytics_service_server::{AnalyticsService, AnalyticsServiceServer},
};

pub struct AnalyticsServer {
    store: Arc<Store>,
    redis_pub: Arc<RedisPublisher>,
}

impl AnalyticsServer {
    fn new(store: Arc<Store>, redis_pub: Arc<RedisPublisher>) -> Self {
        Self { store, redis_pub }
    }
}

// Implement the gRPC service

#[tonic::async_trait]
impl AnalyticsService for AnalyticsServer {
    async fn save_event(
        &self,
        request: Request<EventBatch>,
    ) -> Result<Response<SaveEventResponse>, Status> {
        let batch: EventBatch = request.into_inner();
        let mut dtos: Vec<EventDTO> = Vec::with_capacity(batch.events.len());
        info!("Batch Data -> {batch:?}");
        info!("📦 Received batch with {} events", batch.events.len());
        let company_id = batch.company_id;
        let app_id = batch.app_id;
        let user_id = batch.user_id;

        for event in batch.events {
            // parse timestamp string to i64; fallback to 0
            let ts: i64 = event.timestamp.parse::<i64>().unwrap_or(0);

            dtos.push(EventDTO {
                company_id: company_id.to_string(),
                app_id: app_id.to_string(),
                user_id: user_id.to_string(),
                event_name: event.event_name,
                timestamp: ts,
                payload_json: event.payload_json,
            });
        }

        match self.store.insert_events(&dtos).await {
            Result::Ok(count) => {
                let msg = serde_json::json!({
                "type": "batch_inserted",
                "company_id": company_id,
                "app_id": app_id,
                "user_id": user_id,
                });
                let channel = format!("analytics:company:{}:app:{}", company_id, app_id);

                let publisher: Arc<RedisPublisher> = self.redis_pub.clone();
                tokio::spawn(async move {
                    if let Err(e) = publisher.publish(&channel, &msg).await {
                        error!("redis publish error: {:?}", e);
                    };
                });

                Ok(Response::new(SaveEventResponse {
                    message: format!("Inserted {} events", count),
                    success: true,
                }))
            }
            Err(e) => {
                error!("DB insert error: {:?}", e);
                Err(Status::internal("Failed to save events"))
            }
        }
    }

    async fn get_event_count(
        &self,
        request: Request<GetCountRequest>,
    ) -> Result<Response<GetCountResponse>, Status> {
        let req = request.into_inner();
        let company_id = req.company_id;
        let app_id = req.app_id;
        let user_id = req.user_id;

        //Run Query through store

        let count = self
            .store
            .get_event_count(company_id, app_id, user_id)
            .await
            .map_err(|e| {
                error!("DB error failed: {:?}", e);
                Status::internal("Database error")
            })?;

        Ok(Response::new(analytics::GetCountResponse { count }))
    }

    async fn get_daily_active_users(
        &self,
        request: Request<DailyActiveUsersRequest>,
    ) -> Result<Response<DailyActiveUsersResponse>, Status> {
        let req: DailyActiveUsersRequest = request.into_inner();

        let rows: Vec<(chrono::NaiveDate, i32)> = self
            .store
            .get_daily_active_users(req.company_id, req.app_id, req.days as i64)
            .await
            .map_err(|e| Status::internal(format!("DB error {:?}", e)))?;

        let data: Vec<DayCount> = rows
            .into_iter()
            .map(|(date, count)| DayCount {
                count: count as u64,
                date: date.to_string(),
            })
            .collect();

        Ok(Response::new(DailyActiveUsersResponse { data }))
    }

    async fn get_event_trends(
        &self,
        request: Request<EventTrendRequest>,
    ) -> Result<Response<EventTrendResponse>, Status> {
        let req = request.into_inner();
        let rows = self
            .store
            .get_event_trends(req.company_id, req.app_id, req.days)
            .await
            .map_err(|e: anyhow::Error| Status::internal(format!("DB error {:?}", e)))?;
        Ok(Response::new(EventTrendResponse { data: rows }))
    }

    async fn get_top_events(
        &self,
        request: Request<TopEventsRequest>,
    ) -> Result<Response<TopEventsResponse>, Status> {
        Ok(Response::new(TopEventsResponse {
            data: vec![EventCount {
                count: 10,
                event_name: "".to_string(),
            }],
        }))
    }

    async fn get_user_initial_analytics(
        &self,
        request: Request<GetUserInitialAnalyticsRequest>
    ) -> Result<Response<GetUserInitialAnalyticsResponse>,Status> {
       
         let req = request.into_inner();
         let company_id = req.company_id;   
         let app_id = req.app_id;
         let user_id = req.user_id;
         let days = if req.days > 0 {req.days} else {30};

         let store = self.store.clone();

    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Read RUST_LOG from env (e.g. RUST_LOG=debug) or fallback to "info"
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("debug"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(env_filter)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting tracing default failed");

    info!("rust-analytics starter: logging initialized");

    // --- Create DB pool and Store ---
    // Expect DATABASE_URL in env: e.g. postgres://analytics:pass@127.0.0.1:5432/analytics_db
    let database_url = "postgres://analytics:analytics_pass@127.0.0.1:5432/analytics_db";
    // let database_url =
    //     std::env::var("DATABASE_URL").expect("DATABASE_URL env var must be set for DB connection");

    // connect to postgres database
    let pool = sqlx::PgPool::connect(&database_url).await?;
    let store: Store = Store::new(pool);
    let store: Arc<Store> = Arc::new(store);

    //connect to redis server
    let redis_pub: RedisPublisher = RedisPublisher::new("redis://127.0.0.1:6379").await?;
    let redis_pub = Arc::new(redis_pub);
    let svc: AnalyticsServer = AnalyticsServer::new(store, redis_pub);

    let addr: SocketAddr = "127.0.0.1:50051".parse()?;
    info!("🚀 Starting gRPC server on {}", addr);

    //start Server
    Server::builder()
        .add_service(AnalyticsServiceServer::new(svc))
        .serve(addr)
        .await?;

    Ok(())
}
