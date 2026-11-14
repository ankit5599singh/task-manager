<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TaskOrderingService
{
    public function create(Project $project, array $data): Task
    {
        return DB::transaction(function () use ($project, $data) {
            $project = Project::query()->lockForUpdate()->findOrFail($project->id);
            $priority = ((int) $project->tasks()->max('priority')) + 1;
            return $project->tasks()->create(['name' => $data['name'], 'priority' => $priority]);
        });
    }

    public function update(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data) {
            $task = Task::query()->lockForUpdate()->findOrFail($task->id);
            $oldProjectId = $task->project_id;
            $newProjectId = (int) $data['project_id'];
            $task->name = $data['name'];
            if ($oldProjectId !== $newProjectId) {
                $oldProject = Project::query()->lockForUpdate()->findOrFail($oldProjectId);
                $newProject = Project::query()->lockForUpdate()->findOrFail($newProjectId);
                $task->project_id = $newProjectId;
                $task->priority = ((int) $newProject->tasks()->max('priority')) + 1;
                $task->save();
                $this->normalize($oldProject);
            } else {
                $task->save();
            }
            return $task->fresh('project');
        });
    }

    public function delete(Task $task): void
    {
        DB::transaction(function () use ($task) {
            $project = Project::query()->lockForUpdate()->findOrFail($task->project_id);
            $task->delete();
            $this->normalize($project);
        });
    }

    public function reorder(Project $project, array $taskIds): void
    {
        DB::transaction(function () use ($project, $taskIds) {
            $project = Project::query()->lockForUpdate()->findOrFail($project->id);
            $currentIds = $project->tasks()
                ->orderBy('priority')
                ->orderBy('id')
                ->pluck('id')
                ->map(fn($id) => (int) $id)
                ->all();

            $submittedIds = array_map('intval', $taskIds);
            $expected = $currentIds;
            $received = $submittedIds;
            sort($expected);
            sort($received);
            if ($expected !== $received) {
                throw ValidationException::withMessages(['task_ids' => 'The submitted task order does not match this project.']);
            }

            foreach ($submittedIds as $index => $taskId) {
                $project->tasks()->whereKey($taskId)->update(['priority' => $index + 1]);
            }
        });
    }

    private function normalize(Project $project): void
    {
        $tasks = $project->tasks()->orderBy('priority')->orderBy('id')->get(['id']);
        foreach ($tasks as $index => $task) {
            $project->tasks()->whereKey($task->id)->update(['priority' => $index + 1]);
        }
    }
}
