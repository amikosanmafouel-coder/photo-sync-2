<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        return User::where('id', '!=', auth()->id())->get();
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'user deleted successfully']);
    }
}
