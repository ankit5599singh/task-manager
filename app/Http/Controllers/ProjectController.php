<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;

class ProjectController extends Controller
{
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = Project::create($request->validated());
        return redirect()->route('dashboard', ['project_id' => $project->id])->with('success', 'Project created successfully.');
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update($request->validated());
        return redirect()->route('dashboard', ['project_id' => $project->id])->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();
        return redirect()->route('dashboard')->with('success', 'Project deleted successfully.');
    }
}
