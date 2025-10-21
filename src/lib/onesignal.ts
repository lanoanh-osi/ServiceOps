// Lightweight helpers to interact with OneSignal v16 safely

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}

function enqueue(callback: (OneSignal: any) => void) {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback as any);
}

// OneSignal is now available on all domains

export function oneSignalSetExternalId(userId: string, tags?: Record<string, string>) {
  if (!userId) {
    console.log("No userId provided - skipping setExternalId");
    return;
  }
  
  enqueue(async (OneSignal) => {
    try {
      // Wait for SDK to be fully ready
      let attempts = 0;
      while (attempts < 10) {
        if (OneSignal && typeof OneSignal.setExternalUserId === "function") {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      if (!OneSignal || typeof OneSignal.setExternalUserId !== "function") {
        console.warn("OneSignal not ready after waiting: setExternalUserId skipped");
        return;
      }
      
      // Set external ID (email) for targeting
      await OneSignal.setExternalUserId(String(userId));
      console.log("OneSignal external ID set:", userId);
      
      // Add tags if provided
      if (tags && Object.keys(tags).length > 0) {
        try {
          if (OneSignal?.sendTags) {
            await OneSignal.sendTags(tags);
            console.log("OneSignal tags set:", tags);
          }
        } catch {}
      }
    } catch (err) {
      console.error("OneSignal setExternalUserId error", err);
    }
  });
}

export function oneSignalLogout() {
  
  enqueue(async (OneSignal) => {
    try {
      // Wait for SDK to be fully ready
      let attempts = 0;
      while (attempts < 10) {
        if (OneSignal && typeof OneSignal.removeExternalUserId === "function") {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      if (!OneSignal || typeof OneSignal.removeExternalUserId !== "function") {
        console.warn("OneSignal not ready after waiting: removeExternalUserId skipped");
        return;
      }
      
      await OneSignal.removeExternalUserId();
      console.log("OneSignal external ID removed");
    } catch (err) {
      console.error("OneSignal logout error", err);
    }
  });
}

// Simple logout function for manual logout
export function handleLogout() {
  // Clear local storage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  
  // Remove OneSignal external ID (only on production)
  oneSignalLogout();
}

export function oneSignalRequestPermissionAndOptIn() {
  
  enqueue(async (OneSignal) => {
    try {
      if (!OneSignal?.Notifications) {
        console.warn("OneSignal Notifications not ready");
        return;
      }
      const permission = await OneSignal.Notifications.permission;
      if (permission === "default") {
        try { await OneSignal.Notifications.requestPermission(); } catch {}
      }
      // Directly attempt opt-in; v16 SDK exposes optIn without needing a getter
      try {
        if (OneSignal?.User?.PushSubscription?.optIn) {
          await OneSignal.User.PushSubscription.optIn();
        }
      } catch {}
    } catch (err) {
      console.error("OneSignal opt-in error", err);
    }
  });
}

// Complete OneSignal setup flow with email as external_user_id
export function oneSignalCompleteSetup(userEmail: string) {
  if (!userEmail) {
    console.log("No user email provided - skipping OneSignal setup");
    return;
  }

  enqueue(async (OneSignal) => {
    try {
      console.log("🚀 Starting OneSignal complete setup...");

      // Check if OneSignal is properly initialized
      if (!OneSignal || !OneSignal.Notifications) {
        console.warn("⚠️ OneSignal not properly initialized - skipping setup");
        return;
      }

      // 1. Đảm bảo OneSignal được khởi tạo (đã được init trong index.html)
      console.log("✅ OneSignal already initialized");

      // 2. Kiểm tra quyền thông báo
      const permission = await OneSignal.Notifications.permission;
      console.log("🔔 Current permission:", permission);
      
      if (permission !== "granted") {
        console.log("📱 Requesting notification permission...");
        try {
          await OneSignal.Notifications.requestPermission();
        } catch (permError) {
          console.warn("⚠️ Permission request failed:", permError.message);
        }
      }

      // 3. Lấy player_id
      let playerId = null;
      try {
        playerId = await OneSignal.User.PushSubscription.id;
        console.log("🎯 Player ID:", playerId);
      } catch (playerError) {
        console.warn("⚠️ Failed to get Player ID:", playerError.message);
      }

      // 4. Gắn external_user_id (sử dụng email)
      try {
        await OneSignal.setExternalUserId(userEmail);
        console.log("🔗 Linked external_user_id (email):", userEmail);
      } catch (externalIdError) {
        console.warn("⚠️ Failed to set external user ID:", externalIdError.message);
      }

      // 5. Gửi playerId về server hoặc n8n webhook
      if (playerId) {
        try {
          const response = await fetch("https://n8n.osi.vn/webhook/save-player-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: userEmail,
              player_id: playerId
            })
          });
          
          if (response.ok) {
            console.log("✅ Player ID sent to webhook successfully");
          } else {
            console.warn("⚠️ Failed to send player ID to webhook:", response.status);
          }
        } catch (webhookError) {
          console.error("❌ Webhook error:", webhookError);
        }
      }

      console.log("🎉 OneSignal setup completed!");

    } catch (err) {
      console.error("⚠️ OneSignal setup failed:", err.message || err);
    }
  });
}

// Optional snapshot helper (best effort; properties may vary across versions)
export async function getOneSignalSubscriptionSnapshot(): Promise<{
  playerId: string | null;
  optedIn: boolean;
  permission: "default" | "granted" | "denied";
}> {
  
  return new Promise((resolve) => {
    enqueue(async (OneSignal) => {
      try {
        if (!OneSignal?.Notifications) {
          resolve({ playerId: null, optedIn: false, permission: "default" });
          return;
        }
        const permission = await OneSignal.Notifications.permission;
        let playerId: string | null = null;
        let optedIn = false;
        try {
          // Some builds expose id/optedIn as properties
          playerId = OneSignal?.User?.PushSubscription?.id || null;
          optedIn = !!OneSignal?.User?.PushSubscription?.optedIn;
        } catch {}
        resolve({ playerId, optedIn, permission });
      } catch (err) {
        console.error("OneSignal snapshot error", err);
        resolve({ playerId: null, optedIn: false, permission: "default" });
      }
    });
  });
}


