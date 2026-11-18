
        const state = {
            currentUser: null,
            currentView: 'dashboard',
            currentWorkspace: 'workspace-1',
            requests: [
                {
                    id: '#FT-X',
                    title: 'Exportação Relatórios PDF',
                    tag: 'Relatórios',
                    votes: 12,
                    status: 'PENDING',
                    description: 'Exportação de relatórios avançados de desempenho em formato PDF.',
                    upvotes: 12,
                    downvotes: 1,
                    comments: [
                        { author: '@João Santos', time: '10:30', text: 'Concordo, podemos avançar com esta integração no próximo ciclo.' }
                    ]
                },
                {
                    id: '#FT-Y',
                    title: 'Autenticação SSO',
                    tag: 'Segurança',
                    votes: 28,
                    status: 'PENDING',
                    description: 'Permitir login corporativo utilizando credenciais Google e GitHub integradas via protocolo OAuth2/SSO.',
                    upvotes: 28,
                    downvotes: 2,
                    comments: [
                        { author: '@João Santos', time: '10:30', text: 'Concordo, podemos avançar com esta integração no próximo ciclo.' },
                        { author: '@Maria Costa', time: '10:45', text: 'Confirmo, desde que a revisão das permissões seja concluída.' }
                    ]
                }
            ]
        };

        // --- NAVEGAÇÃO DE AUTENTICAÇÃO ---

        function toggleAuthView(view) {
            const loginBox = document.getElementById('view-login');
            const regBox = document.getElementById('view-register');
            const heroLogin = document.getElementById('auth-hero-login');
            const heroReg = document.getElementById('auth-hero-register');

            if (view === 'register') {
                loginBox.classList.add('hidden');
                regBox.classList.remove('hidden');
                heroLogin.classList.add('hidden');
                heroReg.classList.remove('hidden');
            } else {
                regBox.classList.add('hidden');
                loginBox.classList.remove('hidden');
                heroReg.classList.add('hidden');
                heroLogin.classList.remove('hidden');
            }
        }

        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            
            state.currentUser = { email: email, role: 'Product Owner' };
            
            // Atualizar UI do utilizador
            document.getElementById('user-display-email').innerText = email;
            document.getElementById('settings-email-display').innerText = email;
            document.getElementById('user-avatar-initials').innerText = email.substring(0,2).toUpperCase();

            // Alternar para Tela Principal (Dashboard)
            document.getElementById('auth-flow').classList.add('hidden');
            document.getElementById('app-flow').classList.remove('hidden');

            showToast(`Sessão iniciada como ${email}`);
            renderRequestsTables();
            renderVotingCards();
        }

        function handleRegister(e) {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const pass = document.getElementById('reg-pass').value;
            const passConf = document.getElementById('reg-pass-confirm').value;

            if (pass !== passConf) {
                showToast('As palavras-passe não coincidem!', 'error');
                return;
            }

            state.currentUser = { email: email, role: 'Product Owner' };
            
            document.getElementById('user-display-email').innerText = email;
            document.getElementById('settings-email-display').innerText = email;
            document.getElementById('user-avatar-initials').innerText = email.substring(0,2).toUpperCase();

            document.getElementById('auth-flow').classList.add('hidden');
            document.getElementById('app-flow').classList.remove('hidden');

            showToast('Conta registada com sucesso!');
            renderRequestsTables();
            renderVotingCards();
        }

        function handleLogout() {
            openModal('Terminar Sessão', 'Deseja realmente sair da sua conta?', () => {
                state.currentUser = null;
                document.getElementById('app-flow').classList.add('hidden');
                document.getElementById('auth-flow').classList.remove('hidden');
                toggleAuthView('login');
                showToast('Sessão terminada.');
            });
        }

        // --- ROUTING INTERNO DA SPA ---

        function navigateTo(viewId, event) {
            if (event) event.preventDefault();
            
            state.currentView = viewId;

            // Esconder todas as vistas
            document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
            
            // Mostrar vista ativa
            const target = document.getElementById(`page-${viewId}`);
            if (target) target.classList.remove('hidden');

            // Atualizar realce na sidebar
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeNav = document.getElementById(`nav-${viewId}`);
            if (activeNav) {
                activeNav.classList.add('active');
            }

            // Títulos da barra superior
            const titles = {
                'dashboard': ['Dashboard Principal', 'Visão geral unificada do projeto'],
                'requests-list': ['Lista de Pedidos de Funcionalidades', 'Gestão de aprovações e ciclo de vida'],
                'voting': ['Pedidos e Votação', 'Discussão direta com a comunidade'],
                'submit-request': ['Submeter Novo Pedido', 'Criação de novos requisitos para o sistema'],
                'backlog': ['Gestão do Product Backlog', 'Priorização Kanban e tarefas'],
                'sprints': ['Sprint Board & Requisitos', 'Planeamento de iterações e histórias'],
                'roadmap': ['Roadmap Visual & Estatísticas', 'Linha do tempo e entregas'],
                'teams': ['Gestão de Equipas e Papéis SCRUM', 'Workspaces e estrutura da equipa'],
                'settings': ['Configuração de Conta', 'Definições do perfil de utilizador']
            };

            if (titles[viewId]) {
                document.getElementById('page-header-title').innerText = titles[viewId][0];
                document.getElementById('page-header-subtitle').innerText = titles[viewId][1];
            }
        }

        function changeWorkspace(wsValue) {
            state.currentWorkspace = wsValue;
            showToast(`Workspace alterado para ${wsValue}`);
        }

        // --- RENDERIZAÇÃO DE DADOS ---

        function renderRequestsTables(filterTag = 'ALL') {
            const pendingBody = document.getElementById('table-pending-body');
            const approvedBody = document.getElementById('table-approved-body');
            const rejectedBody = document.getElementById('table-rejected-body');

            if (!pendingBody) return;

            pendingBody.innerHTML = '';
            approvedBody.innerHTML = '';
            rejectedBody.innerHTML = '';

            state.requests.forEach((req, index) => {
                if (filterTag !== 'ALL' && req.tag !== filterTag) return;

                const tr = document.createElement('tr');
                tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition';

                if (req.status === 'PENDING') {
                    tr.innerHTML = `
                        <td class="p-2.5"><strong>${req.id}</strong></td>
                        <td class="p-2.5">${req.title}</td>
                        <td class="p-2.5"><span class="tag">${req.tag}</span></td>
                        <td class="p-2.5 font-bold">${req.votes}</td>
                        <td class="p-2.5"><button onclick="updateRequestStatus(${index}, 'APPROVED')" class="btn py-1 px-2 text-[10px]"><i class="fas fa-check"></i></button></td>
                        <td class="p-2.5"><button onclick="updateRequestStatus(${index}, 'REJECTED')" class="btn btn-outline py-1 px-2 text-[10px]"><i class="fas fa-times"></i></button></td>
                        <td class="p-2.5"><button onclick="deleteRequest(${index})" class="btn btn-outline py-1 px-2 text-[10px] text-red-600"><i class="fas fa-trash"></i></button></td>
                    `;
                    pendingBody.appendChild(tr);
                } else if (req.status === 'APPROVED') {
                    tr.innerHTML = `
                        <td class="p-2.5"><strong>${req.id}</strong></td>
                        <td class="p-2.5">${req.title}</td>
                        <td class="p-2.5"><span class="tag">${req.tag}</span></td>
                        <td class="p-2.5 font-bold">${req.votes}</td>
                        <td class="p-2.5"><span class="tag bg-blue-100 text-blue-700">Backlog</span></td>
                        <td class="p-2.5"><button onclick="showToast('Editar pedido')" class="btn btn-outline py-1 px-2 text-[10px]"><i class="fas fa-pencil"></i></button></td>
                        <td class="p-2.5"><button onclick="deleteRequest(${index})" class="btn btn-outline py-1 px-2 text-[10px] text-red-600"><i class="fas fa-trash"></i></button></td>
                    `;
                    approvedBody.appendChild(tr);
                } else if (req.status === 'REJECTED') {
                    tr.innerHTML = `
                        <td class="p-2.5"><strong>${req.id}</strong></td>
                        <td class="p-2.5">${req.title}</td>
                        <td class="p-2.5"><span class="tag">${req.tag}</span></td>
                        <td class="p-2.5 font-bold">${req.votes}</td>
                        <td class="p-2.5"><span class="tag bg-red-100 text-red-700">Rejeitado</span></td>
                        <td class="p-2.5"><button onclick="showToast('Editar pedido')" class="btn btn-outline py-1 px-2 text-[10px]"><i class="fas fa-pencil"></i></button></td>
                        <td class="p-2.5"><button onclick="deleteRequest(${index})" class="btn btn-outline py-1 px-2 text-[10px] text-red-600"><i class="fas fa-trash"></i></button></td>
                    `;
                    rejectedBody.appendChild(tr);
                }
            });
        }

        function filterRequestsTable(val) {
            renderRequestsTables(val);
        }

        function updateRequestStatus(index, newStatus) {
            state.requests[index].status = newStatus;
            showToast(`Estado alterado para ${newStatus}`);
            renderRequestsTables();
        }

        function deleteRequest(index) {
            openModal('Confirmar Remoção', 'Deseja realmente eliminar este pedido?', () => {
                state.requests.splice(index, 1);
                showToast('Pedido removido.');
                renderRequestsTables();
                renderVotingCards();
            });
        }

        function handleCreateRequest(e) {
            e.preventDefault();
            const title = document.getElementById('req-title').value;
            const tag = document.getElementById('req-tag').value;
            const desc = document.getElementById('req-desc').value;

            const newReq = {
                id: `#FT-${Math.floor(100 + Math.random() * 900)}`,
                title: title,
                tag: tag,
                votes: 1,
                status: 'PENDING',
                description: desc,
                upvotes: 1,
                downvotes: 0,
                comments: []
            };

            state.requests.unshift(newReq);
            showToast('Pedido submetido com sucesso!');
            
            document.getElementById('req-title').value = '';
            document.getElementById('req-desc').value = '';
            
            navigateTo('requests-list');
            renderRequestsTables();
            renderVotingCards();
        }

        function renderVotingCards() {
            const container = document.getElementById('voting-cards-container');
            if (!container) return;

            container.innerHTML = '';

            state.requests.forEach((req, reqIdx) => {
                const card = document.createElement('div');
                card.className = 'bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3';
                
                let commentsHtml = req.comments.map(c => `
                    <div class="bg-slate-50 p-2.5 rounded-md text-xs space-y-1">
                        <div class="flex justify-between font-bold text-slate-800">
                            <span>${c.author}</span>
                            <span class="text-[10px] text-slate-400 font-normal">· ${c.time}</span>
                        </div>
                        <p class="text-slate-600">${c.text}</p>
                    </div>
                `).join('');

                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <h2 class="text-xs font-bold text-slate-800">${req.title} (${req.id})</h2>
                        <div class="flex gap-2">
                            <button onclick="vote(${reqIdx}, 'up')" class="btn py-1 px-2.5 text-[10px]"><i class="fa-solid fa-thumbs-up"></i> Quero (${req.upvotes})</button>
                            <button onclick="vote(${reqIdx}, 'down')" class="btn btn-outline py-1 px-2.5 text-[10px]"><i class="fa-solid fa-thumbs-down"></i> Não Quero (${req.downvotes})</button>
                        </div>
                    </div>
                    
                    <p class="text-xs text-slate-700">${req.description}</p>
                    
                    <div class="border border-orange-200 bg-orange-50/60 p-2.5 rounded-md text-xs text-orange-900 font-medium">
                        <strong><i class="fa-solid fa-wand-magic-sparkles"></i> Sugestão da IA:</strong>
                        Alta prioridade recomendada devido ao volume expressivo de solicitações semelhantes.
                    </div>

                    <div class="flex gap-2">
                        <span class="tag"><i class="fa-solid fa-check"></i> ${req.status}</span>
                        <span class="tag bg-blue-50 text-blue-700"><i class="fa-solid fa-shield-halved"></i> ${req.tag}</span>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-slate-100">
                        ${commentsHtml}
                        <div class="flex gap-2 mt-2">
                            <textarea id="comment-input-${reqIdx}" placeholder="Escreva um comentário..." rows="1" class="flex-1 p-2 border border-slate-200 rounded-md text-xs outline-none focus:border-orange-500"></textarea>
                            <button onclick="addComment(${reqIdx})" class="btn px-3"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function vote(reqIdx, type) {
            if (type === 'up') {
                state.requests[reqIdx].upvotes++;
                state.requests[reqIdx].votes++;
            } else {
                state.requests[reqIdx].downvotes++;
            }
            renderVotingCards();
            showToast('Voto registado com sucesso!');
        }

        function addComment(reqIdx) {
            const input = document.getElementById(`comment-input-${reqIdx}`);
            if (!input || !input.value.trim()) return;

            state.requests[reqIdx].comments.push({
                author: state.currentUser ? state.currentUser.email : '@Utilizador',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: input.value
            });

            input.value = '';
            renderVotingCards();
            showToast('Comentário registado!');
        }

        function toggleDetails(id) {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden');
        }

        // --- SISTEMA DE UTILS (MODAL & TOASTS) ---

        function showToast(message) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<i class="fa-solid fa-circle-info text-orange-400"></i> <span>${message}</span>`;
            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        let pendingModalAction = null;

        function openModal(title, bodyText, onConfirm) {
            document.getElementById('modal-title').innerText = title;
            document.getElementById('modal-body').innerText = bodyText;
            pendingModalAction = onConfirm;
            document.getElementById('generic-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('generic-modal').classList.add('hidden');
        }

        document.getElementById('modal-confirm-btn').addEventListener('click', () => {
            if (pendingModalAction) pendingModalAction();
            closeModal();
        });
		
		function toggleReleaseForm() {
			const form = document.getElementById('release-form-container');
			if (form) {
				form.classList.toggle('hidden');
				if (!form.classList.contains('hidden')) {
					form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				}
			}
		}

        // Inicialização
        window.onload = function() {
            renderRequestsTables();
            renderVotingCards();
        };
 
