// Shared schedule storage for the YASC guide, backed by Supabase.
// Exposes window.ScheduleStore = { subscribe(onData, onError), save(state) }.
// index.html keeps a localStorage copy as the fallback, so if this file fails to load the page still works on one device.
(function () {
  var cfg = window.YASC_CONFIG || {};
  if (!window.supabase || !cfg.SUPABASE_URL || /YOUR-PROJECT/.test(cfg.SUPABASE_URL)) {
    console.warn("ScheduleStore: Supabase not configured; using this device only.");
    return;
  }
  var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  var ID = cfg.SCHEDULE_ID || "main";

  async function load() {
    var r = await client.from("schedules").select("data").eq("id", ID).maybeSingle();
    if (r.error) throw r.error;
    return r.data ? r.data.data : null;
  }

  window.ScheduleStore = {
    subscribe: function (onData, onError) {
      load().then(onData).catch(onError || function () {});
      client
        .channel("schedules-" + ID)
        .on("postgres_changes", { event: "*", schema: "public", table: "schedules", filter: "id=eq." + ID }, function (payload) {
          if (payload.new && payload.new.data) onData(payload.new.data);
        })
        .subscribe(function (status) {
          if (status === "CHANNEL_ERROR" && onError) onError(new Error("realtime channel error"));
        });
    },
    save: async function (state) {
      var r = await client.from("schedules").upsert({ id: ID, data: state, updated_at: new Date().toISOString() });
      if (r.error) throw r.error;
    }
  };
})();
