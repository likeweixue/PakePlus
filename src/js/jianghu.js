// ========== 江湖模块 - 外部链接管理 ==========

// 数据结构
var jianghuGroups = [];
var jianghuItems = [];

// 默认数据
var defaultJianghuGroups = [
    { id: 'default', name: '默认分组', icon: '📁' }
];
var defaultJianghuItems = [
    { id: 1, groupId: 'default', title: 'QQ交流群', url: 'https://qm.qq.com/q/你的QQ群链接', desc: '与作者们实时交流', icon: '💬' },
    { id: 2, groupId: 'default', title: 'GitHub', url: 'https://github.com/likeweixue/OpenWrite', desc: '查看源码与反馈', icon: '🐙' },
    { id: 3, groupId: 'default', title: '官方论坛', url: 'https://your-forum.com', desc: '分享作品与技巧', icon: '📚' },
    { id: 4, groupId: 'default', title: '意见反馈', url: 'https://your-feedback.com', desc: '告诉我们你的想法', icon: '💡' }
];

// 加载数据
function loadJianghuData() {
    var savedGroups = localStorage.getItem('openwrite_jianghu_groups');
    var savedItems = localStorage.getItem('openwrite_jianghu_items');
    
    if (savedGroups) {
        try { jianghuGroups = JSON.parse(savedGroups); } catch(e) {}
    }
    if (savedItems) {
        try { jianghuItems = JSON.parse(savedItems); } catch(e) {}
    }
    
    if (!jianghuGroups || jianghuGroups.length === 0) {
        jianghuGroups = JSON.parse(JSON.stringify(defaultJianghuGroups));
    }
    if (!jianghuItems || jianghuItems.length === 0) {
        jianghuItems = JSON.parse(JSON.stringify(defaultJianghuItems));
    }
}

// 保存数据
function saveJianghuData() {
    localStorage.setItem('openwrite_jianghu_groups', JSON.stringify(jianghuGroups));
    localStorage.setItem('openwrite_jianghu_items', JSON.stringify(jianghuItems));
}

// 导出数据到文件
function exportJianghuData() {
    var data = {
        groups: jianghuGroups,
        items: jianghuItems,
        exportTime: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'openwrite_jianghu_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('江湖数据已导出');
}

// 导入数据
function importJianghuData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (data.groups) jianghuGroups = data.groups;
            if (data.items) jianghuItems = data.items;
            saveJianghuData();
            renderJianghuPage();
            alert('数据导入成功');
        } catch(err) {
            alert('文件格式错误');
        }
    };
    reader.readAsText(file);
}

// 渲染江湖页面
function renderJianghuPage() {
    var container = document.getElementById('jianghuContainerPage');
    if (!container) return;
    
    var html = `
        <div style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                <h2 style="margin:0;">江湖</h2>
                <div style="display:flex; gap:12px;">
                    <button id="jhNewGroupBtn" class="btn-secondary" style="background:#6c757d;">+ 新建分组</button>
                    <button id="jhNewItemBtn" class="btn-primary" style="background:#007aff;">+ 新建链接</button>
                    <button id="jhExportBtn" class="btn-secondary" style="background:#28a745;">📤 导出数据</button>
                    <button id="jhImportBtn" class="btn-secondary" style="background:#ffc107; color:#333;">📥 导入数据</button>
                </div>
            </div>
            <div id="jhGroupsContainer"></div>
            <input type="file" id="jhImportFile" accept=".json" style="display:none;">
        </div>
    `;
    container.innerHTML = html;
    
    renderJianghuGroups();
    
    // 绑定事件
    document.getElementById('jhNewGroupBtn').onclick = function() { openNewJianghuGroup(); };
    document.getElementById('jhNewItemBtn').onclick = function() { openNewJianghuItem(); };
    document.getElementById('jhExportBtn').onclick = function() { exportJianghuData(); };
    document.getElementById('jhImportBtn').onclick = function() { document.getElementById('jhImportFile').click(); };
    document.getElementById('jhImportFile').onchange = function(e) {
        if (e.target.files && e.target.files[0]) {
            importJianghuData(e.target.files[0]);
            e.target.value = '';
        }
    };
}

function renderJianghuGroups() {
    var container = document.getElementById('jhGroupsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    for (var g = 0; g < jianghuGroups.length; g++) {
        var group = jianghuGroups[g];
        var groupItems = jianghuItems.filter(function(item) { return item.groupId === group.id; });
        
        var groupDiv = document.createElement('div');
        groupDiv.className = 'jh-group-section';
        groupDiv.setAttribute('data-group-id', group.id);
        groupDiv.style.cssText = 'margin-bottom:30px;';
        groupDiv.innerHTML = `
            <div class="jh-group-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:8px; border-bottom:2px solid rgba(0,0,0,0.1);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:24px;">${group.icon || '📁'}</span>
                    <h3 style="margin:0;">${escapeHtml(group.name)}</h3>
                    <span style="font-size:12px; opacity:0.6;">(${groupItems.length}项)</span>
                </div>
                <button class="jh-group-menu" data-id="${group.id}" style="background:none; border:none; font-size:18px; cursor:pointer; padding:4px 8px;">⋯</button>
            </div>
            <div class="jh-items-grid" data-group="${group.id}" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
                ${groupItems.map(function(item) {
                    return `
                        <div class="jh-item-card" data-id="${item.id}" draggable="true" style="background:#fff; border-radius:12px; padding:16px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:32px;">${item.icon || '🔗'}</span>
                                <div style="flex:1;">
                                    <div style="font-weight:600; font-size:16px;">${escapeHtml(item.title)}</div>
                                    <div style="font-size:12px; color:#888; margin-top:4px;">${escapeHtml(item.desc || '点击打开链接')}</div>
                                </div>
                                <button class="jh-item-menu" data-id="${item.id}" style="background:none; border:none; font-size:16px; cursor:pointer; padding:4px;">⋯</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        container.appendChild(groupDiv);
    }
    
    // 绑定卡片点击
    var cards = document.querySelectorAll('.jh-item-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].onclick = function(e) {
            if (e.target.classList && e.target.classList.contains('jh-item-menu')) return;
            var id = parseInt(this.getAttribute('data-id'));
            var item = jianghuItems.find(function(i) { return i.id === id; });
            if (item && item.url) window.open(item.url, '_blank');
        };
        initDragAndDrop(cards[i]);
    }
    
    // 绑定分组菜单
    var groupMenus = document.querySelectorAll('.jh-group-menu');
    for (var i = 0; i < groupMenus.length; i++) {
        groupMenus[i].onclick = function(e) {
            e.stopPropagation();
            var groupId = this.getAttribute('data-id');
            showJianghuGroupMenu(groupId);
        };
    }
    
    // 绑定项目菜单
    var itemMenus = document.querySelectorAll('.jh-item-menu');
    for (var i = 0; i < itemMenus.length; i++) {
        itemMenus[i].onclick = function(e) {
            e.stopPropagation();
            var itemId = parseInt(this.getAttribute('data-id'));
            showJianghuItemMenu(itemId);
        };
    }
    
    // 初始化拖拽
    initGroupDropZones();
}

// 拖拽功能
var dragSourceItemId = null;
var dragSourceGroupId = null;

function initDragAndDrop(card) {
    card.ondragstart = function(e) {
        dragSourceItemId = parseInt(this.getAttribute('data-id'));
        var groupDiv = this.closest('.jh-group-section');
        if (groupDiv) dragSourceGroupId = groupDiv.getAttribute('data-group-id');
        e.dataTransfer.setData('text/plain', dragSourceItemId);
        e.dataTransfer.effectAllowed = 'move';
        this.style.opacity = '0.5';
    };
    card.ondragend = function(e) {
        this.style.opacity = '1';
        dragSourceItemId = null;
        dragSourceGroupId = null;
    };
}

function initGroupDropZones() {
    var groups = document.querySelectorAll('.jh-group-section');
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        group.ondragover = function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.style.backgroundColor = 'rgba(0,122,255,0.05)';
        };
        group.ondragleave = function(e) {
            this.style.backgroundColor = '';
        };
        group.ondrop = function(e) {
            e.preventDefault();
            this.style.backgroundColor = '';
            if (!dragSourceItemId) return;
            var targetGroupId = this.getAttribute('data-group-id');
            if (dragSourceGroupId === targetGroupId) return;
            var item = jianghuItems.find(function(i) { return i.id === dragSourceItemId; });
            if (item) {
                item.groupId = targetGroupId;
                saveJianghuData();
                renderJianghuPage();
                alert('已移动到目标分组');
            }
            dragSourceItemId = null;
        };
    }
}

function showJianghuGroupMenu(groupId) {
    var group = jianghuGroups.find(function(g) { return g.id == groupId; });
    if (!group) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed; background:#fff; border-radius:8px; padding:4px 0; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:1000; min-width:120px;';
    menu.innerHTML = '<button class="rename-group" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer; text-align:left;">重命名</button><button class="delete-group" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer; text-align:left;">删除分组</button>';
    document.body.appendChild(menu);
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.querySelector('.rename-group').onclick = function() {
        var newName = prompt('请输入新名称', group.name);
        if (newName && newName.trim()) {
            group.name = newName.trim();
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
    menu.querySelector('.delete-group').onclick = function() {
        if (group.name === '默认分组') { alert('默认分组不能删除'); menu.remove(); return; }
        if (confirm('确定删除分组 "' + group.name + '" 吗？链接将移到默认分组')) {
            var defaultGroup = jianghuGroups.find(function(g) { return g.name === '默认分组'; });
            if (!defaultGroup) {
                defaultGroup = { id: 'default', name: '默认分组', icon: '📁' };
                jianghuGroups.push(defaultGroup);
            }
            for (var i = 0; i < jianghuItems.length; i++) {
                if (jianghuItems[i].groupId == groupId) jianghuItems[i].groupId = defaultGroup.id;
            }
            jianghuGroups = jianghuGroups.filter(function(g) { return g.id != groupId; });
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function showJianghuItemMenu(itemId) {
    var item = jianghuItems.find(function(i) { return i.id === itemId; });
    if (!item) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed; background:#fff; border-radius:8px; padding:4px 0; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:1000; min-width:120px;';
    menu.innerHTML = '<button class="edit-item" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer; text-align:left;">编辑</button><button class="delete-item" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer; text-align:left;">删除</button><button class="move-item" style="display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer; text-align:left;">移动到分组</button>';
    document.body.appendChild(menu);
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.querySelector('.edit-item').onclick = function() {
        var newTitle = prompt('请输入链接名称', item.title);
        if (newTitle && newTitle.trim()) item.title = newTitle.trim();
        var newUrl = prompt('请输入链接地址', item.url);
        if (newUrl && newUrl.trim()) item.url = newUrl.trim();
        var newDesc = prompt('请输入链接描述', item.desc);
        if (newDesc !== null) item.desc = newDesc || '';
        saveJianghuData();
        renderJianghuPage();
        menu.remove();
    };
    menu.querySelector('.delete-item').onclick = function() {
        if (confirm('确定删除这个链接吗？')) {
            jianghuItems = jianghuItems.filter(function(i) { return i.id !== itemId; });
            saveJianghuData();
            renderJianghuPage();
        }
        menu.remove();
    };
    menu.querySelector('.move-item').onclick = function() {
        showMoveToGroupMenuForItem(itemId, menu);
    };
}

function showMoveToGroupMenuForItem(itemId, parentMenu) {
    parentMenu.innerHTML = '<div style="padding:8px 12px; font-weight:500; border-bottom:1px solid #eee;">移动到分组</div>';
    for (var i = 0; i < jianghuGroups.length; i++) {
        var group = jianghuGroups[i];
        var btn = document.createElement('button');
        btn.textContent = group.name;
        btn.style.cssText = 'display:block; width:100%; padding:8px 16px; border:none; background:none; cursor:pointer; text-align:left;';
        btn.onclick = (function(gid) {
            return function() {
                var item = jianghuItems.find(function(i) { return i.id === itemId; });
                if (item) {
                    item.groupId = gid;
                    saveJianghuData();
                    renderJianghuPage();
                    parentMenu.remove();
                    alert('已移动');
                }
            };
        })(group.id);
        parentMenu.appendChild(btn);
    }
}

function openNewJianghuGroup() {
    var name = prompt('请输入分组名称：');
    if (name && name.trim()) {
        var newGroup = { id: Date.now().toString(), name: name.trim(), icon: '📁' };
        jianghuGroups.push(newGroup);
        saveJianghuData();
        renderJianghuPage();
        alert('分组创建成功');
    }
}

function openNewJianghuItem() {
    var title = prompt('请输入链接名称：');
    if (!title || !title.trim()) return;
    var url = prompt('请输入链接地址（URL）：');
    if (!url || !url.trim()) return;
    var desc = prompt('请输入链接描述（可选）：');
    var groupNames = jianghuGroups.map(function(g) { return g.name; }).join(', ');
    var groupName = prompt('请选择分组（默认："默认分组"），可选：' + groupNames, '默认分组');
    var targetGroup = jianghuGroups.find(function(g) { return g.name === (groupName || '默认分组'); });
    if (!targetGroup) targetGroup = jianghuGroups[0];
    
    var newItem = {
        id: Date.now(),
        groupId: targetGroup.id,
        title: title.trim(),
        url: url.trim(),
        desc: desc || '点击打开链接',
        icon: '🔗'
    };
    jianghuItems.push(newItem);
    saveJianghuData();
    renderJianghuPage();
    alert('链接添加成功');
}

function loadJianghuPageContent() {
    loadJianghuData();
    renderJianghuPage();
}

// 初始化
loadJianghuData();

// 确保函数暴露到全局
window.loadJianghuPageContent = loadJianghuPageContent;
window.renderJianghuPage = renderJianghuPage;
