use serde::Serialize;
use tracing::info;
use std::sync::Arc;
use tokio::sync::Mutex;
use redis::{self,AsyncCommands,RedisError,aio::ConnectionManager};

mod  messages_structs;

#[derive(Clone)]
pub struct RedisPublisher {
  conn:Arc<Mutex<ConnectionManager>>
}

impl RedisPublisher {
    pub async fn new(url:&str) -> Result<Self,RedisError> {
        let client = redis::Client::open(url)?;
        let mgr = ConnectionManager::new(client).await?;
        Ok(Self { conn: Arc::new(Mutex::new(mgr)) })
    }

    pub async fn publish<T:Serialize>(&self,channel:&str,msg:&T) -> Result<(),RedisError> {
        let json = serde_json::to_string(msg)
        .map_err(|e| RedisError::from((redis::ErrorKind::TypeError, "Serialization error", e.to_string())))?;
        let mut connection = self.conn.lock().await;
        let subscribers: i32 = connection.publish(channel, json).await?;
        info!("Message sent to {} subscribers", subscribers);
        Ok(())  
    }
}

