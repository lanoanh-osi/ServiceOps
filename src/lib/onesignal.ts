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

// Check if OneSignal is available (only on production)
function isOneSignalAvailable(): boolean {
  return window.location.hostname === 'service-ops-blush.vercel.app';
}

export function oneSignalSetExternalId(userId: string, tags?: Record<string, string>) {
  if (!userId || !isOneSignalAvailable()) {
    console.log("OneSignal not available on localhost - skipping setExternalId");
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
  if (!isOneSignalAvailable()) {
    console.log("OneSignal not available on localhost - skipping logout");
    return;
  }
  
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
  if (!isOneSignalAvailable()) {
    console.log("OneSignal not available on localhost - skipping permission request");
    return;
  }
  
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

// Optional snapshot helper (best effort; properties may vary across versions)
export async function getOneSignalSubscriptionSnapshot(): Promise<{
  playerId: string | null;
  optedIn: boolean;
  permission: "default" | "granted" | "denied";
}> {
  if (!isOneSignalAvailable()) {
    return { playerId: null, optedIn: false, permission: "default" };
  }
  
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


