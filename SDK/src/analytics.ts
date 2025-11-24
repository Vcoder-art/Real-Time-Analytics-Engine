import { AnalyticsConfig, EventPayload, SendResponse } from "./types";

const ANALYTICS_QUEUE_KEY = "analytics_queue";
const ANALYTICS_USER_ID_KEY = "analytics_user_id";
const ANON_ID_KEY = "analytics_anonymous_id";

export default class Analytics {
  private config: AnalyticsConfig;
  private queue: EventPayload[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing: Boolean = false;

  constructor(config: AnalyticsConfig) {
    this.config = {
      flushInterval: 3000,
      maxBatchSize: 10,
      debug: false,
      ...config,
    };

    if (!this.config.userId) {
      throw new Error("userId is required in Analytics config");
    }

    if (this.config.debug) {
      console.log("[Analytics] Initialized with config:", this.config);
    }

    // Start periodic flush + add beforeunload hook
    this.loadQueueFromStorage();
    this.startAutoFlush();
    this.attachBeforeUnload();
  }

  async identify(email: string, name: string) {
    this.config.email = email;
    this.config.name = name;
    await this.initializeUser();
  }

  private async initializeUser() {
    // Already exists?
    const storedUserId = localStorage.getItem(ANALYTICS_USER_ID_KEY);

    if (storedUserId) {
      this.config.userId = storedUserId;
      if (this.config.debug)
        console.log("[Analytics] Loaded existing user:", storedUserId);
      return;
    }

    try {
      const res = await fetch(`${this.config.apiUrl}/company-users/init-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
        },
        body: JSON.stringify({
          email: this.config.email,
          name: this.config.name,
        }),
      });

      const data = await res.json();
      if (data.userId) {
        localStorage.setItem(ANALYTICS_USER_ID_KEY, data.userId);
        this.config.userId = data.userId;

        if (this.config.debug)
          console.log("[Analytics] User initialized:", data.userId);
      }
    } catch (err) {
      console.error("[Analytics] Failed to initialize user:", err);
    }
  }

  /** Public method for tracking events */

  track(event: string, metadata: Record<string, any> = {}) {
    const payload: EventPayload = {
      event,
      metadata,
      timestamp: Date.now(),
    };

    this.queue.push(payload);
    this.saveQueueToStorage();

    if (this.config.debug) {
      console.log(`[Analytics] Queued event: ${event}, payload`);
    }

    if (this.queue.length >= (this.config.maxBatchSize || 10)) {
      this.flush();
    }
  }

  /** Flushes queued events to server */
  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;

    if (!this.config.userId) {
      this.initializeUser();
      if (this.config.debug) {
        console.log("[Analytics] retry to initialize user");
      }
      return;
    }

    this.isFlushing = true;
    const events = [...this.queue];
    this.queue = []; // clear queue

    try {
      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
        },
        body: JSON.stringify({ userid: this.config.userId, events }),
        //Allows requests to complete even during page unload
        keepalive: true, // important for beforeunload to work
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (this.config.debug) {
        console.log(`[Analytics] Flushed ${events.length} events`);
      }
      localStorage.removeItem(ANALYTICS_QUEUE_KEY);
    } catch (err) {
      console.error("[Analytics] Failed to send events:", err);
      this.queue.unshift(...events); // requeue for retry
      this.saveQueueToStorage(); // persist again
    } finally {
      this.isFlushing = false;
    }
  }

  startAutoFlush() {
    const interval = this.config.flushInterval || 3000;
    this.flushTimer = setInterval(() => this.flush(), interval);
  }

  /** Attach beforeunload flush to prevent event loss */
  private attachBeforeUnload() {
    window.addEventListener("beforeunload", () => {
      if (this.queue.length > 0) {
        this.flush();
      }
    });
  }

  stop() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flush();
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.warn("[Analytics] Failed to save queue to localStorage", err);
    }
  }

  private loadQueueFromStorage() {
    try {
      const saved = localStorage.getItem(ANALYTICS_QUEUE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
        if (this.config.debug) {
          console.log(`
            [Analytics] Restored ${this.queue.length} events from storage
          `);
        }
      }
    } catch (err) {
      console.warn("[Analytics] Failed to load queue from localStorage", err);
    }
  }

  private generateAnonymousId() {
    return "anon_" + crypto.randomUUID();
  }
}
