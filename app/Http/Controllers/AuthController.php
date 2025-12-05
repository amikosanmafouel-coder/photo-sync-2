<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Register request received', ['data' => $request->all()]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:client,photographer',
        ]);
        Log::info('Validation passed', ['validated_data' => $validated]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
        ]);
        Log::info('User created', ['user_id' => $user->id, 'email' => $user->email]);

        $token = $user->createToken('auth_token')->plainTextToken;
        Log::info('Token created for user', ['user_id' => $user->id]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        Log::info('Login attempt', ['email' => $request->email]);

        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        Log::info('Login validation passed');

        $user = User::where('email', $request->email)->first();
        Log::info('User lookup result', ['user_found' => !is_null($user), 'user_id' => $user?->id]);

        if (! $user || ! Hash::check($request->password, $user->password)) {
            Log::warning('Invalid login credentials', ['email' => $request->email]);
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }
        Log::info('Password verification successful', ['user_id' => $user->id]);

        $token = $user->createToken('auth_token')->plainTextToken;
        Log::info('Login token created', ['user_id' => $user->id]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        Log::info('Logout request', ['user_id' => $user->id, 'email' => $user->email]);

        $tokenId = $request->user()->currentAccessToken()->id;
        $request->user()->currentAccessToken()->delete();

        Log::info('Token deleted', ['token_id' => $tokenId, 'user_id' => $user->id]);

        return response()->json(['message' => 'Logged out successfully']);
    }
}
