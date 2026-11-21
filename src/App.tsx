
import { useEffect, useState } from "react";
import type { FormEvent, CSSProperties, ChangeEvent } from "react";
import { supabase } from "./lib";
import { LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Command,
  Files,
  Footprints,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Trophy,
  X,
  Bot,
  Trash2,
  Pencil,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,

} from "lucide-react";
import "./index.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: FolderKanban },
  { label: "Smart Planner", icon: CalendarDays },
  { label: "Company", icon: BriefcaseBusiness },
  { label: "GATE Preparation", icon: GraduationCap },
  { label: "Smart Insole", icon: Footprints },
  { label: "Funding & Competitions", icon: Trophy },
  { label: "Activity Intelligence", icon: Activity },
  { label: "Documents", icon: Files },
  { label: "Assistant", icon: Bot },
];

type Workspace = {
  id: string;
  owner_id: string;
  name: string;
  workspace_type: string;
  description: string | null;
  created_at: string;
};

type Project = {
  id: string;
  owner_id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: string | null;
  created_at: string;
};

type Task = {
  id: string;
  owner_id: string;
  workspace_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_at: string | null;
  estimated_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const defaultWorkspaces = [
  { name: "Personal", workspace_type: "personal", description: "Personal tasks and everyday responsibilities" },
  { name: "REFLEXO Company", workspace_type: "company", description: "NEXONIX REFLEXO PRIVATE LIMITED business management" },
  { name: "GATE Preparation", workspace_type: "exam", description: "GATE preparation and study planning" },
  { name: "Smart Insole", workspace_type: "project", description: "Smart Insole engineering and development project" },
  { name: "Funding & Competitions", workspace_type: "funding", description: "Funding applications, grants and competitions" },
];

function getWorkspacePresentation(workspace: Workspace) {
  const type = workspace.workspace_type.toLowerCase();

  if (type === "company") return { icon: BriefcaseBusiness, color: "green", subtitle: workspace.description || "Business management" };
  if (type === "exam") return { icon: GraduationCap, color: "blue", subtitle: workspace.description || "Exam preparation" };
  if (type === "project") return { icon: Footprints, color: "purple", subtitle: workspace.description || "Project workspace" };
  if (type === "funding") return { icon: Trophy, color: "orange", subtitle: workspace.description || "Opportunity management" };
  return { icon: LayoutDashboard, color: "blue", subtitle: workspace.description || "Personal workspace" };
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        if (!data.session) {
          alert("Account created! Please check your email for confirmation.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#090f20",
      color: "white",
      fontFamily: "Arial",
      padding: 20
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%",
        maxWidth: 400,
        padding: 30,
        borderRadius: 16,
        background: "#111b30",
        display: "grid",
        gap: 16
      }}>
        <h1 style={{ textAlign: "center" }}>A.R.J.U.N.A.</h1>
        <p style={{ textAlign: "center" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        {mode === "signup" && (
          <input
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p style={{ color: "#ff7777" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." :
            mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Create a new account"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
function App() {
    // SUPABASE AUTHENTICATION STATES
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // GEMINI AI ASSISTANT
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [plannerDate, setPlannerDate] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectWorkspaceId, setProjectWorkspaceId] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskWorkspaceId, setTaskWorkspaceId] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskEstimatedMinutes, setTaskEstimatedMinutes] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");
  const [creatingWorkspaces, setCreatingWorkspaces] = useState(false);

  // DOCUMENT MANAGEMENT
  type DocumentCategory = "Personal" | "Company" | "GATE" | "Smart Insole" | "Funding & Competitions";
  type StoredDocument = {
    name: string;
    id: string;
    created_at: string;
    metadata?: Record<string, unknown> | null;
  };
  const documentBucket = "arjuna-documents";
  const documentCategories: DocumentCategory[] = [
    "Personal", "Company", "GATE", "Smart Insole", "Funding & Competitions"
  ];
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>("Personal");
  const [documentSearch, setDocumentSearch] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Load the current Supabase session and keep it updated after login/logout.
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Could not load Supabase session:", error.message);
      }

      setSession(data.session);
      setAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load saved workspaces belonging to the signed-in user.
  useEffect(() => {
    if (!session?.user.id) {
      setWorkspaces([]);
      return;
    }

    let isMounted = true;

    async function loadWorkspaces() {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      const { data, error } = await supabase
        .from("workspaces")
        .select("id, owner_id, name, workspace_type, description, created_at")
        .eq("owner_id", session!.user.id)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setWorkspaceError(error.message);
        setWorkspaces([]);
      } else {
        setWorkspaces((data ?? []) as Workspace[]);
      }

      setWorkspaceLoading(false);
    }

    void loadWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  async function createDefaultWorkspaces() {
    if (!session?.user.id) return;

    setCreatingWorkspaces(true);
    setWorkspaceError("");

    const rows = defaultWorkspaces.map((workspace) => ({
      ...workspace,
      owner_id: session.user.id,
    }));

    const { data, error } = await supabase
      .from("workspaces")
      .insert(rows)
      .select("id, owner_id, name, workspace_type, description, created_at");

    if (error) {
      setWorkspaceError(error.message);
    } else {
      setWorkspaces((data ?? []) as Workspace[]);
    }

    setCreatingWorkspaces(false);
  }

  // Load projects belonging to the signed-in user.
  useEffect(() => {
    if (!session?.user.id) {
      setProjects([]);
      return;
    }

    let isMounted = true;

    async function loadProjects() {
      setProjectLoading(true);
      setProjectError("");

      const { data, error } = await supabase
        .from("projects")
        .select("id, owner_id, workspace_id, name, description, status, created_at")
        .eq("owner_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setProjectError(error.message);
        setProjects([]);
      } else {
        setProjects((data ?? []) as Project[]);
      }

      setProjectLoading(false);
    }

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  // Load tasks for the signed-in user from Supabase.
  useEffect(() => {
    if (!session?.user.id) {
      setTasks([]);
      return;
    }

    let isMounted = true;

    async function loadTasks() {
      setTaskLoading(true);
      setTaskError("");

      const { data, error } = await supabase
        .from("tasks")
        .select("id, owner_id, workspace_id, project_id, title, description, status, priority, due_at, estimated_minutes, completed_at, created_at, updated_at")
        .eq("owner_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setTaskError(error.message);
        setTasks([]);
      } else {
        setTasks((data ?? []) as Task[]);
      }

      setTaskLoading(false);
    }

    void loadTasks();

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  function resetProjectForm() {
    setProjectName("");
    setProjectDescription("");
    setProjectWorkspaceId(workspaces[0]?.id ?? "");
    setEditingProjectId(null);
    setProjectFormOpen(false);
  }

  function openNewProjectForm() {
    setProjectName("");
    setProjectDescription("");
    setProjectWorkspaceId(workspaces[0]?.id ?? "");
    setEditingProjectId(null);
    setProjectFormOpen(true);
  }

  function openEditProjectForm(project: Project) {
    setProjectName(project.name);
    setProjectDescription(project.description ?? "");
    setProjectWorkspaceId(project.workspace_id);
    setEditingProjectId(project.id);
    setProjectFormOpen(true);
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user.id) return;
    if (!projectWorkspaceId) {
      setProjectError("Please select a workspace for this project.");
      return;
    }

    setSavingProject(true);
    setProjectError("");

    const payload = {
      owner_id: session.user.id,
      workspace_id: projectWorkspaceId,
      name: projectName.trim(),
      description: projectDescription.trim() || null,
      status: editingProjectId
        ? projects.find((project) => project.id === editingProjectId)?.status ?? "active"
        : "active",
    };

    const result = editingProjectId
      ? await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingProjectId)
          .eq("owner_id", session.user.id)
          .select("id, owner_id, workspace_id, name, description, status, created_at")
          .single()
      : await supabase
          .from("projects")
          .insert(payload)
          .select("id, owner_id, workspace_id, name, description, status, created_at")
          .single();

    if (result.error) {
      setProjectError(result.error.message);
    } else if (result.data) {
      const savedProject = result.data as Project;
      setProjects((current) =>
        editingProjectId
          ? current.map((project) => project.id === editingProjectId ? savedProject : project)
          : [savedProject, ...current]
      );
      resetProjectForm();
    }

    setSavingProject(false);
  }

  async function toggleProjectStatus(project: Project) {
    if (!session?.user.id) return;

    const nextStatus = project.status === "completed" ? "active" : "completed";
    const { data, error } = await supabase
      .from("projects")
      .update({ status: nextStatus })
      .eq("id", project.id)
      .eq("owner_id", session.user.id)
      .select("id, owner_id, workspace_id, name, description, status, created_at")
      .single();

    if (error) {
      setProjectError(error.message);
      return;
    }

    setProjects((current) =>
      current.map((item) => item.id === project.id ? data as Project : item)
    );
  }

  async function deleteProject(projectId: string) {
    if (!session?.user.id) return;

    const confirmed = window.confirm(
      "Delete this project? Tasks linked to it may need to be reassigned."
    );
    if (!confirmed) return;

    // Unlink tasks first so deleting a project does not leave broken task references.
    const { error: unlinkError } = await supabase
      .from("tasks")
      .update({ project_id: null, updated_at: new Date().toISOString() })
      .eq("project_id", projectId)
      .eq("owner_id", session.user.id);

    if (unlinkError) {
      setProjectError(unlinkError.message);
      return;
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("owner_id", session.user.id);

    if (error) {
      setProjectError(error.message);
      return;
    }

    setProjects((current) => current.filter((project) => project.id !== projectId));
    setTasks((current) =>
      current.map((task) =>
        task.project_id === projectId ? { ...task, project_id: null } : task
      )
    );
  }

  function resetTaskForm() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskWorkspaceId(workspaces[0]?.id ?? "");
    setTaskProjectId("");
    setTaskPriority("medium");
    setTaskDueAt("");
    setTaskEstimatedMinutes("");
    setEditingTaskId(null);
    setTaskFormOpen(false);
  }

  function openNewTaskForm() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskWorkspaceId(workspaces[0]?.id ?? "");
    setTaskProjectId("");
    setTaskPriority("medium");
    setTaskDueAt("");
    setTaskEstimatedMinutes("");
    setEditingTaskId(null);
    setTaskFormOpen(true);
  }

  function openEditTaskForm(task: Task) {
    setTaskTitle(task.title);
    setTaskDescription(task.description ?? "");
    setTaskWorkspaceId(task.workspace_id);
    setTaskProjectId(task.project_id ?? "");
    setTaskPriority(task.priority ?? "medium");
    setTaskDueAt(task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : "");
    setTaskEstimatedMinutes(task.estimated_minutes?.toString() ?? "");
    setEditingTaskId(task.id);
    setTaskFormOpen(true);
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user.id) return;
    if (!taskWorkspaceId) {
      setTaskError("Create or select a workspace before adding a task.");
      return;
    }

    setSavingTask(true);
    setTaskError("");

    const taskPayload = {
      owner_id: session.user.id,
      workspace_id: taskWorkspaceId,
      project_id: taskProjectId || null,
      title: taskTitle.trim(),
      description: taskDescription.trim() || null,
      status: "pending",
      priority: taskPriority,
      due_at: taskDueAt ? new Date(taskDueAt).toISOString() : null,
      estimated_minutes: taskEstimatedMinutes ? Number(taskEstimatedMinutes) : null,
      updated_at: new Date().toISOString(),
    };

    const result = editingTaskId
      ? await supabase
          .from("tasks")
          .update({
            ...taskPayload,
            status: tasks.find((task) => task.id === editingTaskId)?.status ?? "pending",
            completed_at: tasks.find((task) => task.id === editingTaskId)?.completed_at ?? null,
          })
          .eq("id", editingTaskId)
          .eq("owner_id", session.user.id)
          .select("id, owner_id, workspace_id, project_id, title, description, status, priority, due_at, estimated_minutes, completed_at, created_at, updated_at")
          .single()
      : await supabase
          .from("tasks")
          .insert(taskPayload)
          .select("id, owner_id, workspace_id, project_id, title, description, status, priority, due_at, estimated_minutes, completed_at, created_at, updated_at")
          .single();

    if (result.error) {
      setTaskError(result.error.message);
    } else if (result.data) {
      const savedTask = result.data as Task;
      setTasks((current) =>
        editingTaskId
          ? current.map((task) => task.id === editingTaskId ? savedTask : task)
          : [savedTask, ...current]
      );
      resetTaskForm();
    }

    setSavingTask(false);
  }

  async function toggleTask(task: Task) {
    if (!session?.user.id) return;

    const isCompleted = task.status === "completed";
    const nextStatus = isCompleted ? "pending" : "completed";
    const completedAt = isCompleted ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .eq("owner_id", session.user.id)
      .select("id, owner_id, workspace_id, project_id, title, description, status, priority, due_at, estimated_minutes, completed_at, created_at, updated_at")
      .single();

    if (error) {
      setTaskError(error.message);
      return;
    }

    setTasks((current) => current.map((item) => item.id === task.id ? data as Task : item));
  }

  async function deleteTask(taskId: string) {
    if (!session?.user.id) return;
    const confirmed = window.confirm("Delete this task permanently?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("owner_id", session.user.id);

    if (error) {
      setTaskError(error.message);
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  async function loadDocuments() {
    if (!session?.user.id) return;
    setDocumentsLoading(true);
    setDocumentsError("");

    const { data, error } = await supabase.storage
      .from(documentBucket)
      .list(session.user.id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      setDocumentsError(error.message);
      setDocuments([]);
    } else {
      setDocuments((data ?? []).filter((item) => item.name && item.id) as StoredDocument[]);
    }
    setDocumentsLoading(false);
  }

  useEffect(() => {
    if (activePage === "Documents" && session?.user.id) {
      void loadDocuments();
    }
  }, [activePage, session?.user.id]);

  async function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session?.user.id) return;

    if (file.size > 20 * 1024 * 1024) {
      setDocumentsError("File is larger than 20 MB. Please choose a smaller file.");
      return;
    }

    setUploadingDocument(true);
    setDocumentsError("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${session.user.id}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(documentBucket)
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
        metadata: { category: documentCategory },
      });

    if (error) {
      setDocumentsError(error.message);
    } else {
      await loadDocuments();
    }
    setUploadingDocument(false);
  }

  async function downloadDocument(document: StoredDocument) {
    if (!session?.user.id) return;
    const storagePath = `${session.user.id}/${document.name}`;
    const { data, error } = await supabase.storage
      .from(documentBucket)
      .download(storagePath);

    if (error) {
      setDocumentsError(error.message);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.name.replace(/^\\d+-/, "");
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteDocument(document: StoredDocument) {
    if (!session?.user.id) return;
    if (!window.confirm(`Delete "${document.name.replace(/^\\d+-/, "")}" permanently?`)) return;

    const storagePath = `${session.user.id}/${document.name}`;
    const { error } = await supabase.storage
      .from(documentBucket)
      .remove([storagePath]);

    if (error) {
      setDocumentsError(error.message);
    } else {
      setDocuments((current) => current.filter((item) => item.id !== document.id));
    }
  }

  function getDocumentCategory(document: StoredDocument): string {
    const metadata = document.metadata as { category?: string } | null | undefined;
    return metadata?.category || "Personal";
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const progress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  function getTaskDateKey(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const currentDateKey = getTaskDateKey(new Date().toISOString());
  const incompleteTasks = tasks.filter((task) => task.status !== "completed");
  const selectedDayTasks = tasks.filter(
    (task) => task.due_at && getTaskDateKey(task.due_at) === plannerDate
  );
  const overdueTasks = incompleteTasks.filter(
    (task) => task.due_at && getTaskDateKey(task.due_at) < currentDateKey
  );
  const upcomingTasks = incompleteTasks.filter(
    (task) => task.due_at && getTaskDateKey(task.due_at) > plannerDate
  );
  const unscheduledTasks = incompleteTasks.filter((task) => !task.due_at);

  function renderPlannerTask(task: Task) {
    const workspaceName = workspaces.find((workspace) => workspace.id === task.workspace_id)?.name ?? "Workspace";
    const projectName = projects.find((project) => project.id === task.project_id)?.name;
    return (
      <div className="task-row" key={task.id}>
        <button
          className="task-check"
          onClick={() => void toggleTask(task)}
          aria-label={`Mark ${task.title} complete`}
        >
          <Circle size={21} />
        </button>
        <div className="task-details">
          <strong>{task.title}</strong>
          <span>
            {workspaceName}{projectName ? ` · ${projectName}` : ""} · {(task.priority ?? "medium").toUpperCase()}
            {task.due_at ? ` · ${new Date(task.due_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : " · No deadline"}
          </span>
        </div>
        <button
          className="icon-button"
          onClick={() => { selectPage("Dashboard"); openEditTaskForm(task); }}
          aria-label={`Edit ${task.title}`}
        >
          <Pencil size={16} />
        </button>
      </div>
    );
  }

  // ADD LOGOUT FUNCTION HERE
  async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert(error.message);
  }
}

  // SEND MESSAGE TO GEMINI THROUGH SUPABASE EDGE FUNCTION
  async function sendAssistantMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = chatInput.trim();
    if (!message || chatLoading) return;

    setChatError("");
    setChatInput("");
    setChatLoading(true);
    setChatMessages((current) => [...current, { role: "user", content: message }]);

    try {
      const { data, error } = await supabase.functions.invoke("arjuna-assistant", {
        body: { message },
      });

      if (error) {
        throw new Error(error.message || "Could not connect to Gemini.");
      }

      if (!data?.answer || typeof data.answer !== "string") {
        throw new Error(data?.error || "Gemini returned an invalid response.");
      }

      setChatMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Gemini Assistant error:", error);
      setChatError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setChatLoading(false);
    }
  }

  function selectPage(label: string) {
    setActivePage(label);
    setSidebarOpen(false);
  }

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#090f20",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading A.R.J.U.N.A...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Command size={23} />
          </div>
          <div>
            <h2>A.R.J.U.N.A.</h2>
            <span>PERSONAL WORK MANAGER</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.label;

            return (
              <button
                key={item.label}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => selectPage(item.label)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => selectPage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <div className="profile-card">
            <div className="avatar">AK</div>
            <div className="profile-info">
              <strong>{session.user.user_metadata?.full_name || session.user.email || "My Account"}</strong>
              <span>Personal workspace</span>
            </div>
            <div className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="search-button">
              <Search size={17} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {activePage === "Assistant" ? (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow">YOUR AI PRODUCTIVITY PARTNER</div>
                <h1>A.R.J.U.N.A. Assistant</h1>
                <p>
                  Your Gemini-powered assistant for planning, learning and productivity.
                </p>
              </div>
              <div className="assistant-symbol">
                <Bot size={25} />
              </div>
            </section>

            <section
              className="panel"
              style={{
                padding: 20,
                minHeight: 450,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div className="panel-heading">
                <div>
                  <h3>Chat with A.R.J.U.N.A.</h3>
                  <p>Powered by Google Gemini</p>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setChatMessages([]);
                    setChatError("");
                  }}
                  disabled={chatLoading}
                >
                  <Trash2 size={15} /> Clear chat
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  minHeight: 260,
                  maxHeight: 480,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 8,
                }}
              >
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: "center", margin: "auto", padding: 20 }}>
                    <Bot size={42} />
                    <h3>Hello! I'm A.R.J.U.N.A.</h3>
                    <p>
                      Ask me about your projects, GATE preparation,
                      productivity or general questions.
                    </p>
                  </div>
                )}

                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      padding: 14,
                      borderRadius: 12,
                      background: message.role === "user" ? "#e8efff" : "#f1f3f7",
                      color: "#1f2937",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: 5 }}>
                      {message.role === "user" ? "You" : "A.R.J.U.N.A."}
                    </strong>
                    {message.content}
                  </div>
                ))}

                {chatLoading && (
                  <div style={{ color: "#667085", padding: 10 }}>
                    <Bot size={17} /> A.R.J.U.N.A. is thinking...
                  </div>
                )}
              </div>

              {chatError && (
                <p role="alert" style={{ color: "#d94848" }}>
                  {chatError}
                </p>
              )}

              <form
                onSubmit={sendAssistantMessage}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  borderTop: "1px solid #e7eaf0",
                  paddingTop: 14,
                }}
              >
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask A.R.J.U.N.A. anything..."
                  maxLength={10000}
                  disabled={chatLoading}
                  required
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button
                  type="submit"
                  className="primary-button"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? "Sending..." : "Send"}
                </button>
              </form>
            </section>

            <footer className="page-footer">
              A.R.J.U.N.A. Work Manager • Gemini AI Assistant
            </footer>
          </div>
        ) : activePage === "Smart Planner" ? (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow">DAILY SCHEDULING</div>
                <h1>Smart Planner</h1>
                <p>Review deadlines, organize your day and keep your priorities moving.</p>
              </div>
              <label style={{ display: "grid", gap: 6 }}>
                <strong>Choose a date</strong>
                <input
                  type="date"
                  value={plannerDate}
                  onChange={(event) => setPlannerDate(event.target.value)}
                />
              </label>
            </section>

            {taskError && <p role="alert" style={{ color: "#d94848" }}>{taskError}</p>}

            <section className="overview-grid">
              <div className="overview-card">
                <div className="card-top"><span>Selected day</span><div className="metric-icon blue"><CalendarDays size={19} /></div></div>
                <h2>{selectedDayTasks.length}</h2><p>Tasks with a deadline on this date</p>
              </div>
              <div className="overview-card">
                <div className="card-top"><span>Overdue</span><div className="metric-icon orange"><Clock3 size={19} /></div></div>
                <h2>{overdueTasks.length}</h2><p>Incomplete tasks past their deadline</p>
              </div>
              <div className="overview-card">
                <div className="card-top"><span>Upcoming</span><div className="metric-icon purple"><ArrowUpRight size={19} /></div></div>
                <h2>{upcomingTasks.length}</h2><p>Incomplete tasks after selected date</p>
              </div>
              <div className="overview-card">
                <div className="card-top"><span>Unscheduled</span><div className="metric-icon green"><Circle size={19} /></div></div>
                <h2>{unscheduledTasks.length}</h2><p>Incomplete tasks without a deadline</p>
              </div>
            </section>

            {taskLoading ? <p>Loading your planner...</p> : (
              <div style={{ display: "grid", gap: 18 }}>
                <section className="panel" style={{ padding: 18 }}>
                  <div className="panel-heading">
                    <div><h3>Daily agenda</h3><p>{new Date(`${plannerDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
                    <button className="secondary-button" onClick={() => { setPlannerDate(currentDateKey); }}>Today</button>
                  </div>
                  {selectedDayTasks.length ? <div className="task-list">{selectedDayTasks.map(renderPlannerTask)}</div> : <p>No tasks have a deadline on this date.</p>}
                </section>

                <section className="panel" style={{ padding: 18 }}>
                  <div className="panel-heading"><div><h3>Overdue tasks</h3><p>Incomplete tasks with past deadlines</p></div></div>
                  {overdueTasks.length ? <div className="task-list">{overdueTasks.map(renderPlannerTask)}</div> : <p>You have no overdue tasks. Great work!</p>}
                </section>

                <section className="panel" style={{ padding: 18 }}>
                  <div className="panel-heading"><div><h3>Upcoming tasks</h3><p>Tasks scheduled after the selected date</p></div></div>
                  {upcomingTasks.length ? <div className="task-list">{upcomingTasks.map(renderPlannerTask)}</div> : <p>No upcoming tasks found.</p>}
                </section>

                <section className="panel" style={{ padding: 18 }}>
                  <div className="panel-heading"><div><h3>Unscheduled tasks</h3><p>Tasks that still need a deadline</p></div><button className="secondary-button" onClick={() => selectPage("Dashboard")}>Manage tasks</button></div>
                  {unscheduledTasks.length ? <div className="task-list">{unscheduledTasks.map(renderPlannerTask)}</div> : <p>All incomplete tasks have a deadline.</p>}
                </section>
              </div>
            )}
            <footer className="page-footer">A.R.J.U.N.A. Work Manager • Smart Planner</footer>
          </div>
        ) : activePage === "Projects" ? (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow">PROJECT MANAGEMENT</div>
                <h1>Your Projects</h1>
                <p>Create and organize projects inside your A.R.J.U.N.A. workspaces.</p>
              </div>
              <button className="primary-button" onClick={openNewProjectForm} disabled={workspaces.length === 0}>
                <Plus size={17} /> New project
              </button>
            </section>

            {projectError && <p role="alert" style={{ color: "#d94848" }}>{projectError}</p>}

            {projectFormOpen && (
              <form
                onSubmit={saveProject}
                className="panel"
                style={{ padding: 18, marginBottom: 18, display: "grid", gap: 12 }}
              >
                <h3>{editingProjectId ? "Edit project" : "Create a project"}</h3>
                <input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Project name"
                  maxLength={180}
                  required
                />
                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="Project description (optional)"
                  rows={3}
                />
                <label style={{ display: "grid", gap: 5 }}>
                  Workspace
                  <select
                    value={projectWorkspaceId}
                    onChange={(event) => setProjectWorkspaceId(event.target.value)}
                    required
                  >
                    <option value="">Select workspace</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="primary-button" type="submit" disabled={savingProject || workspaces.length === 0}>
                    {savingProject ? "Saving..." : editingProjectId ? "Save changes" : "Save project"}
                  </button>
                  <button className="secondary-button" type="button" onClick={resetProjectForm}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {workspaceLoading || projectLoading ? (
              <p>Loading your projects...</p>
            ) : workspaces.length === 0 ? (
              <div className="panel" style={{ padding: 20 }}>
                <h3>No workspaces available</h3>
                <p>Create your default workspaces on the Dashboard before adding projects.</p>
                <button className="secondary-button" onClick={() => selectPage("Dashboard")}>Go to Dashboard</button>
              </div>
            ) : projects.length === 0 ? (
              <div className="panel" style={{ padding: 20 }}>
                <h3>No projects yet</h3>
                <p>Create your first project and assign it to one of your workspaces.</p>
                <button className="primary-button" onClick={openNewProjectForm}>
                  <Plus size={17} /> Create first project
                </button>
              </div>
            ) : (
              <div className="workspace-grid">
                {projects.map((project) => {
                  const workspaceName =
                    workspaces.find((workspace) => workspace.id === project.workspace_id)?.name ?? "Workspace";
                  const linkedTasks = tasks.filter((task) => task.project_id === project.id);
                  const completedLinkedTasks = linkedTasks.filter((task) => task.status === "completed").length;
                  const isCompleted = project.status === "completed";

                  return (
                    <div className="workspace-card" key={project.id}>
                      <div className="workspace-icon purple"><FolderKanban size={21} /></div>
                      <div className="workspace-card-title">
                        <strong>{project.name}</strong>
                        <span className={`status-pill ${isCompleted ? "completed" : ""}`}>
                          {isCompleted ? "Completed" : "Active"}
                        </span>
                      </div>
                      <p>{project.description || "No description added."}</p>
                      <div className="workspace-progress-label">
                        <span>{workspaceName}</span>
                        <strong>{completedLinkedTasks}/{linkedTasks.length} tasks</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill purple"
                          style={{
                            width: `${linkedTasks.length ? (completedLinkedTasks / linkedTasks.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                        <button className="secondary-button" onClick={() => openEditProjectForm(project)}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button className="secondary-button" onClick={() => void toggleProjectStatus(project)}>
                          {isCompleted ? "Reopen" : "Complete"}
                        </button>
                        <button className="icon-button" onClick={() => void deleteProject(project.id)} aria-label={`Delete ${project.name}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <footer className="page-footer">A.R.J.U.N.A. Work Manager • Project Management</footer>
          </div>
        ) : activePage === "Documents" ? (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow">YOUR SECURE FILE LIBRARY</div>
                <h1>Documents</h1>
                <p>Upload and organize important files for your personal work, company and projects.</p>
              </div>
              <label className="primary-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: uploadingDocument ? "wait" : "pointer" }}>
                <Upload size={17} />
                {uploadingDocument ? "Uploading..." : "Upload document"}
                <input
                  type="file"
                  onChange={uploadDocument}
                  disabled={uploadingDocument}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp"
                  style={{ display: "none" }}
                />
              </label>
            </section>

            <section className="panel" style={{ padding: 18, marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <strong>Save under category</strong>
                  <select value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value as DocumentCategory)}>
                    {documentCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <strong>Search documents</strong>
                  <input value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} placeholder="Search by file name..." />
                </label>
              </div>
              <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 0 }}>Maximum file size: 20 MB. Supported: PDF, Word, Excel, PowerPoint, text, CSV and common image formats.</p>
            </section>

            {documentsError && <p role="alert" style={{ color: "#d94848" }}>{documentsError}</p>}

            <section className="panel" style={{ padding: 18 }}>
              <div className="panel-heading">
                <div><h3>Your documents</h3><p>Files stored in your private Supabase account</p></div>
                <button className="secondary-button" onClick={() => void loadDocuments()} disabled={documentsLoading}>
                  {documentsLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {documentsLoading ? (
                <p>Loading your documents...</p>
              ) : documents.filter((doc) => doc.name.toLowerCase().includes(documentSearch.toLowerCase())).length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 12px" }}>
                  <FileText size={34} style={{ margin: "0 auto 10px", opacity: 0.55 }} />
                  <h3>No documents found</h3>
                  <p>Upload your first file using the button above.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {documents
                    .filter((doc) => doc.name.toLowerCase().includes(documentSearch.toLowerCase()))
                    .map((doc) => {
                      const displayName = doc.name.replace(/^\\d+-/, "");
                      const isImage = /\\.(png|jpe?g|webp)$/i.test(displayName);
                      return (
                        <div key={doc.id} className="task-row" style={{ alignItems: "center", gap: 12 }}>
                          <div className="workspace-icon blue">
                            {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                          </div>
                          <div className="task-details" style={{ minWidth: 0, flex: 1 }}>
                            <strong style={{ overflowWrap: "anywhere" }}>{displayName}</strong>
                            <span>{getDocumentCategory(doc)} · {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button className="icon-button" onClick={() => void downloadDocument(doc)} aria-label={`Download ${displayName}`} title="Download">
                              <Download size={16} />
                            </button>
                            <button className="icon-button" onClick={() => void deleteDocument(doc)} aria-label={`Delete ${displayName}`} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
            <footer className="page-footer">A.R.J.U.N.A. Work Manager • Documents</footer>
          </div>
        ) : activePage === "Activity Intelligence" ? (
          <div className="page-content">
            {(() => {
              const total = tasks.length;
              const done = tasks.filter((task) => task.status === "completed").length;
              const pending = total - done;
              const now = new Date();
              const overdue = tasks.filter((task) =>
                task.status !== "completed" && task.due_at && new Date(task.due_at).getTime() < now.getTime()
              ).length;
              const completionRate = total ? Math.round((done / total) * 100) : 0;
              const priorities = ["high", "medium", "low"];
              const priorityColors: Record<string, string> = {
                high: "#ef6b6b", medium: "#e6a23c", low: "#36b58a"
              };
              const workspaceStats = workspaces.map((workspace) => {
                const items = tasks.filter((task) => task.workspace_id === workspace.id);
                const completed = items.filter((task) => task.status === "completed").length;
                return { name: workspace.name, total: items.length, completed,
                  rate: items.length ? Math.round((completed / items.length) * 100) : 0 };
              });
              const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() - (6 - index));
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                const count = tasks.filter((task) => task.completed_at && getTaskDateKey(task.completed_at) === key).length;
                return { label: date.toLocaleDateString("en-IN", { weekday: "short" }), count };
              });
              const maxDaily = Math.max(1, ...lastSevenDays.map((day) => day.count));
              const cardStyle: CSSProperties = {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #e7eaf0",
                borderRadius: 14,
                padding: 18,
                minWidth: 0
              };
              const headingStyle: CSSProperties = {
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 12, flexWrap: "wrap", marginBottom: 14
              };
              return (
                <>
                  <section className="welcome-section">
                    <div>
                      <div className="eyebrow">YOUR PRODUCTIVITY OVERVIEW</div>
                      <h1>Activity Intelligence</h1>
                      <p>Understand your progress across tasks, priorities and workspaces.</p>
                    </div>
                    <button className="secondary-button" onClick={() => selectPage("Smart Planner")}>
                      <CalendarDays size={16} /> Open Smart Planner
                    </button>
                  </section>

                  {taskLoading || workspaceLoading ? <p>Loading your activity data...</p> : null}
                  {taskError && <p role="alert" style={{ color: "#d94848" }}>{taskError}</p>}

                  <section className="overview-grid">
                    <div className="overview-card">
                      <div className="card-top"><span>Total tasks</span><div className="metric-icon blue"><Files size={19} /></div></div>
                      <h2>{total}</h2><p>Tasks saved in your account</p>
                    </div>
                    <div className="overview-card">
                      <div className="card-top"><span>Completed</span><div className="metric-icon green"><CheckCircle2 size={19} /></div></div>
                      <h2>{done}</h2><p>Tasks marked as completed</p>
                    </div>
                    <div className="overview-card">
                      <div className="card-top"><span>Pending</span><div className="metric-icon purple"><Clock3 size={19} /></div></div>
                      <h2>{pending}</h2><p>Tasks still to be completed</p>
                    </div>
                    <div className="overview-card">
                      <div className="card-top"><span>Overdue</span><div className="metric-icon orange"><Activity size={19} /></div></div>
                      <h2>{overdue}</h2><p>Incomplete tasks past their deadline</p>
                    </div>
                  </section>

                  <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginTop: 18 }}>
                    <div style={cardStyle}>
                      <div style={headingStyle}><div><h3>Completion rate</h3><p>Share of all tasks completed</p></div><strong style={{ fontSize: 26 }}>{completionRate}%</strong></div>
                      <div style={{ height: 12, background: "#e9edf3", borderRadius: 20, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${completionRate}%`, background: "#36b58a", borderRadius: 20, transition: "width .25s" }} />
                      </div>
                      <p style={{ marginTop: 10 }}>{done} completed out of {total} total tasks</p>
                    </div>

                    <div style={cardStyle}>
                      <div style={headingStyle}><div><h3>Priority breakdown</h3><p>Tasks grouped by priority</p></div></div>
                      {priorities.map((priority) => {
                        const count = tasks.filter((task) => (task.priority ?? "medium").toLowerCase() === priority).length;
                        const percent = total ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={priority} style={{ marginBottom: 13 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <strong style={{ textTransform: "capitalize" }}>{priority}</strong><span>{count} ({percent}%)</span>
                            </div>
                            <div style={{ height: 9, background: "#e9edf3", borderRadius: 20, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${percent}%`, background: priorityColors[priority], borderRadius: 20 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section style={{ ...cardStyle, marginTop: 18 }}>
                    <div style={headingStyle}><div><h3>7-day completion trend</h3><p>Tasks completed on each of the last seven days</p></div></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10, alignItems: "end", minHeight: 150 }}>
                      {lastSevenDays.map((day) => (
                        <div key={day.label} style={{ display: "grid", gridTemplateRows: "1fr auto auto", gap: 7, textAlign: "center", height: 145, alignItems: "end" }}>
                          <div style={{ height: 105, display: "flex", alignItems: "end", justifyContent: "center", background: "#f0f3f8", borderRadius: 8, overflow: "hidden" }}>
                            <div title={`${day.count} completed`} style={{ width: "65%", height: `${day.count ? Math.max(8, (day.count / maxDaily) * 100) : 0}%`, background: "#6688df", borderRadius: "7px 7px 0 0" }} />
                          </div>
                          <strong>{day.count}</strong><span style={{ fontSize: 12, color: "#778196" }}>{day.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section style={{ ...cardStyle, marginTop: 18 }}>
                    <div style={headingStyle}><div><h3>Workspace performance</h3><p>Completion progress for each workspace</p></div></div>
                    {workspaceStats.length ? workspaceStats.map((item) => (
                      <div key={item.name} style={{ padding: "12px 0", borderTop: "1px solid #edf0f4" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7, flexWrap: "wrap" }}>
                          <strong>{item.name}</strong><span>{item.completed}/{item.total} completed · {item.rate}%</span>
                        </div>
                        <div style={{ height: 9, background: "#e9edf3", borderRadius: 20, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.rate}%`, background: "#6688df", borderRadius: 20 }} />
                        </div>
                      </div>
                    )) : <p>No workspaces found yet.</p>}
                  </section>
                  <footer className="page-footer">A.R.J.U.N.A. Work Manager • Activity Intelligence</footer>
                </>
              );
            })()}
          </div>
        ) : activePage === "Dashboard" ? (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow">YOUR PERSONAL COMMAND CENTER</div>
                <h1>Good morning, Aman <span>✦</span></h1>
                <p>Stay focused. Manage everything. Make every day count.</p>
              </div>
              <div className="today-date">
                <CalendarDays size={17} />
                {today}
              </div>
            </section>

            <section className="overview-grid">
              <div className="overview-card">
                <div className="card-top">
                  <span>Total tasks</span>
                  <div className="metric-icon blue"><CalendarDays size={19} /></div>
                </div>
                <h2>{tasks.length}</h2>
                <p>Tasks currently shown on your dashboard</p>
              </div>

              <div className="overview-card">
                <div className="card-top">
                  <span>Completed</span>
                  <div className="metric-icon green"><CheckCircle2 size={19} /></div>
                </div>
                <h2>{completedTasks}</h2>
                <p>Tasks marked complete</p>
              </div>

              <div className="overview-card">
                <div className="card-top">
                  <span>Remaining</span>
                  <div className="metric-icon orange"><Clock3 size={19} /></div>
                </div>
                <h2>{tasks.length - completedTasks}</h2>
                <p>Tasks still on your list</p>
              </div>

              <div className="overview-card">
                <div className="card-top">
                  <span>Daily progress</span>
                  <div className="metric-icon purple"><ArrowUpRight size={19} /></div>
                </div>
                <h2>{progress}%</h2>
                <div className="mini-progress">
                  <div style={{ width: `${progress}%` }} />
                </div>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel tasks-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Today's priorities</h3>
                    <p>Your task checklist</p>
                  </div>
                  <button className="secondary-button" onClick={openNewTaskForm}>
                    <Plus size={16} /> Add task
                  </button>
                </div>

                {taskFormOpen && (
                  <form
                    onSubmit={saveTask}
                    className="panel"
                    style={{ padding: 16, marginBottom: 16, display: "grid", gap: 12 }}
                  >
                    <h3>{editingTaskId ? "Edit task" : "Create a new task"}</h3>
                    <input
                      value={taskTitle}
                      onChange={(event) => setTaskTitle(event.target.value)}
                      placeholder="Task title"
                      required
                      maxLength={180}
                    />
                    <textarea
                      value={taskDescription}
                      onChange={(event) => setTaskDescription(event.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <select
                      value={taskWorkspaceId}
                      onChange={(event) => setTaskWorkspaceId(event.target.value)}
                      required
                    >
                      <option value="">Select workspace</option>
                      {workspaces.map((workspace) => (
                        <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                      ))}
                    </select>
                    <label style={{ display: "grid", gap: 5 }}>
                      Project (optional)
                      <select
                        value={taskProjectId}
                        onChange={(event) => setTaskProjectId(event.target.value)}
                      >
                        <option value="">No project linked</option>
                        {projects
                          .filter((project) => project.workspace_id === taskWorkspaceId)
                          .map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                          ))}
                      </select>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                      <label style={{ display: "grid", gap: 5 }}>
                        Priority
                        <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value)}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </label>
                      <label style={{ display: "grid", gap: 5 }}>
                        Due date and time
                        <input type="datetime-local" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} />
                      </label>
                      <label style={{ display: "grid", gap: 5 }}>
                        Estimated minutes
                        <input type="number" min="1" max="100000" value={taskEstimatedMinutes} onChange={(event) => setTaskEstimatedMinutes(event.target.value)} placeholder="e.g. 60" />
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="primary-button" type="submit" disabled={savingTask || workspaces.length === 0}>
                        {savingTask ? "Saving..." : editingTaskId ? "Save changes" : "Save task"}
                      </button>
                      <button className="secondary-button" type="button" onClick={resetTaskForm}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {taskError && (
                  <p role="alert" style={{ color: "#d94848" }}>{taskError}</p>
                )}

                {taskLoading ? (
                  <p>Loading your saved tasks...</p>
                ) : tasks.length === 0 ? (
                  <p>No tasks saved yet. Select "Add task" to create your first task.</p>
                ) : (
                  <div className="task-list">
                    {tasks.map((task) => {
                      const workspaceName = workspaces.find((workspace) => workspace.id === task.workspace_id)?.name ?? "Workspace";
                      const isDone = task.status === "completed";
                      const dueLabel = task.due_at
                        ? new Date(task.due_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                        : "No deadline";
                      return (
                        <div className={`task-row ${isDone ? "task-done" : ""}`} key={task.id}>
                          <button
                            className="task-check"
                            onClick={() => void toggleTask(task)}
                            aria-label={`Mark ${task.title} ${isDone ? "incomplete" : "complete"}`}
                          >
                            {isDone ? <CheckCircle2 size={21} /> : <Circle size={21} />}
                          </button>
                          <div className="task-details">
                            <strong>{task.title}</strong>
                            <span>{workspaceName} · {(task.priority ?? "medium").toUpperCase()} · {dueLabel}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button className="icon-button" onClick={() => openEditTaskForm(task)} aria-label={`Edit ${task.title}`}>
                              <Pencil size={16} />
                            </button>
                            <button className="icon-button" onClick={() => void deleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="panel-footer">
                  <span>{completedTasks} of {tasks.length} completed</span>
                  <span>{progress}% done</span>
                </div>
              </div>

              <div className="panel assistant-panel">
                <div className="assistant-symbol"><Bot size={25} /></div>
                <div className="eyebrow">A.R.J.U.N.A. ASSISTANT</div>
                <h3>Ready to get things done?</h3>
                <p>Your workspace assistant will help you organize tasks, plan your day and manage your projects.</p>
                <button
                  className="primary-button"
                  onClick={() => selectPage("Assistant")}
                >
                  Open Assistant <ArrowUpRight size={17} />
                </button>
                <div className="assistant-note">Text and voice features will be added in a later phase.</div>
              </div>
            </section>

            <section className="workspaces-section">
              <div className="section-heading">
                <div>
                  <h3>Your workspaces</h3>
                  <p>All your important responsibilities in one place</p>
                </div>
                <button className="text-button">View all <ArrowUpRight size={15} /></button>
              </div>

              {workspaceLoading ? (
                <p>Loading your saved workspaces...</p>
              ) : workspaceError ? (
                <p role="alert" style={{ color: "#d94848" }}>
                  Could not load workspaces: {workspaceError}
                </p>
              ) : workspaces.length === 0 ? (
                <div className="panel" style={{ padding: 20 }}>
                  <h3>No workspaces found</h3>
                  <p>Your account does not have any saved workspaces yet.</p>
                  <button
                    className="primary-button"
                    onClick={createDefaultWorkspaces}
                    disabled={creatingWorkspaces}
                  >
                    {creatingWorkspaces ? "Creating workspaces..." : "Create my default workspaces"}
                  </button>
                </div>
              ) : (
                <div className="workspace-grid">
                  {workspaces.map((workspace) => {
                    const presentation = getWorkspacePresentation(workspace);
                    const Icon = presentation.icon;
                    return (
                      <button
                        className="workspace-card"
                        key={workspace.id}
                        onClick={() => {
                          const page =
                            workspace.workspace_type === "company" ? "Company" :
                            workspace.workspace_type === "exam" ? "GATE Preparation" :
                            workspace.workspace_type === "project" ? "Smart Insole" :
                            workspace.workspace_type === "funding" ? "Funding & Competitions" :
                            "Dashboard";
                          selectPage(page);
                        }}
                      >
                        <div className={`workspace-icon ${presentation.color}`}>
                          <Icon size={21} />
                        </div>
                        <div className="workspace-card-title">
                          <strong>{workspace.name}</strong>
                          <ArrowUpRight size={16} />
                        </div>
                        <p>{presentation.subtitle}</p>
                        <div className="workspace-progress-label">
                          <span>Saved workspace</span>
                          <strong>Active</strong>
                        </div>
                        <div className="progress-track">
                          <div className={`progress-fill ${presentation.color}`} style={{ width: "100%" }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <footer className="page-footer">
              A.R.J.U.N.A. Work Manager <span>•</span> Initial development version
            </footer>
          </div>
        ) : (
          <div className="placeholder-page">
            <div className="placeholder-icon"><Bot size={30} /></div>
            <div className="eyebrow">A.R.J.U.N.A. WORKSPACE</div>
            <h1>{activePage}</h1>
            <p>This module is planned for the next development phase.</p>
            <button className="primary-button" onClick={() => selectPage("Dashboard")}>
              <LayoutDashboard size={17} /> Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
