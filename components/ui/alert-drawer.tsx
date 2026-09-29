"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ShieldAlert, Info, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

interface AlertItem {
  id: string;
  category: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL" | string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isAcknowledged: boolean;
  isResolved: boolean;
  createdAt: string;
}

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canManageAlerts?: boolean;
}

export function AlertDrawer({ isOpen, onClose, canManageAlerts = false }: AlertDrawerProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "WARNINGS" | "CRITICAL" | "RESOLVED">("ALL");
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  const handleAction = async (alertId: string, action: "acknowledge" | "resolve") => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, action }),
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === "RESOLVED") return a.isResolved;
    if (a.isResolved) return false;
    if (activeTab === "CRITICAL") return a.level === "CRITICAL";
    if (activeTab === "WARNINGS") return a.level === "WARNING";
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-deep/80 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md glass-panel border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20 text-accent border border-primary/30">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">System Alert Center</h2>
                    <p className="text-xs text-text-secondary">Real-time operational & academic telemetry</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Segmented Filter Controls */}
              <div className="flex p-2 bg-surface/60 border-b border-white/10 gap-1 text-xs">
                {(["ALL", "CRITICAL", "WARNINGS", "RESOLVED"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      activeTab === tab
                        ? "bg-primary text-white shadow-glow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="text-center py-12 text-sm text-text-muted">Loading system alerts...</div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-success mx-auto opacity-70" />
                    <p className="text-sm font-medium text-text-primary">No active {activeTab.toLowerCase()} alerts</p>
                    <p className="text-xs text-text-secondary">All systems and course pipelines are operating normally.</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isCritical = alert.level === "CRITICAL";
                    const isWarning = alert.level === "WARNING";
                    const isSuccess = alert.level === "SUCCESS";

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCritical
                            ? "bg-critical/10 border-critical/30"
                            : isWarning
                            ? "bg-warning/10 border-warning/30"
                            : isSuccess
                            ? "bg-success/10 border-success/30"
                            : "bg-surface/80 border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {isCritical ? (
                              <ShieldAlert className="w-4 h-4 text-critical shrink-0" />
                            ) : isWarning ? (
                              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                            ) : isSuccess ? (
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                            ) : (
                              <Info className="w-4 h-4 text-info shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-text-primary">{alert.title}</span>
                          </div>
                          <Badge
                            variant={
                              isCritical ? "critical" : isWarning ? "warning" : isSuccess ? "success" : "default"
                            }
                          >
                            {alert.category}
                          </Badge>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed mb-3">{alert.message}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px]">
                          <span className="text-text-muted">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-2">
                            {alert.linkUrl && (
                              <a
                                href={alert.linkUrl}
                                className="inline-flex items-center gap-1 text-primary-light hover:text-white"
                              >
                                View <ArrowUpRight className="w-3 h-3" />
                              </a>
                            )}
                            {canManageAlerts && !alert.isResolved && (
                              <button
                                onClick={() => handleAction(alert.id, "resolve")}
                                className="text-xs text-success hover:underline ml-2"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
