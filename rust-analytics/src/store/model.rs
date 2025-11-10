use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct EventDTO {
    pub company_id: String,
    pub app_id: String,
    pub user_id: String,
    pub event_name: String,
    pub timestamp: i64,       // unix millis
    pub payload_json: String, // stringified JSON
}

