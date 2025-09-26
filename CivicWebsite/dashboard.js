// Global variables
let currentUser = null;
let allReports = [];
let filteredReports = [];
let selectedDepartment = null;
let isGroupedByLocation = false;
let assignments = []; // Track all assignments
let activeTab = 'departments';

// Government credentials with district access
const govCredentials = {
    'admin@gov.local': 'password123',
    'official@city.gov': 'secure456',
    'manager@municipal.gov': 'admin789',
    'mumbai@gov.in': 'mumbai123',
    'pune@gov.in': 'pune123',
    'dhule@gov.in': 'dhule123',
    // Department Head Logins
    'roads.dept@gov.in': 'roads123',
    'water.dept@gov.in': 'water123',
    'electricity.dept@gov.in': 'electricity123',
    'waste.dept@gov.in': 'waste123',
    'public.dept@gov.in': 'public123'
};

// All possible departments - ALWAYS SHOW THESE
const DEPARTMENTS = [
    { id: 'roads', name: 'Roads & Traffic', icon: '🛣️', color: '#2563eb' },
    { id: 'water', name: 'Water Supply', icon: '💧', color: '#10b981' },
    { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#f59e0b' },
    { id: 'waste', name: 'Waste Management', icon: '🗑️', color: '#22c55e' },
    { id: 'public', name: 'Public Facilities', icon: '🏛️', color: '#a855f7' },
    {id: 'other', name: 'Other',icon: '📝', color: '#C7CEEA'}
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeHeader();
    startClock();
    createDepartmentCards(); // Show all departments initially
    
    // Auto-load if user is logged in
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (currentUserEmail && document.getElementById('dashboard').style.display !== 'none') {
        console.log('🔄 Auto-loading reports for logged in user');
        fetchReportsFromAPI();
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
    
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (govCredentials[email] && govCredentials[email] === password) {
        currentUser = { email: email };
        localStorage.setItem('currentUserEmail', email);
        updateUserProfile(email);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        showNotification(`Welcome ${currentUser.profile.name}!`);
        
        // Load appropriate dashboard based on user type
        setTimeout(() => {
            if (currentUser.profile.userType === 'department') {
                loadDepartmentAssignments();
            } else {
                fetchReportsFromAPI();
            }
        }, 500);
    } else {
        showNotification('Invalid credentials. Access denied.');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Secure Login';
        loginBtn.disabled = false;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUserEmail');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    showNotification('Logged out successfully.');
}

// Header functions
function initializeHeader() {
    updateDateTime();
    const userEmail = localStorage.getItem('currentUserEmail') || 'admin@gov.local';
    updateUserProfile(userEmail);
}

function startClock() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const dateTimeText = now.toLocaleDateString('en-IN', options);
    const element = document.getElementById('dateTimeText');
    if (element) {
        element.textContent = dateTimeText;
    }
}

function updateUserProfile(email) {
    const userProfiles = {
        'admin@gov.local': {
            name: 'Government Admin',
            role: 'State Administrator',
            avatar: 'GA',
            district: 'ALL',
            userType: 'admin'
        },
        'official@city.gov': {
            name: 'City Official',
            role: 'Public Works',
            avatar: 'CO',
            district: 'ALL',
            userType: 'admin'
        },
        'manager@municipal.gov': {
            name: 'Municipal Manager',
            role: 'Department Head',
            avatar: 'MM',
            district: 'ALL',
            userType: 'admin'
        },
        'mumbai@gov.in': {
            name: 'Mumbai District Officer',
            role: 'District Administrator',
            avatar: 'MD',
            district: 'Mumbai',
            userType: 'district'
        },
        'pune@gov.in': {
            name: 'Pune District Officer',
            role: 'District Administrator',
            avatar: 'PD',
            district: 'Pune',
            userType: 'district'
        },
        'dhule@gov.in': {
            name: 'Dhule District Officer',
            role: 'District Administrator',
            avatar: 'DD',
            district: 'Dhule',
            userType: 'district'
        },
        // Department Head Profiles
        'roads.dept@gov.in': {
            name: 'Roads Department Head',
            role: 'Department Manager',
            avatar: 'RD',
            district: 'ALL',
            userType: 'department',
            department: 'roads'
        },
        'water.dept@gov.in': {
            name: 'Water Department Head',
            role: 'Department Manager',
            avatar: 'WD',
            district: 'ALL',
            userType: 'department',
            department: 'water'
        },
        'electricity.dept@gov.in': {
            name: 'Electricity Department Head',
            role: 'Department Manager',
            avatar: 'ED',
            district: 'ALL',
            userType: 'department',
            department: 'electricity'
        },
        'waste.dept@gov.in': {
            name: 'Waste Management Head',
            role: 'Department Manager',
            avatar: 'WM',
            district: 'ALL',
            userType: 'department',
            department: 'waste'
        },
        'public.dept@gov.in': {
            name: 'Public Facilities Head',
            role: 'Department Manager',
            avatar: 'PF',
            district: 'ALL',
            userType: 'department',
            department: 'public'
        }
    };
    
    const profile = userProfiles[email] || userProfiles['admin@gov.local'];
    currentUser.profile = profile; // Store profile in currentUser
    
    document.getElementById('userName').textContent = profile.name;
    document.getElementById('userAvatar').textContent = profile.avatar;
    document.querySelector('.user-role').textContent = profile.role;
    
    // Show district info in header
    updateDistrictInfo(profile.district);
}

function updateDistrictInfo(district) {
    const districtElement = document.getElementById('userDistrict');
    if (districtElement) {
        districtElement.textContent = district === 'ALL' ? 'All Districts' : `${district} District`;
    }
}

// District-based filtering
function filterReportsByDistrict(reports) {
    if (!currentUser?.profile?.district || currentUser.profile.district === 'ALL') {
        return reports; // Show all reports for admin users
    }
    
    const userDistrict = currentUser.profile.district.toLowerCase();
    
    return reports.filter(report => {
        const reportLocation = report.location?.address?.toLowerCase() || '';
        return reportLocation.includes(userDistrict);
    });
}

// API Functions - WORKING API CALL
async function fetchReportsFromAPI() {
    const btn = event?.target;
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        btn.disabled = true;
    }
    
    // Clear existing data first to prevent duplication
    allReports = [];
    filteredReports = [];
    
    // Clear the display container
    const container = document.getElementById('reportsContainer');
    if (container) {
        container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading reports...</span></div>';
    }
    
    try {
        console.log('🔄 Fetching reports from API...');
        const response = await fetch('http://localhost:9000/api/reports');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📡 API Response:', result);
        
        if (result.success && result.data) {
            // Apply district-based filtering
            const districtFilteredReports = filterReportsByDistrict(result.data);
            
            // Completely replace arrays to prevent duplication
            allReports = [...districtFilteredReports];
            filteredReports = [...districtFilteredReports];
            
            console.log(`✅ Loaded ${result.data.length} total reports from MongoDB`);
            console.log(`🏛️ Filtered to ${allReports.length} reports for user's district`);
            console.log('📋 First report data:', allReports[0]);
            
            // Debug: Show all categories in reports
            const categories = [...new Set(allReports.map(r => r.category))];
            console.log('🏷️ Categories found in reports:', categories);
            
            // Create departments based on actual data
            createDepartmentsFromData();
            
            // Update dashboard immediately
            updateStats();
            displayReports();
            
            // Force refresh department cards with new data
            createDepartmentCards();
            
            showNotification(`✅ Loaded ${allReports.length} reports from database`);
        } else {
            console.error('❌ API response error:', result);
            showNotification('❌ No reports found in database');
        }
    } catch (error) {
        console.error('❌ Failed to fetch reports:', error);
        showNotification('❌ Cannot connect to backend - Check if server is running on port 9000');
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Load Reports';
            btn.disabled = false;
        }
    }
}

// Department Functions
function createDepartmentsFromData() {
    // Always create all department cards
    createDepartmentCards();
}

function createDepartmentCards() {
    const container = document.getElementById('departmentsGrid');
    
    if (!allReports || allReports.length === 0) {
        // Show all departments with 0 counts if no data
        const allCard = `
            <div class="department-card active" onclick="selectDepartment(null)">
                <div class="department-name">📊 All Departments</div>
                <div class="department-count">0 reports</div>
            </div>
        `;
        
        const departmentCards = DEPARTMENTS.map(dept => `
            <div class="department-card" onclick="selectDepartment('${dept.id}')">
                <div class="department-name">${dept.icon} ${dept.name}</div>
                <div class="department-count">0 reports</div>
            </div>
        `).join('');
        
        container.innerHTML = allCard + departmentCards;
        return;
    }
    
    // Show all departments with actual counts
    const allCard = `
        <div class="department-card active" onclick="selectDepartment(null)">
            <div class="department-name">📊 All Departments</div>
            <div class="department-count">${allReports.length} reports</div>
        </div>
    `;
    
    const departmentCards = DEPARTMENTS.map(dept => {
        const count = allReports.filter(report => report.category === dept.id).length;
        return `
            <div class="department-card" onclick="selectDepartment('${dept.id}')">
                <div class="department-name">${dept.icon} ${dept.name}</div>
                <div class="department-count">${count} reports</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = allCard + departmentCards;
    console.log('✅ All department cards created:', DEPARTMENTS.length + 1, 'total cards');
}

function selectDepartment(departmentId) {
    selectedDepartment = departmentId;
    
    // Update active state
    document.querySelectorAll('.department-card').forEach(card => {
        card.classList.remove('active');
    });
    event.target.closest('.department-card').classList.add('active');
    
    if (departmentId === null) {
        // Show ALL reports
        filteredReports = allReports;
        console.log(`📊 Selected ALL departments, showing ${filteredReports.length} reports`);
        showNotification(`Showing all ${filteredReports.length} reports`);
    } else {
        // Filter reports by specific category
        filteredReports = allReports.filter(report => report.category === departmentId);
        console.log(`🏢 Selected department: ${departmentId}`);
        console.log(`🔍 Filtering reports where category === '${departmentId}'`);
        console.log(`📊 Found ${filteredReports.length} reports for this department`);
        
        const deptName = DEPARTMENTS.find(d => d.id === departmentId)?.name || departmentId;
        showNotification(`Showing ${filteredReports.length} reports for ${deptName}`);
    }
    
    displayReports();
}

// Location Grouping Functions
function toggleLocationGrouping() {
    isGroupedByLocation = !isGroupedByLocation;
    const btn = document.getElementById('groupByLocationBtn');
    
    if (isGroupedByLocation) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-list"></i> Show Individual Reports';
        showNotification('Reports grouped by location');
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-layer-group"></i> Group by Location';
        showNotification('Showing individual reports');
    }
    
    displayReports();
}

function groupReportsByLocation(reports) {
    const locationGroups = {};
    
    // Filter out resolved reports for district officers
    let reportsToGroup = reports;
    if (currentUser?.profile?.userType === 'district' || currentUser?.profile?.userType === 'admin') {
        reportsToGroup = reports.filter(report => 
            report.status !== 'resolved' && report.status !== 'rejected'
        );
    }
    
    reportsToGroup.forEach(report => {
        const fullAddress = report.location?.address || 'Unknown Location';
        
        // Extract last 3 parts of address (area, district, state)
        const addressParts = fullAddress.split(',').map(part => part.trim());
        const locationKey = addressParts.length >= 3 
            ? addressParts.slice(-3).join(', ') 
            : fullAddress;
        
        if (!locationGroups[locationKey]) {
            locationGroups[locationKey] = {
                location: locationKey,
                reports: [],
                count: 0,
                categories: new Set(),
                priorities: new Set(),
                statuses: new Set()
            };
        }
        
        locationGroups[locationKey].reports.push(report);
        locationGroups[locationKey].count++;
        locationGroups[locationKey].categories.add(report.category);
        locationGroups[locationKey].priorities.add(report.priority);
        locationGroups[locationKey].statuses.add(report.status);
    });
    
    // Convert to array and sort by count (most reports first)
    return Object.values(locationGroups).sort((a, b) => b.count - a.count);
}



// Display Functions
function updateStats() {
    if (!allReports || allReports.length === 0) {
        document.getElementById('totalReports').textContent = '0';
        document.getElementById('pendingReports').textContent = '0';
        document.getElementById('progressReports').textContent = '0';
        document.getElementById('resolvedReports').textContent = '0';
        return;
    }
    
    // For district officers, show only pending reports (unassigned)
    let reportsForStats = allReports;
    if (currentUser?.profile?.userType === 'district' || currentUser?.profile?.userType === 'admin') {
        const pendingReports = allReports.filter(r => r.status === 'pending');
        const assignedReports = allReports.filter(r => r.status === 'assigned');
        const inProgressReports = allReports.filter(r => r.status === 'in-progress');
        const resolvedReports = allReports.filter(r => r.status === 'resolved');
        
        document.getElementById('totalReports').textContent = pendingReports.length; // Only pending for district
        document.getElementById('pendingReports').textContent = pendingReports.length;
        document.getElementById('progressReports').textContent = assignedReports.length + inProgressReports.length;
        document.getElementById('resolvedReports').textContent = resolvedReports.length;
    } else {
        // For department heads, show all reports
        document.getElementById('totalReports').textContent = allReports.length;
        document.getElementById('pendingReports').textContent = 
            allReports.filter(r => r.status === 'pending').length;
        document.getElementById('progressReports').textContent = 
            allReports.filter(r => r.status === 'in-progress').length;
        document.getElementById('resolvedReports').textContent = 
            allReports.filter(r => r.status === 'resolved').length;
    }
}

function displayReports() {
    console.log(`📊 Displaying reports...`);
    
    const container = document.getElementById('reportsContainer');
    const count = document.getElementById('reportsCount');
    
    if (!container) {
        console.error('❌ Reports container not found!');
        return;
    }
    
    // Filter out resolved reports for district officers (only show pending/in-progress)
    let reportsToShow = filteredReports || allReports || [];
    
    if (currentUser?.profile?.userType === 'district' || currentUser?.profile?.userType === 'admin') {
        reportsToShow = reportsToShow.filter(report => 
            report.status === 'pending' // Only show pending reports that haven't been assigned yet
        );
        console.log(`🔍 District view: Showing only pending reports. ${reportsToShow.length} reports available for assignment.`);
    }
    
    if (reportsToShow.length === 0) {
        count.textContent = '0 reports';
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 48px; color: #d1d5db; margin-bottom: 15px;"></i>
                <p>No reports found</p>
                <p style="font-size: 14px; margin-top: 10px;">Click "Load Reports" to fetch data</p>
            </div>
        `;
        return;
    }
    
    if (isGroupedByLocation) {
        displayGroupedReports(reportsToShow);
    } else {
        displayIndividualReports(reportsToShow);
    }
}

function displayIndividualReports(reports) {
    const container = document.getElementById('reportsContainer');
    const count = document.getElementById('reportsCount');
    
    count.textContent = `${reports.length} reports`;
    console.log(`📊 Showing ${reports.length} individual reports`);
    
    const reportsHTML = reports.map(report => {
        const date = new Date(report.createdAt || Date.now()).toLocaleDateString();
        const time = new Date(report.createdAt || Date.now()).toLocaleTimeString();
        const locationText = report.location?.address || 'Unknown location';
        
        return `
            <div class="report-item">
                <div class="report-header">
                    <div>
                        <div class="report-title">${report.title || 'No Title'}</div>
                        <span class="report-category category-${report.category}">
                            ${(report.category || 'general').toUpperCase()}
                        </span>
                    </div>
                    <span class="status-badge status-${report.status || 'pending'}">
                        ${(report.status || 'pending').toUpperCase()}
                    </span>
                </div>
                <div class="report-description">${report.description || 'No description'}</div>
                <div class="report-meta">
                    <div class="report-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${locationText}
                    </div>
                    <div class="report-time">
                        <i class="fas fa-clock"></i>
                        ${date} ${time}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = reportsHTML;
    console.log('✅ Individual reports displayed successfully');
}

function displayGroupedReports(reports) {
    const container = document.getElementById('reportsContainer');
    const count = document.getElementById('reportsCount');
    
    const locationGroups = groupReportsByLocation(reports);
    
    count.textContent = `${locationGroups.length} locations (${reports.length} total reports)`;
    console.log(`📊 Showing ${locationGroups.length} location groups`);
    
    const groupsHTML = locationGroups.map(group => {
        const categoriesArray = Array.from(group.categories);
        const prioritiesArray = Array.from(group.priorities);
        const statusesArray = Array.from(group.statuses);
        
        return `
            <div class="location-group" onclick="toggleLocationGroup(this)">
                <div class="location-group-header">
                    <div class="location-info">
                        <div class="location-name">
                            <i class="fas fa-map-marker-alt"></i>
                            ${group.location}
                        </div>
                        <div class="location-stats">
                            <span class="report-count">${group.count} reports</span>
                            <span class="categories">${categoriesArray.join(', ')}</span>
                        </div>
                    </div>
                    <div class="group-actions">
                        <button class="send-to-dept-btn" onclick="showDepartmentAssignModal(event, '${group.location}', ${JSON.stringify(group.reports).replace(/"/g, '&quot;')})">
                            <i class="fas fa-paper-plane"></i> Send to Department
                        </button>
                        <span class="expand-icon"><i class="fas fa-chevron-down"></i></span>
                    </div>
                </div>
                <div class="location-group-content" style="display: none;">
                    ${group.reports.map(report => {
                        const date = new Date(report.createdAt || Date.now()).toLocaleDateString();
                        const time = new Date(report.createdAt || Date.now()).toLocaleTimeString();
                        
                        return `
                            <div class="grouped-report-item">
                                <div class="report-header">
                                    <div>
                                        <div class="report-title">${report.title || 'No Title'}</div>
                                        <span class="report-category category-${report.category}">
                                            ${(report.category || 'general').toUpperCase()}
                                        </span>
                                    </div>
                                    <span class="status-badge status-${report.status || 'pending'}">
                                        ${(report.status || 'pending').toUpperCase()}
                                    </span>
                                </div>
                                <div class="report-description">${report.description || 'No description'}</div>
                                <div class="report-time">
                                    <i class="fas fa-clock"></i>
                                    ${date} ${time}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = groupsHTML;
    console.log('✅ Grouped reports displayed successfully');
}

function toggleLocationGroup(groupElement) {
    const content = groupElement.querySelector('.location-group-content');
    const icon = groupElement.querySelector('.expand-icon i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
    }
}

// Department Assignment Functions
let selectedReportsForAssignment = [];
let selectedLocationForAssignment = '';
let selectedDepartmentForAssignment = null;

function showDepartmentAssignModal(event, location, reports) {
    event.stopPropagation(); // Prevent location group toggle
    
    selectedReportsForAssignment = reports;
    selectedLocationForAssignment = location;
    
    // Populate modal
    document.getElementById('assignLocation').textContent = location;
    document.getElementById('assignReportsCount').textContent = `${reports.length} reports`;
    
    // Create department options
    createDepartmentOptions();
    
    // Show modal
    document.getElementById('assignModal').style.display = 'flex';
}

function createDepartmentOptions() {
    const container = document.getElementById('departmentOptions');
    
    const optionsHTML = DEPARTMENTS.map(dept => `
        <div class="dept-option" onclick="selectDepartmentForAssignment('${dept.id}')" data-dept="${dept.id}">
            <div>${dept.icon} ${dept.name}</div>
        </div>
    `).join('');
    
    container.innerHTML = optionsHTML;
}

function selectDepartmentForAssignment(deptId) {
    selectedDepartmentForAssignment = deptId;
    
    // Update visual selection
    document.querySelectorAll('.dept-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`[data-dept="${deptId}"]`).classList.add('selected');
}

function closeAssignModal() {
    document.getElementById('assignModal').style.display = 'none';
    selectedReportsForAssignment = [];
    selectedLocationForAssignment = '';
    selectedDepartmentForAssignment = null;
    document.getElementById('assignmentNote').value = '';
}

async function assignToDepartment() {
    if (!selectedDepartmentForAssignment) {
        showNotification('⚠️ Please select a department');
        return;
    }
    
    const assignBtn = document.querySelector('.btn-assign');
    assignBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...';
    assignBtn.disabled = true;
    
    try {
        const deptName = DEPARTMENTS.find(d => d.id === selectedDepartmentForAssignment)?.name;
        
        // Check if assignment already exists for this location and department
        const checkResponse = await fetch('http://localhost:9000/api/assignments');
        const checkResult = await checkResponse.json();
        
        if (checkResult.success) {
            const existingAssignment = checkResult.data.find(assignment => 
                assignment.location === selectedLocationForAssignment && 
                assignment.department === selectedDepartmentForAssignment
            );
            
            if (existingAssignment) {
                showNotification('⚠️ This location is already assigned to this department');
                assignBtn.innerHTML = '<i class="fas fa-check"></i> Assign Reports';
                assignBtn.disabled = false;
                closeAssignModal();
                return;
            }
        }
        
        console.log('🎯 Creating new assignment:', {
            location: selectedLocationForAssignment,
            department: selectedDepartmentForAssignment,
            departmentName: deptName,
            reportsCount: selectedReportsForAssignment.length
        });
        
        // Send to real API
        const response = await fetch('http://localhost:9000/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location: selectedLocationForAssignment,
                department: selectedDepartmentForAssignment,
                departmentName: deptName,
                reports: selectedReportsForAssignment, // Send full report data
                reportsCount: selectedReportsForAssignment.length,
                note: document.getElementById('assignmentNote').value,
                assignedBy: currentUser.email,
                assignedByName: currentUser.profile.name
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to create assignment');
        }
        
        console.log('✅ Assignment created in database:', result.data);
        
        // Update all reports in this assignment to 'assigned' status
        for (const report of selectedReportsForAssignment) {
            try {
                await fetch(`http://localhost:9000/api/reports/${report._id || report.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'assigned',
                        assignedAt: new Date().toISOString(),
                        assignedTo: deptName
                    })
                });
                console.log(`✅ Updated report ${report._id || report.id} status to 'assigned'`);
            } catch (reportError) {
                console.error(`❌ Failed to update report ${report._id || report.id}:`, reportError);
            }
        }
        
        showNotification(`✅ Successfully assigned ${selectedReportsForAssignment.length} reports from ${selectedLocationForAssignment} to ${deptName}`);
        
        closeAssignModal();
        
        // Refresh reports to show updated status
        fetchReportsFromAPI();
        
    } catch (error) {
        console.error('❌ Assignment failed:', error);
        showNotification(`❌ Failed to assign reports: ${error.message}`);
    } finally {
        assignBtn.innerHTML = '<i class="fas fa-check"></i> Assign Reports';
        assignBtn.disabled = false;
    }
}

// Tab Management Functions
function switchTab(tabName) {
    activeTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide panels
    if (tabName === 'departments') {
        document.getElementById('departmentsPanel').style.display = 'block';
        document.getElementById('assignmentsPanel').style.display = 'none';
    } else if (tabName === 'assignments') {
        document.getElementById('departmentsPanel').style.display = 'none';
        document.getElementById('assignmentsPanel').style.display = 'block';
        loadAndDisplayAssignments();
    }
}

// Assignment Display Functions
function loadAndDisplayAssignments() {
    // Load assignments from localStorage
    const storedAssignments = localStorage.getItem('assignments');
    if (storedAssignments) {
        assignments = JSON.parse(storedAssignments);
    }
    
    displayAssignments();
}

function displayAssignments() {
    const container = document.getElementById('assignmentsList');
    const count = document.getElementById('assignmentsCount');
    
    if (assignments.length === 0) {
        count.textContent = '0 assignments';
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <i class="fas fa-clipboard-list" style="font-size: 48px; color: #d1d5db; margin-bottom: 15px;"></i>
                <p>No assignments yet</p>
                <p style="font-size: 14px; margin-top: 10px;">Assign location groups to departments to track progress</p>
            </div>
        `;
        return;
    }
    
    count.textContent = `${assignments.length} assignments`;
    
    const assignmentsHTML = assignments.map(assignment => {
        const assignedDate = new Date(assignment.assignedAt).toLocaleDateString();
        const assignedTime = new Date(assignment.assignedAt).toLocaleTimeString();
        
        return `
            <div class="assignment-item">
                <div class="assignment-header">
                    <div>
                        <div class="assignment-location">
                            <i class="fas fa-map-marker-alt"></i> ${assignment.location}
                        </div>
                        <div class="assignment-department">
                            <i class="fas fa-building"></i> ${assignment.departmentName}
                        </div>
                    </div>
                    <span class="assignment-status status-${assignment.status}">
                        ${assignment.status}
                    </span>
                </div>
                
                ${assignment.note ? `<div class="assignment-note" style="margin: 10px 0; font-size: 14px; color: #6b7280; font-style: italic;">
                    "${assignment.note}"
                </div>` : ''}
                
                <div class="assignment-meta">
                    <div>
                        <span class="assignment-reports-count">${assignment.reportsCount} reports</span>
                        <span style="margin-left: 10px;">Assigned: ${assignedDate} ${assignedTime}</span>
                    </div>
                </div>
                
                <div class="assignment-actions">
                    <button class="action-btn-small" onclick="viewAssignmentDetails('${assignment.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="action-btn-small primary" onclick="updateAssignmentStatus('${assignment.id}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = assignmentsHTML;
}

function viewAssignmentDetails(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    console.log('📝 Assignment Details:', assignment);
    showNotification(`Assignment: ${assignment.reportsCount} reports from ${assignment.location} assigned to ${assignment.departmentName}`);
}

function updateAssignmentStatus(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    // Cycle through statuses
    const statusCycle = ['assigned', 'in-progress', 'completed'];
    const currentIndex = statusCycle.indexOf(assignment.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    
    assignment.status = statusCycle[nextIndex];
    assignment.lastUpdated = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('assignments', JSON.stringify(assignments));
    
    // Refresh display
    displayAssignments();
    
    showNotification(`✅ Assignment status updated to: ${assignment.status.toUpperCase()}`);
}

// Department-specific functions
async function loadDepartmentAssignments() {
    const userDepartment = currentUser.profile.department;
    
    console.log('🔍 Loading assignments for department:', userDepartment);
    
    try {
        // First fetch assignments from API
        const assignmentsResponse = await fetch(`http://localhost:9000/api/assignments/department/${userDepartment}`);
        
        if (!assignmentsResponse.ok) {
            throw new Error(`HTTP error! status: ${assignmentsResponse.status}`);
        }
        
        const assignmentsResult = await assignmentsResponse.json();
        console.log('📊 Assignments API Response:', assignmentsResult);
        
        if (assignmentsResult.success && assignmentsResult.data && assignmentsResult.data.length > 0) {
            const departmentAssignments = assignmentsResult.data;
            
            // Now fetch all reports to get full details
            const reportsResponse = await fetch('http://localhost:9000/api/reports');
            const reportsResult = await reportsResponse.json();
            
            if (reportsResult.success && reportsResult.data) {
                const allReports = reportsResult.data;
                
                // Remove duplicates based on location and department
                const uniqueAssignments = departmentAssignments.filter((assignment, index, self) => 
                    index === self.findIndex(a => 
                        a.location === assignment.location && 
                        a.department === assignment.department
                    )
                );
                
                console.log(`🔄 Removed ${departmentAssignments.length - uniqueAssignments.length} duplicate assignments`);
                
                // Match assignment report IDs with full report data
                const enrichedAssignments = uniqueAssignments.map(assignment => {
                    const reportIds = assignment.reports || [];
                    const fullReports = reportIds.map(reportId => {
                        return allReports.find(report => (report._id || report.id) === reportId) || {
                            _id: reportId,
                            title: 'Report not found',
                            description: 'This report may have been deleted',
                            category: userDepartment,
                            status: 'pending'
                        };
                    });
                    
                    return {
                        ...assignment,
                        reports: fullReports
                    };
                });
                
                console.log(`🏢 Found ${enrichedAssignments.length} assignments with full report details`);
                
                // Update UI for department view
                showDepartmentView(enrichedAssignments);
                
                // Update statistics for department view
                updateDepartmentStats(enrichedAssignments);
                
                showNotification(`✅ Loaded ${enrichedAssignments.length} assignments for ${currentUser.profile.name}`);
            } else {
                showDepartmentView(departmentAssignments);
                showNotification('⚠️ Could not load report details');
            }
        } else {
            console.log('⚠️ No assignments found for this department');
            showDepartmentView([]);
            showNotification('No assignments found for your department');
        }
    } catch (error) {
        console.error('❌ Failed to load assignments:', error);
        showNotification('❌ Cannot connect to backend - Check if server is running');
        showDepartmentView([]);
    }
}

function showDepartmentView(departmentAssignments) {
    // Hide the normal dashboard layout
    document.querySelector('.dashboard-layout').style.display = 'none';
    
    // Create department-specific view
    const mainContent = document.querySelector('.main-content');
    
    const departmentViewHTML = `
        <div class="department-view" id="departmentView">
            <div class="department-header">
                <h2><i class="fas fa-tasks"></i> Department Assignments</h2>
                <p>Assignments sent to ${currentUser.profile.name}</p>
            </div>
            
            <div class="assignments-container" id="departmentAssignments">
                ${departmentAssignments.length === 0 ? `
                    <div class="no-assignments">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #d1d5db; margin-bottom: 15px;"></i>
                        <p>No assignments yet</p>
                        <p style="font-size: 14px; color: #6b7280;">District officers will send location groups to your department</p>
                    </div>
                ` : departmentAssignments.map(assignment => `
                    <div class="department-assignment-card">
                        <div class="assignment-card-header">
                            <div class="assignment-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <strong>${assignment.location}</strong>
                            </div>
                            <div class="assignment-status status-${assignment.status}">
                                ${assignment.status === 'completed' ? 'RESOLVED' : assignment.status.toUpperCase()}
                            </div>
                        </div>
                        
                        <div class="assignment-details">
                            <div class="reports-count">
                                <i class="fas fa-file-alt"></i>
                                ${assignment.reportsCount} reports to handle
                            </div>
                            <div class="assigned-date">
                                <i class="fas fa-calendar"></i>
                                Assigned: ${new Date(assignment.assignedAt).toLocaleDateString()}
                            </div>
                        </div>
                        
                        ${assignment.note ? `
                            <div class="assignment-note">
                                <i class="fas fa-sticky-note"></i>
                                "${assignment.note}"
                            </div>
                        ` : ''}
                        
                        <div class="assignment-actions">
                            <button class="view-reports-btn" onclick="viewAssignmentReports('${assignment._id}', ${JSON.stringify(assignment.reports || []).replace(/"/g, '&quot;')})">
                                <i class="fas fa-eye"></i> View Reports
                            </button>
                            ${assignment.status === 'assigned' ? `
                                <button class="assign-engineer-btn" onclick="showAssignEngineerModal(event, '${assignment._id}', '${assignment.department}')">
                                    <i class="fas fa-user-hard-hat"></i> Assign Engineer
                                </button>
                            ` : ''}
                            <button class="view-tasks-btn" onclick="viewAssignmentTasks('${assignment._id}')">
                                <i class="fas fa-tasks"></i> View Tasks
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add department view after stats
    const statsGrid = document.querySelector('.stats-grid');
    statsGrid.insertAdjacentHTML('afterend', departmentViewHTML);
}

function showReportDetails(reportId, reportData) {
    console.log('📋 Showing report details:', reportData);
    
    const modalHTML = `
        <div class="modal-overlay" id="reportDetailsModal">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-alt"></i> Report Details</h3>
                    <button class="modal-close" onclick="closeReportDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="report-details-grid">
                        <div class="detail-item">
                            <label>Title:</label>
                            <div class="detail-value">${reportData.title || 'No Title'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <label>Category:</label>
                            <div class="detail-value">
                                <span class="report-category category-${reportData.category}">
                                    ${(reportData.category || 'general').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <label>Priority:</label>
                            <div class="detail-value">
                                <span class="priority-badge priority-${reportData.priority || 'medium'}">
                                    ${(reportData.priority || 'medium').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <label>Status:</label>
                            <div class="detail-value">
                                <span class="status-badge status-${reportData.status || 'pending'}">
                                    ${(reportData.status || 'pending').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-item full-width">
                            <label>Description:</label>
                            <div class="detail-value">${reportData.description || 'No description provided'}</div>
                        </div>
                        
                        <div class="detail-item full-width">
                            <label>Location:</label>
                            <div class="detail-value">
                                <i class="fas fa-map-marker-alt"></i>
                                ${reportData.location?.address || 'Location not specified'}
                                ${reportData.location?.latitude && reportData.location?.longitude ? `
                                    <br><small>Coordinates: ${reportData.location.latitude}, ${reportData.location.longitude}</small>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <label>Reported On:</label>
                            <div class="detail-value">
                                <i class="fas fa-calendar"></i>
                                ${new Date(reportData.createdAt || Date.now()).toLocaleDateString()}
                                <br><small>${new Date(reportData.createdAt || Date.now()).toLocaleTimeString()}</small>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <label>Last Updated:</label>
                            <div class="detail-value">
                                <i class="fas fa-clock"></i>
                                ${new Date(reportData.updatedAt || reportData.createdAt || Date.now()).toLocaleDateString()}
                                <br><small>${new Date(reportData.updatedAt || reportData.createdAt || Date.now()).toLocaleTimeString()}</small>
                            </div>
                        </div>
                        
                        ${reportData.images && reportData.images.length > 0 ? `
                            <div class="detail-item full-width">
                                <label>Images:</label>
                                <div class="detail-value">
                                    <div class="images-grid">
                                        ${reportData.images.map(img => {
                                            const imageUrl = img.startsWith('http') ? img : `http://192.168.214.228:9000${img}`;
                                            return `<img src="${imageUrl}" alt="Report image" class="report-image" onclick="showImageModal('${imageUrl}')" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin: 5px; cursor: pointer;">`;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeReportDetailsModal()">Close</button>
                    <button class="btn-assign" onclick="updateReportStatus('${reportId}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeReportDetailsModal() {
    const modal = document.getElementById('reportDetailsModal');
    if (modal) {
        modal.remove();
    }
}

function updateReportStatus(reportId) {
    // Simple status update - cycle through statuses
    const statuses = ['pending', 'in-progress', 'resolved'];
    const currentStatus = 'pending'; // You can get this from the report data
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    console.log(`🔄 Updating report ${reportId} status to: ${nextStatus}`);
    showNotification(`✅ Report status updated to: ${nextStatus.toUpperCase()}`);
    
    closeReportDetailsModal();
    // Refresh the department view
    loadDepartmentAssignments();
}

async function updateDepartmentAssignmentStatus(assignmentId, currentStatus) {
    const statuses = ['assigned', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    try {
        const response = await fetch(`http://localhost:9000/api/assignments/${assignmentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: nextStatus,
                updatedBy: currentUser.email,
                updatedAt: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            showNotification(`✅ Assignment status updated to: ${nextStatus.toUpperCase()}`);
            // Refresh the department view and stats
            loadDepartmentAssignments();
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        console.error('❌ Status update failed:', error);
        showNotification('❌ Failed to update status. Please try again.');
    }
}

function updateDepartmentStats(assignments) {
    const totalAssignments = assignments.length;
    const assignedCount = assignments.filter(a => a.status === 'assigned').length;
    const inProgressCount = assignments.filter(a => a.status === 'in-progress').length;
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    
    document.getElementById('totalReports').textContent = totalAssignments;
    document.getElementById('pendingReports').textContent = assignedCount;
    document.getElementById('progressReports').textContent = inProgressCount;
    document.getElementById('resolvedReports').textContent = completedCount;
}

function viewAssignmentReports(assignmentId, reports) {
    console.log('📝 Viewing assignment reports:', reports);
    
    if (!reports || reports.length === 0) {
        showNotification('⚠️ No reports found in this assignment');
        return;
    }
    
    const modalHTML = `
        <div class="modal-overlay" id="assignmentReportsModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-alt"></i> Assignment Reports (${reports.length})</h3>
                    <button class="modal-close" onclick="closeAssignmentReportsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="reports-list">
                        ${reports.map(report => `
                            <div class="report-item" onclick="showReportDetails('${report._id || report.id}', ${JSON.stringify(report).replace(/"/g, '&quot;')})">
                                <div class="report-header">
                                    <div>
                                        <div class="report-title">${report.title || 'No Title'}</div>
                                        <span class="report-category category-${report.category}">
                                            ${(report.category || 'general').toUpperCase()}
                                        </span>
                                    </div>
                                    <span class="status-badge status-${report.status || 'pending'}">
                                        ${(report.status || 'pending').toUpperCase()}
                                    </span>
                                </div>
                                <div class="report-description">${report.description || 'No description'}</div>
                                <div class="report-meta">
                                    <div class="report-location">
                                        <i class="fas fa-map-marker-alt"></i>
                                        ${report.location?.address || 'Unknown location'}
                                    </div>
                                    <div class="report-time">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(report.createdAt || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeAssignmentReportsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showAssignmentReportsModal(assignment) {
    const modalHTML = `
        <div class="modal-overlay" id="assignmentReportsModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-map-marker-alt"></i> ${assignment.location} - Reports</h3>
                    <button class="modal-close" onclick="closeAssignmentReportsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="assignment-summary">
                        <p><strong>Department:</strong> ${assignment.departmentName}</p>
                        <p><strong>Total Reports:</strong> ${assignment.reportsCount}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${assignment.status}">${assignment.status.toUpperCase()}</span></p>
                    </div>
                    
                    <div class="reports-list">
                        ${assignment.reports.map(report => `
                            <div class="report-item">
                                <div class="report-header">
                                    <div>
                                        <div class="report-title">${report.title || 'No Title'}</div>
                                        <span class="report-category category-${report.category}">
                                            ${(report.category || 'general').toUpperCase()}
                                        </span>
                                    </div>
                                    <span class="status-badge status-${report.status || 'pending'}">
                                        ${(report.status || 'pending').toUpperCase()}
                                    </span>
                                </div>
                                <div class="report-description">${report.description || 'No description'}</div>
                                <div class="report-meta">
                                    <div class="report-time">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(report.createdAt || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeAssignmentReportsModal()">Close</button>
                    <button class="btn-assign" onclick="updateAssignmentStatusFromModal('${assignment.id}')">
                        <i class="fas fa-check"></i> Update Status
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAssignmentReportsModal() {
    const modal = document.getElementById('assignmentReportsModal');
    if (modal) {
        modal.remove();
    }
}

function updateAssignmentStatusFromModal(assignmentId) {
    updateAssignmentStatus(assignmentId);
    closeAssignmentReportsModal();
    
    // Refresh department view
    setTimeout(() => {
        loadDepartmentAssignments();
    }, 500);
}



// Debug Functions
function debugAssignments() {
    const storedAssignments = localStorage.getItem('assignments');
    console.log('🔍 DEBUG: All stored assignments:', storedAssignments);
    
    if (storedAssignments) {
        const parsed = JSON.parse(storedAssignments);
        console.log('🔍 DEBUG: Parsed assignments:', parsed);
        console.log('🔍 DEBUG: Number of assignments:', parsed.length);
        
        parsed.forEach((assignment, index) => {
            console.log(`🔍 DEBUG: Assignment ${index + 1}:`, {
                id: assignment.id,
                location: assignment.location,
                department: assignment.department,
                departmentName: assignment.departmentName,
                reportsCount: assignment.reportsCount
            });
        });
    } else {
        console.log('🔍 DEBUG: No assignments found in localStorage');
    }
}

// Add to window for console access
window.debugAssignments = debugAssignments;

// Engineer Assignment Functions
let selectedAssignmentForEngineer = null;
let selectedEngineerForAssignment = null;

async function showAssignEngineerModal(event, assignmentId, department) {
    event.stopPropagation();
    
    selectedAssignmentForEngineer = assignmentId;
    
    console.log('🔍 DEBUG: Assignment ID:', assignmentId);
    console.log('🔍 DEBUG: Department:', department);
    
    // Show modal
    document.getElementById('engineerAssignModal').style.display = 'flex';
    document.getElementById('engineerAssignmentLocation').textContent = 'Loading assignment details...';
    
    try {
        // Fetch available engineers for this department
        console.log(`🔍 DEBUG: Fetching engineers from: http://localhost:9000/api/engineers/department/${department}`);
        const response = await fetch(`http://localhost:9000/api/engineers/department/${department}`);
        const result = await response.json();
        
        console.log('🔍 DEBUG: Engineers API response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            console.log(`✅ Found ${result.data.length} engineers for ${department} department`);
            displayEngineersForSelection(result.data);
            document.getElementById('engineerAssignmentLocation').textContent = `Assignment ID: ${assignmentId}`;
        } else {
            console.log('❌ No engineers found or empty result');
            showNotification(`❌ No engineers available for ${department} department`);
            closeEngineerAssignModal();
        }
    } catch (error) {
        console.error('❌ Failed to load engineers:', error);
        showNotification('❌ Failed to load engineers');
        closeEngineerAssignModal();
    }
}

function displayEngineersForSelection(engineers) {
    const container = document.getElementById('engineersList');
    
    if (engineers.length === 0) {
        container.innerHTML = '<p>No engineers available for this department</p>';
        return;
    }
    
    const engineersHTML = engineers.map(engineer => `
        <div class="engineer-option" onclick="selectEngineerForAssignment('${engineer._id}')" data-engineer="${engineer._id}">
            <div class="engineer-info">
                <div class="engineer-name">${engineer.name}</div>
                <div class="engineer-details">
                    <span class="engineer-specialization">${engineer.specialization}</span>
                    <span class="engineer-status status-${engineer.status}">${engineer.status.toUpperCase()}</span>
                </div>
                <div class="engineer-stats">
                    <span>📋 ${engineer.currentTasks} current tasks</span>
                    <span>⭐ ${engineer.rating}/5.0</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = engineersHTML;
}

function selectEngineerForAssignment(engineerId) {
    selectedEngineerForAssignment = engineerId;
    
    // Update visual selection
    document.querySelectorAll('.engineer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`[data-engineer="${engineerId}"]`).classList.add('selected');
}

function closeEngineerAssignModal() {
    document.getElementById('engineerAssignModal').style.display = 'none';
    selectedAssignmentForEngineer = null;
    selectedEngineerForAssignment = null;
}

async function assignToEngineer() {
    if (!selectedEngineerForAssignment) {
        showNotification('⚠️ Please select an engineer');
        return;
    }
    
    const assignBtn = document.querySelector('#engineerAssignModal .btn-assign');
    assignBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...';
    assignBtn.disabled = true;
    
    try {
        // Get assignment details
        const assignmentResponse = await fetch(`http://localhost:9000/api/assignments`);
        const assignmentResult = await assignmentResponse.json();
        
        const assignment = assignmentResult.data.find(a => a._id === selectedAssignmentForEngineer);
        
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        
        // Get engineer details
        const engineerResponse = await fetch(`http://localhost:9000/api/engineers`);
        const engineerResult = await engineerResponse.json();
        
        const engineer = engineerResult.data.find(e => e._id === selectedEngineerForAssignment);
        
        if (!engineer) {
            throw new Error('Engineer not found');
        }
        
        // Create task
        const taskData = {
            assignmentId: selectedAssignmentForEngineer,
            engineerId: selectedEngineerForAssignment,
            engineerName: engineer.name,
            location: assignment.location,
            department: assignment.department,
            reports: assignment.reports || [],
            reportsCount: assignment.reportsCount,
            assignedBy: currentUser.email,
            priority: 'medium'
        };
        
        console.log('👷 Creating task for engineer:', taskData);
        
        const taskResponse = await fetch('http://localhost:9000/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        const taskResult = await taskResponse.json();
        
        if (!taskResult.success) {
            throw new Error(taskResult.error || 'Failed to create task');
        }
        
        console.log('✅ Task created successfully:', taskResult.data);
        
        showNotification(`✅ Task assigned to ${engineer.name}!`);
        closeEngineerAssignModal();
        
        // Refresh department assignments
        loadDepartmentAssignments();
        
    } catch (error) {
        console.error('❌ Engineer assignment failed:', error);
        showNotification('❌ Failed to assign engineer. Please try again.');
    } finally {
        assignBtn.innerHTML = '<i class="fas fa-check"></i> Assign to Engineer';
        assignBtn.disabled = false;
    }
}

// View Assignment Tasks Function
async function viewAssignmentTasks(assignmentId) {
    try {
        console.log('🔍 Loading tasks for assignment:', assignmentId);
        
        const response = await fetch('http://192.168.214.228:9000/api/tasks');
        const result = await response.json();
        
        if (result.success) {
            const assignmentTasks = result.data.filter(task => task.assignmentId === assignmentId);
            console.log('📋 Found tasks:', assignmentTasks);
            
            showTasksModal(assignmentTasks);
        } else {
            showNotification('❌ Failed to load tasks');
        }
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        showNotification('❌ Cannot connect to server');
    }
}

function showTasksModal(tasks) {
    const modalHTML = `
        <div class="modal-overlay" id="tasksModal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3><i class="fas fa-tasks"></i> Engineer Tasks (${tasks.length})</h3>
                    <button class="modal-close" onclick="closeTasksModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${tasks.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-info-circle" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                            <p>No tasks created yet</p>
                            <p style="font-size: 14px; margin-top: 10px;">Tasks will appear here when engineers are assigned</p>
                        </div>
                    ` : tasks.map(task => `
                        <div class="task-card" style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                            <div class="task-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <div>
                                    <h4 style="margin: 0; color: #333;">👷 ${task.engineerName}</h4>
                                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">📍 ${task.location}</p>
                                </div>
                                <span class="status-badge status-${task.status}" style="padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                                    ${task.status.replace('-', ' ')}
                                </span>
                            </div>
                            
                            <div class="task-details" style="margin-bottom: 15px;">
                                <p style="margin: 5px 0; color: #666; font-size: 14px;">📋 ${task.reportsCount} reports • ${task.department} department</p>
                                <p style="margin: 5px 0; color: #666; font-size: 14px;">📅 Assigned: ${new Date(task.assignedAt).toLocaleDateString()}</p>
                                ${task.completedAt ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">✅ Completed: ${new Date(task.completedAt).toLocaleDateString()}</p>` : ''}
                            </div>
                            
                            ${task.status === 'completed' ? `
                                <div class="completion-details" style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                                    <h5 style="margin: 0 0 10px 0; color: #333;">📝 Completion Details</h5>
                                    ${task.notes ? `<p style="margin: 5px 0; color: #666;"><strong>Notes:</strong> ${task.notes}</p>` : ''}
                                    ${task.completionPhotos && task.completionPhotos.length > 0 ? `
                                        <div style="margin-top: 10px;">
                                            <strong style="color: #333;">📷 Completion Photos (${task.completionPhotos.length}):</strong>
                                            <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                                                ${task.completionPhotos.map(photo => `
                                                    <div style="width: 100px; height: 100px; background: #e5e7eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #666;">
                                                        📷 Photo
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div class="approval-actions" style="display: flex; gap: 10px;">
                                    <button class="approve-btn" onclick="approveTask('${task._id}')" style="flex: 1; padding: 10px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                        <i class="fas fa-check"></i> Approve Work
                                    </button>
                                    <button class="reject-btn" onclick="rejectTask('${task._id}')" style="flex: 1; padding: 10px; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                        <i class="fas fa-times"></i> Request Revision
                                    </button>
                                </div>
                            ` : `
                                <div style="padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                                    <p style="margin: 0; color: #856404;">⏳ Task is ${task.status.replace('-', ' ')}. Waiting for engineer to complete work.</p>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeTasksModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeTasksModal() {
    const modal = document.getElementById('tasksModal');
    if (modal) {
        modal.remove();
    }
}

async function approveTask(taskId) {
    try {
        // First approve the task
        const taskResponse = await fetch(`http://192.168.214.228:9000/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'approved',
                approvedBy: currentUser.email,
                approvedAt: new Date().toISOString()
            })
        });
        
        const taskResult = await taskResponse.json();
        
        if (taskResult.success) {
            // Get task details to update associated reports and assignment
            const task = taskResult.data;
            
            // Update all reports in this task to 'resolved' status
            if (task.reports && task.reports.length > 0) {
                for (const reportId of task.reports) {
                    try {
                        await fetch(`http://192.168.214.228:9000/api/reports/${reportId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                status: 'resolved',
                                resolvedAt: new Date().toISOString(),
                                resolvedBy: currentUser.email,
                                resolution: `Task completed by ${task.engineerName} and approved by department head.`
                            })
                        });
                        console.log(`✅ Updated report ${reportId} to resolved`);
                    } catch (reportError) {
                        console.error(`❌ Failed to update report ${reportId}:`, reportError);
                    }
                }
            }
            
            // Update the assignment status to 'completed'
            if (task.assignmentId) {
                try {
                    await fetch(`http://192.168.214.228:9000/api/assignments/${task.assignmentId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            status: 'completed',
                            completedAt: new Date().toISOString(),
                            completedBy: currentUser.email
                        })
                    });
                    console.log(`✅ Updated assignment ${task.assignmentId} to completed`);
                } catch (assignmentError) {
                    console.error(`❌ Failed to update assignment ${task.assignmentId}:`, assignmentError);
                }
            }
            
            showNotification(`✅ Task approved! ${task.reports?.length || 0} citizen reports marked as resolved.`);
            closeTasksModal();
            
            // Refresh all data to reflect changes immediately
            console.log('🔄 Refreshing dashboard data after approval...');
            
            await fetchReportsFromAPI(); // This will clear and reload data
            loadDepartmentAssignments(); // Refresh assignments
            
            // If user switches back to district view, they'll see updated data
            console.log('✅ Dashboard data refreshed');
        } else {
            throw new Error(taskResult.error || 'Failed to approve task');
        }
    } catch (error) {
        console.error('❌ Failed to approve task:', error);
        showNotification('❌ Failed to approve task');
    }
}

async function rejectTask(taskId) {
    const reason = prompt('Please provide a reason for requesting revision:');
    if (!reason) return;
    
    try {
        const response = await fetch(`http://192.168.214.228:9000/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'revision-requested',
                rejectionReason: reason,
                rejectedBy: currentUser.email,
                rejectedAt: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('📝 Revision requested successfully!');
            closeTasksModal();
            
            // Refresh all data to reflect changes immediately
            console.log('🔄 Refreshing dashboard data after revision request...');
            
            await fetchReportsFromAPI(); // This will clear and reload data
            loadDepartmentAssignments(); // Refresh assignments
        } else {
            throw new Error(result.error || 'Failed to request revision');
        }
    } catch (error) {
        console.error('❌ Failed to request revision:', error);
        showNotification('❌ Failed to request revision');
    }
}

// Utility Functions
function showNotification(message) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}