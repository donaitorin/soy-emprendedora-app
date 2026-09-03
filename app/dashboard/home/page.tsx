"use client";

import { useEffect, useState } from "react";
import IncomeModal from "@/app/dashboard/money/_components/income-modal";
import TaskModal from "@/app/dashboard/_components/task-modal";
import { api, ApiError } from "@/lib/api";
import {
  HARDCODED_REACH_TODAY,
  HARDCODED_WEEKLY_REACH,
  greeting,
  hoursLabel,
  lastNDays,
  weekdayLong,
} from "@/lib/home";
import { selectFocusLeads } from "@/lib/leads";
import { formatMoney, sumByDate, toIsoDate } from "@/lib/money";
import type {
  Income,
  Lead,
  LeadsPage,
  LeadStats,
  PostingStatus,
  Task,
  TaskPriority,
  TaskSuggestionType,
  UnansweredConversation,
  User,
} from "@/lib/types";
import AttentionSection from "./_components/attention-section";
import FocusLeads from "./_components/focus-leads";
import WeeklyChart, { type WeeklyRow } from "./_components/weekly-chart";

type TaskPrefill = {
  title: string;
  notes: string;
  priority: TaskPriority;
  suggestionType: TaskSuggestionType;
  conversationRef: string | null;
};

export default function DashboardHomePage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [incomesWeek, setIncomesWeek] = useState<Income[] | null>(null);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [leadsBoard, setLeadsBoard] = useState<Lead[] | null>(null);
  const [leadsWeek, setLeadsWeek] = useState<Lead[] | null>(null);
  const [postingStatus, setPostingStatus] = useState<PostingStatus | null>(null);
  // null = todavía no sabemos (sigue cargando) — distinto de "ya revisamos y no hay nada".
  const [unanswered, setUnanswered] = useState<UnansweredConversation[] | null>(null);
  const [unansweredError, setUnansweredError] = useState(false);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [taskPrefill, setTaskPrefill] = useState<TaskPrefill | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await api.get<User>("/auth/me");
        const account = me.accounts[0];
        if (!account) {
          if (!cancelled) setLoadError("No se encontró un negocio asociado a tu cuenta.");
          return;
        }

        const now = new Date();
        const weekStart = toIsoDate(lastNDays(now, 7)[0]);
        const today = toIsoDate(now);

        const [incomes, stats, board, weekLeads, todaysTasks] = await Promise.all([
          api.get<Income[]>(`/accounts/${account.id}/incomes?from=${weekStart}&to=${today}`),
          api.get<LeadStats>(`/accounts/${account.id}/leads/stats`),
          api.get<Lead[]>(`/accounts/${account.id}/leads/board`),
          api.get<LeadsPage>(
            `/accounts/${account.id}/leads?created_from=${weekStart}&created_to=${today}&page_size=100`
          ),
          api.get<Task[]>(`/accounts/${account.id}/tasks?date=${today}`),
        ]);

        if (cancelled) return;
        setAccountId(account.id);
        setFirstName(me.first_name);
        setIncomesWeek(incomes);
        setLeadStats(stats);
        setLeadsBoard(board);
        setLeadsWeek(weekLeads.items);
        setTasks(todaysTasks);

        // "Atención hoy" depende de la Graph API de Meta — no bloqueamos el resto de la
        // pantalla si esto falla o no hay conexión activa. `unanswered-conversations` en
        // particular puede tardar hasta 60s (timeout propio en el backend), por eso va
        // separado del resto y con su propio estado de carga/error.
        api
          .get<PostingStatus>(`/dashboard/${account.id}/posting-status`)
          .then((result) => {
            if (!cancelled) setPostingStatus(result);
          })
          .catch(() => {
            if (!cancelled) setPostingStatus(null);
          });

        api
          .get<UnansweredConversation[]>(`/dashboard/${account.id}/unanswered-conversations`)
          .then((result) => {
            if (!cancelled) {
              setUnanswered(result);
              setUnansweredError(false);
            }
          })
          .catch(() => {
            if (!cancelled) {
              setUnanswered([]);
              setUnansweredError(true);
            }
          });
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "No se pudo cargar el inicio");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }

  function handleIncomeCreated(income: Income) {
    setIncomesWeek((prev) => (prev ? [income, ...prev] : [income]));
    setShowIncomeModal(false);
    showToast(`Ingreso registrado: ${formatMoney(Number(income.amount))}`);
  }

  function handleTaskCreated(task: Task) {
    setTasks((prev) => (prev ? [task, ...prev] : [task]));
    setTaskPrefill(null);
    showToast("Tarea agregada");
  }

  function handleCreatePostingTask() {
    if (!postingStatus) return;
    setTaskPrefill({
      title: "Publicar contenido hoy",
      notes:
        postingStatus.days_since_last_post === null
          ? "Todavía no publicaste contenido en tu Instagram conectado."
          : `Llevás ${postingStatus.days_since_last_post} ${
              postingStatus.days_since_last_post === 1 ? "día" : "días"
            } sin publicar`,
      priority: "alta",
      suggestionType: "posting_reminder",
      conversationRef: null,
    });
  }

  function handleCreateConversationTask(conversation: UnansweredConversation) {
    setTaskPrefill({
      title: `Responder a ${conversation.contact_name}`,
      notes: `Lleva ${hoursLabel(conversation.hours_since_last_message)} sin seguimiento`,
      priority: "alta",
      suggestionType: "unanswered_conversation",
      conversationRef: conversation.conversation_id,
    });
  }

  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  if (!accountId || !incomesWeek || !leadStats || !leadsBoard || !leadsWeek || !tasks) {
    return <p className="text-sm text-secondary">Cargando…</p>;
  }

  const now = new Date();
  const today = toIsoDate(now);
  const todayIncome = sumByDate(incomesWeek, today);
  const focusLeads = selectFocusLeads(leadsBoard, now, 3);

  const doneTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - doneTasks;
  const tasksPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const hasPostingTaskToday = tasks.some((t) => t.suggestion_type === "posting_reminder");
  const respondedConversationRefs = new Set(
    tasks
      .filter((t) => t.suggestion_type === "unanswered_conversation" && t.conversation_ref)
      .map((t) => t.conversation_ref as string)
  );

  const weeklyRows: WeeklyRow[] = lastNDays(now, 7).map((date, index) => {
    const iso = toIsoDate(date);
    const leadsCount = leadsWeek.filter((lead) => lead.created_at.slice(0, 10) === iso).length;
    return {
      date,
      iso,
      isToday: iso === today,
      income: sumByDate(incomesWeek, iso),
      reach: HARDCODED_WEEKLY_REACH[index] ?? 0,
      leads: leadsCount,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">
            {greeting(now)}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Hoy es {weekdayLong(now)} · Foco del día:{" "}
            <span className="font-semibold text-accent">Leads</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowIncomeModal(true)}
          className="rounded-lg bg-accent px-4 py-2.25 text-sm font-semibold text-on-accent"
        >
          Registrar ingreso
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Ingresos hoy
          </div>
          <div className="mt-2 text-2xl font-black text-success">{formatMoney(todayIncome)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Alcance
          </div>
          <div className="mt-2 text-2xl font-black text-primary">
            {HARDCODED_REACH_TODAY.toLocaleString("es-AR")}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Leads activos
          </div>
          <div className="mt-2 text-2xl font-black text-primary">{leadStats.active_count}</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Tareas de hoy
          </div>
          <div className="mt-2 text-2xl font-black text-primary">{pendingTasks}</div>
          <div className="text-xs text-secondary">
            {totalTasks === 0 ? "sin tareas todavía" : `pendientes de ${totalTasks}`}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent" style={{ width: `${tasksPct}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <AttentionSection
          postingStatus={postingStatus}
          unanswered={unanswered}
          unansweredError={unansweredError}
          hasPostingTaskToday={hasPostingTaskToday}
          respondedConversationRefs={respondedConversationRefs}
          onCreatePostingTask={handleCreatePostingTask}
          onCreateConversationTask={handleCreateConversationTask}
        />
        <FocusLeads leads={focusLeads} now={now} />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-semibold text-primary">Esta semana</h2>
        <WeeklyChart rows={weeklyRows} />
      </section>

      {showIncomeModal && (
        <IncomeModal
          accountId={accountId}
          onClose={() => setShowIncomeModal(false)}
          onCreated={handleIncomeCreated}
        />
      )}

      {taskPrefill && (
        <TaskModal
          accountId={accountId}
          initialTitle={taskPrefill.title}
          initialNotes={taskPrefill.notes}
          initialPriority={taskPrefill.priority}
          suggestionType={taskPrefill.suggestionType}
          conversationRef={taskPrefill.conversationRef}
          onClose={() => setTaskPrefill(null)}
          onCreated={handleTaskCreated}
        />
      )}

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-60 -translate-x-1/2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
