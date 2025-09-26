// Global variables
let currentEngineer = null;
let engineerTasks = [];

// Engineer credentials (for demo)
const engineerCredentials = {
    'rajesh.roads@gov.in': 'engineer123',
    'amit.roads@gov.in': 'engineer123',
    'priya.water@gov.in': 'engineer123',
    'suresh.water@gov.in': 'engineer123',
    'vikram.elec@gov.in': 'engineer123',
    'anita.waste@gov.in': 'engineer123',
    'ravi.public@gov.in': 'engineer123'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    // Check if user is already logged in
    const savedEngineer = localStorage.getItem('currentEngineer');
    if (savedEngineer) {
        currentEngineer = JSON.parse(savedEngineer);
        showApp();
        loadTasks();
    }
});

// Event listeners
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Check credentials
        if (engineerCredentials[email] && engineerCredentials[email] === password) {
            // Fetch engineer details from API
            const response = await fetch('http://localhost:9000/api/engineers');
            const result = await response.json();
            
            if (result.success) {
                const engineer = result.data.find(eng => eng.email === email);
                
                if (engineer) {
                    currentEngineer = engineer;
                    localStorage.setItem('currentEngineer', JSON.stringify(engineer));
                    
                    showApp();
                    loadTasks();
                    
                    showNotification('✅ Login successful!');
                } else {
                    throw new Error('Engineer profile not found');
                }
            } else {
                throw new Error('Failed to fetch engineer data');
            }
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('❌ Login failed:', error);
        showNotification('❌ Login failed: ' + error.message);
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}

function logout() {
    currentEngineer = null;
    localStorage.removeItem('currentEngineer');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    showNotification('Logged out successfully');
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    
    // Update user info
    document.getElementById('userName').textContent = currentEngineer.name;
    document.getElementById('userRole').textContent = currentEngineer.specialization;
    document.getElementById('userAvatar').textContent = getInitials(currentEngineer.name);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Load tasks for current engineer
async function loadTasks() {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading tasks...</p></div>';
    
    try {
        console.log('🔍 Loading tasks for engineer:', currentEngineer._id);
        
        const response = await fetch(`http://localhost:9000/api/tasks/engineer/${currentEngineer._id}`);
        const result = await response.json();
        
        console.log('📋 Tasks API response:', result);
        
        if (result.success && result.data) {
            engineerTasks = result.data;
            displayTasks(engineerTasks);
            updateTaskStats(engineerTasks);
        } else {
            displayNoTasks();
        }
    } catch (error) {
        console.error('❌ Failed to load tasks:', error);
        container.innerHTML = `
            <div class="no-tasks">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load tasks</p>
                <p style="font-size: 12px; margin-top: 10px;">Check your connection and try again</p>
            </div>
        `;
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        displayNoTasks();
        return;
    }
    
    const tasksHTML = tasks.map(task => `
        <div class="task-card" onclick="showTaskDetails('${task._id}')">
            <div class="task-header">
                <div class="task-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${task.location}
                </div>
                <span class="task-status status-${task.status}">
                    ${task.status.replace('-', ' ')}
                </span>
            </div>
            
            <div class="task-details">
                <div class="task-detail">
                    <i class="fas fa-building"></i>
                    <span>${task.department.charAt(0).toUpperCase() + task.department.slice(1)} Department</span>
                </div>
                <div class="task-detail">
                    <i class="fas fa-file-alt"></i>
                    <span>${task.reportsCount} reports to handle</span>
                </div>
                <div class="task-detail">
                    <i class="fas fa-calendar"></i>
                    <span>Assigned: ${new Date(task.assignedAt).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="task-actions">
                ${getTaskActionButtons(task)}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = tasksHTML;
}

function displayNoTasks() {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = `
        <div class="no-tasks">
            <i class="fas fa-clipboard-check"></i>
            <p>No tasks assigned</p>
            <p style="font-size: 14px; margin-top: 10px; color: #999;">New tasks will appear here when assigned by your department</p>
        </div>
    `;
}

function getTaskActionButtons(task) {
    switch (task.status) {
        case 'assigned':
            return `
                <button class="task-btn btn-primary" onclick="acceptTask(event, '${task._id}')">
                    <i class="fas fa-check"></i> Accept Task
                </button>
            `;
        case 'accepted':
            return `
                <button class="task-btn btn-success" onclick="startTask(event, '${task._id}')">
                    <i class="fas fa-play"></i> Start Work
                </button>
            `;
        case 'in-progress':
            return `
                <button class="task-btn btn-secondary" onclick="completeTask(event, '${task._id}')">
                    <i class="fas fa-flag-checkered"></i> Mark Complete
                </button>
            `;
        case 'completed':
            return `
                <span style="color: #28a745; font-weight: 600;">
                    <i class="fas fa-check-circle"></i> Completed
                </span>
            `;
        default:
            return '';
    }
}

function updateTaskStats(tasks) {
    const assigned = tasks.filter(t => t.status === 'assigned').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    
    document.getElementById('taskStats').innerHTML = `
        <span class="stat">${assigned} Assigned</span>
        <span class="stat">${inProgress} In Progress</span>
    `;
}

// Task actions
async function acceptTask(event, taskId) {
    event.stopPropagation();
    await updateTaskStatus(taskId, 'accepted', 'Task accepted successfully!');
}

async function startTask(event, taskId) {
    event.stopPropagation();
    await updateTaskStatus(taskId, 'in-progress', 'Task started successfully!');
}

async function completeTask(event, taskId) {
    event.stopPropagation();
    await updateTaskStatus(taskId, 'completed', 'Task completed successfully!');
}

async function updateTaskStatus(taskId, status, successMessage) {
    try {
        const response = await fetch(`http://localhost:9000/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status,
                updatedBy: currentEngineer.email,
                updatedAt: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(successMessage);
            loadTasks(); // Refresh tasks
        } else {
            throw new Error(result.error || 'Failed to update task');
        }
    } catch (error) {
        console.error('❌ Failed to update task:', error);
        showNotification('❌ Failed to update task: ' + error.message);
    }
}

// Task details modal
function showTaskDetails(taskId) {
    const task = engineerTasks.find(t => t._id === taskId);
    if (!task) return;
    
    document.getElementById('taskModalTitle').textContent = `Task: ${task.location}`;
    
    document.getElementById('taskModalBody').innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px; color: #333;">Task Information</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <p><strong>Location:</strong> ${task.location}</p>
                <p><strong>Department:</strong> ${task.department.charAt(0).toUpperCase() + task.department.slice(1)}</p>
                <p><strong>Reports:</strong> ${task.reportsCount} issues to resolve</p>
                <p><strong>Status:</strong> <span class="task-status status-${task.status}">${task.status.replace('-', ' ')}</span></p>
                <p><strong>Assigned:</strong> ${new Date(task.assignedAt).toLocaleString()}</p>
            </div>
        </div>
        
        ${task.notes ? `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px; color: #333;">Notes</h4>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    ${task.notes}
                </div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('taskModalFooter').innerHTML = `
        <button class="task-btn btn-secondary" onclick="closeTaskModal()">Close</button>
        ${task.status !== 'completed' ? `
            <button class="task-btn btn-primary" onclick="closeTaskModal(); ${getTaskAction(task)}">
                ${getTaskActionText(task)}
            </button>
        ` : ''}
    `;
    
    document.getElementById('taskModal').style.display = 'flex';
}

function getTaskAction(task) {
    switch (task.status) {
        case 'assigned': return `acceptTask(event, '${task._id}')`;
        case 'accepted': return `startTask(event, '${task._id}')`;
        case 'in-progress': return `completeTask(event, '${task._id}')`;
        default: return '';
    }
}

function getTaskActionText(task) {
    switch (task.status) {
        case 'assigned': return 'Accept Task';
        case 'accepted': return 'Start Work';
        case 'in-progress': return 'Mark Complete';
        default: return '';
    }
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
}

// Utility functions
function showNotification(message) {
    // Simple notification - you can enhance this
    alert(message);
}

// Show tasks screen (default)
function showTasks() {
    document.getElementById('tasksScreen').style.display = 'block';
    loadTasks();
}