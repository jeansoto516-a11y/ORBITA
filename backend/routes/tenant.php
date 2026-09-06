<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\CustoController;
use App\Http\Controllers\EquipeController;
use App\Http\Controllers\OcorrenciaController;
use App\Http\Controllers\OrdemServicoController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    Route::get('/', function () {
        return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
    });
});

Route::middleware([
    'api',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::apiResource('clientes', ClienteController::class);
        Route::apiResource('contratos', ContratoController::class);
        Route::apiResource('equipes', EquipeController::class);
        Route::apiResource('ordens-servico', OrdemServicoController::class);
        Route::get('/ordens-servico/{id}/historico', [OrdemServicoController::class, 'historico']);
        Route::get('/minhas-ordens-servico', [OrdemServicoController::class, 'minhas']);
        Route::patch('/ordens-servico/{id}/status', [OrdemServicoController::class, 'atualizarStatus']);
        Route::get('/alertas-sla', [OrdemServicoController::class, 'alertasSla']);
        Route::apiResource('ocorrencias', OcorrenciaController::class);
        Route::apiResource('custos', CustoController::class);
        Route::get('/custos-resumo', [CustoController::class, 'resumoPorContrato']);
        Route::get('/usuarios', [UserController::class, 'index']);
    });
});