<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderTasksRequest;
use App\Models\Project;
use App\Services\TaskOrderingService;
use Illuminate\Http\RedirectResponse;

class TaskReorderController extends Controller
{
    public function __construct(private readonly TaskOrderingService $orderingService) {}

    public function __invoke(ReorderTasksRequest $request, Project $project): RedirectResponse
    {
        $this->orderingService->reorder($project, $request->validated('task_ids'));
        return redirect()->route('dashboard', ['project_id' => $project->id])->with('success', 'Task order updated successfully.');
    }
}
