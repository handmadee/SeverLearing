'use strict';

import { LOCALHOST_API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const sessionSelect = document.getElementById('session');
    const teacherSelect = document.getElementById('teacher');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilter');
    const dateRangeDisplay = document.getElementById('dateRangeDisplay');
    const timetableContainer = document.getElementById('timetableContainer');
    const absenceTableBody = document.getElementById('absenceTable').querySelector('tbody');

    // Vietnam timezone constants
    const VIETNAM_TIMEZONE_OFFSET = 7 * 60; // Vietnam timezone offset in minutes
    const MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const DAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    // Set default date range to current month
    const setupDefaultDates = () => {
        const vietnamTime = getVietnamTime();
        const firstDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), 1);
        const lastDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth() + 1, 0);

        startDateInput.valueAsDate = firstDay;
        endDateInput.valueAsDate = lastDay;

        // Update date range display
        updateDateRangeDisplay(firstDay, lastDay);
    };

    // Get current time in Vietnam timezone
    const getVietnamTime = () => {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utcTime + (VIETNAM_TIMEZONE_OFFSET * 60000));
    };

    // Update date range display
    const updateDateRangeDisplay = (fromDate, toDate) => {
        const sameMonth = fromDate.getMonth() === toDate.getMonth() &&
            fromDate.getFullYear() === toDate.getFullYear();

        if (sameMonth) {
            dateRangeDisplay.textContent = `${MONTH_NAMES[fromDate.getMonth()]}/${fromDate.getFullYear()}`;
        } else {
            dateRangeDisplay.textContent = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
        }
    };

    // Format date to DD-MM-YYYY
    const formatDate = (dateObj) => {
        if (typeof dateObj === 'string') {
            dateObj = new Date(dateObj);
        }
        return `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
    };

    // Parse date string DD-MM-YYYY to Date object
    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`);
    };

    // Group absences by date and session
    const groupAbsencesByDateAndSession = (data) => {
        const groupedData = {};

        data.forEach(student => {
            // Filter only absences with status = false (absent)
            const allAbsences = student.absentDates.filter(absence => absence.status === false);

            allAbsences.forEach(absence => {
                const dateStr = absence.date;
                const session = absence.study.toString();
                const reason = absence.reason || '';

                // Convert DD-MM-YYYY to Date object for sorting
                const dateObj = parseDate(dateStr);
                const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format for keys

                if (!groupedData[dateKey]) {
                    groupedData[dateKey] = {
                        date: dateStr,
                        dayOfWeek: DAY_NAMES[dateObj.getDay()],
                        dateFull: dateStr,
                        sessions: {}
                    };
                }

                if (!groupedData[dateKey].sessions[session]) {
                    groupedData[dateKey].sessions[session] = {
                        sessionNumber: session,
                        students: []
                    };
                }

                groupedData[dateKey].sessions[session].students.push({
                    id: student.studentId,
                    fullname: student.fullname,
                    reason: reason,
                    absenceId: absence.id
                });
            });
        });

        // Convert to array and sort by date
        return Object.values(groupedData).sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA - dateB;
        });
    };

    // Group students with the same name in a session
    const groupStudentsByName = (students) => {
        const nameGroups = {};

        students.forEach(student => {
            const name = student.fullname;
            if (!nameGroups[name]) {
                nameGroups[name] = {
                    name: name,
                    count: 1,
                    students: [student]
                };
            } else {
                nameGroups[name].count++;
                nameGroups[name].students.push(student);
            }
        });

        return Object.values(nameGroups);
    };

    // Render timetable view
    const renderTimetable = (groupedData) => {
        timetableContainer.innerHTML = '';

        if (groupedData.length === 0) {
            renderNoDataMessage();
            return;
        }

        groupedData.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('timetable-day');

            dayElement.innerHTML = `
                <div class="timetable-day-header">
                    <div>${day.dayOfWeek}</div>
                    <div class="timetable-day-date">${day.dateFull}</div>
                </div>
                <div class="timetable-day-content" id="day-${day.date.replace(/\//g, '-')}">
                </div>
            `;

            timetableContainer.appendChild(dayElement);

            const dayContent = dayElement.querySelector('.timetable-day-content');

            // Sort sessions by session number
            const sortedSessions = Object.values(day.sessions).sort((a, b) =>
                parseInt(a.sessionNumber) - parseInt(b.sessionNumber)
            );

            sortedSessions.forEach(session => {
                renderSessionInTimetable(dayContent, session, day.date);
            });
        });

        // Add event listeners for "Show more" buttons and student names
        setupTimetableEventListeners();
    };

    // Render no data message
    const renderNoDataMessage = () => {
        const noDataDiv = document.createElement('div');
        noDataDiv.classList.add('col-12', 'text-center', 'py-5');
        noDataDiv.innerHTML = `
            <div class="no-data">
                <i class="fas fa-smile"></i>
                <p>Không có dữ liệu vắng mặt trong khoảng thời gian này</p>
            </div>
        `;
        timetableContainer.appendChild(noDataDiv);
    };

    // Render a session in the timetable
    const renderSessionInTimetable = (dayContent, session, dayDate) => {
        const sessionElement = document.createElement('div');
        sessionElement.classList.add('timetable-session');

        // Group students with the same name
        const groupedStudents = groupStudentsByName(session.students);
        const studentCount = session.students.length;
        const displayLimit = 3;
        const displayedGroups = groupedStudents.slice(0, displayLimit);
        const hasMoreGroups = groupedStudents.length > displayLimit;

        let studentHtml = '';

        // Render displayed students
        displayedGroups.forEach(group => {
            studentHtml += renderStudentGroup(group, dayDate, session.sessionNumber, false);
        });

        // Add "Show more" section if needed
        if (hasMoreGroups) {
            studentHtml += renderMoreStudentsSection(groupedStudents.slice(displayLimit), dayDate, session.sessionNumber);
        }

        sessionElement.innerHTML = `
            <div class="timetable-session-header">
                <div class="timetable-session-title">Ca ${session.sessionNumber}</div>
                <div class="absence-count">${studentCount}</div>
            </div>
            <div class="timetable-absentees">
                ${studentHtml}
            </div>
        `;

        dayContent.appendChild(sessionElement);
    };

    // Render a student group (students with the same name)
    const renderStudentGroup = (group, dayDate, sessionNumber, isExpanded) => {
        const countBadge = group.count > 1 ?
            `<span class="badge rounded-pill bg-secondary ms-1">${group.count}</span>` : '';

        const detailsPrefix = isExpanded ? 'details-expanded' : 'details';

        let html = `
            <div class="timetable-absentee" data-name="${group.name}">
                ${group.name} ${countBadge}
                ${group.students[0].reason ? `<span class="absentee-reason">(${group.students[0].reason})</span>` : ''}
            </div>
        `;

        // If there are multiple students with the same name, add details section
        if (group.count > 1) {
            html += `
                <div class="name-details" id="${detailsPrefix}-${dayDate}-${sessionNumber}-${group.name.replace(/\s+/g, '-')}" style="display: none; margin-left: 15px; font-size: 0.9em;">
                    ${group.students.map((student, idx) => `
                        <div class="detail-item">
                            ${idx + 1}. ${student.fullname} 
                            ${student.reason ? `<span class="absentee-reason">(${student.reason})</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return html;
    };

    // Render the "Show more" section for a session
    const renderMoreStudentsSection = (moreGroups, dayDate, sessionNumber) => {
        return `
            <div class="timetable-absentee show-more" data-date="${dayDate}" data-session="${sessionNumber}">
                <i class="fas fa-plus-circle"></i> Xem thêm ${moreGroups.length} học sinh vắng mặt
            </div>
            <div class="timetable-absentees-expanded" id="expanded-${dayDate}-${sessionNumber}" style="display: none;">
                ${moreGroups.map(group => renderStudentGroup(group, dayDate, sessionNumber, true)).join('')}
            </div>
        `;
    };

    // Setup event listeners for timetable interactions
    const setupTimetableEventListeners = () => {
        // Add event listeners for "Show more" buttons
        document.querySelectorAll('.show-more').forEach(button => {
            button.addEventListener('click', function () {
                const date = this.getAttribute('data-date');
                const session = this.getAttribute('data-session');
                const expandedSection = document.getElementById(`expanded-${date}-${session}`);

                if (expandedSection.style.display === 'none') {
                    expandedSection.style.display = 'block';
                    this.innerHTML = '<i class="fas fa-minus-circle"></i> Ẩn bớt';
                } else {
                    expandedSection.style.display = 'none';
                    const moreCount = expandedSection.querySelectorAll('.timetable-absentee').length;
                    this.innerHTML = `<i class="fas fa-plus-circle"></i> Xem thêm ${moreCount} học sinh vắng mặt`;
                }
            });
        });

        // Add event listeners for student names with multiple occurrences
        document.querySelectorAll('.timetable-absentee[data-name]').forEach(element => {
            const name = element.getAttribute('data-name');
            const badge = element.querySelector('.badge');

            if (badge) {
                element.style.cursor = 'pointer';

                element.addEventListener('click', function () {
                    // Find the closest session and day elements
                    const session = this.closest('.timetable-session');
                    const day = this.closest('.timetable-day');

                    // Extract date and session number
                    const dateMatch = day.querySelector('.timetable-day-content').id.match(/day-(.+)/);
                    const date = dateMatch ? dateMatch[1] : '';
                    const sessionNumber = session.querySelector('.timetable-session-title').textContent.replace('Ca ', '').trim();

                    // Find the details element
                    const regularDetails = document.getElementById(`details-${date}-${sessionNumber}-${name.replace(/\s+/g, '-')}`);
                    const expandedDetails = document.getElementById(`details-expanded-${date}-${sessionNumber}-${name.replace(/\s+/g, '-')}`);
                    const detailsElement = regularDetails || expandedDetails;

                    if (detailsElement) {
                        detailsElement.style.display = detailsElement.style.display === 'none' ? 'block' : 'none';
                    }
                });
            }
        });
    };

    // Render detailed table view
    const renderAbsenceTable = (data) => {
        absenceTableBody.innerHTML = '';

        if (data.length === 0) {
            absenceTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>';
            return;
        }

        let rowIndex = 1;
        data.forEach(student => {
            // Filter actual absences (status = false)
            const allAbsences = student.absentDates.filter(absence => absence.status === false);

            if (allAbsences.length === 0) return; // Skip students with no actual absences

            // For each actual absence, create a row
            allAbsences.forEach((absence, index) => {
                const tr = document.createElement('tr');
                console.log(absence)
                tr.innerHTML = `
                    <td>${rowIndex}</td>
                    <td>${student.fullname}</td>
                     <td>${student.absentDates.length}</td>
                    <td>${allAbsences.length}</td>
                    <td>${absence.date}</td>
                    <td>Ca ${absence.study}</td>
                    <td><span class="status-badge bg-danger" style="color: white;">Vắng mặt</span></td>
                    <td>
                        ${student.absentDates.length > 1 && index === 0 ?
                        `<button class="btn btn-sm btn-outline-secondary ms-1 viewAllDates" 
                                data-bs-toggle="modal" 
                                data-bs-target="#absenceDatesModal" 
                                data-student="${encodeURIComponent(JSON.stringify(student))}">
                            <i class="fas fa-calendar-alt me-1"></i>Xem tất cả
                        </button>` : `                  <button class="btn btn-sm btn-outline-primary changeAttendance"
                                data-id="${student.studentId}" 
                                data-attendance="false"
                                data-date="${absence.date}"
                                data-session="${absence.study}"
                                data-absence-id="${absence.id}">
                            <i class="fas fa-exchange-alt me-1"></i>Đổi trạng thái
                        </button>`}
                    </td>
                `;

                absenceTableBody.appendChild(tr);
                rowIndex++;
            });
        });

        // Add event listeners for change attendance buttons
        setupChangeAttendanceListeners();
        setupViewAllDatesListeners();
    };

    // Setup change attendance button listeners
    const setupChangeAttendanceListeners = () => {
        document.querySelectorAll('.changeAttendance').forEach(button => {
            button.addEventListener('click', async function (event) {
                event.preventDefault();
                await handleAttendanceChange(this);
            });
        });
    };

    // Setup view all dates button listeners
    const setupViewAllDatesListeners = () => {
        document.querySelectorAll('.viewAllDates').forEach(button => {
            button.addEventListener('click', function () {
                const studentData = JSON.parse(decodeURIComponent(this.getAttribute('data-student')));
                populateAbsencesModal(studentData);
            });
        });
    };

    // Handle attendance status change
    const handleAttendanceChange = async (buttonElement) => {
        const studentId = buttonElement.getAttribute('data-absence-id');
        const currentStatus = buttonElement.getAttribute('data-attendance') === 'true';
        const newStatus = !currentStatus;
        const date = buttonElement.getAttribute('data-date');
        const session = buttonElement.getAttribute('data-session');
        const absenceId = buttonElement.getAttribute('data-absence-id');

        try {
            const response = await fetch(`${LOCALHOST_API_URL}changeAttendance/${studentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    attendance: newStatus,
                    date: date,
                    session: session,
                    absenceId: absenceId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to change attendance status');
            }

            const result = await response.json();
            if (result?.status === 200) {
                // Update the button data attribute
                buttonElement.setAttribute('data-attendance', newStatus.toString());

                // Update the status badge in the same row
                const statusBadge = buttonElement.closest('tr') ?
                    buttonElement.closest('tr').querySelector('.status-badge') :
                    buttonElement.closest('li').querySelector('.status-badge');

                if (statusBadge) {
                    if (newStatus) {
                        statusBadge.className = buttonElement.closest('tr') ?
                            'status-badge bg-success' :
                            'status-badge bg-success text-white ms-2 px-2 py-1 rounded';
                        statusBadge.textContent = 'Có mặt';
                    } else {
                        statusBadge.className = buttonElement.closest('tr') ?
                            'status-badge bg-danger' :
                            'status-badge bg-danger text-white ms-2 px-2 py-1 rounded';
                        statusBadge.textContent = 'Vắng mặt';
                    }
                }

                showToast('Thay đổi trạng thái thành công', 'success');

                // Refresh data
                await fetchAbsenceData();
            } else {
                showToast('Có lỗi xảy ra khi thay đổi trạng thái', 'error');
            }
        } catch (error) {
            console.error('Error changing attendance:', error);
            showToast('Có lỗi xảy ra khi thay đổi trạng thái', 'error');
        }
    };

    // Populate modal with student absence data
    const populateAbsencesModal = (studentData) => {
        const modalTitle = document.getElementById('absenceDatesModalLabel');
        const modalBody = document.getElementById('absenceDatesModalBody');

        modalTitle.textContent = `Lịch sử vắng của ${studentData.fullname}`;

        // Get all absences
        const allAbsences = studentData.absentDates;

        if (allAbsences.length === 0) return;

        let modalContent = '<ul class="list-group">';
        allAbsences.forEach((absence, index) => {
            const isAbsent = absence.status === false;
            modalContent += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                        <span class="status-badge ${isAbsent ? 'bg-danger' : 'bg-success'}" style="color: white;">
                            ${isAbsent ? 'Vắng mặt' : 'Có mặt'}
                        </span>
                        ${absence.lable}
                    </span>
                    <span>
                        <button class="btn btn-sm btn-outline-primary changeAttendance" 
                            data-id="${studentData.studentId}" 
                            data-attendance="${absence.status}"
                            data-date="${absence.date}"
                            data-session="${absence.study}"
                            data-absence-id="${absence.id}">
                            <i class="fas fa-exchange-alt me-1"></i>Đổi trạng thái
                        </button>
                    </span>
                </li>
            `;
        });
        modalContent += '</ul>';

        modalBody.innerHTML = modalContent;

        // Add event listeners for the attendance buttons inside modal
        document.querySelectorAll('.changeAttendance').forEach(btn => {
            btn.addEventListener('click', async function (event) {
                event.preventDefault();
                await handleAttendanceChange(this);
            });
        });
    };

    // Fetch absence data from API
    const fetchAbsenceData = async () => {
        try {
            const fromDate = startDateInput.value;
            const toDate = endDateInput.value;
            const selectedSession = sessionSelect.value !== 'all' ? sessionSelect.value : '';
            const selectedTeacher = teacherSelect.value !== 'all' ? teacherSelect.value : '';

            const params = new URLSearchParams({
                date: fromDate,
                date1: toDate,
                session: selectedSession,
                teacherId: selectedTeacher
            }).toString();

            const response = await fetch(`${LOCALHOST_API_URL}attendance/by-teacher?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attendance data');
            }

            const result = await response.json();

            if (result?.status === 200 && result?.data?.data) {
                const absenceData = result.data.data;

                // Render detailed table
                renderAbsenceTable(absenceData);

                // Group and render timetable
                const groupedData = groupAbsencesByDateAndSession(absenceData);
                renderTimetable(groupedData);

                // Update date range display
                const fromDateObj = new Date(fromDate);
                const toDateObj = new Date(toDate);
                updateDateRangeDisplay(fromDateObj, toDateObj);
            } else {
                renderAbsenceTable([]);
                renderTimetable([]);
                showToast('Không có dữ liệu điểm danh', 'warning');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
            renderAbsenceTable([]);
            renderTimetable([]);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'info') => {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });

        bsToast.show();

        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function () {
            this.remove();
        });
    };

    // Create and add CSS
    const addStyles = () => {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .timetable-absentee[data-name] {
                transition: background-color 0.2s;
            }
            .timetable-absentee[data-name]:hover {
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 4px;
            }
            .timetable-absentee[data-name] .badge {
                cursor: pointer;
            }
            .name-details {
                background-color: #f8f9fa;
                border-radius: 4px;
                padding: 8px;
                margin-top: 4px;
                margin-bottom: 8px;
                border-left: 3px solid #6c757d;
            }
            .status-badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.8em;
            }
            .btn.changeAttendance, .btn.changeAttendanceModal {
                transition: all 0.2s ease;
            }
            .btn.changeAttendance:hover, .btn.changeAttendanceModal:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .show-more {
                cursor: pointer;
                color: #0d6efd;
                font-size: 0.9em;
                padding: 3px 0;
            }
            .show-more:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(styleElement);
    };

    // Create absence dates modal
    const createAbsencesModal = () => {
        const modalHtml = `
            <div class="modal fade" id="absenceDatesModal" tabindex="-1" aria-labelledby="absenceDatesModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="absenceDatesModalLabel">Lịch sử vắng mặt</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="absenceDatesModalBody">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Check if modal already exists
        if (!document.getElementById('absenceDatesModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    };

    // Initialize
    const init = () => {
        addStyles();
        createAbsencesModal();
        setupDefaultDates();
        fetchAbsenceData();

        // Event listeners
        applyFilterBtn.addEventListener('click', fetchAbsenceData);
    };

    // Start the application
    init();
});