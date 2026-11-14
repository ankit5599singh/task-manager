import { Head, router, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ArrowDownUp,
    ChevronDown,
    ClipboardList,
    FolderKanban,
    GripVertical,
    ListTodo,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { dashboard } from "@/routes";
import {
    store as storeProject,
    destroy as destroyProject,
} from "@/routes/projects";
import {
    store as storeTask,
    update as updateTask,
    destroy as destroyTask,
} from "@/routes/tasks";
import { reorder as reorderTasks } from "@/routes/projects/tasks";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Project = {
    id: number;
    name: string;
    description: string | null;
    tasks_count: number;
};

type Task = {
    id: number;
    project_id: number;
    name: string;
    priority: number;
    created_at: string;
    project?: {
        id: number;
        name: string;
    };
};

type Props = {
    projects: Project[];
    tasks: Task[];
    selectedProjectId: number | null;
};

const inputClass =
    "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

const primaryButton =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted";

function SortableTask({
    task,
    disabled,
    onEdit,
    onDelete,
}: {
    task: Task;
    disabled: boolean;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm ${
                isDragging ? "z-10 opacity-60 shadow-xl" : ""
            }`}
        >
            <button
                type="button"
                aria-label="Drag to reorder task"
                disabled={disabled}
                {...attributes}
                {...listeners}
                className="cursor-grab text-muted-foreground transition hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
            >
                <GripVertical size={19} />
            </button>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListTodo size={19} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{task.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Priority #{task.priority}</span>
                    {!task.project && (
                        <span className="rounded-full bg-muted px-2 py-0.5">
                            Task
                        </span>
                    )}
                    {task.project && <span>{task.project.name}</span>}
                </div>
            </div>

            <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
                #{task.priority}
            </span>

            <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button
                    type="button"
                    onClick={() => onEdit(task)}
                    aria-label="Edit task"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <Pencil size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(task)}
                    aria-label="Delete task"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default function Dashboard({
    projects,
    tasks,
    selectedProjectId,
}: Props) {
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [search, setSearch] = useState("");
    const taskForm = useForm({
        project_id: selectedProjectId ?? projects[0]?.id ?? 0,
        name: "",
    });

    const projectForm = useForm({
        name: "",
        description: "",
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const selectedProject = projects.find(
        (project) => project.id === selectedProjectId,
    );

    const filteredTasks = tasks.filter((task) =>
        task.name.toLowerCase().includes(search.toLowerCase()),
    );

    const canReorder = selectedProjectId !== null && search.trim().length === 0;

    function selectProject(value: string) {
        router.get(
            dashboard.url(),
            { project_id: value === "all" ? undefined : Number(value) },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function openCreateTask() {
        setEditingTask(null);
        taskForm.reset();
        taskForm.clearErrors();
        taskForm.setData({
            project_id: selectedProjectId ?? projects[0]?.id ?? 0,
            name: "",
        });
        setTaskDialogOpen(true);
    }

    function openEditTask(task: Task) {
        setEditingTask(task);
        taskForm.clearErrors();
        taskForm.setData({
            project_id: task.project_id,
            name: task.name,
        });
        setTaskDialogOpen(true);
    }

    function submitTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editingTask) {
            taskForm.put(updateTask.url({ task: editingTask.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    setTaskDialogOpen(false);
                    taskForm.reset();
                },
            });
            return;
        }

        taskForm.post(storeTask.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setTaskDialogOpen(false);
                taskForm.reset();
            },
        });
    }

    function submitProject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        projectForm.post(storeProject.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setProjectDialogOpen(false);
                projectForm.reset();
            },
        });
    }

    function deleteTask(task: Task) {
        if (!window.confirm(`Delete "${task.name}"?`)) return;

        router.delete(destroyTask.url({ task: task.id }), {
            preserveScroll: true,
        });
    }

    function deleteProject() {
        if (!selectedProject) return;

        const confirmed = window.confirm(
            `Delete "${selectedProject.name}" and all its tasks?`,
        );

        if (!confirmed) return;

        router.delete(destroyProject.url({ project: selectedProject.id }));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id || !selectedProjectId) {
            return;
        }

        const oldIndex = tasks.findIndex(
            (task) => task.id === Number(active.id),
        );

        const newIndex = tasks.findIndex((task) => task.id === Number(over.id));

        if (oldIndex === -1 || newIndex === -1) return;

        const orderedTasks = arrayMove(tasks, oldIndex, newIndex);
        const projectId = selectedProjectId;

        router.put(
            reorderTasks.url({ project: projectId }),
            {
                task_ids: orderedTasks.map((task) => task.id),
            },
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title="Task Dashboard" />

            <div className="min-h-screen bg-muted/30">
                <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                <span className="size-2 rounded-full bg-primary" />
                                Workspace
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                My tasks<span className="text-primary">.</span>
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Organize your work and make progress every day.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateTask}
                            disabled={projects.length === 0}
                            className={primaryButton}
                        >
                            <Plus size={18} />
                            Create task
                        </button>
                    </header>

                    {/* Statistics */}
                    <section className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            icon={<ClipboardList size={20} />}
                            label="Total tasks"
                            value={tasks.length}
                            description="Tasks in this view"
                        />
                        <StatCard
                            icon={<FolderKanban size={20} />}
                            label="Projects"
                            value={projects.length}
                            description="Your workspaces"
                        />
                        <StatCard
                            icon={<ArrowDownUp size={20} />}
                            label="Current priority"
                            value={tasks.length ? `#1 – #${tasks.length}` : "—"}
                            description="Drag tasks to reorder"
                        />
                    </section>

                    {/* Project toolbar */}
                    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <FolderKanban
                                        size={18}
                                        className="text-primary"
                                    />
                                    Project
                                </div>

                                <div className="relative">
                                    <select
                                        value={selectedProjectId ?? "all"}
                                        onChange={(event) =>
                                            selectProject(event.target.value)
                                        }
                                        className={`${inputClass} min-w-56 appearance-none pr-10`}
                                    >
                                        <option value="all">
                                            All projects
                                        </option>
                                        {projects.map((project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setProjectDialogOpen(true)}
                                    className={secondaryButton}
                                >
                                    <Plus size={16} />
                                    New project
                                </button>

                                {selectedProject && (
                                    <button
                                        type="button"
                                        onClick={deleteProject}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                                    >
                                        <Trash2 size={16} />
                                        Delete project
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Task list */}
                    <section className="space-y-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {selectedProject?.name ?? "All tasks"}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {tasks.length}{" "}
                                    {tasks.length === 1 ? "task" : "tasks"} in
                                    this view
                                </p>
                            </div>

                            <div className="relative w-full sm:max-w-xs">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search tasks..."
                                    className={`${inputClass} pl-10`}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {canReorder && tasks.length > 1 && (
                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <GripVertical size={15} />
                                Drag and drop tasks to change their priority.
                            </p>
                        )}

                        {search && (
                            <p className="text-xs text-muted-foreground">
                                Reordering is disabled while searching.
                            </p>
                        )}

                        {filteredTasks.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={filteredTasks.map((task) => task.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {filteredTasks.map((task) => (
                                            <SortableTask
                                                key={task.id}
                                                task={task}
                                                disabled={!canReorder}
                                                onEdit={openEditTask}
                                                onDelete={deleteTask}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <ListTodo size={25} />
                                </div>
                                <h3 className="text-base font-semibold">
                                    {search
                                        ? "No matching tasks"
                                        : "Nothing on your list yet"}
                                </h3>
                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                    {search
                                        ? "Try another search term."
                                        : "Create your first task and start organizing your work."}
                                </p>
                                {!search && projects.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={openCreateTask}
                                        className={`${primaryButton} mt-5`}
                                    >
                                        <Plus size={17} />
                                        Create your first task
                                    </button>
                                )}
                                {!search && projects.length === 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setProjectDialogOpen(true)
                                        }
                                        className={`${primaryButton} mt-5`}
                                    >
                                        <Plus size={17} />
                                        Create a project
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    <footer className="border-t border-border pt-5 text-center text-xs text-muted-foreground">
                        Taskflow · Stay focused. Get things done.
                    </footer>
                </main>
            </div>

            {/* Create / Edit Task Dialog */}
            <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTask ? "Edit task" : "Create a task"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTask
                                ? "Update the task details below."
                                : "Add a new task to your project."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitTask} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Task name
                            </label>
                            <input
                                autoFocus
                                value={taskForm.data.name}
                                onChange={(event) =>
                                    taskForm.setData("name", event.target.value)
                                }
                                placeholder="e.g. Design homepage"
                                className={inputClass}
                            />
                            {taskForm.errors.name && (
                                <p className="text-xs text-destructive">
                                    {taskForm.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Project
                            </label>
                            <select
                                value={taskForm.data.project_id}
                                onChange={(event) =>
                                    taskForm.setData(
                                        "project_id",
                                        Number(event.target.value),
                                    )
                                }
                                className={inputClass}
                            >
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                            {taskForm.errors.project_id && (
                                <p className="text-xs text-destructive">
                                    {taskForm.errors.project_id}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setTaskDialogOpen(false)}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    taskForm.processing ||
                                    !taskForm.data.name.trim()
                                }
                                className={primaryButton}
                            >
                                {taskForm.processing
                                    ? "Saving..."
                                    : editingTask
                                      ? "Save changes"
                                      : "Create task"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Project Dialog */}
            <Dialog
                open={projectDialogOpen}
                onOpenChange={setProjectDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a project</DialogTitle>
                        <DialogDescription>
                            Create a workspace to organize related tasks.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitProject} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Project name
                            </label>
                            <input
                                autoFocus
                                value={projectForm.data.name}
                                onChange={(event) =>
                                    projectForm.setData(
                                        "name",
                                        event.target.value,
                                    )
                                }
                                placeholder="e.g. Website Development"
                                className={inputClass}
                            />
                            {projectForm.errors.name && (
                                <p className="text-xs text-destructive">
                                    {projectForm.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Description (optional)
                            </label>
                            <textarea
                                value={projectForm.data.description}
                                onChange={(event) =>
                                    projectForm.setData(
                                        "description",
                                        event.target.value,
                                    )
                                }
                                placeholder="What is this project about?"
                                rows={3}
                                className={`${inputClass} h-auto resize-none py-3`}
                            />
                            {projectForm.errors.description && (
                                <p className="text-xs text-destructive">
                                    {projectForm.errors.description}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setProjectDialogOpen(false)}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    projectForm.processing ||
                                    !projectForm.data.name.trim()
                                }
                                className={primaryButton}
                            >
                                {projectForm.processing
                                    ? "Creating..."
                                    : "Create project"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                    {label}
                </span>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
    );
}
