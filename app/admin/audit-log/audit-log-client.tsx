"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Shield, Eye, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string;
  payload: string | null;
  createdAt: string;
}

interface AuditLogClientProps {
  initialLogs: AuditLogItem[];
}

export function AuditLogClient({ initialLogs }: AuditLogClientProps) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("PUBLISH") || action.includes("RELEASE")) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (action.includes("SUBMIT") || action.includes("GRADE")) {
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
    }
    if (action.includes("ROLE") || action.includes("SECURITY")) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-slate-100">
              System Audit Trail
            </h1>
            <Badge className="bg-slate-800 text-slate-400 border-slate-700">
              Immutable Records
            </Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Complete cryptographic activity log tracking administrative decisions, grading actions, and mutations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-nexora-surface/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nexora-elevated/70 border border-slate-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-nexora-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-nexora-elevated border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <GlassCard className="p-0 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-nexora-elevated text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Timestamp (UTC)</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                let parsedPayload = null;
                if (log.payload) {
                  try {
                    parsedPayload = JSON.parse(log.payload);
                  } catch {
                    parsedPayload = log.payload;
                  }
                }

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="py-4 px-4">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <div className="font-medium text-slate-200">
                        {log.actorName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {log.actorEmail}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-slate-400">
                      <span className="text-slate-300">{log.entityType}</span>
                      <span className="text-slate-600 block text-[10px]">
                        {log.entityId}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {log.payload ? (
                        <button
                          onClick={() =>
                            setExpandedLogId(isExpanded ? null : log.id)
                          }
                          className="inline-flex items-center gap-1 text-xs text-nexora-secondary hover:underline cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>{isExpanded ? "Hide" : "Inspect"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}

                      {/* Expandable JSON Payload Drawer */}
                      {isExpanded && parsedPayload && (
                        <div className="mt-3 text-left p-3 rounded-lg bg-nexora-surface border border-slate-700/80 font-mono text-xs text-slate-300 overflow-x-auto">
                          <pre className="text-[11px] text-cyan-300 leading-tight">
                            {JSON.stringify(parsedPayload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No audit records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
