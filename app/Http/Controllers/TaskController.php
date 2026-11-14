<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskOrderingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(private readonly TaskOrderingService $orderingService) {}

    public function index(Request $request): Response
    {
        $projectId = $request->integer('project_id');
        return Inertia::render('dashboard', [
            'projects' => Project::query()->withCount('tasks')->latest()->get(),
            'tasks' => Task::query()
                ->with('project:id,name')
                ->when($projectId, fn($query) => $query->where('project_id', $projectId))
                ->orderBy('priority')
                ->orderBy('id')
                ->get(),
            'selectedProjectId' => $projectId ?: null,
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $project = Project::findOrFail($data['project_id']);
        $this->orderingService->create($project, $data);
        return redirect()->route('dashboard', ['project_id' => $project->id])->with('success', 'Task created successfully.');
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $updatedTask = $this->orderingService->update($task, $request->validated());
        return redirect()->route('dashboard', ['project_id' => $updatedTask->project_id])->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $projectId = $task->project_id;
        $this->orderingService->delete($task);
        return redirect()->route('dashboard', ['project_id' => $projectId])->with('success', 'Task deleted successfully.');
    }
}
