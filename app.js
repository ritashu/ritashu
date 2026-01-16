
        // 应用状态
        const AppState = {
            currentTab: 'msg-page',
            currentChat: null,
            friends: [],
            groups: [],
            messages: {},
            conversations: [],
            user: {
                name: '薯片机用户',
                avatar: '',
                signature: '这个人很懒，什么都没写~',
                bgImage: ''
            },
            dynamicFuncs: {
    moments: true,        // 朋友圈
    forum: true,          // 论坛
    reading: true,        // 阅读
    calendar: true,       // 日历
    weather: true,        // 天气 - 新增
    shopping: true,       // 购物 - 新增
    game: true,           // 游戏中心
    placeholder1: true,   // 占位1 - 新增
    placeholder2: true,   // 占位2 - 新增
    placeholder3: true    // 占位3 - 新增
},
            importedCards: []
        };

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadFromStorage();
            initEventListeners();
            renderUI();
            updateDynamicFuncList();
        });

        // 从本地存储加载数据
        function loadFromStorage() {
            try {
                const savedState = localStorage.getItem('shupianjAppState');
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    Object.assign(AppState, parsed);
                }
            } catch (e) {
                console.error('加载数据失败:', e);
            }
        }

        // 保存到本地存储
        function saveToStorage() {
            try {
                localStorage.setItem('shupianjAppState', JSON.stringify(AppState));
            } catch (e) {
                console.error('保存数据失败:', e);
            }
        }

        // 初始化事件监听
        function initEventListeners() {
            // 用户信息点击 - 打开侧边栏
            document.getElementById('user-info').addEventListener('click', function() {
                document.getElementById('side-menu').classList.add('open');
                document.getElementById('mask').classList.add('show');
            });

            // 遮罩层点击
            document.getElementById('mask').addEventListener('click', function() {
                closeSideMenu();
                closeAddPopup();
            });

            // 添加按钮
            document.getElementById('add-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                toggleAddPopup();
            });

            // 点击其他地方关闭弹窗
            document.addEventListener('click', function(e) {
                if (!e.target.closest('#add-popup') && !e.target.closest('#add-btn')) {
                    closeAddPopup();
                }
            });

            // 底部标签栏
            document.querySelectorAll('.tab-item').forEach(function(tab) {
                tab.addEventListener('click', function() {
                    switchTab(this.dataset.tab);
                });
            });

            // 好友分组折叠
            document.querySelectorAll('.group-header').forEach(function(header) {
                header.addEventListener('click', function() {
                    const group = this.dataset.group;
                    const list = document.querySelector(`.friend-list[data-group="${group}"]`);
                    this.classList.toggle('collapsed');
                    list.classList.toggle('show');
                });
            });

            // 动态页面功能项
            document.querySelectorAll('.func-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    const pageId = this.dataset.page;
                    if (pageId) {
                        openSubPage(pageId);
                    }
                });
            });

            // 子页面返回按钮
            document.querySelectorAll('.back-btn[data-back]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const pageId = this.dataset.back;
                    closeSubPage(pageId);
                });
            });

            // 侧边栏菜单项
            document.querySelectorAll('.menu-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    const func = this.dataset.func;
                    handleMenuClick(func);
                });
            });

            // 个性名片点击 - 直接跳转编辑页面
            document.getElementById('card-info').addEventListener('click', function() {
                closeSideMenu();
                setTimeout(function() {
                    openCardEditPage();
                }, 300);
            });

            // 添加好友相关
            document.getElementById('add-friend-btn').addEventListener('click', function() {
                closeAddPopup();
                openAddFriendPage();
            });

            document.getElementById('add-friend-back-btn').addEventListener('click', function() {
                closeAddFriendPage();
            });

            document.getElementById('add-friend-cancel').addEventListener('click', function() {
                closeAddFriendPage();
            });

            document.getElementById('add-friend-submit').addEventListener('click', function() {
                submitAddFriend();
            });

            // 创建群聊相关
            document.getElementById('create-group-btn').addEventListener('click', function() {
                closeAddPopup();
                openCreateGroupPage();
            });

            document.getElementById('create-group-back-btn').addEventListener('click', function() {
                closeCreateGroupPage();
            });

            document.getElementById('create-group-cancel').addEventListener('click', function() {
                closeCreateGroupPage();
            });

            document.getElementById('create-group-submit').addEventListener('click', function() {
                submitCreateGroup();
            });

            // 导入角色卡相关
            document.getElementById('import-card-btn').addEventListener('click', function() {
                closeAddPopup();
                openImportCardPage();
            });

            document.getElementById('import-card-back-btn').addEventListener('click', function() {
                closeImportCardPage();
            });

            document.getElementById('import-file-btn').addEventListener('click', function() {
                document.getElementById('import-file-input').click();
            });

            document.getElementById('import-file-input').addEventListener('change', function(e) {
                handleFileImport(e.target.files);
            });

            document.getElementById('import-all-btn').addEventListener('click', function() {
                importAllCards();
            });

            // 聊天页面
            document.getElementById('chat-back-btn').addEventListener('click', function() {
                closeChatPage();
            });

            document.getElementById('chat-send-btn').addEventListener('click', function() {
                sendMessage();
            });

            document.getElementById('chat-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // 自动调整输入框高度
            document.getElementById('chat-input').addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 100) + 'px';
            });

            // 个性名片编辑页面
            document.getElementById('card-edit-back-btn').addEventListener('click', function() {
                closeCardEditPage();
            });

            document.getElementById('edit-avatar-btn').addEventListener('click', function() {
                openImagePicker('avatar');
            });

            document.getElementById('edit-bg-btn').addEventListener('click', function() {
                openImagePicker('bg');
            });

            document.getElementById('edit-name-btn').addEventListener('click', function() {
                editUserName();
            });

            document.getElementById('edit-signature-btn').addEventListener('click', function() {
                editUserSignature();
            });

            // 图片选择弹窗
            document.getElementById('picker-cancel').addEventListener('click', function() {
                closeImagePicker();
            });

            document.getElementById('picker-local').addEventListener('click', function() {
                document.getElementById('picker-file-input').click();
            });

            document.getElementById('picker-file-input').addEventListener('change', function(e) {
                handlePickerFileSelect(e.target.files[0]);
            });

            document.getElementById('picker-url-toggle').addEventListener('click', function() {
                document.getElementById('picker-url-input').classList.toggle('hidden');
                document.getElementById('picker-url-confirm').classList.toggle('hidden');
            });

            document.getElementById('picker-url-confirm').addEventListener('click', function() {
                handlePickerUrlConfirm();
            });

            document.getElementById('image-picker-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeImagePicker();
                }
            });

            // 更多功能设置
            document.getElementById('more-func-btn').addEventListener('click', function() {
                openMoreSettings();
            });

            document.getElementById('more-settings-confirm').addEventListener('click', function() {
                closeMoreSettings();
            });

            document.getElementById('more-settings-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeMoreSettings();
                }
            });

            // 开关切换
            document.querySelectorAll('.toggle-switch').forEach(function(toggle) {
                toggle.addEventListener('click', function() {
                    const funcId = this.dataset.funcId;
                    this.classList.toggle('active');
                    AppState.dynamicFuncs[funcId] = this.classList.contains('active');
                    saveToStorage();
                });
            });
        }

        // 渲染UI
        function renderUI() {
            updateUserDisplay();
            renderConversations();
            renderFriends();
            renderGroups();
        }

        // 更新用户显示
        function updateUserDisplay() {
            const user = AppState.user;
            
            // 顶部导航
            document.querySelector('.user-name').textContent = user.name;
            const avatarDisplay = document.getElementById('user-avatar-display');
            if (user.avatar) {
                avatarDisplay.innerHTML = `<img src="${user.avatar}" alt="">`;
            } else {
                avatarDisplay.textContent = user.name.charAt(0);
            }

            // 侧边栏名片
            document.getElementById('display-name').textContent = user.name;
            document.getElementById('card-signature').textContent = user.signature || '这个人很懒，什么都没写~';
            
            const cardAvatar = document.getElementById('card-avatar');
            if (user.avatar) {
                cardAvatar.innerHTML = `<img src="${user.avatar}" alt="">`;
            } else {
                cardAvatar.textContent = user.name.charAt(0);
            }

            const cardBg = document.getElementById('card-bg');
            if (user.bgImage) {
                cardBg.style.backgroundImage = `url(${user.bgImage})`;
            }

            // 编辑页面
            document.getElementById('card-edit-preview-name').textContent = user.name;
            document.getElementById('card-edit-preview-sig').textContent = user.signature || '这个人很懒，什么都没写~';
            
            const previewAvatar = document.getElementById('card-edit-preview-avatar');
            if (user.avatar) {
                previewAvatar.innerHTML = `<img src="${user.avatar}" alt="">`;
            } else {
                previewAvatar.textContent = user.name.charAt(0);
            }

            const editPreview = document.getElementById('card-edit-preview');
            if (user.bgImage) {
                editPreview.style.backgroundImage = `url(${user.bgImage})`;
            }

            const editAvatarSmall = document.getElementById('edit-avatar-small');
            if (user.avatar) {
                editAvatarSmall.innerHTML = `<img src="${user.avatar}" alt="">`;
            } else {
                editAvatarSmall.style.backgroundColor = '#e8e8e8';
            }

            document.getElementById('edit-name-value').textContent = user.name;
            document.getElementById('edit-signature-value').textContent = user.signature || '这个人很懒，什么都没写~';
            document.getElementById('edit-bg-value').textContent = user.bgImage ? '已设置' : '默认';
        }

        // 渲染会话列表
        function renderConversations() {
            const msgList = document.getElementById('msg-list');
            const emptyState = document.getElementById('msg-empty');
            
            if (AppState.conversations.length === 0) {
                emptyState.style.display = 'flex';
                return;
            }
            
            emptyState.style.display = 'none';
            
            // 清除旧的会话项
            const oldItems = msgList.querySelectorAll('.msg-item');
            oldItems.forEach(item => item.remove());
            
            AppState.conversations.forEach(function(conv) {
                const item = document.createElement('div');
                item.className = 'msg-item';
                item.dataset.id = conv.id;
                item.dataset.type = conv.type;
                
                const avatarContent = conv.avatar 
                    ? `<img src="${conv.avatar}" alt="">` 
                    : conv.name.charAt(0);
                
                item.innerHTML = `
                    <div class="msg-avatar">
                        ${avatarContent}
                        ${conv.unread > 0 ? `<div class="msg-badge">${conv.unread > 99 ? '99+' : conv.unread}</div>` : ''}
                    </div>
                    <div class="msg-content">
                        <div class="msg-header">
                            <div class="msg-title">${conv.name}</div>
                            <div class="msg-time">${conv.time || ''}</div>
                        </div>
                        <div class="msg-desc">${conv.lastMsg || ''}</div>
                    </div>
                `;
                
                item.addEventListener('click', function() {
                    openChat(conv);
                });
                
                msgList.insertBefore(item, emptyState);
            });
        }

        // 渲染好友列表
        function renderFriends() {
            const friendList = document.querySelector('.friend-list[data-group="common"]');
            const count = document.querySelector('.group-header[data-group="common"] .group-count');
            
            count.textContent = `(${AppState.friends.length}/${AppState.friends.length})`;
            
            if (AppState.friends.length === 0) {
                friendList.innerHTML = `
                    <div class="empty-state" style="padding: 30px 20px;">
                        <div class="empty-text">暂无好友</div>
                    </div>
                `;
                return;
            }
            
            friendList.innerHTML = '';
            
            AppState.friends.forEach(function(friend) {
                const item = document.createElement('div');
                item.className = 'friend-item';
                item.dataset.id = friend.id;
                
                const avatarContent = friend.avatar 
                    ? `<img src="${friend.avatar}" alt="">` 
                    : friend.name.charAt(0);
                
                item.innerHTML = `
                    <div class="friend-avatar">${avatarContent}</div>
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                        <div class="friend-status">${friend.status || ''}</div>
                    </div>
                `;
                
                item.addEventListener('click', function() {
                    openChatWithFriend(friend);
                });
                
                friendList.appendChild(item);
            });
        }

        // 渲染群聊列表
        function renderGroups() {
            const groupList = document.querySelector('.friend-list[data-group="groups"]');
            const count = document.querySelector('.group-header[data-group="groups"] .group-count');
            
            count.textContent = `(${AppState.groups.length}/${AppState.groups.length})`;
            
            if (AppState.groups.length === 0) {
                groupList.innerHTML = `
                    <div class="empty-state" style="padding: 30px 20px;">
                        <div class="empty-text">暂无群聊</div>
                    </div>
                `;
                return;
            }
            
            groupList.innerHTML = '';
            
            AppState.groups.forEach(function(group) {
                const item = document.createElement('div');
                item.className = 'friend-item';
                item.dataset.id = group.id;
                
                const avatarContent = group.avatar 
                    ? `<img src="${group.avatar}" alt="">` 
                    : group.name.charAt(0);
                
                item.innerHTML = `
                    <div class="friend-avatar">${avatarContent}</div>
                    <div class="friend-info">
                        <div class="friend-name">${group.name}</div>
                        <div class="friend-status">${group.memberCount || 0}人</div>
                    </div>
                `;
                
                item.addEventListener('click', function() {
                    openChatWithGroup(group);
                });
                
                groupList.appendChild(item);
            });
        }

        // 更新动态功能列表
        function updateDynamicFuncList() {
            document.querySelectorAll('.func-item').forEach(function(item) {
                const funcId = item.dataset.funcId;
                if (funcId && AppState.dynamicFuncs[funcId] === false) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });

            // 更新设置弹窗中的开关状态
            document.querySelectorAll('.toggle-switch').forEach(function(toggle) {
                const funcId = toggle.dataset.funcId;
                if (funcId) {
                    if (AppState.dynamicFuncs[funcId] === false) {
                        toggle.classList.remove('active');
                    } else {
                        toggle.classList.add('active');
                    }
                }
            });
        }

        // 切换标签页
        function switchTab(tabId) {
            // 更新标签栏
            document.querySelectorAll('.tab-item').forEach(function(tab) {
                tab.classList.remove('active');
            });
            document.querySelector(`.tab-item[data-tab="${tabId}"]`).classList.add('active');
            
            // 更新内容区域
            document.querySelectorAll('.main-content').forEach(function(page) {
                page.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // 更新顶部导航栏显示
            const topNav = document.getElementById('top-nav');
            if (tabId === 'dynamic-page') {
                topNav.style.display = 'none';
            } else {
                topNav.style.display = 'flex';
            }
            
            AppState.currentTab = tabId;
        }

        // 关闭侧边栏
        function closeSideMenu() {
            document.getElementById('side-menu').classList.remove('open');
            document.getElementById('mask').classList.remove('show');
        }

        // 切换添加弹窗
        function toggleAddPopup() {
            document.getElementById('add-popup').classList.toggle('show');
        }

        // 关闭添加弹窗
        function closeAddPopup() {
            document.getElementById('add-popup').classList.remove('show');
        }

        // 打开子页面
        function openSubPage(pageId) {
            document.getElementById(pageId).classList.add('open');
        }

        // 关闭子页面
        function closeSubPage(pageId) {
            document.getElementById(pageId).classList.remove('open');
        }

        // 处理侧边栏菜单点击
        function handleMenuClick(func) {
            closeSideMenu();
            
            setTimeout(function() {
                switch(func) {
                    case 'api-settings':
                        openSubPage('api-settings-page');
                        break;
                    case 'chat-summary':
                        openSubPage('chat-summary-page');
                        break;
                    case 'worldbook':
                        openSubPage('worldbook-page');
                        break;
                    default:
                        alert('功能开发中: ' + func);
                }
            }, 300);
        }

        // 添加好友页面
        function openAddFriendPage() {
            document.getElementById('add-friend-page').classList.add('open');
        }

        function closeAddFriendPage() {
            document.getElementById('add-friend-page').classList.remove('open');
            // 清空输入
            document.getElementById('friend-name-input').value = '';
            document.getElementById('friend-avatar-input').value = '';
            document.getElementById('friend-desc-input').value = '';
            document.getElementById('friend-greeting-input').value = '';
        }

        function submitAddFriend() {
            const name = document.getElementById('friend-name-input').value.trim();
            const avatar = document.getElementById('friend-avatar-input').value.trim();
            const desc = document.getElementById('friend-desc-input').value.trim();
            const greeting = document.getElementById('friend-greeting-input').value.trim();
            
            if (!name) {
                alert('请输入AI好友名称');
                return;
            }
            
            const friend = {
                id: 'friend_' + Date.now(),
                name: name,
                avatar: avatar,
                description: desc,
                greeting: greeting,
                status: desc ? desc.substring(0, 20) + (desc.length > 20 ? '...' : '') : '',
                createdAt: new Date().toISOString()
            };
            
            AppState.friends.push(friend);
            saveToStorage();
            renderFriends();
            closeAddFriendPage();
            
            // 自动打开聊天
            openChatWithFriend(friend);
        }

        // 创建群聊页面
        function openCreateGroupPage() {
            document.getElementById('create-group-page').classList.add('open');
        }

        function closeCreateGroupPage() {
            document.getElementById('create-group-page').classList.remove('open');
            document.getElementById('group-name-input').value = '';
            document.getElementById('group-avatar-input').value = '';
            document.getElementById('group-desc-input').value = '';
        }

        function submitCreateGroup() {
            const name = document.getElementById('group-name-input').value.trim();
            const avatar = document.getElementById('group-avatar-input').value.trim();
            const desc = document.getElementById('group-desc-input').value.trim();
            
            if (!name) {
                alert('请输入群聊名称');
                return;
            }
            
            const group = {
                id: 'group_' + Date.now(),
                name:  name,
                avatar: avatar,
                description: desc,
                memberCount: 1,
                members: [],
                createdAt: new Date().toISOString()
            };
            
            AppState.groups.push(group);
            saveToStorage();
            renderGroups();
            closeCreateGroupPage();
            
            // 自动打开聊天
            openChatWithGroup(group);
        }

        // 导入角色卡页面
        function openImportCardPage() {
            document.getElementById('import-card-page').classList.add('open');
        }

        function closeImportCardPage() {
            document.getElementById('import-card-page').classList.remove('open');
            document.getElementById('import-file-input').value = '';
            document.getElementById('import-preview').innerHTML = '';
            document.getElementById('import-all-btn').classList.remove('show');
            AppState.importedCards = [];
        }

        function handleFileImport(files) {
            if (!files || files.length === 0) return;
            
            const preview = document.getElementById('import-preview');
            preview.innerHTML = '';
            AppState.importedCards = [];
            
            Array.from(files).forEach(function(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        const card = parseCharacterCard(data);
                        
                        if (card) {
                            AppState.importedCards.push(card);
                            
                            const item = document.createElement('div');
                            item.className = 'import-preview-item';
                            
                            const avatarContent = card.avatar 
                                ? `<img src="${card.avatar}" alt="">` 
                                : card.name.charAt(0);
                            
                            item.innerHTML = `
                                <div class="import-preview-avatar">${avatarContent}</div>
                                <div class="import-preview-info">
                                    <div class="import-preview-name">${card.name}</div>
                                    <div class="import-preview-desc">${card.description ? card.description.substring(0, 50) + '...' : '无描述'}</div>
                                </div>
                            `;
                            
                            preview.appendChild(item);
                            
                            if (AppState.importedCards.length > 0) {
                                document.getElementById('import-all-btn').classList.add('show');
                            }
                        }
                    } catch (err) {
                        console.error('解析文件失败:', file.name, err);
                        alert('文件 ' + file.name + ' 解析失败');
                    }
                };
                reader.readAsText(file);
            });
        }

        function parseCharacterCard(data) {
            let card = null;
            
            // SillyTavern V2 格式
            if (data.spec === 'chara_card_v2' && data.data) {
                card = {
                    name: data.data.name,
                    description: data.data.description || data.data.personality,
                    greeting: data.data.first_mes,
                    avatar: data.data.avatar,
                    scenario: data.data.scenario,
                    mesExample: data.data.mes_example
                };
            }
            // SillyTavern V1 格式
            else if (data.name) {
                card = {
                    name: data.name,
                    description: data.description || data.personality,
                    greeting: data.first_mes,
                    avatar: data.avatar,
                    scenario: data.scenario,
                    mesExample: data.mes_example
                };
            }
            
            if (card && card.name) {
                card.id = 'friend_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                card.status = card.description ? card.description.substring(0, 20) + '...' : '';
                card.createdAt = new Date().toISOString();
                return card;
            }
            
            return null;
        }

        function importAllCards() {
            if (AppState.importedCards.length === 0) {
                alert('没有可导入的角色卡');
                return;
            }
            
            AppState.importedCards.forEach(function(card) {
                AppState.friends.push(card);
            });
            
            saveToStorage();
            renderFriends();
            
            alert('成功导入 ' + AppState.importedCards.length + ' 个角色');
            closeImportCardPage();
        }

        // 聊天功能
        function openChat(conv) {
            AppState.currentChat = conv;
            document.getElementById('chat-title').textContent = conv.name;
            
            // 清除未读
            conv.unread = 0;
            saveToStorage();
            renderConversations();
            
            // 渲染消息
            renderChatMessages();
            
            document.getElementById('chat-page').classList.add('open');
        }

        function openChatWithFriend(friend) {
            // 查找或创建会话
            let conv = AppState.conversations.find(c => c.id === friend.id);
            
            if (!conv) {
                conv = {
                    id: friend.id,
                    type: 'friend',
                    name: friend.name,
                    avatar: friend.avatar,
                    lastMsg: friend.greeting || '',
                    time: formatTime(new Date()),
                    unread: 0
                };
                AppState.conversations.unshift(conv);
                
                // 初始化消息
                if (!AppState.messages[friend.id]) {
                    AppState.messages[friend.id] = [];
                    
                    // 添加开场白
                    if (friend.greeting) {
                        AppState.messages[friend.id].push({
                            id: 'msg_' + Date.now(),
                            type: 'received',
                            content: friend.greeting,
                            time: new Date().toISOString()
                        });
                    }
                }
                
                saveToStorage();
                renderConversations();
            }
            
            openChat(conv);
        }

        function openChatWithGroup(group) {
            let conv = AppState.conversations.find(c => c.id === group.id);
            
            if (!conv) {
                conv = {
                    id: group.id,
                    type: 'group',
                    name: group.name,
                    avatar: group.avatar,
                    lastMsg: '',
                    time: formatTime(new Date()),
                    unread: 0
                };
                AppState.conversations.unshift(conv);
                
                if (!AppState.messages[group.id]) {
                    AppState.messages[group.id] = [];
                }
                
                saveToStorage();
                renderConversations();
            }
            
            openChat(conv);
        }

        function closeChatPage() {
            document.getElementById('chat-page').classList.remove('open');
            AppState.currentChat = null;
        }

        function renderChatMessages() {
            const container = document.getElementById('chat-messages');
            container.innerHTML = '';
            
            if (!AppState.currentChat) return;
            
            const messages = AppState.messages[AppState.currentChat.id] || [];
            
            messages.forEach(function(msg) {
                const bubble = document.createElement('div');
                bubble.className = 'chat-bubble ' + msg.type;
                
                let avatarContent;
                if (msg.type === 'sent') {
                    avatarContent = AppState.user.avatar 
                        ? `<img src="${AppState.user.avatar}" alt="">` 
                        : AppState.user.name.charAt(0);
                } else {
                    avatarContent = AppState.currentChat.avatar 
                        ? `<img src="${AppState.currentChat.avatar}" alt="">` 
                        : AppState.currentChat.name.charAt(0);
                }
                
                bubble.innerHTML = `
                    <div class="chat-avatar">${avatarContent}</div>
                    <div class="chat-text">${escapeHtml(msg.content)}</div>
                `;
                
                container.appendChild(bubble);
            });
            
            // 滚动到底部
            container.scrollTop = container.scrollHeight;
        }

        function sendMessage() {
            const input = document.getElementById('chat-input');
            const content = input.value.trim();
            
            if (!content || !AppState.currentChat) return;
            
            // 添加用户消息
            const userMsg = {
                id: 'msg_' + Date.now(),
                type: 'sent',
                content: content,
                time: new Date().toISOString()
            };
            
            if (!AppState.messages[AppState.currentChat.id]) {
                AppState.messages[AppState.currentChat.id] = [];
            }
            
            AppState.messages[AppState.currentChat.id].push(userMsg);
            
            // 更新会话
            const conv = AppState.conversations.find(c => c.id === AppState.currentChat.id);
            if (conv) {
                conv.lastMsg = content;
                conv.time = formatTime(new Date());
            }
            
            saveToStorage();
            renderChatMessages();
            renderConversations();
            
            // 清空输入
            input.value = '';
            input.style.height = 'auto';
            
            // 模拟AI回复
            simulateAIReply();
        }

        function simulateAIReply() {
            setTimeout(function() {
                if (!AppState.currentChat) return;
                
                const replies = [
                    '收到你的消息了~',
                    '嗯嗯，我在听呢',
                    '这个问题很有趣！',
                    '让我想想...',
                    '好的，我明白了',
                    '哈哈，你说得对！',
                    '继续说，我很感兴趣',
                    '原来如此~'
                ];
                
                const reply = replies[Math.floor(Math.random() * replies.length)];
                
                const aiMsg = {
                    id: 'msg_' + Date.now(),
                    type: 'received',
                    content: reply,
                    time: new Date().toISOString()
                };
                
                AppState.messages[AppState.currentChat.id].push(aiMsg);
                
                const conv = AppState.conversations.find(c => c.id === AppState.currentChat.id);
                if (conv) {
                    conv.lastMsg = reply;
                    conv.time = formatTime(new Date());
                }
                
                saveToStorage();
                renderChatMessages();
                renderConversations();
            }, 1000 + Math.random() * 1000);
        }

        // 个性名片编辑
        function openCardEditPage() {
            document.getElementById('card-edit-page').classList.add('open');
        }

        function closeCardEditPage() {
            document.getElementById('card-edit-page').classList.remove('open');
        }

        let currentPickerType = '';

        function openImagePicker(type) {
            currentPickerType = type;
            document.getElementById('picker-title').textContent = type === 'avatar' ? '选择头像' : '选择背景图';
            document.getElementById('picker-url-input').classList.add('hidden');
            document.getElementById('picker-url-confirm').classList.add('hidden');
            document.getElementById('picker-url-input').value = '';
            document.getElementById('image-picker-modal').classList.add('show');
        }

        function closeImagePicker() {
            document.getElementById('image-picker-modal').classList.remove('show');
            currentPickerType = '';
        }

        function handlePickerFileSelect(file) {
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                applyImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }

        function handlePickerUrlConfirm() {
            const url = document.getElementById('picker-url-input').value.trim();
            if (url) {
                applyImage(url);
            }
        }

        function applyImage(imageUrl) {
            if (currentPickerType === 'avatar') {
                AppState.user.avatar = imageUrl;
            } else if (currentPickerType === 'bg') {
                AppState.user.bgImage = imageUrl;
            }
            
            saveToStorage();
            updateUserDisplay();
            closeImagePicker();
        }

        function editUserName() {
            const newName = prompt('请输入新昵称', AppState.user.name);
            if (newName && newName.trim()) {
                AppState.user.name = newName.trim();
                saveToStorage();
                updateUserDisplay();
            }
        }

        function editUserSignature() {
            const newSig = prompt('请输入个性签名', AppState.user.signature);
            if (newSig !== null) {
                AppState.user.signature = newSig.trim();
                saveToStorage();
                updateUserDisplay();
            }
        }

        // 更多功能设置
        function openMoreSettings() {
            updateDynamicFuncList();
            document.getElementById('more-settings-modal').classList.add('show');
        }

        function closeMoreSettings() {
            document.getElementById('more-settings-modal').classList.remove('show');
            updateDynamicFuncList();
        }

        // 工具函数
        function formatTime(date) {
            const now = new Date();
            const d = new Date(date);
            
            if (d.toDateString() === now.toDateString()) {
                return d.getHours().toString().padStart(2, '0') + ':' + 
                       d.getMinutes().toString().padStart(2, '0');
            }
            
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (d.toDateString() === yesterday.toDateString()) {
                return '昨天';
            }
            
            return (d.getMonth() + 1) + '/' + d.getDate();
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 生成唯一ID
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
  