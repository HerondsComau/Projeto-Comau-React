import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2, Wrench, Cpu } from "lucide-react";
import { iniciarControleLegado } from "./legado/controle";
import { useProjetoActions } from "./hooks/useProjetos";
import { checkConnection } from "./lib/supabase";

const htmlLegado = String.raw`
  <!-- Splash corporativa: removida pelo initCorporateSplash em app.js apos exibir 1x por aba -->
  <div id="splash-overlay" class="splash-overlay">
    <div class="splash-card">
      <div class="splash-logo">
        <img src="/assets/logo_comau_azul.png" alt="Comau" />
      </div>
      <div class="splash-title">Central de Controle</div>
      <div class="splash-sub">Project Governance Suite</div>
      <div class="splash-status" id="splash-status">Inicializando…</div>
      <div class="splash-bar"><div id="splash-bar-fill"></div></div>
      <div class="splash-hint">Clique para pular</div>
    </div>
  </div>

  <div id="app-shell" class="app-shell">
    <!-- Header unico: botao back SPA, branding, seletor de projeto e atalho para Home -->
    <header class="top-header">
      <div class="brand">
        <button id="app-back" class="btn btn-icon ghost app-back" type="button" aria-label="Voltar" title="Voltar">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <img src="/assets/logo_comau_azul.png" alt="Comau" class="brand-logo" />
        <div class="brand-info">
          <strong id="app-title" class="brand-title">Central de Controle</strong>
          <span id="app-subtitle" class="brand-sub">HTML/JS Preview - Comau</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-icon ghost" id="btn-abrir-setup" type="button" title="Criar Novo Projeto">
             <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"></path></svg>
        </button>

        <div class="custom-dropdown" id="project-dropdown-wrapper">
            <button class="btn btn-ghost dropdown-trigger" id="project-trigger" aria-haspopup="true" aria-expanded="false">
                <span id="project-trigger-label">Selecione um Projeto</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6; margin-left:4px;">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            <div class="dropdown-menu" id="project-menu-list">
                </div>
        </div>

        <button class="btn btn-icon ghost" id="btn-app-reload" title="Recarregar Sistema">
             <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
        <a class="btn btn-icon" id="app-home" title="Inicio" href="#home" data-route="home">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>
        </a>
      </div>
    </header>

    <!-- Container do router SPA (ViewRouter em app.js alterna as .view) -->
    <div id="view-container" class="view-container">
      <!-- VIEW: Home (hub de entrada, botoes de navegacao e KPIs) -->
      <section id="view-home" class="view view-active" data-view="home">
        <main class="app-content">
          <section class="page-header">
            <h1>Central de Controle</h1>
            <div class="center" style="gap:8px;flex-wrap:wrap">
              <span class="badge">Visao geral dos projetos</span>
              <button class="btn ghost" id="btn-clear-dados" type="button">Limpar todos os dados</button>
            </div>
          </section>
          <section class="hub-grid" id="hub-grid-react">
            <div id="home-cards-react"></div>
          </section>
          <section class="card mt-4">
            <div class="grid grid-3" id="hub-stats">
              <div class="kpi">
                <div class="kpi-title">Projetos</div>
                <div class="kpi-value" id="hub-kpi-projetos">0</div>
                <small class="kpi-sub">ativos</small>
              </div>
              <div class="kpi">
                <div class="kpi-title">Dispositivos</div>
                <div class="kpi-value" id="hub-kpi-dispositivos">0</div>
                <small class="kpi-sub">cadastrados</small>
              </div>
              <div class="kpi">
                <div class="kpi-title">Proximos Marcos</div>
                <div class="kpi-value" id="hub-kpi-marcos">0</div>
                <small class="kpi-sub">nos proximos 30 dias</small>
              </div>
            </div>
          </section>
        </main>
      </section>
      <!-- VIEW: Setup (página dedicada do projeto) -->
      <section id="view-setup" class="view" data-view="setup">
        <main class="page page-shell">
          <section id="cs-page-setup" class="page active" data-page="setup">
              <div id="setup-container-wrapper" class="card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
                     <div>
                        <h2 class="app-title" style="margin:0; font-size:20px;">Dados do Projeto</h2>
                        <small class="muted">Informações gerais e configuração</small>
                     </div>
                     <div style="text-align:center;">
                         <div id="setup-client-logo-preview" style="width:60px; height:60px; background:#f3f4f6; border-radius:50%; margin:0 auto 8px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid #e5e7eb;">
                             <span style="font-size:10px; color:#9ca3af;">Logo</span>
                         </div>
                         <select id="setup-client-select" class="input" style="font-size:11px; padding:4px;">
                             <option value="">Selecione Cliente</option>
                             <option value="fiat">Fiat</option>
                             <option value="jeep">Jeep</option>
                             <option value="ram">Ram</option>
                             <option value="stellantis">Stellantis</option>
                             <option value="comau">Comau</option>
                         </select>
                     </div>
                </div>

                <div class="project-data-grid">
                    <div class="input-group-clean">
                        <label>Centro de Custo</label>
                        <input type="text" id="pd-cc" class="input-clean" placeholder="Ex: 123456">
                    </div>
                    <div class="input-group-clean">
                        <label>Cliente</label>
                        <input type="text" id="pd-cliente" class="input-clean" placeholder="Nome do Cliente">
                    </div>
                    <div class="input-group-clean">
                        <label>Planta</label>
                        <input type="text" id="pd-planta" class="input-clean" placeholder="Local da Planta">
                    </div>
                    <div class="grid grid-2">
                        <div class="input-group-clean">
                            <label>Projeto</label>
                            <input type="text" id="pd-projeto" class="input-clean" placeholder="Nome do Projeto">
                        </div>
                        <div class="input-group-clean">
                            <label>Área</label>
                            <input type="text" id="pd-area" class="input-clean" placeholder="Body Shop / Assembly">
                        </div>
                    </div>
                    <div class="grid grid-2">
                         <div class="input-group-clean">
                            <label>Design Leader</label>
                            <input type="text" id="pd-dl" class="input-clean">
                        </div>
                        <div class="input-group-clean">
                            <label>Technical Leader</label>
                            <input type="text" id="pd-tl" class="input-clean">
                        </div>
                    </div>
                    <div style="text-align:right; margin-top:10px;">
                        <button class="btn btn-primary btn-sm" id="btn-save-project-data">Salvar Dados do Projeto</button>
                    </div>
                </div>
              </div>

              <div class="card mt-4">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <h3 class="app-title" style="font-size:18px; margin:0;">Milestones do Projeto</h3>
                        <small class="muted">Antigas "Classes". Defina as entregas principais (DR1, DR2, etc).</small>
                    </div>
                    <button class="btn btn-primary" id="btn-toggle-milestone-form">+ Novo Milestone</button>
                  </div>

                  <div id="setup-form-container">
                       <h4 style="margin:0 0 12px 0; font-size:14px;">Cadastrar / Editar Milestone</h4>
                       <div class="grid grid-4">
                          <div>
                            <label style="font-size:11px;">Nome (Ex: DR1)</label>
                            <input type="text" id="setup-classe-nome" class="input" style="width:100%" />
                          </div>
                          <div>
                            <label style="font-size:11px;">Cor</label>
                            <input type="color" id="setup-classe-cor" value="#0D9488" style="width:100%; height:32px;" />
                          </div>
                          <div>
                            <label style="font-size:11px;">Percentual (%)</label>
                            <input type="number" min="0" max="100" id="setup-classe-percent" class="input" style="width:100%" />
                          </div>
                          <div>
                            <label style="font-size:11px;">Data Base</label>
                            <input type="date" id="setup-classe-data" class="input" style="width:100%" />
                          </div>
                       </div>
                       <div class="mt-3" style="display:flex; gap:8px;">
                          <button class="btn btn-primary" id="setup-classe-salvar">Salvar Milestone</button>
                          <button class="btn ghost" id="setup-classe-cancelar">Cancelar</button>
                       </div>
                  </div>

                  <div class="table-wrap mt-3">
                    <table class="table comfy">
                      <thead>
                        <tr>
                          <th style="width:36px;">Cor</th>
                          <th>Milestone</th>
                          <th>Progresso (%)</th>
                          <th>Data Base</th>
                          <th style="text-align:right;">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="setup-classes-table"></tbody>
                    </table>
                  </div>

                  <div class="mt-3" style="display:flex; justify-content:flex-end;">
                     <span class="badge" id="setup-sum-percent">Total Progresso: 0%</span>
                  </div>
              </div>

              <div class="mt-4" style="display:flex; gap:12px; justify-content:flex-end; flex-wrap:wrap;">
                <button id="btn-setup-concluir" class="btn btn-primary">Concluir Setup</button>
                <button id="btn-setup-cancelar" class="btn ghost">Cancelar</button>
              </div>
          </section>
        </main>
      </section>

      <!-- VIEW: Status (painel de projetos mecanicos com abas internas e modais) -->
      <section id="view-status" class="view" data-view="status">
        <div class="mobile-nav-header">
            <button class="mobile-drawer-trigger" onclick="toggleDrawer()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
                <span id="mobile-nav-title" style="font-weight:600; font-size:16px;">Menu</span>
            </button>
        </div>

        <nav class="top-nav nav-shell desktop-only">
            <ul class="menu" tabindex="0">
                <li><a class="nav-link" data-sub-page="setup" href="#">Setup</a></li>
                <li><a class="nav-link" data-sub-page="descricaoevento" href="#">Descrição Evento</a></li>
                <li><a class="nav-link" data-sub-page="dispositivos" href="#">Dispositivos</a></li>
                <li><a class="nav-link" data-sub-page="cronograma" href="#">Cronograma</a></li>
                <li><a class="nav-link active" data-sub-page="dashboard" href="#">Dashboard</a></li>
                <li><a class="nav-link" data-sub-page="kanban" href="#">Kanban</a></li>
                <li><a class="nav-link" data-sub-page="recurso" href="#">Recurso</a></li>
            </ul>
            <span class="inkbar" aria-hidden="true"></span>
        </nav><div id="drawer-overlay" class="drawer-overlay" onclick="toggleDrawer()"></div>
        <aside id="drawer-menu" class="drawer-panel">
            <div class="drawer-header">
                <div class="drawer-title">Navegação</div>
                <button class="drawer-close" onclick="toggleDrawer()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="drawer-content">
                <button class="drawer-item" data-sub-page="setup" onclick="mobileNavigate('setup')">
                    <span class="icon">⚙️</span> Setup
                </button>
                <button class="drawer-item" data-sub-page="descricaoevento" onclick="mobileNavigate('descricaoevento')">
                    <span class="icon">📝</span> Descrição Evento
                </button>
                <button class="drawer-item" data-sub-page="dispositivos" onclick="mobileNavigate('dispositivos')">
                    <span class="icon">🔧</span> Dispositivos
                </button>
                <button class="drawer-item" data-sub-page="cronograma" onclick="mobileNavigate('cronograma')">
                    <span class="icon">📅</span> Cronograma
                </button>
                <button class="drawer-item active" data-sub-page="dashboard" onclick="mobileNavigate('dashboard')">
                    <span class="icon">📊</span> Dashboard
                </button>
                <button class="drawer-item" data-sub-page="kanban" onclick="mobileNavigate('kanban')">
                    <span class="icon">📋</span> Kanban
                </button>
                <button class="drawer-item" data-sub-page="recurso" onclick="mobileNavigate('recurso')">
                    <span class="icon">👥</span> Recurso
                </button>
            </div><div class="drawer-footer">
                <small>Comau System v2.0</small>
            </div>
        </aside>

        <main class="page page-shell">
          <div id="cs-pages" class="cs-pages">
            <section id="cs-page-dashboard" class="page active" data-page="dashboard">
              <div class="card">
                <h2 class="app-title" style="margin:0;">Dashboard - Visao Geral</h2>
              </div>
              <div class="grid grid-4">
                <article class="card kpi">
                  <div class="kpi-title">Dispositivos</div>
                  <div class="kpi-value" id="dash-kpi-total">0</div>
                  <small class="kpi-sub">total</small>
                </article>
                <article class="card kpi">
                  <div class="kpi-title">No Prazo</div>
                  <div class="kpi-value" id="dash-kpi-prazo">0</div>
                  <small class="kpi-sub">andamento ok</small>
                </article>
                <article class="card kpi">
                  <div class="kpi-title">Em Atraso</div>
                  <div class="kpi-value" id="dash-kpi-atraso">0</div>
                  <small class="kpi-sub">precisam de atencao</small>
                </article>
                <article class="card kpi">
                  <div class="kpi-title">Concluidos</div>
                  <div class="kpi-value" id="dash-kpi-concluido">0</div>
                  <small class="kpi-sub">finalizados</small>
                </article>
              </div>
              <div class="grid grid-2">
                <div>
                  <article class="card">
                    <h3 class="app-title" style="font-size:16px;margin-top:0;">Status dos Dispositivos</h3>
                    <canvas id="chart-status" height="200"></canvas>
                  </article>
                  <article class="card">
                    <h3 class="app-title" style="font-size:16px;margin-top:0;">Media por Fase (%)</h3>
                    <canvas id="chart-fases" height="220"></canvas>
                  </article>
                </div>
                <div>
                  <article class="card">
                    <h3 class="app-title" style="font-size:16px;margin-top:0;">Media de Progresso</h3>
                    <div class="meter" style="margin-top:8px;">
                      <div id="dash-meter-bar" class="bar" style="width:0%;"></div>
                      <span id="dash-meter-label">0%</span>
                    </div>
                    <div class="mt-3" style="display:flex;gap:8px;flex-wrap:wrap;">
                      <span class="badge primary" id="dash-kpi-simulacao">Em Simulacao: 0</span>
                      <span class="badge" id="dash-kpi-standby">Standby: 0</span>
                    </div>
                  </article>
                  <article class="card">
                    <h3 class="app-title" style="font-size:16px;margin-top:0;">Proximos Marcos</h3>
                    <div class="table-wrap">
                      <table class="table">
                        <thead><tr><th>Data</th><th>Classe</th><th>Marco</th></tr></thead>
                        <tbody id="dash-milestones-table"></tbody>
                      </table>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <section id="cs-page-setup" class="page" data-page="setup">
              <div class="card">
                <h2 class="app-title" style="font-size:16px;margin:0 0 8px 0;">Setup do Departamento - Mecânica</h2>
                <p class="mt-2" style="margin:0 0 20px 0;color:#64748b;">
                  Configure as informações específicas do departamento de Mecânica para este projeto.
                  Estes dados são necessários para o gerenciamento adequado dos dispositivos e cronogramas.
                </p>
              </div>

              <div class="card">
                <h3 class="app-title" style="font-size:14px;margin:0 0 16px 0;">Informações do Projeto - Mecânica</h3>
                <div class="grid grid-2">
                  <div class="form-group">
                    <label class="label" for="setup-centro-custo">Centro de Custo</label>
                    <input type="text" id="setup-centro-custo" class="input" placeholder="Ex: 123456" />
                  </div>
                  <div class="form-group">
                    <label class="label" for="setup-cliente">Cliente</label>
                    <input type="text" id="setup-cliente" class="input" placeholder="Nome do Cliente" />
                  </div>
                  <div class="form-group">
                    <label class="label" for="setup-planta">Planta</label>
                    <input type="text" id="setup-planta" class="input" placeholder="Local da Planta" />
                  </div>
                  <div class="form-group">
                    <label class="label" for="setup-projeto">Projeto</label>
                    <input type="text" id="setup-projeto" class="input" placeholder="Nome do Projeto" />
                  </div>
                  <div class="form-group">
                    <label class="label" for="setup-area">Área</label>
                    <select id="setup-area" class="input">
                      <option value="">Selecione...</option>
                      <option value="body-shop">Body Shop</option>
                      <option value="assembly">Assembly</option>
                      <option value="paint-shop">Paint Shop</option>
                      <option value="powertrain">Powertrain</option>
                      <option value="general-assembly">General Assembly</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="label" for="setup-design-leader">Design Leader</label>
                    <input type="text" id="setup-design-leader" class="input" placeholder="Nome do Design Leader" />
                  </div>
                  <div class="form-group" style="grid-column: span 2;">
                    <label class="label" for="setup-technical-leader">Technical Leader</label>
                    <input type="text" id="setup-technical-leader" class="input" placeholder="Nome do Technical Leader" />
                  </div>
                </div>

                <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end;">
                  <button class="btn btn-primary" id="btn-salvar-setup-mecanica" type="button">
                    Salvar Configurações
                  </button>
                </div>
              </div>

              <div class="card">
                <h3 class="app-title" style="font-size:14px;margin:0 0 16px 0;">Milestones do Projeto</h3>
                <p style="margin:0 0 16px 0;color:#64748b;font-size:13px;">
                  Defina as entregas principais (DR1, DR2, DR3, etc.) para este projeto.
                </p>
                <div style="margin-bottom:16px;">
                  <button class="btn btn-primary" id="btn-novo-milestone" type="button">+ Novo Milestone</button>
                </div>
                <div class="table-wrap">
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width:80px;">Cor</th>
                        <th>Milestone</th>
                        <th style="width:120px;">Progresso (%)</th>
                        <th style="width:140px;">Data Base</th>
                        <th style="width:100px;">Ações</th>
                      </tr>
                    </thead>
                    <tbody id="setup-milestones-table">
                      <tr>
                        <td colspan="5" style="text-align:center;color:#94a3b8;padding:40px;">
                          Nenhum milestone definido.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="cs-page-descricaoevento" class="page" data-page="descricaoevento">
              <div class="card">
                <h2 class="app-title" style="font-size:16px;margin:0 0 8px 0;">Descricao do Evento - DR01 / DR02 / DR03</h2>
                <p class="mt-2" style="margin:0;">
                  Marque os checks para indicar conclusao das fases de desenho (DR).
                  Ao marcar, o sistema define 100% e registra a data de hoje.
                </p>
                <div class="mt-3" style="display:flex;gap:8px;flex-wrap:wrap;">
                  <span class="badge ok">OK / 100%</span>
                  <span class="badge warn">Parcial</span>
                  <span class="badge err">Atraso</span>
                </div>
              </div>
              <div class="grid" id="desc-evento-lista"></div>
            </section>

            <section id="cs-page-dispositivos" class="page" data-page="dispositivos">
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <h2 class="app-title" style="font-size:16px;margin:0;">Dispositivos - Visualizacao</h2>
                    <button class="btn btn-primary" id="btn-add-dispositivo" type="button">Adicionar Dispositivo</button>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;">
                    <div>
                      <label>Classe</label>
                      <select id="disp-filtro-classe" class="input" style="min-width:160px"></select>
                    </div>
                    <div>
                      <label>Tipo</label>
                      <select id="disp-filtro-tipo" class="input" style="min-width:140px"></select>
                    </div>
                    <div>
                      <label>Nivel</label>
                      <select id="disp-filtro-nivel" class="input" style="min-width:120px"></select>
                    </div>
                    <div>
                      <label>Busca</label>
                      <input type="text" id="disp-filtro-busca" class="input" placeholder="nome, tag, fornecedor, linha..." style="min-width:200px" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="card">
                <div id="dispositivos-grid" class="device-grid"></div>
              </div>
            </section>
            <section id="cs-page-cronograma" class="page" data-page="cronograma">
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                  <h2 class="app-title" style="font-size:18px;margin:0;">Cronograma - Classes e Milestones</h2>
                  <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;">
                    <div>
                      <label>Escala</label>
                      <select id="crono-escala" class="input" style="min-width:140px">
                        <option value="dia">Dia</option>
                        <option value="semana" selected>Semana</option>
                        <option value="mes">Mes</option>
                      </select>
                    </div>
                    <div>
                      <label>De</label>
                      <input type="date" id="crono-start" class="input" />
                    </div>
                    <div>
                      <label>Ate</label>
                      <input type="date" id="crono-end" class="input" />
                    </div>
                    <button class="btn" id="crono-recarregar">Recarregar</button>
                  </div>
                </div>
              </div>
              <div class="card" style="overflow:auto;">
                <div class="gantt">
                  <div class="gantt-head">
                    <div class="left">Classe</div>
                    <div class="right">
                      <div class="scale" id="crono-scale-ticks"></div>
                    </div>
                  </div>
                  <div id="crono-rows"></div>
                </div>
              </div>
            </section>

            <section id="cs-page-kanban" class="page" data-page="kanban">
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                  <h2 class="app-title" style="font-size:16px;margin:0;">Kanban - Status por Dispositivo</h2>
                  <small>Arraste os cards para alterar o status manual.</small>
                </div>
              </div>
              <div class="grid grid-5">
                <div class="kanban-col" data-status="NoPrazo">
                  <div class="kanban-head">No Prazo <span id="kanban-label-prazo">(0)</span></div>
                  <div id="kanban-list-prazo" class="kanban-list"></div>
                </div>
                <div class="kanban-col" data-status="EmAtraso">
                  <div class="kanban-head">Em Atraso <span id="kanban-label-atraso">(0)</span></div>
                  <div id="kanban-list-atraso" class="kanban-list"></div>
                </div>
                <div class="kanban-col" data-status="EmSimulacao">
                  <div class="kanban-head">Em Simulacao <span id="kanban-label-simulacao">(0)</span></div>
                  <div id="kanban-list-simulacao" class="kanban-list"></div>
                </div>
                <div class="kanban-col" data-status="Concluido">
                  <div class="kanban-head">Concluido <span id="kanban-label-concluido">(0)</span></div>
                  <div id="kanban-list-concluido" class="kanban-list"></div>
                </div>
                <div class="kanban-col" data-status="Standby">
                  <div class="kanban-head">Standby <span id="kanban-label-standby">(0)</span></div>
                  <div id="kanban-list-standby" class="kanban-list"></div>
                </div>
              </div>
            </section>

            <section id="cs-page-recurso" class="page" data-page="recurso">
              <div class="grid grid-2">
                <div class="card">
                  <h2 class="app-title" style="font-size:16px;margin:0 0 12px 0;">Parametros de Calculo</h2>
                  <div class="grid grid-2">
                    <div>
                      <label>Horas planejadas (total)</label>
                      <input id="rec-horas-plan" type="number" class="input" value="160" />
                    </div>
                    <div>
                      <label>Horas/dia</label>
                      <input id="rec-horas-dia" type="number" class="input" value="8" />
                    </div>
                    <div>
                      <label>Ineficiencia (0 a 1)</label>
                      <input id="rec-ineficiencia" type="number" step="0.01" class="input" value="0.15" />
                    </div>
                    <div>
                      <label>Data de inicio</label>
                      <input id="rec-data-inicio" type="date" class="input" />
                    </div>
                    <div>
                      <label>Data de termino</label>
                      <input id="rec-data-fim" type="date" class="input" />
                    </div>
                  </div>
                  <div class="mt-3">
                    <span class="badge" id="rec-dias-uteis">Dias uteis no periodo: 0</span>
                  </div>
                  <div class="mt-4" style="display:flex; gap:12px; flex-wrap:wrap;">
                    <button class="btn btn-primary" id="rec-calcular">Calcular</button>
                    <span class="badge" id="rec-status-msg"></span>
                  </div>
                </div>

                <div class="card">
                  <h2 class="app-title" style="font-size:16px;margin:0 0 12px 0;">Resultado</h2>
                  <div class="grid grid-3">
                    <div class="res-box">
                      <div class="res-label">Horas planejadas (ajustadas)</div>
                      <div class="res-value" id="rec-res-horas-ajustadas">0 h</div>
                    </div>
                    <div class="res-box">
                      <div class="res-label">Capacidade / pessoa</div>
                      <div class="res-value" id="rec-res-capacidade">0 h</div>
                    </div>
                    <div class="res-box">
                      <div class="res-label">Pessoas necessarias</div>
                      <div class="res-big" id="rec-res-pessoas">0</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <!-- Modais do modulo de Status (dispositivo, inserir/editar, horas) -->
        <div id="dispositivo-modal-backdrop" class="modal-backdrop"></div>
        <div id="dispositivo-modal" class="modal"></div>

        <div id="frmInserirDispositivo-backdrop" class="modal-backdrop"></div>
        <form id="frmInserirDispositivo" class="modal">
          <div class="modal-head">
            <h3 class="app-title" style="margin:0;">Inserir Dispositivo</h3>
            <div style="display:flex;gap:8px">
              <button type="button" class="btn ghost" id="modal-disp-novo">Novo</button>
              <button type="button" class="btn" id="modal-disp-salvar">Salvar</button>
              <button type="button" class="btn warn" id="modal-disp-excluir">Excluir</button>
              <button type="button" class="btn ghost" id="modal-disp-fechar">Fechar</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="modal-grid-3">
              <div class="modal-col">
  <div style="display:flex; gap:16px; margin-bottom:20px; align-items: flex-end; border-bottom:1px dashed #e2e8f0; padding-bottom:16px;">
      <div style="flex:1; text-align:center;">
          <label style="font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase; margin-bottom:6px; display:block;">Comau</label>
          <img id="modal-img-empresa" src="" style="width:100%; height:80px; object-fit:contain;">
      </div>
      <div style="flex:1; text-align:center;">
          <label style="font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase; margin-bottom:6px; display:block;">Cliente</label>
          <img id="modal-img-cliente" src="" style="width:100%; height:80px; object-fit:contain;">
      </div>
  </div>

  <div>
    <label>Classes (selecione uma ou mais)</label>
    <select id="modal-disp-classes" class="input" multiple size="5" style="min-height:100px;"></select>
  </div>
  
  <div style="margin-top:12px;">
      <label>Imagem do Dispositivo</label>
      <input type="file" id="modal-disp-img" accept="image/*" />
      <div class="img-placeholder" id="imgDispositivo-preview" style="height:140px; display:flex; align-items:center; justify-content:center; margin-top:6px;">Sem imagem</div>
  </div>

  <div style="margin-top:12px; display:flex; gap:10px; align-items:center;">
      <button type="button" class="btn btn-sm" id="modal-disp-horas" style="flex:1;">Definir Horas</button>
      <div class="check-item" style="margin:0;">
        <input type="checkbox" id="modal-disp-standby" />
        <label for="modal-disp-standby" style="font-weight:600; color:#ef4444;">Stand By / Cancelado</label>
      </div>
  </div>

  <div style="margin-top:12px;">
    <label for="modal-disp-data-2d">Data Prevista 2D:</label>
    <input type="date" id="modal-disp-data-2d" class="input" style="width:100%;" />
    <input type="hidden" id="modal-disp-data2d" value="" />
  </div>
</div>

              <div class="modal-col">
                <div>
                  <label for="modal-disp-nome">Nome Dispositivo</label>
                  <input type="text" id="modal-disp-nome" />
                </div>
                <div>
                  <label for="modal-disp-tipo">Tipo</label>
                  <select id="modal-disp-tipo" class="input"></select>
                </div>
                <div>
                  <label for="modal-disp-tiposigla">Tipo Sigla</label>
                  <input type="text" id="modal-disp-tiposigla" class="input" />
                </div>
                <div>
                  <label for="modal-disp-tag">TAG / Numero Cliente</label>
                  <input type="text" id="modal-disp-tag" />
                </div>
                <div>
                  <label for="modal-disp-op">OP / ST</label>
                  <input type="text" id="modal-disp-op" />
                </div>
                <div>
                  <label for="modal-disp-linha">Linha</label>
                  <input type="text" id="modal-disp-linha" />
                </div>
                <div>
                  <label for="modal-disp-quant">Quant.</label>
                  <input type="number" id="modal-disp-quant" value="1" />
                </div>
                <div>
                  <label for="modal-disp-newretooling">NEW/ ReTooling</label>
                  <input type="text" id="modal-disp-newretooling" />
                </div>
                <div>
                  <label for="modal-disp-produto">Produto</label>
                  <input type="text" id="modal-disp-produto" />
                </div>
                <div>
                  <label for="modal-disp-seedtool">SeedTool / Referencia</label>
                  <input type="text" id="modal-disp-seedtool" />
                </div>
                <div>
                  <label for="modal-disp-nivel">Nivel de Prioridade</label>
                  <select id="modal-disp-nivel" class="input"></select>
                </div>
                <div>
                  <label for="modal-disp-fornecedor">Fornecedor</label>
                  <input type="text" id="modal-disp-fornecedor" />
                </div>
                <div class="check-item">
                  <input type="checkbox" id="chkPlanoSequencia" />
                  <label for="chkPlanoSequencia">Plano de Sequencia</label>
                </div>
                <div class="check-item">
                  <input type="checkbox" id="chk2D" />
                  <label for="chk2D">2D</label>
                </div>
                <input type="hidden" id="modal-disp-horas-totais" value="0">
                <input type="hidden" id="modal-disp-horas-2d" value="0">
              </div>

              <div class="modal-col">
                <div class="dr-group">
                  <h4>DR1</h4>
                  <div class="dr-group-cols">
                    <div class="check-item">
                      <input type="checkbox" id="chkERGONOMY" />
                      <label for="chkERGONOMY">ERGONOMY / ERROR PROOFING</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkSELFASSESSMENT" />
                      <label for="chkSELFASSESSMENT">SELF-ASSESSMENT</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkWEDGUNS" />
                      <label for="chkWEDGUNS">WELD GUNS</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkSCANER3D" />
                      <label for="chkSCANER3D">SCANNER 3D</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkRPS" />
                      <label for="chkRPS">METODO / RPS / DATUM</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkSEQUECEASBUILT" />
                      <label for="chkSEQUECEASBUILT">SEQUENCE AS BUILT</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkPRELIMINARYPAYLOAD" />
                      <label for="chkPRELIMINARYPAYLOAD">PRELIMINARY PAYLOAD</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkPRODUCT3D" />
                      <label for="chkPRODUCT3D">PRODUCT 3D</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkCHECKLISTDR1" />
                      <label for="chkCHECKLISTDR1">CHECK LIST</label>
                    </div>
                  </div>
                </div>
                <div class="dr-group">
                  <h4>DR2</h4>
                  <div class="dr-group-cols">
                    <div class="check-item">
                      <input type="checkbox" id="chkREMARKSFROMDR1" />
                      <label for="chkREMARKSFROMDR1">REMARKS FROM DR1</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkVALVEBLOCK" />
                      <label for="chkVALVEBLOCK">VALVE BLOCK</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkADVANCEDBILLOFMATERIAIS" />
                      <label for="chkADVANCEDBILLOFMATERIAIS">ADVANCED BILL</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkCHECKLISTDR2" />
                      <label for="chkCHECKLISTDR2">CHECK LIST</label>
                    </div>
                  </div>
                </div>
                <div class="dr-group">
                  <h4>DR3</h4>
                  <div class="dr-group-cols">
                    <div class="check-item">
                      <input type="checkbox" id="chkREMARKSFROMDR2" />
                      <label for="chkREMARKSFROMDR2">REMARKS FROM DR2</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkFINALPAYLOAD" />
                      <label for="chkFINALPAYLOAD">FINAL PAYLOAD</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkFEA" />
                      <label for="chkFEA">FEA</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkFILEFORCONSTRUCTIONQUOTE" />
                      <label for="chkFILEFORCONSTRUCTIONQUOTE">FILE FOR QUOTE</label>
                    </div>
                    <div class="check-item">
                      <input type="checkbox" id="chkCHECKLISTDR3" />
                      <label for="chkCHECKLISTDR3">CHECK LIST</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div id="horas-modal-backdrop" class="modal-backdrop"></div>
        <div id="horas-modal" class="modal small">
          <div class="modal-head">
            <h3>Horas</h3>
            <div style="display:flex;gap:8px">
              <button type="button" class="btn" id="modal-horas-salvar">Salvar</button>
              <button type="button" class="btn ghost" id="modal-horas-fechar">Fechar</button>
            </div>
          </div>
          <div class="modal-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label>Horas Totais</label>
                <input id="modal-horas-totais" type="number" class="input" value="0">
              </div>
              <div>
                <label>Horas 2D</label>
                <input id="modal-horas-2d" type="number" class="input" value="0">
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- VIEW: Simulacao (kanban de liberacao + modal de detalhe) -->
      <section id="view-simulacao" class="view" data-view="simulacao">
        <main class="page page-shell" id="sim-root">
          <section class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <div>
                <h2 class="app-title" style="margin:0;font-size:18px;">Kanban de Liberacao</h2>
                <p class="mt-2" style="margin:6px 0 0 0;">
                  Arraste os cards entre as colunas para marcar como <strong>Para liberar</strong> ou <strong>Liberado</strong>.
                  Clique em um card para ver detalhes.
                </p>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <span class="badge primary">Somente itens em Simulacao/Concluido aparecem aqui</span>
              </div>
            </div>
          </section>

          <section class="grid grid-2">
            <div class="kanban-col" data-status="para-liberar">
              <div class="kanban-head">
                Para liberar <span id="sim-label-liberar">(0)</span>
              </div>
              <div id="sim-list-liberar" class="kanban-list"></div>
            </div>

            <div class="kanban-col" data-status="liberado">
              <div class="kanban-head">
                Liberado <span id="sim-label-liberado">(0)</span>
              </div>
              <div id="sim-list-liberado" class="kanban-list"></div>
            </div>
          </section>

          <section class="card mt-4">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <div>
                <h2 class="app-title" style="margin:0;font-size:16px;">Robos (rapido)</h2>
                <small class="muted">Entrada simples para registrar/lembrar nomes (toast).</small>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;">
                <div>
                  <label for="sim-robo-nome">Nome do robo</label>
                  <input id="sim-robo-nome" class="input" type="text" placeholder="Ex.: RB-01 / Station 20" style="min-width:260px;" />
                </div>
                <button class="btn btn-primary" id="sim-add-robo" type="button">Adicionar</button>
              </div>
            </div>
          </section>
        </main>

        <div id="sim-detail-backdrop" class="modal-backdrop"></div>
        <div id="sim-detail" class="modal">
          <div class="modal-head">
            <h3 class="app-title" style="margin:0;">Detalhe do Dispositivo</h3>
            <div style="display:flex;gap:8px">
              <button type="button" class="btn ghost" id="sim-detail-close">Fechar</button>
            </div>
          </div>
          <div class="modal-body" id="sim-detail-body"></div>
        </div>
      </section>
    </div>

    <div class="toast-container" id="toast-container"></div>
  </div>

  <!-- Scripts globais: bridge.js prepara store, app.js cuida de estado/rotas/render -->
  <div id="sr-live"></div>

`;


function CartoesIOSHome({ onAbrirSetup }) {
  const [expandingCard, setExpandingCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const cardsRef = useRef({});

  const cartoes = useMemo(() => {
    return [
      {
        id: "mecanica",
        categoria: "DEPARTAMENTO",
        titulo: "Mecânica",
        resumo: "Cronograma, dispositivos e recursos.",
        gradient: "linear-gradient(135deg, #374151 0%, #6b7280 100%)",
        icone: Wrench,
        viewId: "view-status"
      },
      {
        id: "simulacao",
        categoria: "DEPARTAMENTO",
        titulo: "Simulação",
        resumo: "Análises e liberações de simulação.",
        gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        icone: Cpu,
        viewId: "view-simulacao"
      }
    ];
  }, []);

  // Monitora navegação de volta para home
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#home" || hash === "") {
        // Se tem um card expandido e voltou para home, colapsar
        if (expandingCard && !isCollapsing) {
          handleCollapseBack();
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [expandingCard, isCollapsing]);

  const handleCollapseBack = () => {
    if (!expandingCard) return;

    // Esconde o header antes de colapsar
    const header = document.querySelector('.top-header');
    if (header) {
      header.style.transition = 'opacity 0.3s ease';
      header.style.opacity = '0';
      header.style.pointerEvents = 'none';
    }

    setIsCollapsing(true);
    setIsAnimating(false);

    // Aguarda a animação de colapso terminar
    setTimeout(() => {
      setIsCollapsing(false);
      setExpandingCard(null);

      // Mostra o header novamente
      if (header) {
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
      }
    }, 500);
  };

  const handleCardClick = (card) => {
    // Verifica se há pelo menos um projeto criado antes de permitir acesso aos cards
    const state = window.PS?.store?.getState?.();
    const projetos = state?.projetos || [];
    const temProjeto = projetos.length > 0 && projetos.some(p => p.Ativo !== false);

    if (!temProjeto) {
      alert("Você precisa criar um projeto antes de acessar os departamentos.\n\nClique no botão '+' no cabeçalho para criar seu primeiro projeto.");
      onAbrirSetup?.();
      return;
    }

    const element = cardsRef.current[card.id];
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setExpandingCard({ ...card, rect });

    // Esconde o header durante a expansão
    const header = document.querySelector('.top-header');
    if (header) {
      header.style.transition = 'opacity 0.4s ease';
      header.style.opacity = '0';
      header.style.pointerEvents = 'none';
    }

    setTimeout(() => {
      setIsAnimating(true);
    }, 10);

    // Para setup, só abre o modal após a animação
    if (card.id === "setup") {
      setTimeout(() => {
        onAbrirSetup?.();
        setTimeout(() => {
          setIsAnimating(false);
          setExpandingCard(null);
          if (header) {
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto';
          }
        }, 100);
      }, 600);
      return;
    }

    // Para outras views, navega após card expandir
    setTimeout(() => {
      if (card.id === "simulacao") {
        window.location.hash = "#simulacao";
      } else if (card.id === "mecanica") {
        window.location.hash = "#status";
        window.__statusIntentTab = "dashboard";
      }

      // Mostra o header após a view aparecer
      setTimeout(() => {
        if (header) {
          header.style.opacity = '1';
          header.style.pointerEvents = 'auto';
        }
      }, 300);
    }, 500);
  };

  // Verifica se há projeto para decidir se os cards devem estar bloqueados
  const state = window.PS?.store?.getState?.();
  const projetos = state?.projetos || [];
  const temProjeto = projetos.length > 0 && projetos.some(p => p.Ativo !== false);

  return (
    <>
      <div className="ios-home">
        <div className="ios-lista">
          {cartoes.map((c) => (
            <div
              key={c.id}
              className="ios-card-wrap"
              ref={(el) => (cardsRef.current[c.id] = el)}
            >
              <motion.div
                className="ios-card"
                style={{
                  background: c.gradient,
                  opacity: expandingCard?.id === c.id ? 0 : (temProjeto ? 1 : 0.5),
                  filter: temProjeto ? "none" : "grayscale(0.4)",
                  cursor: temProjeto ? "pointer" : "not-allowed"
                }}
                whileHover={temProjeto ? { scale: 1.02 } : {}}
                whileTap={temProjeto ? { scale: 0.985 } : {}}
                onClick={() => handleCardClick(c)}
              >
                <div className="ios-card-inner">
                  <div className="ios-bg-icon">
                    <c.icone size={44} />
                  </div>
                  <div className="ios-icon">
                    <c.icone size={44} />
                  </div>
                  <div>
                    <div className="ios-kicker">{c.categoria}</div>
                    <div className="ios-title">{c.titulo}</div>
                    <div className="ios-summary">{c.resumo}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expandingCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isCollapsing ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="ios-expanding-backdrop"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 997
              }}
            />

            <div
              className="ios-expanding-card"
              style={{
                position: 'fixed',
                top: (isAnimating && !isCollapsing) ? 0 : expandingCard.rect.top,
                left: (isAnimating && !isCollapsing) ? 0 : expandingCard.rect.left,
                width: (isAnimating && !isCollapsing) ? '100%' : expandingCard.rect.width,
                height: (isAnimating && !isCollapsing) ? '100%' : expandingCard.rect.height,
                background: expandingCard.gradient,
                borderRadius: (isAnimating && !isCollapsing) ? '0px' : '28px',
                transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                zIndex: isAnimating ? 998 : 101,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                padding: '32px',
                paddingBottom: '48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                color: 'white',
                opacity: (isAnimating && !isCollapsing) ? 0 : (isCollapsing ? 0 : 1),
                transition: 'opacity 0.4s ease',
                transitionDelay: (isAnimating && !isCollapsing) ? '0.3s' : '0s'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                  marginBottom: '12px'
                }}>
                  {expandingCard.categoria}
                </div>
                <div style={{
                  fontSize: (isAnimating && !isCollapsing) ? '56px' : '36px',
                  fontWeight: 900,
                  transition: 'font-size 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em'
                }}>
                  {expandingCard.titulo}
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  opacity: 0.9,
                  maxWidth: '600px'
                }}>
                  {expandingCard.resumo}
                </div>

                {/* Ícone decorativo */}
                <div style={{
                  position: 'absolute',
                  top: '32px',
                  right: '32px',
                  opacity: 0.15
                }}>
                  <expandingCard.icone size={(isAnimating && !isCollapsing) ? 96 : 48} style={{
                    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
                  }} />
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ModalSetupProjeto({ aberto, onFechar }) {
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [logoSelecionado, setLogoSelecionado] = useState("comau");
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const { criar: criarSupabase, loading } = useProjetoActions();

  useEffect(() => {
    if (aberto) {
      // Captura a posição do botão "+"
      const btn = document.getElementById("btn-abrir-setup");
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setButtonRect(rect);
        // Pequeno delay para a animação começar
        setTimeout(() => setIsAnimating(true), 10);
      }
    } else {
      setNome("");
      setCliente("");
      setLogoSelecionado("comau");
      setIsAnimating(false);
      setButtonRect(null);
    }
  }, [aberto]);

  if (!aberto) return null;

  const logosDisponiveis = [
    { id: "comau", nome: "Comau", path: "/assets/logo_comau_azul.png" },
    { id: "fiat", nome: "FIAT", path: "/assets/FIAT_logo.png" },
    { id: "jeep", nome: "Jeep", path: "/assets/Jeep.svg.png" },
    { id: "stellantis", nome: "Stellantis", path: "/assets/Stellantis-Logo.png" },
    { id: "volkswagen", nome: "Volkswagen", path: "/assets/Volkswagen-logo.png" }
  ];

  const criar = async () => {
    const n = (nome || "").trim();
    const c = (cliente || "").trim();

    if (!n || !c) {
      alert("Por favor, preencha o nome do projeto e o cliente.");
      return;
    }

    // 🆕 PRIORIDADE 1: Tentar criar no Supabase
    try {
      const resultado = await criarSupabase({
        nome: n,
        cliente: c,
        logo_id: logoSelecionado
      });

      if (resultado.success) {
        console.log('✅ Projeto criado no Supabase:', resultado.data);

        // Também salva no localStorage para compatibilidade com código legado
        try {
          const ok =
            window.PS?.actions?.createProject?.(n) ??
            window.createProject?.(n) ??
            window.PS?.store?.createProject?.(n);

          if (ok) {
            const state = window.PS?.store?.getState?.();
            if (state) {
              const currentProj = (state.projetos || []).find(p => p.Id === state.projetoIdAtual);
              if (currentProj) {
                currentProj.Cliente = c;
                currentProj.LogoId = logoSelecionado;
                currentProj.SupabaseId = resultado.data.id; // Link com Supabase
                window.PS?.store?.setState?.(state);
              }
            }
          }
        } catch (e) {
          console.warn('Aviso ao sincronizar com localStorage:', e);
        }

        alert('✅ Projeto criado com sucesso!');
        onFechar?.();
        return;
      }
    } catch (error) {
      console.error('Erro ao criar projeto no Supabase:', error);
    }

    // FALLBACK: Se Supabase falhar, usa localStorage
    console.warn('⚠️ Usando localStorage como fallback');
    const ok =
      window.PS?.actions?.createProject?.(n) ??
      window.createProject?.(n) ??
      window.PS?.store?.createProject?.(n);

    if (!ok && !window.PS?.actions?.createProject && !window.createProject && !window.PS?.store?.createProject) {
      alert("Erro: Não foi possível criar o projeto.");
      return;
    }

    try {
      const state = window.PS?.store?.getState?.();
      if (state) {
        const currentProj = (state.projetos || []).find(p => p.Id === state.projetoIdAtual);
        if (currentProj) {
          currentProj.Cliente = c;
          currentProj.LogoId = logoSelecionado;
          window.PS?.store?.setState?.(state);
        }
      }
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }

    alert('⚠️ Projeto criado localmente (offline)');
    onFechar?.();
  };

  const modalStyle = buttonRect && !isAnimating ? {
    position: 'fixed',
    top: buttonRect.top + buttonRect.height / 2,
    left: buttonRect.left + buttonRect.width / 2,
    width: '40px',
    height: '40px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    opacity: 0
  } : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '520px',
    maxWidth: '90vw',
    borderRadius: '24px',
    opacity: 1
  };

  return (
    <div className="ios-modal-wrap" style={{ zIndex: 120 }}>
      <motion.div
        className="ios-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onFechar}
        style={{ zIndex: 120 }}
      />
      <div
        className="ios-modal"
        style={{
          ...modalStyle,
          zIndex: 121,
          height: "auto",
          maxHeight: "86vh",
          transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
          background: 'white',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div
          className="ios-modal-hero"
          style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", height: 200 }}
        >
          <div className="ios-kicker">NOVO PROJETO</div>
          <div className="ios-title">Setup Inicial</div>
          <div className="ios-summary">Configure as informações básicas do projeto</div>
          <button className="ios-close" onClick={onFechar}><X size={18} /></button>
        </div>

        <div className="ios-body" style={{ height: "auto", padding: "28px 32px" }}>
          <label style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px", marginBottom: "8px", display: "block" }}>
            Nome do Projeto
          </label>
          <input
            className="ios-field"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Projeto Body Shop 2026"
            style={{ marginBottom: "20px" }}
          />

          <label style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px", marginBottom: "8px", display: "block" }}>
            Cliente
          </label>
          <input
            className="ios-field"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ex.: FIAT Betim"
            style={{ marginBottom: "20px" }}
          />

          <label style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px", marginBottom: "12px", display: "block" }}>
            Logo do Cliente
          </label>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: "12px",
            marginBottom: "24px"
          }}>
            {logosDisponiveis.map((logo) => (
              <div
                key={logo.id}
                onClick={() => setLogoSelecionado(logo.id)}
                style={{
                  cursor: "pointer",
                  padding: "12px",
                  borderRadius: "12px",
                  border: logoSelecionado === logo.id ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  background: logoSelecionado === logo.id ? "#eff6ff" : "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <img
                  src={logo.path}
                  alt={logo.nome}
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "contain"
                  }}
                />
                <span style={{
                  fontSize: "11px",
                  fontWeight: logoSelecionado === logo.id ? 600 : 500,
                  color: logoSelecionado === logo.id ? "#3b82f6" : "#64748b",
                  textAlign: "center"
                }}>
                  {logo.nome}
                </span>
              </div>
            ))}
          </div>

          <button
            className="ios-btn"
            onClick={criar}
            disabled={loading}
            style={{
              width: "100%",
              background: loading
                ? "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)"
                : "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Criando..." : "Criar Projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function garantirAlvoCards() {
  let alvo = document.getElementById("home-cards-react");
  if (alvo) {
    alvo.classList.add("hub-react-wrap");
    return alvo;
  }

  const viewHome = document.getElementById("view-home");
  const hubGrid = document.getElementById("hub-grid-react");
  const hubGridInside = document.querySelector("#view-home .hub-grid");
  const host = viewHome || hubGrid || hubGridInside;

  if (!host) {
    console.warn("[HOME] host para cards não encontrado; usando body (fallback)");
    alvo = document.createElement("div");
    alvo.id = "home-cards-react";
    alvo.className = "hub-react-wrap";
    document.body.appendChild(alvo);
    return alvo;
  }

  alvo = document.createElement("div");
  alvo.id = "home-cards-react";
  alvo.className = "hub-react-wrap";
  host.appendChild(alvo);
  return alvo;
}

export default function Aplicacao() {
  const [alvo, setAlvo] = useState(null);
  const [setupAberto, setSetupAberto] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const errorLogsRef = useRef([]);
  const [htmlInserido, setHtmlInserido] = useState(false);

  window.__dumpHomeDebug = function () {
    const target = document.getElementById("home-cards-react");
    const home = document.getElementById("view-home");
    const hub = document.getElementById("hub-grid-react");
    const views = [...document.querySelectorAll(".view")];

    const infoEl = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        id: el.id,
        className: el.className,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        position: cs.position,
        zIndex: cs.zIndex,
        width: r.width,
        height: r.height,
        top: r.top,
        left: r.left,
      };
    };

    console.log("=== HOME DEBUG ===");
    console.log("hash:", window.location.hash);
    console.log("target exists?", !!target);
    console.log("home exists?", !!home);
    console.log("hub exists?", !!hub);
    console.table(views.map(v => ({ id: v.id, active: v.classList.contains("view-active"), className: v.className })));
    console.log("home:", infoEl(home));
    console.log("hub:", infoEl(hub));
    console.log("target:", infoEl(target));
    console.log("target children:", target ? target.children.length : null);
    console.log("target innerHTML length:", target ? (target.innerHTML || "").length : null);
  };

  useEffect(() => {
    // Aguarda o HTML legado ser inserido antes de procurar o alvo
    if (!htmlInserido) {
      console.info("[BOOT] Aguardando HTML legado ser inserido...");
      return;
    }

    let disposed = false;
    let cleanupBtn = () => {};

    // Garante que o alvo seja setado IMEDIATAMENTE (sem requestAnimationFrame)
    if (!window.location.hash) window.location.hash = "#home";
    console.info("[BOOT] hash=", window.location.hash);
    console.info("[HOME] view-home exists?", !!document.getElementById("view-home"));
    console.info("[HOME] hub-grid-react exists?", !!document.getElementById("hub-grid-react"));
    console.info("[HOME] home-cards-react exists?", !!document.getElementById("home-cards-react"));

    const target = garantirAlvoCards();
    console.info("[BOOT] alvo home-cards-react encontrado?", !!target);

    // Garante que view-home esteja visível ANTES de tudo
    const homeEl = document.getElementById("view-home");
    if (homeEl) {
      homeEl.classList.add("view-active");
      ["view-exit-left", "view-exit-right", "view-enter-left"].forEach((cls) => homeEl.classList.remove(cls));
      console.info("[BOOT] view-home.view-active setado");
    }

    // Seta o alvo IMEDIATAMENTE para o portal funcionar
    if (!disposed && target) {
      setAlvo(target);
    }

    const btn = document.getElementById("btn-abrir-setup") || document.getElementById("btn-novo-projeto");
    const onClick = (e) => { e.preventDefault(); setSetupAberto(true); };
    btn?.addEventListener("click", onClick);
    cleanupBtn = () => btn?.removeEventListener("click", onClick);

    // Aguarda o próximo frame para iniciar o controle legado
    // Isso dá tempo para o React renderizar o portal
    requestAnimationFrame(() => {
      if (disposed) return;

      // Verifica se os cards foram renderizados
      setTimeout(() => {
        const cardsContainer = document.getElementById("home-cards-react");
        console.info("[BOOT] home-cards-react children após render:", cardsContainer?.childElementCount);
        console.info("[BOOT] Cards renderizados?", !!document.querySelector(".ios-home"));
      }, 100);

      console.info("[BOOT] iniciarControleLegado disparado");
      iniciarControleLegado();

      // fallback extra para garantir remoção da splash mesmo se algo falhar
      setTimeout(() => window.removerSplashOverlayAgora?.(), 600);

      const isDebug = String(window.location.href || "").includes("debug=1");
      if (isDebug) {
                const capture = () => {
          const viewsAtivas = [...document.querySelectorAll(".view.view-active")].map((v) => v.id);
          const homeEl2 = document.getElementById("view-home");
          const cardsEl = document.getElementById("home-cards-react");
          const summarizeRect = (el) => el ? (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })() : null;
          const cs = cardsEl ? getComputedStyle(cardsEl) : null;
          const cardCount = document.querySelectorAll(".hub-card, .ios-card, .ios-card-wrap, .hub-motion-card").length;
          setDebugInfo({
            hash: window.location.hash,
            viewsAtivas,
            hasHome: !!homeEl2,
            hasCards: !!cardsEl,
            cardsChildren: cardsEl?.childElementCount ?? 0,
            rectHome: summarizeRect(homeEl2),
            rectCards: summarizeRect(cardsEl),
            cardsDisplay: cs?.display,
            cardsOpacity: cs?.opacity,
            cardsVisibility: cs?.visibility,
            cardsCount: cardCount,
            errors: errorLogsRef.current
          });
        };
        capture();
        const t = setInterval(capture, 600);
        cleanupBtn = ((prevCleanup) => () => { clearInterval(t); prevCleanup(); })(cleanupBtn);
      }
    });

    return () => {
      disposed = true;
      cleanupBtn();
    };
  }, [htmlInserido]);

  useEffect(() => {
    if (!alvo) return;
    alvo.dataset.portal = "mounted";
    const isDebug = String(window.location.href || "").includes("debug=1");
    const logRect = () => {
      const r = alvo.getBoundingClientRect();
      console.info("[PORTAL] children=", alvo.childElementCount, "rect=", r);
    };
    const ensurePlaceholder = () => {
      if (!isDebug) return;
      if (alvo.childElementCount === 0 && !alvo.querySelector(".debug-placeholder")) {
        const ph = document.createElement("div");
        ph.className = "debug-placeholder";
        ph.textContent = "PORTAL SEM FILHOS";
        ph.style.cssText = "padding:12px;background:#fee2e2;color:#991b1b;border:1px dashed #ef4444;border-radius:8px;margin:8px 0;font-weight:600;";
        alvo.appendChild(ph);
      }
    };
    const t1 = setTimeout(logRect, 250);
    const t2 = setTimeout(ensurePlaceholder, 260);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [alvo]);

  useEffect(() => {
    const onErr = (e) => { const msg = e?.message || String(e?.error || e); errorLogsRef.current = [...errorLogsRef.current.slice(-4), msg]; setErrorLogs(errorLogsRef.current); };
    const onRej = (e) => { const msg = e?.reason?.message || String(e?.reason || e); errorLogsRef.current = [...errorLogsRef.current.slice(-4), msg]; setErrorLogs(errorLogsRef.current); };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);


  return (
    <div className="raiz-legado">
      <div ref={(el) => {
        if (el && !htmlInserido) {
          el.innerHTML = htmlLegado;
          setHtmlInserido(true);
        }
      }} />
      {alvo && createPortal(
        <>
          <CartoesIOSHome onAbrirSetup={() => setSetupAberto(true)} />
          <ModalSetupProjeto aberto={setupAberto} onFechar={() => setSetupAberto(false)} />
        </>,
        alvo
      )}
      {debugInfo ? (
        <pre style={{
          position: "fixed",
          right: 12,
          bottom: 12,
          background: "rgba(0,0,0,0.75)",
          color: "#e0f2fe",
          padding: "12px 14px",
          margin: 0,
          fontSize: "12px",
          lineHeight: "1.4",
          borderRadius: "8px",
          zIndex: 9999,
          maxWidth: "320px",
          pointerEvents: "none",
          backdropFilter: "blur(2px)"
        }}>
          {`hash: ${debugInfo.hash}\nviews: ${debugInfo.viewsAtivas.join(", ") || "(nenhuma)"}\nhas #view-home: ${debugInfo.hasHome}\nhas #hub-grid-react: ${document.getElementById("hub-grid-react") ? "true" : "false"}\nhas #home-cards-react: ${debugInfo.hasCards}\n#home-cards-react children: ${debugInfo.cardsChildren}\n#home-cards-react display/opacity/visibility: ${debugInfo.cardsDisplay}/${debugInfo.cardsOpacity}/${debugInfo.cardsVisibility}\ncard nodes (.hub-card/.ios-card/.hub-motion-card): ${debugInfo.cardsCount}\nrect home: ${JSON.stringify(debugInfo.rectHome)}\nrect cards: ${JSON.stringify(debugInfo.rectCards)}\nerrors: ${(debugInfo.errors || []).join(" | ") || "(nenhum)"}`}
        </pre>
      ) : null}
    </div>
  );
}









